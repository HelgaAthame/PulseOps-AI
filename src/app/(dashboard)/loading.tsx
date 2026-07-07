import { Skeleton } from "@/shared/ui/skeleton";

// Базовый скелетон для роутов dashboard (совпадает с раскладкой Overview):
// заголовок + строка метрик + панель графика и лента. Показывается мгновенно
// при навигации, пока RSC стримит данные.
export default function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-20" />
            <Skeleton className="mt-3 h-7 w-24" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:h-90 lg:grid-cols-3">
        <div className="flex flex-col rounded-xl border border-border bg-background p-5 shadow-sm lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-28" />
          <Skeleton className="min-h-60 flex-1 lg:min-h-0" />
        </div>
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-5 shadow-sm">
          <Skeleton className="h-4 w-28" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-8 rounded-full" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
