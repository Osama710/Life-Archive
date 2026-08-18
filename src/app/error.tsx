"use client";

import { useEffect } from "react";
import { Button } from "@/components/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error", { digest: error.digest });
  }, [error.digest]);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-stone-50 p-6">
      <div className="max-w-md rounded-2xl border border-stone-200 bg-white p-8 text-center shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-primary">
          Life Archive
        </p>
        <h1 className="mb-3 text-3xl font-bold">We couldn’t open this page</h1>
        <p className="mb-6 text-stone-600">
          Your memories are safe. Please try loading this part of the archive
          again.
        </p>
        <Button type="button" onClick={reset}>
          Try again
        </Button>
      </div>
    </main>
  );
}
