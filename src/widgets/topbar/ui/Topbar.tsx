import { Search, Sparkles } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { SignOutButton } from "@/features/auth";

export function Topbar() {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-background/80 px-5 backdrop-blur">
      <div className="flex flex-1 items-center gap-2 text-sm text-muted-foreground">
        <Search className="size-4" />
        <span>Поиск по событиям и метрикам…</span>
      </div>

      <Button variant="outline" size="sm">
        <Sparkles className="size-4" />
        Объяснить, что происходит
      </Button>

      <SignOutButton />
    </header>
  );
}
