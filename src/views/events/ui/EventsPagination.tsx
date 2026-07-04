import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { buttonVariants } from "@/shared/ui/button";

type EventsPaginationProps = {
  page: number;
  totalPages: number;
  from: number;
  to: number;
  total: number;
};

/** Серверная пагинация ленты событий: страница живёт в `?page=`. */
export function EventsPagination({
  page,
  totalPages,
  from,
  to,
  total,
}: EventsPaginationProps) {
  const linkCls = buttonVariants({ variant: "outline", size: "sm" });
  const disabledCls =
    "inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border px-2.5 text-[0.8rem] font-medium text-muted-foreground opacity-50 [&_svg]:size-3.5";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">
        Showing <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> of{" "}
        <span className="font-medium text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={`/events?page=${page - 1}`} className={linkCls}>
            <ChevronLeft />
            Prev
          </Link>
        ) : (
          <span className={disabledCls} aria-disabled>
            <ChevronLeft />
            Prev
          </span>
        )}

        <span className="text-xs text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{" "}
          {totalPages}
        </span>

        {page < totalPages ? (
          <Link href={`/events?page=${page + 1}`} className={linkCls}>
            Next
            <ChevronRight />
          </Link>
        ) : (
          <span className={cn(disabledCls)} aria-disabled>
            Next
            <ChevronRight />
          </span>
        )}
      </div>
    </div>
  );
}
