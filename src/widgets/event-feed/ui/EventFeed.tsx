import { type EventRow } from "@/entities/event";
import { formatRelativeTime } from "@/shared/lib/format";

import { eventDisplay, summarizePayload } from "./event-display";

type EventFeedProps = {
  events: EventRow[];
};

export function EventFeed({ events }: EventFeedProps) {
  if (events.length === 0) {
    return (
      <div className="flex h-full min-h-40 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm font-medium">Событий пока нет</p>
        <p className="text-xs text-muted-foreground">
          Нажмите «Смоделировать активность», чтобы сгенерировать поток событий
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {events.map((event) => {
        const display = eventDisplay[event.type];
        const Icon = display.icon;
        const summary = summarizePayload(event.type, event.payload);

        return (
          <li key={event.id} className="flex items-center gap-3 py-2.5">
            <div
              className={`flex size-8 shrink-0 items-center justify-center rounded-full ${display.badge}`}
            >
              <Icon className="size-4" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {display.label}
                </span>
                {summary && (
                  <span className="truncate text-xs text-muted-foreground">
                    {summary}
                  </span>
                )}
              </div>
              <span className="text-xs text-muted-foreground">
                клиент {event.customerId.slice(0, 8)}
              </span>
            </div>

            <time
              className="shrink-0 text-xs text-muted-foreground"
              dateTime={new Date(event.createdAt).toISOString()}
            >
              {formatRelativeTime(event.createdAt)}
            </time>
          </li>
        );
      })}
    </ul>
  );
}
