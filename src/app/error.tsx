"use client";

import { useEffect } from "react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[RootError]", error);
  }, [error]);

  return <MaintenancePage reset={reset} />;
}

export { MaintenancePage };

function MaintenancePage({ reset }: { reset?: () => void }) {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center
                    px-6 text-center bg-zinc-50 dark:bg-[#0B0B0F] overflow-hidden">

      {/* Dot grid background */}
      <div className="pointer-events-none absolute inset-0 dot-bg opacity-40 dark:opacity-20" />

      {/* Ambient glow */}
      <div className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2
                      w-[520px] h-[340px] rounded-full
                      bg-violet-500/10 dark:bg-violet-500/15 blur-3xl" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md">

        {/* Animated logo */}
        <div className="relative">
          <div className="absolute inset-0 rounded-2xl bg-violet-500/20 blur-xl animate-pulse" />
          <div className="relative h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700
                          flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <WrenchIcon className="h-7 w-7 text-white" />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold
                        bg-amber-50 dark:bg-amber-500/10
                        text-amber-700 dark:text-amber-400
                        border border-amber-200 dark:border-amber-500/25">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Under Maintenance
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight
                         text-zinc-900 dark:text-zinc-100">
            We&apos;ll be back{" "}
            <span className="gradient-text">shortly</span>
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Something unexpected happened on our end. Our team has been notified
            and is working to fix it — please try again in a moment.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {reset && (
            <button
              onClick={reset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                         text-white bg-gradient-to-r from-violet-600 to-indigo-600
                         hover:from-violet-500 hover:to-indigo-500
                         shadow-lg shadow-violet-500/20 transition-all active:scale-95"
            >
              <RefreshIcon className="h-4 w-4" />
              Try again
            </button>
          )}
          <a
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                       text-zinc-700 dark:text-zinc-300
                       bg-white dark:bg-zinc-900
                       border border-zinc-200 dark:border-zinc-700
                       hover:border-zinc-300 dark:hover:border-zinc-600
                       transition-all active:scale-95"
          >
            <HomeIcon className="h-4 w-4" />
            Go home
          </a>
        </div>

        {/* Support link */}
        <a
          href="/support"
          className="text-xs text-zinc-400 dark:text-zinc-500
                     hover:text-violet-600 dark:hover:text-violet-400
                     transition-colors underline underline-offset-2"
        >
          Visit support page
        </a>
      </div>
    </div>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z" />
    </svg>
  );
}
function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}
function HomeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}
