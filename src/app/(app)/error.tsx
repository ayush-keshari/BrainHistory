"use client";

import { useEffect } from "react";
import { MaintenancePage } from "@/app/error";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AppError]", error);
  }, [error]);

  return <MaintenancePage reset={reset} />;
}
