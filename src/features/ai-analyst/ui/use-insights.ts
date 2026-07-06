"use client";

import { useCallback, useState } from "react";

import { type Insights } from "../model/insight";

export type InsightsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; insights: Insights };

/** Общий хук: дергает /api/ai/analyze и держит состояние загрузки/ошибки/данных. */
export function useInsights() {
  const [state, setState] = useState<InsightsState>({ status: "idle" });

  const analyze = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/ai/analyze", { method: "POST" });
      const body = await res.json();
      if (!res.ok) {
        setState({
          status: "error",
          message: body?.error ?? "Something went wrong.",
        });
        return;
      }
      setState({ status: "done", insights: body.insights as Insights });
    } catch {
      setState({ status: "error", message: "Network error. Please try again." });
    }
  }, []);

  return { state, analyze };
}
