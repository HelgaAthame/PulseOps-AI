import "server-only";

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
    super("GROQ_API_KEY is not set");
    this.name = "AiNotConfiguredError";
  }
}

// Модель упёрлась в лимит бесплатного тарифа Groq → роут отдаёт 429.
export class AiRateLimitedError extends Error {
  constructor() {
    super("Free AI tier is rate-limited");
    this.name = "AiRateLimitedError";
  }
}

// Провайдер — Groq (OpenAI-совместимый API): бесплатный тариф со щедрыми
// лимитами (30 запросов/мин, 1000-14400/день), очень быстрый инференс.
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Перебираем модели ОТДЕЛЬНЫМИ запросами по очереди: если основная сбоит/висит,
// даём ей свой таймаут и идём в следующую. Порядок: сильная 70B → быстрая 8B
// (у неё лимит запросов в день ещё выше). Переопределяется через GROQ_MODEL.
const DEFAULT_MODELS = ["llama-3.3-70b-versatile", "llama-3.1-8b-instant"];
const ATTEMPT_TIMEOUT_MS = 30_000;

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
- Highlights: 3-5 items, the most important signals. Anomalies: only genuine ones (empty array if none). Recommendations: 2-4 concrete next steps.

Respond with ONLY a single valid JSON object. No markdown, no code fences, no text before or after. It must match exactly this JSON schema:
${JSON.stringify(INSIGHTS_JSON_SCHEMA)}`;

/**
 * Достаёт JSON-объект из ответа модели: бесплатные модели иногда оборачивают
 * его в ```json-заборы или добавляют пролог. Берём срез от первой { до последней }.
 */
function extractJson(raw: string): unknown {
  const fenced = raw.replace(/```(?:json)?/gi, "").trim();
  const start = fenced.indexOf("{");
  const end = fenced.lastIndexOf("}");
  const slice = start >= 0 && end > start ? fenced.slice(start, end + 1) : fenced;
  return JSON.parse(slice);
}

/**
 * Одна попытка на КОНКРЕТНОЙ модели через Groq (OpenAI-совместимый chat API):
 * запрос → извлечение JSON → валидация zod. Схему держим в промпте (+ мягкий
 * response_format json_object) и валидируем ответ zod'ом на своей стороне.
 */
async function callModel(
  apiKey: string,
  model: string,
  context: unknown
): Promise<Insights> {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 2000,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: JSON.stringify(context) },
      ],
    }),
    signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
  });

  if (res.status === 429) {
    throw new AiRateLimitedError();
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Groq ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Groq returned an empty response");
  }

  return insightsSchema.parse(extractJson(content));
}

export async function generateInsights(events: EventRow[]): Promise<Insights> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new AiNotConfiguredError();
  }

  const context = buildContext(events);
  const models = process.env.GROQ_MODEL
    ? [process.env.GROQ_MODEL]
    : DEFAULT_MODELS;

  // Перебираем модели по очереди: зависшую/сбойную пропускаем и идём в следующую.
  // Но при 429 выходим сразу — остальные бесплатные модели делят ту же квоту,
  // добивать их бессмысленно (и лишь тратит оставшиеся запросы).
  let lastErr: unknown;
  for (const model of models) {
    try {
      return await callModel(apiKey, model, context);
    } catch (err) {
      if (err instanceof AiRateLimitedError) throw err;
      lastErr = err;
      console.warn(`AI insights: model ${model} failed:`, (err as Error).message);
    }
  }
  throw lastErr ?? new Error("AI insights: all models failed");
}
