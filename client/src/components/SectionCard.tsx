import * as React from "react";
import { cn } from "@/lib/utils";

export function SectionCard({
  title,
  description,
  right,
  children,
  className,
  "data-testid": dataTestId,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  "data-testid"?: string;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl bg-card/70 glass ring-premium grain animate-float-in",
        className,
      )}
      data-testid={dataTestId ?? "section-card"}
    >
      <div className="flex flex-col gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="text-lg sm:text-xl">{title}</div>
          {description ? (
            <div className="mt-1 text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>

      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}
