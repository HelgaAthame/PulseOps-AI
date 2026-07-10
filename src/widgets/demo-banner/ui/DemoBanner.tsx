"use client";

import { useEffect, useState } from "react";
import { Info, X } from "lucide-react";

const STORAGE_KEY = "pulseops:demo-banner-dismissed";

/**
 * Тонкая плашка «это демо на сэмпл-данных» + продуктовое видение (в проде —
 * приём вебхуков Stripe). Скрывается по клику, состояние в localStorage.
 * Стартует скрытой, чтобы не мигать у тех, кто уже закрыл.
 */
export function DemoBanner() {
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    setHidden(localStorage.getItem(STORAGE_KEY) === "1");
  }, []);

  if (hidden) return null;

  return (
    <div className="flex items-center gap-2.5 border-b border-primary/20 bg-primary/10 px-4 py-1.5 text-xs">
      <Info className="size-3.5 shrink-0 text-primary" />
      <p className="min-w-0 flex-1">
        <span className="font-medium">Demo workspace</span> — you&apos;re viewing
        sample data. In production, PulseOps ingests your Stripe billing webhooks.
      </p>
      <button
        type="button"
        onClick={() => {
          localStorage.setItem(STORAGE_KEY, "1");
          setHidden(true);
        }}
        aria-label="Dismiss"
        className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-primary/15 hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
