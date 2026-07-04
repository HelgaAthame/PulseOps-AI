import { listRecentEvents } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";
import { EventFeed, SimulateButton } from "@/widgets/event-feed";

export async function EventsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const events = user ? await listRecentEvents(user.id, 50) : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">События</h1>
          <p className="text-sm text-muted-foreground">
            Поток бизнес-событий симулируемого SaaS
          </p>
        </div>
        <SimulateButton count={12} />
      </div>

      <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
        <EventFeed events={events} />
      </div>
    </div>
  );
}
