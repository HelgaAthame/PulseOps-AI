import { z } from "zod";

import { EVENT_TYPES } from "./event.types";

/**
 * Тело запроса на приём события. ownerId сюда НЕ входит — он берётся из
 * авторизованной сессии на сервере (нельзя писать события чужому аккаунту).
 */
export const eventIngestSchema = z.object({
  type: z.enum(EVENT_TYPES),
  customerId: z.uuid(),
  payload: z.record(z.string(), z.unknown()).optional(),
});

export type EventIngestInput = z.infer<typeof eventIngestSchema>;
