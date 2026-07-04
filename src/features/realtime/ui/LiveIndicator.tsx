"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/shared/api/supabase/client";
import { cn } from "@/shared/lib/utils";

/**
 * Подписка на вставки событий владельца через Supabase Realtime.
 * При новом событии обновляет серверные данные (лента + графики) —
 * дебаунс, чтобы пачка вставок (simulate) вызвала один refresh.
 * Заодно показывает индикатор Live по статусу канала.
 */
export function LiveIndicator({ userId }: { userId: string }) {
  const router = useRouter();
  const [connected, setConnected] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`events-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
          filter: `owner_id=eq.${userId}`,
        },
        () => {
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(() => router.refresh(), 400);
        }
      )
      .subscribe((status) => setConnected(status === "SUBSCRIBED"));

    return () => {
      if (timer.current) clearTimeout(timer.current);
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  return (
    <div className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground sm:flex">
      <span
        className={cn(
          "size-1.5 rounded-full",
          connected ? "animate-pulse bg-emerald-500" : "bg-muted-foreground/40"
        )}
      />
      {connected ? "Live" : "Connecting…"}
    </div>
  );
}
