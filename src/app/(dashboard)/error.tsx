"use client"; // Error boundary обязан быть Client Component.

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/shared/ui/button";

// Ловит непойманные исключения при рендере сегментов dashboard и показывает
// fallback вместо падения всего приложения. В этой версии Next коллбэк
// повтора называется `unstable_retry` (не классический `reset`).
export default function DashboardError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 p-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="size-6" />
      </span>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h2>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          This section failed to load. It’s usually temporary — try again, and
          if it keeps happening the data source may be unavailable.
        </p>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={() => unstable_retry()}>
        <RefreshCw className="size-3.5" />
        Try again
      </Button>
    </div>
  );
}
