import * as React from "react";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center gap-3 select-none",
        className,
      )}
      data-testid="brand-mark"
    >
      <div className="relative">
        <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary/95 via-primary/70 to-accent/70 shadow-xl shadow-primary/20 ring-1 ring-white/10" />
        <div className="pointer-events-none absolute inset-0 rounded-2xl grain" />
        <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-accent shadow-lg shadow-accent/25 ring-1 ring-black/30" />
      </div>
      <div className="leading-tight">
        <div className="text-[15px] font-semibold tracking-tight">Providence</div>
        <div className="text-xs text-muted-foreground">Forex Members</div>
      </div>
    </div>
  );
}
