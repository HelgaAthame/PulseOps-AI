import { listAllEvents, listRecentEvents } from "@/entities/event";
import { computeAnalytics, computeDailySeries } from "@/entities/metric";
import { createClient } from "@/shared/api/supabase/server";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import { MrrChart } from "@/widgets/charts";
import { EventFeed, SimulateButton } from "@/widgets/event-feed";

export async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [recent, allEvents] = user
    ? await Promise.all([
        listRecentEvents(user.id, 8),
        listAllEvents(user.id),
      ])
    : [[], []];

  const analytics = computeAnalytics(allEvents);
  const series = computeDailySeries(allEvents, 60);

  const metrics = [
    { label: "MRR", value: formatCurrency(analytics.mrr), hint: "Monthly recurring revenue" },
    { label: "ARR", value: formatCurrency(analytics.arr), hint: "Annual recurring revenue" },
    {
      label: "Active users",
      value: String(analytics.activeUsers),
      hint: "Last 30 days",
    },
    {
      label: "Churn",
      value: formatPercent(analytics.churnRate),
      hint: "Among subscribers",
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Overview</h1>
        <p className="text-sm text-muted-foreground">
          Live revenue metrics from your billing events
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="rounded-xl border border-border bg-background p-5 shadow-sm"
          >
            <div className="text-sm text-muted-foreground">{m.label}</div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">
              {m.value}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{m.hint}</div>
          </div>
        ))}
      </div>

      {/* Обе панели в одной grid-строке фиксированной высоты (на десктопе):
          график и лента flex-заполняют её, поэтому визуально равны. */}
      <div className="grid grid-cols-1 gap-4 lg:h-90 lg:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm lg:col-span-2">
          <div className="mb-4 text-sm font-medium">MRR over time</div>
          <div className="min-h-60 flex-1 lg:min-h-0">
            <MrrChart data={series} className="h-full" />
          </div>
        </div>

        <div className="flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Live event feed</div>
            <SimulateButton />
          </div>
          <div className="mt-3 flex-1 lg:min-h-0 lg:overflow-y-auto">
            <EventFeed events={recent} />
          </div>
        </div>
      </div>
    </div>
  );
}
