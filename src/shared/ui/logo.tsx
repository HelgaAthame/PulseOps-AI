import Image from "next/image";

import { cn } from "@/shared/lib/utils";

/** Фирменный знак — кольцо с пульсом (для компактных мест/фавикона). */
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

/** Основной логотип — реальный вордмарк PULSEOPS (вырезан из макета, прозрачный фон). */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/logo/wordmark-compact.png"
      alt="PulseOps"
      width={1287}
      height={198}
      priority
      className={cn("logo-wordmark h-6 w-auto", className)}
    />
  );
}
