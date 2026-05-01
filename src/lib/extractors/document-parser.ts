/**
 * documentParser
 *
 * Parse common document formats from a Buffer — used by both the URL extractor
 * (pdf.ts fetches → Buffer) and the file upload route (direct Buffer from upload).
 *
 * Supported formats:
 *   PDF   (.pdf)  — pdf-parse v1
 *   DOCX  (.docx) — mammoth
 *   DOC   (.doc)  — mammoth (best-effort; older binary format)
 */

export interface ParsedDocument {
  text:      string;
  title?:    string;
  author?:   string;
  subject?:  string;
  keywords?: string[];
  pageCount?: number;
  /** approximate — based on text character count */
  isLarge:   boolean;
}

const LARGE_THRESHOLD = 10_000; // chars

// ─── PDF ──────────────────────────────────────────────────────────────────────

export async function parsePdfBuffer(buffer: Buffer): Promise<ParsedDocument> {
  // Polyfill DOMMatrix for Node.js environment
  if (typeof globalThis.DOMMatrix === 'undefined') {
    globalThis.DOMMatrix = class DOMMatrix {
      constructor(init?: string | number[]) {
        // Basic implementation - pdf-parse mainly uses this for matrix operations
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
        if (typeof init === 'string') {
          // Parse transform string like "matrix(a,b,c,d,e,f)"
          const match = init.match(/matrix\(([^)]+)\)/);
          if (match) {
            const values = match[1].split(',').map(v => parseFloat(v.trim()));
            if (values.length === 6) {
              this.a = values[0]; this.b = values[1]; this.c = values[2];
              this.d = values[3]; this.e = values[4]; this.f = values[5];
            }
          }
        } else if (Array.isArray(init) && init.length === 6) {
          this.a = init[0]; this.b = init[1]; this.c = init[2];
          this.d = init[3]; this.e = init[4]; this.f = init[5];
        }
      }
      a: number; b: number; c: number; d: number; e: number; f: number;

      multiplySelf(other: DOMMatrix) {
        const a = this.a * other.a + this.c * other.b;
        const b = this.b * other.a + this.d * other.b;
        const c = this.a * other.c + this.c * other.d;
        const d = this.b * other.c + this.d * other.d;
        const e = this.a * other.e + this.c * other.f + this.e;
        const f = this.b * other.e + this.d * other.f + this.f;
        this.a = a; this.b = b; this.c = c; this.d = d; this.e = e; this.f = f;
        return this;
      }

      transformPoint(point: { x: number; y: number }) {
        return {
          x: this.a * point.x + this.c * point.y + this.e,
          y: this.b * point.x + this.d * point.y + this.f
        };
      }
    } as any;
  }

  // Lazy require prevents DOMMatrix crash during module init in Next.js
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pdfParse = require("pdf-parse") as (
    buf: Buffer
  ) => Promise<{
    text: string;
    numpages: number;
    info: Record<string, string | undefined>;
  }>;

  const parsed = await pdfParse(buffer);

  const text = parsed.text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return {
    text,
    title:     parsed.info?.Title   || undefined,
    author:    parsed.info?.Author  || undefined,
    subject:   parsed.info?.Subject || undefined,
    keywords:  parsed.info?.Keywords
      ? (parsed.info.Keywords as string).split(/[,;]/).map((k) => k.trim()).filter(Boolean)
      : undefined,
    pageCount: parsed.numpages,
    isLarge:   text.length > LARGE_THRESHOLD,
  };
}

// ─── DOCX / DOC ───────────────────────────────────────────────────────────────

export async function parseWordBuffer(buffer: Buffer): Promise<ParsedDocument> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mammoth = require("mammoth") as {
    extractRawText: (opts: { buffer: Buffer }) => Promise<{ value: string; messages: unknown[] }>;
  };

  const result = await mammoth.extractRawText({ buffer });

  const text = result.value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  return {
    text,
    isLarge: text.length > LARGE_THRESHOLD,
  };
}
