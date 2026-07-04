"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  XAxis,
  YAxis,
} from "recharts";

import { type EventType } from "@/entities/event";
import { type DailyPoint, type EventTypeCount } from "@/entities/metric";
import { cn } from "@/shared/lib/utils";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/shared/ui/chart";

const mrrConfig = {
  mrr: { label: "MRR", color: "var(--chart-1)" },
} satisfies ChartConfig;

// className переопределяет высоту: дефолт 240px, но на Overview график
// заполняет высоту панели (h-full), чтобы сравняться с live-лентой.
export function MrrChart({
  data,
  className,
}: {
  data: DailyPoint[];
  className?: string;
}) {
  return (
    <ChartContainer
      config={mrrConfig}
      className={cn("h-60 w-full", className)}
    >
      <AreaChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <defs>
          <linearGradient id="fillMrr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-mrr)" stopOpacity={0.4} />
            <stop offset="100%" stopColor="var(--color-mrr)" stopOpacity={0.04} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          tickFormatter={(v) => `$${v}`}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="mrr"
          type="natural"
          stroke="var(--color-mrr)"
          strokeWidth={2}
          fill="url(#fillMrr)"
        />
      </AreaChart>
    </ChartContainer>
  );
}

const signupsConfig = {
  signups: { label: "Sign-ups", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function SignupsChart({ data }: { data: DailyPoint[] }) {
  return (
    <ChartContainer config={signupsConfig} className="h-[240px] w-full">
      <BarChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={40}
        />
        <YAxis tickLine={false} axisLine={false} width={32} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="signups" fill="var(--color-signups)" radius={3} />
      </BarChart>
    </ChartContainer>
  );
}

const EVENT_META: Record<EventType, { label: string; color: string }> = {
  user_signed_up: { label: "Sign-up", color: "#3b82f6" },
  subscription_created: { label: "New subscription", color: "#8b5cf6" },
  payment_success: { label: "Payment succeeded", color: "#10b981" },
  payment_failed: { label: "Payment failed", color: "#f59e0b" },
  churn_detected: { label: "Customer churn", color: "#ef4444" },
};

const mixConfig = {
  count: { label: "Events" },
} satisfies ChartConfig;

export function EventMixChart({ data }: { data: EventTypeCount[] }) {
  const chartData = data
    .map((d) => ({
      label: EVENT_META[d.type].label,
      color: EVENT_META[d.type].color,
      count: d.count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <ChartContainer config={mixConfig} className="h-[240px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ left: 8, right: 16 }}
      >
        <XAxis type="number" hide />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          width={130}
        />
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Bar dataKey="count" radius={4}>
          {chartData.map((d) => (
            <Cell key={d.label} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
