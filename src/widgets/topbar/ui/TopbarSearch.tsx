"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

/**
 * Поиск в topbar. Отправляет запрос на /events?q=… — там события фильтруются
 * по типу и id клиента. Раньше это была статичная заглушка (не работала).
 */
export function TopbarSearch() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      className="hidden min-w-0 flex-1 items-center gap-2 md:flex"
      onSubmit={(e) => {
        e.preventDefault();
        const q = value.trim();
        router.push(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
      }}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search events (type or customer)…"
        className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
        aria-label="Search events"
      />
    </form>
  );
}
