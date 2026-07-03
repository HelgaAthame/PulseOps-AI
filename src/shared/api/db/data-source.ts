import "reflect-metadata";
import { DataSource } from "typeorm";

import { EventEntity } from "@/entities/event/model/event.entity";
import { MetricEntity } from "@/entities/metric/model/metric.entity";
import { UserEntity } from "@/entities/user/model/user.entity";

import { InitSchema1783092249369 } from "./migrations/1783092249369-InitSchema";

const globalForDataSource = globalThis as unknown as {
  dataSource?: DataSource;
};

export const dataSource =
  globalForDataSource.dataSource ??
  new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    entities: [UserEntity, EventEntity, MetricEntity],
    // Явные импорты миграций добавляются сюда по мере их генерации —
    // glob-паттерны не работают в бандле Next.js (Turbopack/webpack).
    migrations: [InitSchema1783092249369],
    synchronize: false,
    logging: process.env.NODE_ENV === "development",
  });

if (process.env.NODE_ENV !== "production") {
  globalForDataSource.dataSource = dataSource;
}

let initPromise: Promise<DataSource> | null = null;

export function getDataSource(): Promise<DataSource> {
  if (dataSource.isInitialized) {
    return Promise.resolve(dataSource);
  }
  if (!initPromise) {
    initPromise = dataSource.initialize();
  }
  return initPromise;
}
