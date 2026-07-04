import { countOwnerEvents, listEventsPage } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";
import { EventFeed, SimulateButton } from "@/widgets/event-feed";

import { EventsPagination } from "./EventsPagination";

const PAGE_SIZE = 25;

export async function EventsPage({ page: rawPage }: { page?: string }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const total = user ? await countOwnerEvents(user.id) : 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Номер страницы из URL, зажатый в допустимый диапазон.
  const parsed = Number.parseInt(rawPage ?? "1", 10);
  const page = Math.min(
    Math.max(Number.isFinite(parsed) ? parsed : 1, 1),
    totalPages
  );
  const offset = (page - 1) * PAGE_SIZE;

  const events = user
    ? await listEventsPage(user.id, { limit: PAGE_SIZE, offset })
    : [];

  const from = total === 0 ? 0 : offset + 1;
  const to = offset + events.length;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Events</h1>
          <p className="text-sm text-muted-foreground">
            Business event stream of the simulated SaaS
          </p>
        </div>
        <SimulateButton count={12} />
      </div>

      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <EventFeed events={events} />
      </div>

      {total > PAGE_SIZE && (
        <EventsPagination
          page={page}
          totalPages={totalPages}
          from={from}
          to={to}
          total={total}
        />
      )}
    </div>
  );
}
