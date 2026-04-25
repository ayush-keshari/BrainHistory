"use client";

import { useState } from "react";
import Link from "next/link";

// ─── FAQ data ─────────────────────────────────────────────────────────────────

const FAQS = [
  {
    q: "How do I save a URL?",
    a: "Click the + button (mobile) or the Add Content button in the sidebar, paste any URL, then hit Save. BrainHistory extracts the full content automatically — articles, YouTube videos, PDFs, GitHub repos, tweets and more.",
  },
  {
    q: "Why is my content stuck on 'processing'?",
    a: "Processing usually completes in a few seconds. If it's stuck, the page may be behind a login wall or blocked by bot protection. Try saving a different URL. Content that fails extraction is still saved as a bookmark so you don't lose the link.",
  },
  {
    q: "How does AI Search work?",
    a: "When you save content, BrainHistory breaks it into chunks and creates vector embeddings using OpenAI. When you search, your query is embedded and matched against those vectors semantically — so 'machine learning' finds articles about 'neural networks' even without exact keyword overlap.",
  },
  {
    q: "What is Chat mode and when does it appear?",
    a: "Chat mode appears for large content items (long articles, PDFs, full GitHub repos). Instead of a detail view, you get a ✦ AI Chat button. The AI answers questions about that specific document using retrieval-augmented generation.",
  },
  {
    q: "Can I organise my saved items?",
    a: "Yes — create Collections from the sidebar (or the + icon next to 'Collections'). Open any saved item and assign it to one or more collections. You can also star items as Favourites and filter by content type.",
  },
  {
    q: "How do I delete saved content?",
    a: "On desktop, hover a card and click the ⋯ menu → Delete. On mobile, long-press a card to enter selection mode, pick items, then tap the trash icon. Bulk delete is available via the checkbox / select-all button at the top.",
  },
  {
    q: "Is my data private?",
    a: "All content is stored in your personal library and is never shared. Search and chat queries are sent to OpenAI for embedding and answer generation but are subject to your OpenAI account's data-retention settings. See our Privacy Policy for details.",
  },
  {
    q: "Which content types are supported?",
    a: "Websites, blog posts, PDFs, YouTube videos (captions extracted), GitHub repositories (README + code files), Reddit threads, X/Twitter posts, Spotify tracks, and plain notes. Unsupported types are saved as basic bookmarks.",
  },
];

// ─── Guide cards ──────────────────────────────────────────────────────────────

const GUIDES = [
  {
    icon: <SaveIcon />,
    title: "Saving your first URL",
    desc: "Paste any link and let the AI extract and index the content.",
    steps: ["Click + Add Content", "Paste a URL and press Save", "Wait for the processing badge to turn green"],
  },
  {
    icon: <SearchGuideIcon />,
    title: "Using AI Search",
    desc: "Ask natural-language questions across everything you've saved.",
    steps: ["Navigate to AI Search in the sidebar", "Type a question in plain English", "Review the AI answer and source cards"],
  },
  {
    icon: <ChatGuideIcon />,
    title: "Chatting with a document",
    desc: "Deep-dive into a single PDF or long article with multi-turn Q&A.",
    steps: ["Open any 'large' content item", "Click the ✦ AI Chat button", "Ask questions — the AI stays focused on that document"],
  },
  {
    icon: <CollectionGuideIcon />,
    title: "Organising with Collections",
    desc: "Group related content so your library stays tidy.",
    steps: ["Click + next to Collections in the sidebar", "Name and colour your collection", "Assign items via the card menu"],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function SupportContent() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 md:py-12 space-y-10">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
                        bg-violet-50 dark:bg-violet-500/10
                        text-violet-700 dark:text-violet-300
                        border border-violet-100 dark:border-violet-500/20">
          <LifebuoyIcon className="h-3.5 w-3.5" />
          Help &amp; Support
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          We&apos;re here to <span className="gradient-text">help</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto">
          Browse the guides and FAQs below. If you still need help, reach out and we&apos;ll get back to you.
        </p>
      </div>

      {/* ── Quick guides ─────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel icon={<BookIcon />} label="Getting Started" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {GUIDES.map((g) => (
            <GuideCard key={g.title} {...g} />
          ))}
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel icon={<FaqIcon />} label="Frequently Asked Questions" />
        <div className="space-y-2">
          {FAQS.map((faq, i) => (
            <FaqRow
              key={i}
              question={faq.q}
              answer={faq.a}
              open={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? null : i)}
            />
          ))}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section>
        <div className="card-accent relative overflow-hidden rounded-2xl
                        bg-white dark:bg-zinc-900
                        border border-zinc-100 dark:border-zinc-800
                        p-6 text-center space-y-4">
          {/* Decorative glow */}
          <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2
                          h-32 w-64 rounded-full
                          bg-violet-500/10 dark:bg-violet-500/15 blur-3xl" />

          <div className="relative space-y-1">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl
                            bg-gradient-to-br from-violet-600 to-indigo-600
                            shadow-lg shadow-violet-500/25 mx-auto">
              <MailIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 pt-1">
              Still need help?
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Drop us an email and we&apos;ll respond within 24 hours.
            </p>
          </div>

          <a
            href="mailto:srv.br009@gmail.com"
            className="relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       text-white bg-gradient-to-r from-violet-600 to-indigo-600
                       hover:from-violet-500 hover:to-indigo-500
                       shadow-lg shadow-violet-500/20 transition-all active:scale-95"
          >
            <MailIcon className="h-4 w-4" />
            srv.br009@gmail.com
          </a>

          <p className="relative text-xs text-zinc-400 dark:text-zinc-500">
            Also check our{" "}
            <Link href="/privacy"
              className="text-violet-600 dark:text-violet-400 hover:underline">
              Privacy Policy
            </Link>{" "}
            for data-related questions.
          </p>
        </div>
      </section>

      {/* ── Keyboard shortcuts ───────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionLabel icon={<KeyIcon />} label="Keyboard Shortcuts" />
        <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
          {[
            { keys: ["Enter"], action: "Submit form / send chat message" },
            { keys: ["Shift", "Enter"], action: "New line in chat input" },
            { keys: ["Escape"], action: "Close modal / sheet" },
            { keys: ["⌘", "K"], action: "Open search (desktop)" },
          ].map(({ keys, action }) => (
            <div key={action} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{action}</span>
              <div className="flex items-center gap-1">
                {keys.map((k) => (
                  <kbd key={k}
                    className="px-2 py-0.5 rounded-lg text-xs font-mono
                               bg-zinc-100 dark:bg-zinc-800
                               border border-zinc-200 dark:border-zinc-700
                               text-zinc-500 dark:text-zinc-400">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-violet-500 dark:text-violet-400">{icon}</span>
      <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-zinc-100 dark:bg-zinc-800" />
    </div>
  );
}

function GuideCard({ icon, title, desc, steps }: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  steps: string[];
}) {
  return (
    <div className="card-accent rounded-2xl p-4 space-y-3
                    bg-white dark:bg-zinc-900
                    border border-zinc-100 dark:border-zinc-800
                    hover:-translate-y-px transition-all duration-150">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0
                        bg-violet-50 dark:bg-violet-500/10
                        border border-violet-100 dark:border-violet-500/20
                        text-violet-600 dark:text-violet-400">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-snug">{desc}</p>
        </div>
      </div>
      <ol className="space-y-1.5 pl-1">
        {steps.map((step, i) => (
          <li key={i} className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="shrink-0 h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold
                             bg-violet-100 dark:bg-violet-500/15
                             text-violet-700 dark:text-violet-400 mt-px">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </div>
  );
}

function FaqRow({ question, answer, open, onToggle }: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`rounded-2xl border transition-all duration-150 overflow-hidden ${
      open
        ? "bg-violet-50 dark:bg-violet-500/[0.07] border-violet-200 dark:border-violet-500/25"
        : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700"
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left"
      >
        <span className={`text-sm font-medium ${
          open ? "text-violet-700 dark:text-violet-300" : "text-zinc-800 dark:text-zinc-200"
        }`}>
          {question}
        </span>
        <ChevronIcon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${
          open
            ? "rotate-180 text-violet-500 dark:text-violet-400"
            : "text-zinc-400 dark:text-zinc-500"
        }`} />
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-violet-100 dark:border-violet-500/15 pt-3">
          {answer}
        </div>
      )}
    </div>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function LifebuoyIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406-1.396a9.025 9.025 0 00-1.382.026"/></svg>;
}
function BookIcon() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>;
}
function FaqIcon() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z"/></svg>;
}
function KeyIcon() {
  return <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z"/></svg>;
}
function MailIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>;
}
function ChevronIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>;
}
function SaveIcon() {
  return <svg className="h-4.5 w-4.5 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15"/></svg>;
}
function SearchGuideIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z"/></svg>;
}
function ChatGuideIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"/></svg>;
}
function CollectionGuideIcon() {
  return <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"/></svg>;
}
