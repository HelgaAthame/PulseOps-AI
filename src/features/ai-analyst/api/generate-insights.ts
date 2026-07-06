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
    super("OPENROUTER_API_KEY is not set");
    this.name = "AiNotConfiguredError";
  }
}

// Все модели упёрлись в лимит бесплатного тарифа OpenRouter → роут отдаёт 429.
export class AiRateLimitedError extends Error {
  constructor() {
    super("Free AI tier is rate-limited");
    this.name = "AiRateLimitedError";
  }
}

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
// Перебираем конкретные бесплатные модели ОТДЕЛЬНЫМИ запросами по очереди.
// Почему не `openrouter/free` и не `models`-массив в одном запросе: бесплатные
// эндпоинты иногда ЗАВИСАЮТ (rate-limit → запрос висит), а серверный фолбэк
// OpenRouter срабатывает только на явных ошибках, не на зависании. Поэтому даём
// каждой модели свой таймаут и при неудаче идём в СЛЕДУЮЩУЮ (другой эндпоинт),
// а не долбим ту же зависшую. Порядок: быстрая 9B → альтернатива → надёжный
// (но медленный) запас. Переопределяется одной моделью через OPENROUTER_MODEL.
const DEFAULT_MODELS = [
  "nvidia/nemotron-nano-9b-v2:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];
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
 * Отправляет срез метрик в бесплатную модель через OpenRouter (OpenAI-совместимый
 * API) и возвращает структурированные инсайты. Схему держим в промпте и валидируем
 * ответ zod'ом — не полагаемся на строгий structured-outputs, который не все
 * бесплатные модели поддерживают.
 */
/** Одна попытка на КОНКРЕТНОЙ модели: запрос → извлечение JSON → валидация zod. */
async function callModel(
  apiKey: string,
  model: string,
  context: unknown
): Promise<Insights> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      // Необязательные заголовки OpenRouter для атрибуции приложения.
      "X-Title": "PulseOps",
      ...(process.env.NEXT_PUBLIC_SITE_URL
        ? { "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL }
        : {}),
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
    throw new Error(`OpenRouter ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenRouter returned an empty response");
  }

  return insightsSchema.parse(extractJson(content));
}

export async function generateInsights(events: EventRow[]): Promise<Insights> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AiNotConfiguredError();
  }

  const context = buildContext(events);
  const models = process.env.OPENROUTER_MODEL
    ? [process.env.OPENROUTER_MODEL]
    : DEFAULT_MODELS;

  // Перебираем модели по очереди: зависшую/сбойную пропускаем и идём в следующую.
  let lastErr: unknown;
  let anyRateLimited = false;
  for (const model of models) {
    try {
      return await callModel(apiKey, model, context);
    } catch (err) {
      lastErr = err;
      if (err instanceof AiRateLimitedError) anyRateLimited = true;
      console.warn(`AI insights: model ${model} failed:`, (err as Error).message);
    }
  }
  // Если хоть одна модель словила лимит — это, скорее всего, причина: отдаём 429.
  if (anyRateLimited) throw new AiRateLimitedError();
  throw lastErr ?? new Error("AI insights: all models failed");
}
