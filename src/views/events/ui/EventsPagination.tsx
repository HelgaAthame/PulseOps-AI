import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/shared/ui/button";

import { PageJump } from "./PageJump";
import { PageSizeSelect } from "./PageSizeSelect";

export const PAGE_SIZES = [10, 15, 20, 25] as const;

type EventsPaginationProps = {
  page: number;
  totalPages: number;
  size: number;
  q?: string;
  from: number;
  to: number;
  total: number;
};

/** Строит /events?… с сохранением size и q. */
function href(page: number, size: number, q?: string): string {
  const sp = new URLSearchParams();
  if (page > 1) sp.set("page", String(page));
  sp.set("size", String(size));
  if (q) sp.set("q", q);
  const qs = sp.toString();
  return qs ? `/events?${qs}` : "/events";
}

/** Серверная пагинация ленты событий: page/size/q живут в URL. */
export function EventsPagination({
  page,
  totalPages,
  size,
  q,
  from,
  to,
  total,
}: EventsPaginationProps) {
  const linkCls = buttonVariants({ variant: "outline", size: "sm" });
  const disabledCls =
    "inline-flex h-7 items-center gap-1 rounded-[min(var(--radius-md),12px)] border border-border px-2.5 text-[0.8rem] font-medium text-muted-foreground opacity-50 [&_svg]:size-3.5";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <p className="text-xs text-muted-foreground">
          Showing <span className="font-medium text-foreground">{from}</span>–
          <span className="font-medium text-foreground">{to}</span> of{" "}
          <span className="font-medium text-foreground">{total}</span>
        </p>
        <PageSizeSelect size={size} q={q} />
      </div>

      <div className="flex items-center gap-2">
        {page > 1 ? (
          <Link href={href(page - 1, size, q)} className={linkCls}>
            <ChevronLeft />
            Prev
          </Link>
        ) : (
          <span className={disabledCls} aria-disabled>
            <ChevronLeft />
            Prev
          </span>
        )}

        <PageJump page={page} totalPages={totalPages} size={size} q={q} />

        {page < totalPages ? (
          <Link href={href(page + 1, size, q)} className={linkCls}>
            Next
            <ChevronRight />
          </Link>
        ) : (
          <span className={disabledCls} aria-disabled>
            Next
            <ChevronRight />
          </span>
        )}
      </div>
    </div>
  );
}
