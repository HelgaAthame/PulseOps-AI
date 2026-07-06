import { Suspense } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

import { buttonVariants } from "@/shared/ui/button";
import { ThemeToggle } from "@/shared/ui/theme-toggle";
import { SignOutButton } from "@/features/auth";
import { LiveIndicator } from "@/features/realtime";
import { MobileNav } from "@/widgets/sidebar";

import { TopbarSearch } from "./TopbarSearch";

export function Topbar({ userId }: { userId: string }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur sm:gap-3 sm:px-5">
      <MobileNav />

      {/* Поиск — только на десктопе (Suspense: useSearchParams внутри) */}
      <Suspense fallback={<div className="hidden flex-1 md:block" />}>
        <TopbarSearch />
      </Suspense>

      {/* Распорка, чтобы прижать действия вправо на мобильных */}
      <div className="flex-1 md:hidden" />

      <LiveIndicator userId={userId} />

      {/* AI-аналитик живёт на своей странице /ai */}
      <Link
        href="/ai"
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Sparkles className="size-4" />
        <span className="hidden sm:inline">Explain what&apos;s happening</span>
      </Link>

      <ThemeToggle />
      <SignOutButton />
    </header>
  );
}
