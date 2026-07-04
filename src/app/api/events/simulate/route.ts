import { NextResponse } from "next/server";
import { z } from "zod";

import { generateEvents, insertEvents } from "@/entities/event";
import { createClient } from "@/shared/api/supabase/server";

const simulateSchema = z.object({
  count: z.number().int().min(1).max(50).default(8),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Тело опционально: по умолчанию 8 событий.
  const body = await request.json().catch(() => ({}));
  const parsed = simulateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const generated = generateEvents(parsed.data.count);
  const inserted = await insertEvents(user.id, generated);

  return NextResponse.json(
    { count: inserted.length, events: inserted },
    { status: 201 }
  );
}
