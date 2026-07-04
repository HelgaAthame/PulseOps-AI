import { Search, Sparkles } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { SignOutButton } from "@/features/auth";
import { LiveIndicator } from "@/features/realtime";
import { MobileNav } from "@/widgets/sidebar";

export function Topbar({ userId }: { userId: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur sm:gap-3 sm:px-5">
      <MobileNav />

      {/* Поиск — только на десктопе */}
      <div className="hidden min-w-0 flex-1 items-center gap-2 text-sm text-muted-foreground md:flex">
        <Search className="size-4 shrink-0" />
        <span className="truncate">Search events and metrics…</span>
      </div>

      {/* Распорка, чтобы прижать действия вправо на мобильных */}
      <div className="flex-1 md:hidden" />

      <LiveIndicator userId={userId} />

      <Button variant="outline" size="sm" className="shrink-0">
        <Sparkles className="size-4" />
        <span className="hidden sm:inline">Explain what&apos;s happening</span>
      </Button>

      <ThemeToggle />
      <SignOutButton />
    </header>
  );
}
