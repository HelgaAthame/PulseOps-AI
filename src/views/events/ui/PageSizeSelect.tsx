"use client";

import { useRouter } from "next/navigation";

import { PAGE_SIZES } from "./EventsPagination";

/** Выбор числа событий на странице (10/15/20/25). Сбрасывает на 1-ю страницу. */
export function PageSizeSelect({ size, q }: { size: number; q?: string }) {
  const router = useRouter();

  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="hidden sm:inline">Per page</span>
      <select
        value={size}
        onChange={(e) => {
          const sp = new URLSearchParams();
          sp.set("size", e.target.value);
          if (q) sp.set("q", q);
          router.push(`/events?${sp.toString()}`);
        }}
        className="h-7 rounded-md border border-border bg-background px-1.5 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        aria-label="Events per page"
      >
        {PAGE_SIZES.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </select>
    </label>
  );
}
