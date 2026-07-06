"use client";

import { useRouter } from "next/navigation";

/**
 * Поле ввода номера страницы: пользователь вводит число и жмёт Enter (или
 * уводит фокус) — переходим на эту страницу. Значение зажимается в [1,
 * totalPages]. Навигация через URL (?page=…), сохраняем size и q.
 */
export function PageJump({
  page,
  totalPages,
  size,
  q,
}: {
  page: number;
  totalPages: number;
  size: number;
  q?: string;
}) {
  const router = useRouter();

  function go(raw: string) {
    const n = Number.parseInt(raw, 10);
    if (!Number.isFinite(n)) return;
    const target = Math.min(Math.max(n, 1), totalPages);
    if (target === page) return;
    const sp = new URLSearchParams();
    if (target > 1) sp.set("page", String(target));
    sp.set("size", String(size));
    if (q) sp.set("q", q);
    router.push(`/events?${sp.toString()}`);
  }

  return (
    <form
      className="flex items-center gap-1.5 text-xs text-muted-foreground"
      onSubmit={(e) => {
        e.preventDefault();
        const input = e.currentTarget.elements.namedItem("page") as HTMLInputElement;
        go(input.value);
      }}
    >
      <span>Page</span>
      <input
        // key сбрасывает поле к актуальной странице после навигации.
        key={page}
        name="page"
        type="number"
        min={1}
        max={totalPages}
        defaultValue={page}
        aria-label="Go to page"
        className="h-7 w-12 rounded-md border border-border bg-background px-2 text-center text-xs font-medium text-foreground outline-none transition-colors [appearance:textfield] hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 dark:hover:bg-input/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        onBlur={(e) => go(e.currentTarget.value)}
      />
      <span>
        of <span className="font-medium text-foreground">{totalPages}</span>
      </span>
    </form>
  );
}
