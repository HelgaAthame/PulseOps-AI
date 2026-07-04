"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { navItems } from "@/shared/config/nav";
import { Logo } from "@/shared/ui/logo";
import { Button } from "@/shared/ui/button";

/** Бургер-меню для мобильных. Панель рендерится через портал в body, иначе
 *  backdrop-blur у topbar ограничивает position:fixed рамками шапки. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const drawer = (
    <div className="fixed inset-0 z-50 md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
        onClick={() => setOpen(false)}
      />
      <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-sidebar shadow-2xl animate-in slide-in-from-left-6 fade-in-0 duration-200">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border pr-2 pl-5">
          <Logo />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          >
            <X className="size-4" />
          </Button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                  active && "bg-muted font-medium text-foreground"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="md:hidden"
        aria-label="Open menu"
        onClick={() => setOpen(true)}
      >
        <Menu className="size-5" />
      </Button>

      {mounted && open ? createPortal(drawer, document.body) : null}
    </>
  );
}
