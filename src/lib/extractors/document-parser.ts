/**
 * documentParser
 *
 * Parse common document formats from a Buffer — used by both the URL extractor
 * (pdf.ts fetches → Buffer) and the file upload route (direct Buffer from upload).
 *
 * Supported formats:
 *   PDF   (.pdf)  — pdfjs-dist
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
  // Dynamically import pdfjs-dist at runtime to avoid DOMMatrix issues at build time
  const pdfjsLib = await import('pdfjs-dist');
  
  // Setup worker for Node.js runtime
  if (typeof window === 'undefined') {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const pdfjsWorker = require('pdfjs-dist/build/pdf.worker');
      pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    } catch (e) {
      // Fallback: let pdfjs handle worker initialization
    }
  }
  
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageCount = pdf.numPages;
  const metadata = await pdf.getMetadata().catch(() => null);
  
  let text = '';
  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    text += pageText + '\n';
  }

  text = text
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  const pdfMetadata = metadata?.metadata || {};

  return {
    text,
    title:     pdfMetadata.title || undefined,
    author:    pdfMetadata.author || undefined,
    subject:   pdfMetadata.subject || undefined,
    keywords:  pdfMetadata.keywords
      ? (pdfMetadata.keywords as string).split(/[,;]/).map((k: string) => k.trim()).filter(Boolean)
      : undefined,
    pageCount,
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
