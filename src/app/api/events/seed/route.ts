import { NextResponse } from "next/server";

import { generateHistory, replaceOwnerEvents } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";

/** Заполняет аккаунт демо-историей за ~60 дней (заменяя текущие события). */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const history = generateHistory(60);
  const count = await replaceOwnerEvents(user.id, history);

  return NextResponse.json({ count }, { status: 201 });
}
