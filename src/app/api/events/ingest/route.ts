import { NextResponse } from "next/server";

import { eventIngestSchema, insertEvent } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = eventIngestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const event = await insertEvent(user.id, parsed.data);

  return NextResponse.json({ event }, { status: 201 });
}
