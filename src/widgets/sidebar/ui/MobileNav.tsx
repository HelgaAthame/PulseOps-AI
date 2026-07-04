"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

import { cn } from "@/shared/lib/utils";
import { navItems } from "@/shared/config/nav";
import { Logo } from "@/shared/ui/logo";
import { Button } from "@/shared/ui/button";

/** Бургер-меню для мобильных: кнопка в topbar + выезжающая панель навигации. */
export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 animate-in fade-in-0 duration-200"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 left-0 flex h-full w-64 max-w-[80vw] flex-col border-r border-border bg-sidebar shadow-xl animate-in slide-in-from-left duration-200">
            <div className="flex h-14 items-center justify-between pr-2 pl-5">
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

            <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
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
                      "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
                      active && "bg-muted font-medium text-foreground"
                    )}
                  >
                    <Icon className="size-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
