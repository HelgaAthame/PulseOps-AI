import { AlertTriangle, Lightbulb, Loader2, TrendingUp } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import {
  type AnomalySeverity,
  type InsightSentiment,
  type Insights,
} from "../model/insight";

const sentimentDot: Record<InsightSentiment, string> = {
  positive: "bg-emerald-500",
  neutral: "bg-muted-foreground/50",
  negative: "bg-destructive",
};

const severityStyles: Record<AnomalySeverity, string> = {
  high: "border-destructive/30 bg-destructive/5 text-destructive",
  medium:
    "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400",
  low: "border-border bg-muted/40 text-muted-foreground",
};

/** Скелетон загрузки AI-разбора. */
export function LoadingView() {
  return (
    <div className="space-y-4 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Analyzing your metrics…
      </div>
      <div className="space-y-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-full animate-pulse rounded bg-muted" />
        <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-2 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );
}

/** Отрисовка структурированного AI-разбора. */
export function InsightsView({ insights }: { insights: Insights }) {
  return (
    <div className="space-y-6">
      {/* Заголовок + сводка */}
      <div className="space-y-2">
        <p className="text-base leading-snug font-semibold">{insights.headline}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {insights.summary}
        </p>
      </div>

      {/* Ключевые наблюдения */}
      {insights.highlights.length > 0 && (
        <Section icon={TrendingUp} title="Highlights">
          <div className="grid gap-2 sm:grid-cols-2">
            {insights.highlights.map((h, i) => (
              <div
                key={i}
                className="rounded-lg border border-border bg-muted/30 p-3"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      sentimentDot[h.sentiment]
                    )}
                  />
                  <span className="text-xs font-medium">{h.label}</span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{h.detail}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Аномалии */}
      {insights.anomalies.length > 0 && (
        <Section icon={AlertTriangle} title="Anomalies">
          <div className="space-y-2">
            {insights.anomalies.map((a, i) => (
              <div
                key={i}
                className={cn("rounded-lg border p-3", severityStyles[a.severity])}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{a.title}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                    {a.severity}
                  </span>
                </div>
                <p className="mt-1 text-sm opacity-90">{a.detail}</p>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Рекомендации */}
      {insights.recommendations.length > 0 && (
        <Section icon={Lightbulb} title="Recommendations">
          <ul className="space-y-2">
            {insights.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-primary">
                  {i + 1}
                </span>
                <span className="text-muted-foreground">{r}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof TrendingUp;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2.5">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Icon className="size-3.5" />
        {title}
      </h3>
      {children}
    </section>
  );
}
