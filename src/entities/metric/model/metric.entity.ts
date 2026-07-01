import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

import { METRIC_TYPES, type MetricType } from "./metric.types";

/** Снимок значения метрики на момент пересчёта (не текущее состояние, а история). */
@Entity({ name: "metrics" })
export class MetricEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "enum", enum: METRIC_TYPES, enumName: "metric_type" })
  type!: MetricType;

  @Column({ type: "double precision" })
  value!: number;

  @Index()
  @CreateDateColumn({ type: "timestamptz", name: "computed_at" })
  computedAt!: Date;
}
