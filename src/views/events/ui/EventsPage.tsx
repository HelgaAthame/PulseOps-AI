import { countOwnerEvents, listEventsPage } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";
import { EventFeed, SimulateButton } from "@/widgets/event-feed";

import { EventsPagination, PAGE_SIZES } from "./EventsPagination";

const DEFAULT_SIZE = 10;

export async function EventsPage({
  page: rawPage,
  size: rawSize,
  q: rawQ,
}: {
  page?: string;
  size?: string;
  q?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const q = rawQ?.trim() || undefined;

  // Размер страницы из URL, только из разрешённого набора.
  const parsedSize = Number.parseInt(rawSize ?? "", 10);
  const pageSize = (PAGE_SIZES as readonly number[]).includes(parsedSize)
    ? parsedSize
    : DEFAULT_SIZE;

  const total = user ? await countOwnerEvents(user.id, q) : 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // Номер страницы из URL, зажатый в допустимый диапазон.
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  const page = Math.min(
    Math.max(Number.isFinite(parsed) ? parsed : 1, 1),
    totalPages
  );
  const offset = (page - 1) * pageSize;

  const events = user
    ? await listEventsPage(user.id, { limit: pageSize, offset, q })
    : [];

  const from = total === 0 ? 0 : offset + 1;
  const to = offset + events.length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            {q
              ? `Search results for “${q}”`
              : "Business event stream of the simulated SaaS"}
          </p>
        </div>
        <SimulateButton count={12} />
      </div>

      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        {q && events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No events match “{q}”. Try a type like{" "}
            <span className="font-medium">payment</span>,{" "}
            <span className="font-medium">signup</span> or{" "}
            <span className="font-medium">churn</span>.
          </p>
        ) : (
          <EventFeed events={events} />
        )}
      </div>

      {total > Math.min(...PAGE_SIZES) && (
        <EventsPagination
          page={page}
          totalPages={totalPages}
          size={pageSize}
          q={q}
          from={from}
          to={to}
          total={total}
        />
      )}
    </div>
  );
}
