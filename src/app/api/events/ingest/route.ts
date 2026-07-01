import { NextResponse } from "next/server";

import { EventEntity, eventIngestSchema } from "@/entities/event";
import { getDataSource } from "@/shared/api/db";
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
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const dataSource = await getDataSource();
  const event = dataSource.getRepository(EventEntity).create(parsed.data);
  const saved = await dataSource.getRepository(EventEntity).save(event);

  return NextResponse.json({ event: saved }, { status: 201 });
}
