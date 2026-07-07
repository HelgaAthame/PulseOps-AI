import { Skeleton } from "@/shared/ui/skeleton";

// Скелетон аналитики: заголовок + 6 метрик + сетка графиков.
export default function AnalyticsLoading() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-60" />
        </div>
        <Skeleton className="h-8 w-32" />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <Skeleton className="h-3 w-16" />
            <Skeleton className="mt-2 h-5 w-20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm lg:col-span-2">
          <Skeleton className="mb-4 h-4 w-28" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <Skeleton className="mb-4 h-4 w-28" />
          <Skeleton className="h-60 w-full" />
        </div>
        <div className="rounded-xl border border-border bg-background p-5 shadow-sm">
          <Skeleton className="mb-4 h-4 w-24" />
          <Skeleton className="h-60 w-full" />
        </div>
      </div>
    </div>
  );
}
