import { z } from "zod";

import { EVENT_TYPES } from "./event.types";

export const eventIngestSchema = z.object({
  type: z.enum(EVENT_TYPES),
  userId: z.string().uuid(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type EventIngestInput = z.infer<typeof eventIngestSchema>;
