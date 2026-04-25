"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Message {
  role:      "user" | "assistant";
  content:   string;
  createdAt: string;
}

interface ChatViewProps {
  contentId:        string;
  title:            string;
  url:              string;
  contentType:      string;
  processingStatus: string;
  isLarge:          boolean;
}

const TYPE_EMOJI: Record<string, string> = {
  pdf: "⬛", youtube_video: "▶", blog: "✦", github: "⊛", website: "◉", unknown: "◇",
};

export default function ChatView({
  contentId, title, url, contentType, processingStatus, isLarge,
}: ChatViewProps) {
  const [messages,        setMessages]        = useState<Message[]>([]);
  const [sessionId,       setSessionId]       = useState<string | undefined>(undefined);
  const [input,           setInput]           = useState("");
  const [sending,         setSending]         = useState(false);
  const [streamingText,   setStreamingText]   = useState("");   // in-flight SSE tokens
  const [error,           setError]           = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const inputRef   = useRef<HTMLTextAreaElement>(null);
  const abortRef   = useRef<AbortController | null>(null);

  // Auto-scroll whenever messages or streaming text changes
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    // Optimistically add the user message
    const userMsg: Message = { role: "user", content: text, createdAt: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);
    setStreamingText("");
    setError(null);

    // Cancel any previous in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch("/api/chat/stream", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ contentId, message: text, sessionId }),
        signal:  controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const reader  = res.body!.getReader();
      const decoder = new TextDecoder();
      let   buffer  = "";
      let   reply   = "";

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // SSE events are separated by double newlines
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";

        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;

          let evt: { type: string; token?: string; sessionId?: string; sourceChunks?: string[]; error?: string };
          try {
            evt = JSON.parse(line.slice(5).trim());
          } catch { continue; }

          if (evt.type === "token" && evt.token) {
            reply += evt.token;
            setStreamingText(reply);
          } else if (evt.type === "done") {
            if (evt.sessionId) setSessionId(evt.sessionId);
            // Commit the completed message and clear the streaming buffer
            setMessages((prev) => [
              ...prev,
              { role: "assistant", content: reply, createdAt: new Date().toISOString() },
            ]);
            setStreamingText("");
          } else if (evt.type === "error") {
            throw new Error(evt.error ?? "Stream error");
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to send message");
      // Roll back the optimistic user message
      setMessages((prev) => prev.slice(0, -1));
      setInput(text);
      setStreamingText("");
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const notReady = processingStatus !== "completed";
  const emoji    = TYPE_EMOJI[contentType] ?? "◇";

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-4 py-3
                      bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm
                      border-b border-zinc-100 dark:border-zinc-800">
        <Link href={`/content/${contentId}`}
          className="p-1.5 rounded-xl text-zinc-400 dark:text-zinc-500
                     hover:text-zinc-700 dark:hover:text-zinc-200
                     hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
          title="Back to content">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <div className="h-8 w-8 rounded-xl bg-violet-50 dark:bg-violet-500/10
                        border border-violet-100 dark:border-violet-500/20
                        flex items-center justify-center text-sm font-bold
                        text-violet-600 dark:text-violet-400 shrink-0">
          {emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">{title}</p>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-xs text-zinc-400 dark:text-zinc-500
                       hover:text-violet-600 dark:hover:text-violet-400
                       truncate block transition-colors">
            {(() => { try { return new URL(url).hostname; } catch { return url; } })()}
          </a>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isLarge && (
            <span className="text-xs px-2 py-0.5 rounded-full
                             bg-amber-50 dark:bg-amber-500/10
                             text-amber-700 dark:text-amber-400
                             border border-amber-100 dark:border-amber-500/20">
              small
            </span>
          )}
          <div className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400
                          bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-full
                          border border-violet-100 dark:border-violet-500/20">
            <SparkleIcon className="h-3 w-3" />
            AI Chat
          </div>
        </div>
      </div>

      {/* ── Not-ready banner ────────────────────────────────────────────── */}
      {notReady && (
        <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 text-sm
                        text-amber-700 dark:text-amber-400
                        bg-amber-50 dark:bg-amber-500/10
                        border-b border-amber-100 dark:border-amber-500/20">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          Still indexing ({processingStatus}) — chat will be available once completed.
        </div>
      )}

      {/* ── Messages ────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5">

        {/* Empty state */}
        {messages.length === 0 && !streamingText && !notReady && (
          <div className="flex flex-col items-center justify-center h-full space-y-5 text-center py-12">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center shadow-xl shadow-violet-500/25">
              <SparkleIcon className="h-7 w-7 text-white" />
            </div>
            <div className="space-y-1.5">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                Ask anything about this content
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-xs">
                The AI will answer based on what&apos;s saved. Press Enter or click Send.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              {["Summarize this", "Key points?", "Main idea?"].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="text-xs px-3 py-1.5 rounded-xl
                             bg-white dark:bg-zinc-900
                             border border-zinc-200 dark:border-zinc-700
                             text-zinc-500 dark:text-zinc-400
                             hover:border-violet-200 dark:hover:border-violet-500/30
                             hover:text-violet-600 dark:hover:text-violet-400 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Committed messages */}
        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {/* Streaming assistant reply — shows tokens as they arrive */}
        {streamingText && (
          <div className="flex gap-3 justify-start">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center shadow-md shadow-violet-500/20
                            shrink-0 self-end">
              <SparkleIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="max-w-[78%] rounded-2xl rounded-bl-sm px-4 py-3 text-sm leading-relaxed
                            bg-white dark:bg-zinc-900
                            text-zinc-800 dark:text-zinc-200
                            border border-zinc-100 dark:border-zinc-800 whitespace-pre-wrap">
              {streamingText}
              {/* Blinking cursor while streaming */}
              <span className="inline-block w-0.5 h-3.5 ml-0.5 align-middle
                               bg-violet-500 dark:bg-violet-400 animate-pulse rounded-sm" />
            </div>
          </div>
        )}

        {/* Thinking dots — only shown before first token arrives */}
        {sending && !streamingText && (
          <div className="flex gap-3 justify-start">
            <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                            flex items-center justify-center shadow-md shadow-violet-500/20
                            shrink-0 self-end">
              <SparkleIcon className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl rounded-bl-sm
                            bg-white dark:bg-zinc-900
                            border border-zinc-100 dark:border-zinc-800">
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:0ms]" />
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-violet-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Error bar ───────────────────────────────────────────────────── */}
      {error && (
        <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-xs
                        text-red-600 dark:text-red-400
                        bg-red-50 dark:bg-red-500/10
                        border-t border-red-100 dark:border-red-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-red-400 shrink-0" />
          {error}
        </div>
      )}

      {/* ── Input ───────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-3 bg-white dark:bg-zinc-950
                      border-t border-zinc-100 dark:border-zinc-800">
        <div className="flex items-end gap-2 rounded-2xl px-3 py-2.5
                        bg-zinc-50 dark:bg-zinc-900
                        border border-zinc-200 dark:border-zinc-700
                        focus-within:ring-2 focus-within:ring-violet-500/30
                        focus-within:border-violet-400 dark:focus-within:border-violet-500
                        transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={notReady ? "Waiting for indexing…" : "Ask a question…  (Enter to send)"}
            disabled={notReady || sending}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm
                       text-zinc-900 dark:text-zinc-100
                       placeholder:text-zinc-400 dark:placeholder:text-zinc-500
                       focus:outline-none disabled:opacity-40
                       max-h-32 overflow-y-auto"
            style={{ minHeight: "1.375rem" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
            }}
          />
          <button
            onClick={sendMessage}
            disabled={notReady || sending || !input.trim()}
            className="shrink-0 self-end h-8 w-8 rounded-xl
                       bg-gradient-to-br from-violet-600 to-indigo-600
                       flex items-center justify-center text-white
                       hover:from-violet-500 hover:to-indigo-500
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all shadow-md shadow-violet-500/20"
            title="Send"
          >
            <SendIcon className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="mt-1.5 text-center text-xs text-zinc-400 dark:text-zinc-500">
          Answers are based on your saved content and may not be 100% accurate.
        </p>
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600
                        flex items-center justify-center shadow-md shadow-violet-500/20
                        shrink-0 self-end">
          <SparkleIcon className="h-3.5 w-3.5 text-white" />
        </div>
      )}
      <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
        isUser
          ? "rounded-br-sm bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20"
          : "rounded-bl-sm bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-zinc-800"
      }`}>
        {message.content}
      </div>
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function SparkleIcon({ className }: { className?: string }) {
  return <svg className={className} viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L13.4 8.4L19 9L13.4 9.6L12 15L10.6 9.6L5 9L10.6 8.4L12 3Z" /></svg>;
}
function ChevronLeftIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>;
}
function SendIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
}
