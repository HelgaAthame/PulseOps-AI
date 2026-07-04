"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

import { Button } from "@/shared/ui/button";

type SimulateButtonProps = {
  count?: number;
};

export function SimulateButton({ count = 8 }: SimulateButtonProps) {
  const router = useRouter();
  const [isSending, setIsSending] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setIsSending(true);
    try {
      await fetch("/api/events/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count }),
      });
      startTransition(() => router.refresh());
    } finally {
      setIsSending(false);
    }
  }

  const loading = isSending || isPending;

  return (
    <Button size="sm" onClick={handleClick} disabled={loading}>
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Zap className="size-4" />
      )}
      Simulate activity
    </Button>
  );
}
