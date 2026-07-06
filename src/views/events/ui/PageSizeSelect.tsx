"use client";

import { useRouter } from "next/navigation";
import { Select } from "@base-ui/react/select";
import { Check, ChevronsUpDown } from "lucide-react";

import { PAGE_SIZES } from "./EventsPagination";

/**
 * Выбор числа событий на странице (10/15/20/25). Кастомный селект в стиле
 * приложения на @base-ui/react (как Button), а не нативный <select>.
 * Сбрасывает на 1-ю страницу, сохраняет поиск (q).
 */
export function PageSizeSelect({ size, q }: { size: number; q?: string }) {
  const router = useRouter();

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className="hidden sm:inline">Per page</span>
      <Select.Root
        value={size}
        onValueChange={(value) => {
          if (value == null) return;
          const sp = new URLSearchParams();
          sp.set("size", String(value));
          if (q) sp.set("q", q);
          router.push(`/events?${sp.toString()}`);
        }}
      >
        <Select.Trigger className="flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs font-medium text-foreground outline-none transition-colors select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted dark:bg-input/30 dark:hover:bg-input/50">
          <Select.Value />
          <Select.Icon className="text-muted-foreground">
            <ChevronsUpDown className="size-3" />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Positioner
            sideOffset={6}
            align="start"
            alignItemWithTrigger={false}
            className="z-50 outline-none"
          >
            <Select.Popup className="min-w-16 rounded-lg border border-border bg-background p-1 text-foreground shadow-lg outline-none">
              {PAGE_SIZES.map((n) => (
                <Select.Item
                  key={n}
                  value={n}
                  className="flex cursor-default items-center justify-between gap-4 rounded-md px-2 py-1.5 text-xs outline-none select-none data-highlighted:bg-muted data-highlighted:text-foreground"
                >
                  <Select.ItemText>{n}</Select.ItemText>
                  <Select.ItemIndicator>
                    <Check className="size-3.5 text-primary" />
                  </Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}
