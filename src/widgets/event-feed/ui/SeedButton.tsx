"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Database, Loader2 } from "lucide-react";

import { Button } from "@/shared/ui/button";

/** Заполняет аккаунт демо-историей за ~60 дней (заменяя текущие события). */
export function SeedButton() {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setIsSending(true);
    try {
      await fetch("/api/events/seed", { method: "POST" });
      startTransition(() => router.refresh());
    } finally {
      setIsSending(false);
    }
  }

  const loading = isSending || isPending;

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Database className="size-4" />
      )}
      Seed demo data
    </Button>
  );
}
