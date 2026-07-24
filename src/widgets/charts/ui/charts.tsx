"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";

import { type EventType } from "@/entities/event";
import {
  type DailyPoint,
  type EventTypeCount,
  type MrrMovement,
} from "@/entities/metric";
import { formatCurrency } from "@/shared/lib/format";
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

// MRR movement waterfall: прирост (new/expansion/reactivation) зелёным, отток
// (contraction/churned) красным, старт/итог — фирменным золотом. Каждый столбец
// с прямой подписью величины; цвет дублируется подписью категории (не color-only).
const WATERFALL_UP = "#10b981"; // прирост
const WATERFALL_DOWN = "#ef4444"; // потери
const WATERFALL_TOTAL = "var(--primary)"; // старт/итог

type WaterfallRow = {
  label: string;
  base: number; // прозрачная «подставка» — плавающий столбец
  value: number;
  fill: string;
  deltaLabel: string;
};

function buildWaterfall(m: MrrMovement): WaterfallRow[] {
  let running = 0;
  const rows: WaterfallRow[] = [];

  const total = (label: string, v: number): WaterfallRow => ({
    label,
    base: 0,
    value: v,
    fill: WATERFALL_TOTAL,
    deltaLabel: formatCurrency(v),
  });
  const up = (label: string, v: number): WaterfallRow => {
    const row = {
      label,
      base: running,
      value: v,
      fill: WATERFALL_UP,
      deltaLabel: v === 0 ? "" : `+${formatCurrency(v)}`,
    };
    running += v;
    return row;
  };
  const down = (label: string, v: number): WaterfallRow => {
    running -= v;
    return {
      label,
      base: running,
      value: v,
      fill: WATERFALL_DOWN,
      deltaLabel: v === 0 ? "" : `−${formatCurrency(v)}`,
    };
  };

  rows.push(total("Start", m.startingMrr));
  running = m.startingMrr;
  rows.push(up("New", m.new));
  rows.push(up("Expansion", m.expansion));
  rows.push(up("Reactivation", m.reactivation));
  rows.push(down("Contraction", m.contraction));
  rows.push(down("Churned", m.churned));
  rows.push(total("End", m.endingMrr));
  return rows;
}

function WaterfallTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WaterfallRow }[];
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-md">
      <div className="font-medium">{row.label}</div>
      <div className="text-muted-foreground">
        {row.deltaLabel || formatCurrency(row.value)}
      </div>
    </div>
  );
}

const waterfallConfig = {
  value: { label: "MRR" },
} satisfies ChartConfig;

export function MrrWaterfallChart({ movement }: { movement: MrrMovement }) {
  const data = buildWaterfall(movement);

  return (
    <ChartContainer config={waterfallConfig} className="h-65 w-full">
      <BarChart data={data} margin={{ left: 4, right: 8, top: 24 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={52}
          tickFormatter={(v) => formatCurrency(v)}
        />
        <ChartTooltip content={<WaterfallTooltip />} />
        {/* Прозрачная подставка поднимает видимый столбец на нужную высоту. */}
        <Bar dataKey="base" stackId="w" fill="transparent" />
        <Bar dataKey="value" stackId="w" radius={3}>
          {data.map((d) => (
            <Cell key={d.label} fill={d.fill} />
          ))}
          <LabelList
            dataKey="deltaLabel"
            position="top"
            className="fill-muted-foreground"
            fontSize={10}
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
