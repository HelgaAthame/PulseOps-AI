import "server-only";

import Anthropic from "@anthropic-ai/sdk";

import { type EventRow } from "@/entities/event";
import {
  computeAnalytics,
  computeDailySeries,
  computeEventTypeCounts,
} from "@/entities/metric";

import { INSIGHTS_JSON_SCHEMA, insightsSchema, type Insights } from "../model/insight";

// Ошибка «фича не настроена» — роут превратит её в 503 с понятным текстом.
export class AiNotConfiguredError extends Error {
  constructor() {
    super("ANTHROPIC_API_KEY is not set");
    this.name = "AiNotConfiguredError";
  }
}

const round = (n: number) => Math.round(n);
const pct = (n: number) => Math.round(n * 1000) / 10; // доля 0..1 → проценты, 1 знак

/**
 * Готовит компактный срез данных для модели: агрегаты + дневные ряды за 30 дней
 * + разбивка по типам событий. Держим маленьким — это дёшево и хватает сигнала.
 */
function buildContext(events: EventRow[]) {
  const a = computeAnalytics(events);
  const daily = computeDailySeries(events, 30).map((d) => ({
    date: d.label,
    mrr: round(d.mrr),
    revenue: round(d.revenue),
    signups: d.signups,
  }));
  const startMrr = daily[0]?.mrr ?? 0;
  const endMrr = daily[daily.length - 1]?.mrr ?? 0;

  return {
    generatedAt: new Date().toISOString(),
    currency: "USD",
    totals: {
      mrr: round(a.mrr),
      arr: round(a.arr),
      activeUsers: a.activeUsers,
      signups: a.signups,
      revenueAllTime: round(a.revenue),
      churnRatePct: pct(a.churnRate),
      conversionRatePct: pct(a.conversionRate),
    },
    mrrTrend30d: {
      start: startMrr,
      end: endMrr,
      changePct: startMrr ? Math.round(((endMrr - startMrr) / startMrr) * 100) : null,
    },
    eventTypeCounts: computeEventTypeCounts(events),
    totalEvents: events.length,
    dailyLast30: daily,
  };
}

const SYSTEM_PROMPT = `You are the analytics co-pilot for PulseOps, a SaaS metrics dashboard. You are given a JSON snapshot of one workspace's metrics (MRR, ARR, active users, churn, conversion) plus a 30-day daily time series and event-type counts.

Explain what is happening in this business in plain, confident English, as a sharp analyst briefing a founder. Rules:
- Ground every claim in the numbers provided. Cite concrete figures (e.g. "MRR is $4,857").
- Be specific and useful, not generic. No filler, no hedging, no "as an AI".
- Format currency with a $ and thousands separators. Format rates as percentages.
- If a metric is zero or the workspace has no data, say so plainly instead of inventing a story.
- Highlights: 3-5 items, the most important signals. Anomalies: only genuine ones (empty array if none). Recommendations: 2-4 concrete next steps.`;

/**
 * Отправляет срез метрик в Claude и возвращает структурированные инсайты.
 * Модель — claude-opus-4-8, адаптивное мышление, structured outputs по нашей схеме.
 */
export async function generateInsights(events: EventRow[]): Promise<Insights> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AiNotConfiguredError();
  }

  const client = new Anthropic();
  const context = buildContext(events);

  const response = await client.messages.create({
    model: "claude-opus-4-8",
    max_tokens: 3072,
    thinking: { type: "adaptive" },
    output_config: {
      effort: "medium",
      format: {
        type: "json_schema",
        schema: INSIGHTS_JSON_SCHEMA,
      },
    },
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: JSON.stringify(context) }],
  });

  const text = response.content.find((b) => b.type === "text")?.text ?? "";
  return insightsSchema.parse(JSON.parse(text));
}
