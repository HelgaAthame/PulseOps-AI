import { NextResponse } from "next/server";

import { listAllEvents } from "@/entities/event";
import { computeAnalytics } from "@/entities/metric";
import { createClient } from "@/shared/api/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await listAllEvents(user.id);
  const analytics = computeAnalytics(events);

  return NextResponse.json({ analytics });
}
