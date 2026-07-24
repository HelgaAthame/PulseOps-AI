import { listAllEvents } from "@/entities/event";
import {
  computeAnalytics,
  computeDailySeries,
  computeEventTypeCounts,
  computeMrrMovement,
} from "@/entities/metric";
import { createClient } from "@/shared/api/supabase/server";
import { cn } from "@/shared/lib/utils";
import { formatCurrency, formatPercent } from "@/shared/lib/format";
import {
  MrrChart,
  SignupsChart,
  EventMixChart,
  MrrWaterfallChart,
} from "@/widgets/charts";
import { SeedButton } from "@/widgets/event-feed";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const events = user ? await listAllEvents(user.id) : [];
  const analytics = computeAnalytics(events);
  const series = computeDailySeries(events, 60);
  const typeCounts = computeEventTypeCounts(events);

  const now = Date.now();
  const movement = computeMrrMovement(events, now - THIRTY_DAYS_MS, now);
  const movementRows = [
    { label: "New", value: movement.new, tone: "up" as const },
    { label: "Expansion", value: movement.expansion, tone: "up" as const },
    { label: "Reactivation", value: movement.reactivation, tone: "up" as const },
    { label: "Contraction", value: movement.contraction, tone: "down" as const },
    { label: "Churned", value: movement.churned, tone: "down" as const },
  ];

  const cards = [
    { label: "MRR", value: formatCurrency(analytics.mrr) },
    { label: "ARR", value: formatCurrency(analytics.arr) },
    { label: "Revenue (all-time)", value: formatCurrency(analytics.revenue) },
    { label: "Active users", value: String(analytics.activeUsers) },
    { label: "Conversion", value: formatPercent(analytics.conversionRate) },
    { label: "Churn", value: formatPercent(analytics.churnRate) },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Derived SaaS metrics from the event stream
          </p>
        </div>
        <SeedButton />
      </div>

      {events.length === 0 ? (
        <div className="flex min-h-60 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border p-8 text-center">
          <p className="text-sm font-medium">No data yet</p>
          <p className="text-sm text-muted-foreground">
            Click “Load sample data” to generate ~60 days of history, or simulate
            live events on the Overview page.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-xl border border-border bg-background p-4 shadow-sm"
              >
                <div className="text-xs text-muted-foreground">{c.label}</div>
                <div className="mt-1.5 text-lg font-semibold tracking-tight">
                  {c.value}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div className="text-sm font-medium">MRR movement</div>
              <div className="text-xs text-muted-foreground">Last 30 days</div>
            </div>

            {/* Числовая разбивка — она же доступный table-view к графику. */}
            <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              {movementRows.map((r) => (
                <div key={r.label} className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      r.tone === "up" ? "bg-emerald-500" : "bg-destructive"
                    )}
                  />
                  <span className="text-muted-foreground">{r.label}</span>
                  <span
                    className={cn(
                      "font-medium",
                      r.tone === "up"
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive"
                    )}
                  >
                    {r.tone === "up" ? "+" : "−"}
                    {formatCurrency(r.value)}
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Net</span>
                <span
                  className={cn(
                    "font-medium",
                    movement.net >= 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-destructive"
                  )}
                >
                  {movement.net >= 0 ? "+" : "−"}
                  {formatCurrency(Math.abs(movement.net))}
                </span>
              </div>
            </div>

            <div className="mt-4">
              <MrrWaterfallChart movement={movement} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-5 shadow-sm lg:col-span-2">
              <div className="mb-4 text-sm font-medium">MRR over time</div>
              <MrrChart data={series} />
            </div>

            <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
              <div className="mb-4 text-sm font-medium">Sign-ups per day</div>
              <SignupsChart data={series} />
            </div>

            <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
              <div className="mb-4 text-sm font-medium">Event mix</div>
              <EventMixChart data={typeCounts} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
