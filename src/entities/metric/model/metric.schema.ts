import { z } from "zod";

import { METRIC_TYPES } from "./metric.types";

export const metricQuerySchema = z.object({
  type: z.enum(METRIC_TYPES).optional(),
});

export type MetricQueryInput = z.infer<typeof metricQuerySchema>;
