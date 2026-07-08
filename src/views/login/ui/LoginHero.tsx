import { Activity, Fingerprint, Radio, Sparkles } from "lucide-react";

import { Logo } from "@/shared/ui/logo";

const FEATURES = [
  {
    icon: Activity,
    title: "Live metrics",
    desc: "MRR, ARR, churn and conversion, computed in real time.",
  },
  {
    icon: Sparkles,
    title: "AI analyst",
    desc: "One click explains what’s happening — and what to do next.",
  },
  {
    icon: Radio,
    title: "Realtime feed",
    desc: "Events stream in the moment they happen. No refresh.",
  },
  {
    icon: Fingerprint,
    title: "Passwordless",
    desc: "Passkeys, Google and biometrics via Supabase.",
  },
] as const;

/**
 * Презентационная hero-панель страницы входа — виден только на больших экранах
 * (lg+). Фирменный luxury-стиль: тёплый чёрный фон, металлическое золото,
 * золотые «блики». Всегда тёмная (не зависит от темы) — так читается статуснее.
 */
export function LoginHero() {
  return (
    <aside className="relative hidden overflow-hidden bg-[oklch(0.13_0.004_80)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
      {/* Золотые блики-подсветки. */}
      <div
        aria-hidden
        className="bg-gold pointer-events-none absolute -top-24 -left-24 size-96 rounded-full opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="bg-gold pointer-events-none absolute -right-20 bottom-0 size-80 rounded-full opacity-10 blur-3xl"
      />

      <div className="relative">
        <Logo className="h-7" />
      </div>

      <div className="relative max-w-md">
        <span className="text-xs font-medium tracking-[0.25em] text-white/45 uppercase">
          SaaS analytics
        </span>
        <h2 className="mt-4 text-4xl leading-[1.1] font-semibold tracking-tight">
          Your SaaS,{" "}
          <span className="bg-gold bg-clip-text text-transparent">
            read at a glance.
          </span>
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          PulseOps turns a raw stream of signups, payments and churn into live
          metrics — with an AI analyst that reads the room for you.
        </p>

        <ul className="mt-9 flex flex-col gap-5">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <li key={title} className="flex items-start gap-3.5">
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-[oklch(0.82_0.1_82)] ring-1 ring-white/10">
                <Icon className="size-4.5" />
              </span>
              <div>
                <div className="text-sm font-medium">{title}</div>
                <div className="mt-0.5 text-sm text-white/50">{desc}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center gap-2 text-xs text-white/40">
        <span className="size-1.5 rounded-full bg-emerald-400" />
        Next.js 16 · React 19 · Supabase · Groq AI
      </div>
    </aside>
  );
}
