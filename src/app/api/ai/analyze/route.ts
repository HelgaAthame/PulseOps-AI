import { NextResponse } from "next/server";

import { listAllEvents } from "@/entities/event";
import {
  AiNotConfiguredError,
  generateInsights,
} from "@/features/ai-analyst/api/generate-insights";
import { createClient } from "@/shared/api/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await listAllEvents(user.id);
  if (events.length === 0) {
    return NextResponse.json(
      { error: "No data yet. Seed some demo events first." },
      { status: 422 }
    );
  }

  try {
    const insights = await generateInsights(events);
    return NextResponse.json({ insights });
  } catch (err) {
    if (err instanceof AiNotConfiguredError) {
      return NextResponse.json(
        { error: "AI analyst is not configured. Set ANTHROPIC_API_KEY on the server." },
        { status: 503 }
      );
    }
    console.error("AI analyze failed:", err);
    return NextResponse.json(
      { error: "The AI analyst could not generate insights. Please try again." },
      { status: 502 }
    );
  }
}
