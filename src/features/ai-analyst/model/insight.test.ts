import { describe, expect, it } from "vitest";

import {
  ANOMALY_SEVERITIES,
  INSIGHT_SENTIMENTS,
  INSIGHTS_JSON_SCHEMA,
  insightsSchema,
  type Insights,
} from "./insight";

const valid: Insights = {
  headline: "MRR is climbing",
  summary: "Revenue is up and churn is low.",
  highlights: [{ label: "MRR up", detail: "MRR is $4,857.", sentiment: "positive" }],
  anomalies: [{ title: "Spike", detail: "Signups doubled.", severity: "medium" }],
  recommendations: ["Double down on referral."],
};

describe("insightsSchema", () => {
  it("accepts a well-formed insights object", () => {
    expect(insightsSchema.parse(valid)).toEqual(valid);
  });

  it("rejects an unknown sentiment", () => {
    const bad = {
      ...valid,
      highlights: [{ label: "x", detail: "y", sentiment: "amazing" }],
    };
    expect(() => insightsSchema.parse(bad)).toThrow();
  });

  it("rejects an unknown anomaly severity", () => {
    const bad = { ...valid, anomalies: [{ title: "x", detail: "y", severity: "urgent" }] };
    expect(() => insightsSchema.parse(bad)).toThrow();
  });

  it("rejects a missing required field", () => {
    const { headline: _omit, ...rest } = valid;
    expect(() => insightsSchema.parse(rest)).toThrow();
  });

  it("accepts empty arrays for anomalies", () => {
    expect(insightsSchema.parse({ ...valid, anomalies: [] }).anomalies).toEqual([]);
  });
});

describe("INSIGHTS_JSON_SCHEMA", () => {
  it("locks the object shape and requires every top-level field", () => {
    expect(INSIGHTS_JSON_SCHEMA.additionalProperties).toBe(false);
    expect(INSIGHTS_JSON_SCHEMA.required).toEqual([
      "headline",
      "summary",
      "highlights",
      "anomalies",
      "recommendations",
    ]);
  });

  it("keeps enum values in sync with the zod schema constants", () => {
    expect(INSIGHTS_JSON_SCHEMA.properties.highlights.items.properties.sentiment.enum).toEqual([
      ...INSIGHT_SENTIMENTS,
    ]);
    expect(INSIGHTS_JSON_SCHEMA.properties.anomalies.items.properties.severity.enum).toEqual([
      ...ANOMALY_SEVERITIES,
    ]);
  });
});
