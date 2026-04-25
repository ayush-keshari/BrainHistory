/**
 * POST /api/chat/stream
 *
 * SSE streaming version of the chat endpoint.
 *
 * Pipeline:
 *   1. Auth + validation
 *   2. Embed user message (non-streaming, fast)
 *   3. Vector search in document (non-streaming)
 *   4. Build context string
 *   5. Stream LLM reply token-by-token via SSE
 *   6. Persist session to MongoDB after stream completes
 *
 * SSE event shapes:
 *   data: {"type":"token",  "token":"..."        }
 *   data: {"type":"done",   "sessionId":"...", "sourceChunks":["..."] }
 *   data: {"type":"error",  "error":"..."         }
 */

import { NextRequest }             from "next/server";
import { z }                       from "zod";
import { auth }                    from "@/auth";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import { getEmbeddingService }     from "@/lib/embeddings";
import { vectorSearch }            from "@/lib/rag/vectorSearch";
import { getLLM }                  from "@/lib/rag/llm";
import connectDB                   from "@/lib/db/mongoose";
import { ChatSession, Content }    from "@/models";
import mongoose                    from "mongoose";

// ─── Validation ───────────────────────────────────────────────────────────────

const BodySchema = z.object({
  contentId: z.string().min(1),
  message:   z.string().min(1).max(4000),
  sessionId: z.string().optional(),
});

// ─── SSE helper ───────────────────────────────────────────────────────────────

function sseEvent(data: unknown): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`);
}

// ─── POST ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // ── 1. Auth ────────────────────────────────────────────────────────────────
  const session = await auth();
  const userId  = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 2. Parse body ──────────────────────────────────────────────────────────
  const body   = await req.json().catch(() => null);
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "Validation failed" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
  const { contentId, message, sessionId } = parsed.data;

  // ── 3. Verify content ownership ────────────────────────────────────────────
  await connectDB();
  const contentDoc = await Content
    .findOne({ _id: new mongoose.Types.ObjectId(contentId), userId: new mongoose.Types.ObjectId(userId) })
    .select("title contentType processingStatus")
    .lean() as { title?: string; contentType?: string; processingStatus?: string } | null;

  if (!contentDoc) {
    return new Response(
      JSON.stringify({ error: "Content not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  // ── 4. Build SSE stream ────────────────────────────────────────────────────
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // ── 4a. Embed message ───────────────────────────────────────────────
        const messageVec = await getEmbeddingService().embedQuery(message);

        // ── 4b. Vector search inside the document ──────────────────────────
        const chunks = await vectorSearch({
          userId,
          queryVector: messageVec,
          queryText:   message,
          limit:       6,
          contentId,
        });

        const context        = chunks.map((c, i) => `[${i + 1}] ${c.chunkText}`).join("\n\n---\n\n");
        const sourceChunks   = chunks.map((c) => c.chunkText);

        // ── 4c. Load/create chat session ────────────────────────────────────
        let chatSession = sessionId
          ? await ChatSession.findById(sessionId)
          : null;

        if (!chatSession) {
          chatSession = new ChatSession({
            userId:    new mongoose.Types.ObjectId(userId),
            contentId: new mongoose.Types.ObjectId(contentId),
            messages:  [],
          });
        }

        const history: BaseMessage[] = chatSession.messages.slice(-10).map(
          (m: { role: string; content: string }) =>
            m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
        );

        // ── 4d. Stream LLM reply ────────────────────────────────────────────
        const llm = getLLM({ streaming: true });

        const messages: BaseMessage[] = [
          new SystemMessage(
            `You are an AI assistant helping the user understand a saved ${contentDoc.contentType ?? "document"} titled "${contentDoc.title ?? "unknown"}".
Answer using ONLY the context excerpts. Cite [1], [2], etc.
If the context doesn't contain the answer, say "I couldn't find that in this document."
${chatSession.summary ? `\nConversation so far:\n${chatSession.summary}` : ""}`
          ),
          ...history,
          new HumanMessage(`Context:\n${context}\n\nQuestion: ${message}`),
        ];

        let fullReply = "";

        const llmStream = await llm.stream(messages);
        for await (const chunk of llmStream) {
          const token = String(chunk.content);
          if (token) {
            fullReply += token;
            controller.enqueue(sseEvent({ type: "token", token }));
          }
        }

        // ── 4e. Persist session ─────────────────────────────────────────────
        chatSession.messages.push({ role: "user",      content: message,   createdAt: new Date() });
        chatSession.messages.push({ role: "assistant", content: fullReply, createdAt: new Date() });

        // Periodic summarization every 10 turns
        const SUMMARY_EVERY = 10;
        if (chatSession.messages.length % SUMMARY_EVERY === 0) {
          try {
            const summaryLlm = getLLM();
            const summaryRes = await summaryLlm.invoke([
              new SystemMessage("Summarise this conversation in 3-5 sentences."),
              ...chatSession.messages.map((m: { role: string; content: string }) =>
                m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
              ),
            ]);
            chatSession.summary = String(summaryRes.content);
          } catch { /* non-critical */ }
        }

        await chatSession.save();

        // ── 4f. Final done event ────────────────────────────────────────────
        controller.enqueue(sseEvent({
          type:        "done",
          sessionId:   (chatSession._id as mongoose.Types.ObjectId).toString(),
          sourceChunks,
        }));
        controller.close();

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Stream error";
        console.error("[POST /api/chat/stream]", err);
        try {
          controller.enqueue(sseEvent({ type: "error", error: msg }));
          controller.close();
        } catch { /* already closed */ }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type":  "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection":    "keep-alive",
      "X-Accel-Buffering": "no",   // disable nginx buffering
    },
  });
}
