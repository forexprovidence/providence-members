import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  isLoading?: boolean;
  "data-testid"?: string;
};

export function GradientButton({
  className,
  variant = "primary",
  isLoading,
  disabled,
  children,
  ...props
}: Props) {
  const styles =
    variant === "primary"
      ? "bg-gradient-to-r from-primary to-primary/70 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md ring-1 ring-white/10"
      : variant === "secondary"
        ? "bg-white/6 text-foreground ring-1 ring-white/10 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0 shadow-lg shadow-black/30"
        : variant === "danger"
          ? "bg-gradient-to-r from-destructive to-destructive/70 text-destructive-foreground shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:-translate-y-0.5 active:translate-y-0"
          : "bg-transparent text-foreground hover:bg-white/6 ring-1 ring-transparent hover:ring-white/10";

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      className={cn(
        "btn-sheen inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-4 focus:ring-primary/15 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        styles,
        className,
      )}
      data-testid={props["data-testid"] ?? "gradient-button"}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white/90" />
          <span>Working…</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}
