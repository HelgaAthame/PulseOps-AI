import Link from "next/link";
import { Compass, MoveLeft } from "lucide-react";

import { buttonVariants } from "@/shared/ui/button";

// Корневой 404: рендерится внутри root layout (без сайдбара/топбара).
export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-5 p-6 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Compass className="size-7" />
      </span>
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">
          This page doesn’t exist
        </h1>
        <p className="mx-auto max-w-sm text-sm text-muted-foreground">
          The page you’re looking for may have been moved or never existed.
        </p>
      </div>
      <Link href="/" className={buttonVariants({ variant: "default", size: "sm" })}>
        <MoveLeft className="size-3.5" />
        Back to dashboard
      </Link>
    </div>
  );
}
