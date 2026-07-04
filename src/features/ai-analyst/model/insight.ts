import { z } from "zod";

// Тональность наблюдения — красим карточку highlight'а.
export const INSIGHT_SENTIMENTS = ["positive", "neutral", "negative"] as const;
export type InsightSentiment = (typeof INSIGHT_SENTIMENTS)[number];

// Уровень аномалии — от неё зависит акцент в UI.
export const ANOMALY_SEVERITIES = ["low", "medium", "high"] as const;
export type AnomalySeverity = (typeof ANOMALY_SEVERITIES)[number];

/**
 * Zod-схема ответа AI-аналитика. Ею же валидируем то, что вернула модель
 * (structured outputs гарантирует форму, но проверяем на своей стороне).
 */
export const insightsSchema = z.object({
  headline: z.string(),
  summary: z.string(),
  highlights: z.array(
    z.object({
      label: z.string(),
      detail: z.string(),
      sentiment: z.enum(INSIGHT_SENTIMENTS),
    })
  ),
  anomalies: z.array(
    z.object({
      title: z.string(),
      detail: z.string(),
      severity: z.enum(ANOMALY_SEVERITIES),
    })
  ),
  recommendations: z.array(z.string()),
});

export type Insights = z.infer<typeof insightsSchema>;

/**
 * JSON Schema для `output_config.format` (structured outputs Anthropic).
 * Держим руками, а не генерим из zod — так не завязываемся на версию
 * zod-хелпера SDK. Ограничения формата: additionalProperties:false + required
 * на всех полях, без minLength/maxLength.
 */
export const INSIGHTS_JSON_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["headline", "summary", "highlights", "anomalies", "recommendations"],
  properties: {
    headline: {
      type: "string",
      description: "One punchy sentence: the single most important thing happening right now.",
    },
    summary: {
      type: "string",
      description: "2-3 sentence narrative of the current state of the business.",
    },
    highlights: {
      type: "array",
      description: "3-5 notable observations grounded in the numbers.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "detail", "sentiment"],
        properties: {
          label: { type: "string", description: "Short title, 2-4 words." },
          detail: { type: "string", description: "One sentence with the concrete number." },
          sentiment: { type: "string", enum: [...INSIGHT_SENTIMENTS] },
        },
      },
    },
    anomalies: {
      type: "array",
      description: "Anything unusual or concerning. Empty array if nothing stands out.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail", "severity"],
        properties: {
          title: { type: "string", description: "Short title of the anomaly." },
          detail: { type: "string", description: "What is off and why it matters." },
          severity: { type: "string", enum: [...ANOMALY_SEVERITIES] },
        },
      },
    },
    recommendations: {
      type: "array",
      description: "2-4 concrete, actionable next steps.",
      items: { type: "string" },
    },
  },
} as const;
