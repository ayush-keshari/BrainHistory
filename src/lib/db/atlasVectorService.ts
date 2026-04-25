/**
 * Atlas Vector Service
 *
 * Replaces Pinecone — all vector operations now go through MongoDB Atlas
 * Vector Search on the `content_chunks` collection.
 *
 * Per-user isolation: every query filters by `userId` (indexed filter field).
 * Per-document chat: queries additionally filter by `contentId`.
 *
 * Atlas Vector Search index required (create once in Atlas UI):
 * Collection : content_chunks
 * Index name : vector_index
 * JSON definition:
 * {
 *   "fields": [
 *     { "type": "vector",  "path": "embedding",            "numDimensions": 1536, "similarity": "cosine" },
 *     { "type": "filter",  "path": "userId"                                                               },
 *     { "type": "filter",  "path": "contentId"                                                            },
 *     { "type": "filter",  "path": "chunkMeta.contentType"                                                }
 *   ]
 * }
 */

import mongoose from "mongoose";
import connectDB from "./mongoose";
import ContentChunk from "@/models/ContentChunk";

// ─── Upsert ───────────────────────────────────────────────────────────────────

export interface UpsertChunk {
  chunkIndex:  number;
  chunkText:   string;
  embedding:   number[];
  pageNumber?: number;
}

export interface UpsertOptions {
  userId:      string;
  contentId:   string;
  contentType: string;
  platform:    string;
  title:       string;
  url:         string;
  fileUrl?:    string;   // Cloudinary URL — stored in every chunk for retrieval
  thumbnail?:  string;
  savedAt:     Date;
  chunks:      UpsertChunk[];
}

const BATCH_SIZE = 100;

export async function upsertVectors(opts: UpsertOptions): Promise<void> {
  await connectDB();

  const contentObjId = new mongoose.Types.ObjectId(opts.contentId);
  const userObjId    = new mongoose.Types.ObjectId(opts.userId);
  const model        = process.env.OPENAI_EMBEDDING_MODEL ?? "text-embedding-3-small";

  // Idempotent — remove any existing chunks for this content first
  await ContentChunk.deleteMany({ contentId: contentObjId });

  const docs = opts.chunks.map((chunk) => ({
    contentId:      contentObjId,
    userId:         userObjId,
    chunkIndex:     chunk.chunkIndex,
    chunkText:      chunk.chunkText,
    embedding:      chunk.embedding,
    embeddingModel: model,
    chunkMeta: {
      contentType: opts.contentType,
      platform:    opts.platform,
      title:       opts.title,
      url:         opts.url,
      fileUrl:     opts.fileUrl,
      pageNumber:  chunk.pageNumber,
    },
  }));

  for (let i = 0; i < docs.length; i += BATCH_SIZE) {
    await ContentChunk.insertMany(docs.slice(i, i + BATCH_SIZE));
  }
}

// ─── Query ────────────────────────────────────────────────────────────────────

export interface QueryOptions {
  userId:        string;
  queryVector:   number[];
  /** Original query string — used for text-search fallback when Atlas Vector Search is unavailable */
  queryText?:    string;
  topK?:         number;
  contentTypes?: string[];
  /** Restrict to a single content item (PDF chat mode) */
  contentId?:    string;
}

export interface QueryResult {
  vectorId:   string;           // ContentChunk._id.toString()
  score:      number;
  chunkIndex: number;
  chunkText:  string;
  pageNumber: number;
  contentId:  string;
  // chunkMeta fields (for the merge step in vectorSearch.ts)
  contentType: string;
  platform:    string;
  title:       string;
  url:         string;
  fileUrl?:    string;          // Cloudinary URL if content was uploaded
}

/** Keyword fallback — used when Atlas Vector Search is unavailable */
async function textFallbackSearch(
  opts: QueryOptions,
  queryText: string
): Promise<QueryResult[]> {
  const limit = opts.topK ?? 10;

  // Build a word-level regex from the query (stop words stripped, max 10 words)
  const stopWords = new Set(["a","an","the","is","it","in","on","at","to","for","of","and","or","but","not","with","this","that","i","my","your","their","we","you","what","how","why","when","where","who","which"]);
  const words = queryText
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w))
    .slice(0, 10);

  if (words.length === 0) return [];

  const regexParts = words.map((w) => `(?=.*${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`);
  const regex = new RegExp(regexParts.join(""), "i");

  const matchFilter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(opts.userId),
    $or: [
      { chunkText:         { $regex: regex } },
      { "chunkMeta.title": { $regex: regex } },
    ],
  };
  if (opts.contentId) {
    matchFilter.contentId = new mongoose.Types.ObjectId(opts.contentId);
  }
  if (opts.contentTypes?.length) {
    matchFilter["chunkMeta.contentType"] = { $in: opts.contentTypes };
  }

  type RawDoc = {
    _id:        mongoose.Types.ObjectId;
    chunkIndex: number;
    chunkText:  string;
    contentId:  mongoose.Types.ObjectId;
    chunkMeta:  { contentType: string; platform: string; title: string; url: string; fileUrl?: string; pageNumber?: number };
  };

  const raw = await ContentChunk.find(matchFilter)
    .select("_id chunkIndex chunkText contentId chunkMeta")
    .limit(limit)
    .lean() as RawDoc[];

  return raw.map((r) => ({
    vectorId:    r._id.toString(),
    score:       0.5,   // placeholder — not a real similarity score
    chunkIndex:  r.chunkIndex,
    chunkText:   r.chunkText,
    pageNumber:  r.chunkMeta.pageNumber ?? 0,
    contentId:   r.contentId.toString(),
    contentType: r.chunkMeta.contentType,
    platform:    r.chunkMeta.platform,
    title:       r.chunkMeta.title,
    url:         r.chunkMeta.url,
    fileUrl:     r.chunkMeta.fileUrl,
  }));
}

export async function queryVectors(opts: QueryOptions): Promise<QueryResult[]> {
  await connectDB();

  const limit       = opts.topK ?? 10;
  const numCandidates = Math.max(limit * 15, 150);

  // Pre-filter applied inside the ANN scan (fields must exist in the index)
  const filter: Record<string, unknown> = {
    userId: new mongoose.Types.ObjectId(opts.userId),
  };
  if (opts.contentId) {
    filter.contentId = new mongoose.Types.ObjectId(opts.contentId);
  }
  if (opts.contentTypes?.length) {
    filter["chunkMeta.contentType"] = { $in: opts.contentTypes };
  }

  const pipeline: mongoose.PipelineStage[] = [
    {
      $vectorSearch: {
        index:         "vector_index",
        path:          "embedding",
        queryVector:   opts.queryVector,
        numCandidates,
        limit,
        filter,
      },
    } as unknown as mongoose.PipelineStage,
    {
      $project: {
        _id:        1,
        chunkIndex: 1,
        chunkText:  1,
        contentId:  1,
        chunkMeta:  1,
        score:      { $meta: "vectorSearchScore" },
      },
    },
  ];

  let raw: Array<{
    _id:        mongoose.Types.ObjectId;
    chunkIndex: number;
    chunkText:  string;
    contentId:  mongoose.Types.ObjectId;
    chunkMeta:  { contentType: string; platform: string; title: string; url: string; fileUrl?: string; pageNumber?: number };
    score:      number;
  }>;

  try {
    raw = await ContentChunk.aggregate(pipeline) as typeof raw;
  } catch (err: unknown) {
    // $vectorSearch fails if the Atlas vector index doesn't exist or Vector Search
    // is not enabled on this cluster tier. Log and return empty results so the
    // rest of the search pipeline (AI answer generation) can still run.
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[queryVectors] $vectorSearch failed:", msg);

    // Re-throw only for unexpected errors that aren't index/feature-related
    const isIndexError =
      msg.includes("index not found") ||
      msg.includes("IndexNotFound") ||
      msg.includes("$vectorSearch") ||
      msg.includes("not allowed") ||
      msg.includes("PlanExecutor");

    if (!isIndexError) throw err;

    // Index missing or Vector Search not available — try keyword fallback
    console.warn(
      "[queryVectors] Atlas Vector Search unavailable. " +
      "Create a 'vector_index' in Atlas UI on the content_chunks collection. " +
      "Falling back to keyword search."
    );
    if (opts.queryText) {
      return textFallbackSearch(opts, opts.queryText);
    }
    return [];
  }

  return raw.map((r) => ({
    vectorId:    r._id.toString(),
    score:       r.score,
    chunkIndex:  r.chunkIndex,
    chunkText:   r.chunkText,
    pageNumber:  r.chunkMeta.pageNumber ?? 0,
    contentId:   r.contentId.toString(),
    contentType: r.chunkMeta.contentType,
    platform:    r.chunkMeta.platform,
    title:       r.chunkMeta.title,
    url:         r.chunkMeta.url,
    fileUrl:     r.chunkMeta.fileUrl,
  }));
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deleteContentVectors(
  _userId: string,
  contentId: string
): Promise<void> {
  await connectDB();
  await ContentChunk.deleteMany({ contentId: new mongoose.Types.ObjectId(contentId) });
}

export async function deleteUserVectors(userId: string): Promise<void> {
  await connectDB();
  await ContentChunk.deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
}

export async function getVectorStats(userId: string) {
  await connectDB();
  const count = await ContentChunk.countDocuments({
    userId: new mongoose.Types.ObjectId(userId),
  });
  return { totalVectors: count };
}
