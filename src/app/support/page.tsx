import type { Metadata } from "next";
import Link from "next/link";
import SupportContent from "@/components/support/SupportContent";

export const metadata: Metadata = { title: "Support — BrainHistory" };

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0B0B0F]">

      {/* Minimal public header */}
      <header className="sticky top-0 z-20 flex items-center justify-between
                         px-5 h-14
                         bg-white/90 dark:bg-[#111116]/90 backdrop-blur-sm
                         border-b border-zinc-100 dark:border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <LogoMark />
          <span className="font-semibold text-sm tracking-tight text-zinc-900 dark:text-[#F5F5F7]">
            Brain<span className="font-normal dark:opacity-65">History</span>
          </span>
        </Link>
        <Link
          href="/dashboard"
          className="text-xs font-medium px-3 py-1.5 rounded-xl
                     text-violet-700 dark:text-violet-300
                     bg-violet-50 dark:bg-violet-500/10
                     border border-violet-100 dark:border-violet-500/20
                     hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-colors"
        >
          Go to app →
        </Link>
      </header>

      {/* Page content */}
      <SupportContent />
    </div>
  );
}

function LogoMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" className="shrink-0">
      <defs>
        <linearGradient id="lm-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9B7BFF" />
          <stop offset="100%" stopColor="#5B3FD9" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#lm-g)" />
      <path d="M10 7L10 25M10 7C17 7 22 9.5 22 13C22 15 20.5 16 18 16C21 16 23 17.5 23 20C23 23 19 25 10 25"
        stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="16" r="1.4" fill="white" />
    </svg>
  );
}
