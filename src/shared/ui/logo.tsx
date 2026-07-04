import Image from "next/image";

import { cn } from "@/shared/lib/utils";

/** Фирменный знак — реальный логотип (кольцо с пульсом), вырезанный из макета. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo/mark-circle.png"
      alt=""
      width={371}
      height={335}
      priority
      className={cn("w-auto", className)}
    />
  );
}

/** Знак + вордмарк «PulseOps» (Ops — золотом, как в фирстиле). */
export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LogoMark className="h-6" />
      <span className="text-sm font-semibold tracking-tight">
        Pulse<span className="text-primary">Ops</span>
      </span>
    </div>
  );
}
