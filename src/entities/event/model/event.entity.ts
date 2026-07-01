import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { UserEntity } from "@/entities/user/model/user.entity";

import { EVENT_TYPES, type EventType } from "./event.types";

@Entity({ name: "events" })
export class EventEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Index()
  @Column({ type: "enum", enum: EVENT_TYPES, enumName: "event_type" })
  type!: EventType;

  @Column({ type: "uuid", name: "user_id" })
  userId!: string;

  @ManyToOne(() => UserEntity, (user) => user.events, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user?: UserEntity;

  @Column({ type: "jsonb", nullable: true })
  payload!: Record<string, unknown> | null;

  @Index()
  @CreateDateColumn({ type: "timestamptz", name: "created_at" })
  createdAt!: Date;
}
