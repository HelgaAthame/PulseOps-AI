import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";

import { EventEntity } from "@/entities/event/model/event.entity";

/**
 * id совпадает с auth.users.id из Supabase Auth — это отдельная
 * "теневая" таблица в public-схеме, auth.users нами не управляется.
 */
@Entity({ name: "users" })
export class UserEntity {
  @PrimaryColumn({ type: "uuid" })
  id!: string;

  @Column({ type: "varchar", length: 320, unique: true })
  email!: string;

  @Column({ type: "timestamptz", default: () => "now()" })
  createdAt!: Date;

  @OneToMany(() => EventEntity, (event) => event.user)
  events?: EventEntity[];
}
