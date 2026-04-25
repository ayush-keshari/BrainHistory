"use client";

/**
 * global-error.tsx
 *
 * Catches errors thrown inside the root layout itself.
 * Must provide its own <html> and <body> tags because the
 * root layout is broken and cannot render.
 */

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0B0B0F", color: "#F5F5F7", fontFamily: "system-ui, sans-serif" }}>
        <ErrorScreen reset={reset} />
      </body>
    </html>
  );
}

function ErrorScreen({ reset }: { reset: () => void }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      textAlign: "center",
      gap: "24px",
    }}>
      {/* Glow */}
      <div style={{
        position: "fixed", top: "30%", left: "50%", transform: "translate(-50%, -50%)",
        width: 480, height: 320, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(124,92,255,0.18) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Logo */}
      <svg width="52" height="52" viewBox="0 0 32 32" fill="none" style={{ flexShrink: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9B7BFF" />
            <stop offset="100%" stopColor="#5B3FD9" />
          </linearGradient>
        </defs>
        <rect width="32" height="32" rx="8" fill="url(#g)" />
        <path d="M10 7L10 25M10 7C17 7 22 9.5 22 13C22 15 20.5 16 18 16C21 16 23 17.5 23 20C23 23 19 25 10 25"
          stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="16" r="1.4" fill="white" />
      </svg>

      <div style={{ maxWidth: 380 }}>
        <p style={{ fontSize: 13, color: "rgba(155,123,255,0.9)", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>
          Under Maintenance
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: "0 0 10px", lineHeight: 1.25 }}>
          We&apos;ll be back shortly
        </h1>
        <p style={{ fontSize: 14, color: "rgba(245,245,247,0.55)", lineHeight: 1.6, margin: 0 }}>
          Something unexpected happened on our end. Our team has been notified and is working to fix it. Please try again in a moment.
        </p>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <button
          onClick={reset}
          style={{
            padding: "10px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: "linear-gradient(135deg, #7C5CFF, #5B3FD9)", color: "#fff",
            border: "none", cursor: "pointer",
          }}
        >
          Try again
        </button>
        <a
          href="/"
          style={{
            padding: "10px 22px", borderRadius: 12, fontSize: 14, fontWeight: 600,
            background: "rgba(255,255,255,0.06)", color: "rgba(245,245,247,0.8)",
            border: "1px solid rgba(255,255,255,0.08)", textDecoration: "none",
          }}
        >
          Go home
        </a>
      </div>
    </div>
  );
}
