import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as eventSchema from "@/entities/event/model/event.table";
import * as metricSchema from "@/entities/metric/model/metric.table";
import * as userSchema from "@/entities/user/model/user.table";

const schema = { ...userSchema, ...eventSchema, ...metricSchema };

const globalForDb = globalThis as unknown as { pool?: Pool };

// На serverless (Vercel) под нагрузкой поднимается много изолированных
// экземпляров функции, каждый со своим пулом. Ограничиваем число соединений
// на экземпляр и закрываем простаивающие, чтобы не исчерпать лимит соединений
// Supabase pooler. Для локалки эти значения тоже безопасны.
const pool =
  globalForDb.pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.pool = pool;
}

export const db = drizzle(pool, { schema });
