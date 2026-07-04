import { listRecentEvents } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";
import { EventFeed, SimulateButton } from "@/widgets/event-feed";

const metrics = [
  { label: "MRR", value: "$0", hint: "Месячный доход" },
  { label: "ARR", value: "$0", hint: "Годовой доход" },
  { label: "Активные пользователи", value: "0", hint: "За 30 дней" },
  { label: "Отток (churn)", value: "0%", hint: "За 30 дней" },
];

export async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const events = user ? await listRecentEvents(user.id, 8) : [];

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Обзор</h1>
        <p className="text-sm text-muted-foreground">
          Симуляция метрик SaaS в реальном времени
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm lg:col-span-2">
          <div className="text-sm font-medium">График дохода</div>
          <div className="mt-4 flex h-56 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
            Появится на Day 4 — Аналитика
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="text-sm font-medium">Живая лента событий</div>
            <SimulateButton />
          </div>
          <div className="mt-3">
            <EventFeed events={events} />
          </div>
        </div>
      </div>
    </div>
  );
}
