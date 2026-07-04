import { db } from "@/shared/api/db";

import { users } from "./user.table";

export async function ensureUserProfile(id: string, email: string) {
  await db.insert(users).values({ id, email }).onConflictDoNothing();
}
