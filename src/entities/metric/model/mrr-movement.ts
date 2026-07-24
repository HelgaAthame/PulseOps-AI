import { type EventRow } from "@/entities/event";

/**
 * Декомпозиция изменения MRR за период на составляющие («MRR movement» —
 * ключевая метрика ChartMogul). Прирост: new / expansion / reactivation;
 * отток: contraction / churned. Все поля, кроме net, неотрицательны
 * (contraction и churned — величины потерь).
 */
export type MrrMovement = {
  /** MRR на начало периода. */
  startingMrr: number;
  /** Новые клиенты (первая подписка). */
  new: number;
  /** Апгрейды активных подписок (рост MRR). */
  expansion: number;
  /** Вернувшиеся после оттока клиенты. */
  reactivation: number;
  /** Даунгрейды без оттока (потеря MRR). */
  contraction: number;
  /** Потеря MRR из-за оттока. */
  churned: number;
  /** Чистое изменение = new + expansion + reactivation − contraction − churned. */
  net: number;
  /** MRR на конец периода (= startingMrr + net). */
  endingMrr: number;
};

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Считает MRR movement за период [startMs, endMs] из потока событий владельца.
 * Чистая функция: воспроизводит состояние подписок по времени, а изменения
 * внутри периода классифицирует по составляющим.
 */
export function computeMrrMovement(
  events: EventRow[],
  startMs: number,
  endMs: number
): MrrMovement {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // Состояние клиента: текущий MRR и был ли он когда-либо платящим.
  const state = new Map<string, { mrr: number; everActive: boolean }>();
  const m = { new: 0, expansion: 0, reactivation: 0, contraction: 0, churned: 0 };

  const sumActive = () => {
    let total = 0;
    for (const s of state.values()) total += s.mrr;
    return total;
  };

  let startingMrr: number | null = null;

  for (const event of sorted) {
    const t = new Date(event.createdAt).getTime();
    if (t > endMs) break; // события после периода не влияют
    // Первое событие внутри периода фиксирует MRR на его начало.
    if (startingMrr === null && t >= startMs) startingMrr = sumActive();
    const inPeriod = t >= startMs;
    const s = state.get(event.customerId) ?? { mrr: 0, everActive: false };

    if (event.type === "subscription_created") {
      const newMrr = num(event.payload?.mrr);
      const delta = newMrr - s.mrr;
      if (inPeriod) {
        if (s.mrr === 0) {
          if (s.everActive) m.reactivation += newMrr;
          else m.new += newMrr;
        } else if (delta > 0) {
          m.expansion += delta;
        } else if (delta < 0) {
          m.contraction += -delta;
        }
      }
      s.mrr = newMrr;
      s.everActive = true;
      state.set(event.customerId, s);
    } else if (event.type === "churn_detected") {
      if (inPeriod && s.mrr > 0) m.churned += s.mrr;
      s.mrr = 0;
      state.set(event.customerId, s);
    }
  }

  // Период без единого события внутри — MRR не менялся.
  if (startingMrr === null) startingMrr = sumActive();
  const endingMrr = sumActive();
  const net =
    m.new + m.expansion + m.reactivation - m.contraction - m.churned;

  return {
    startingMrr,
    new: m.new,
    expansion: m.expansion,
    reactivation: m.reactivation,
    contraction: m.contraction,
    churned: m.churned,
    net,
    endingMrr,
  };
}
