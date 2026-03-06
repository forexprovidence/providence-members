import * as React from "react";
import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  LineChart,
  Wallet,
  Database,
  Users,
  ShieldCheck,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";

const nav = [
  { href: "/", label: "Overview", icon: LayoutDashboard, testId: "nav-overview" },
  { href: "/strategies", label: "Strategies", icon: LineChart, testId: "nav-strategies" },
  { href: "/accounts", label: "Accounts", icon: Wallet, testId: "nav-accounts" },
  { href: "/financial-records", label: "Financial", icon: Database, testId: "nav-financial" },
];

const adminNav = [
  { href: "/admin", label: "Admin", icon: ShieldCheck, testId: "nav-admin" },
  { href: "/admin/users", label: "Users", icon: Users, testId: "nav-admin-users" },
  { href: "/admin/settings", label: "Settings", icon: Settings, testId: "nav-admin-settings" },
];

export function DashboardLayout({
  title,
  subtitle,
  children,
  right,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [loc] = useLocation();
  const { user } = useAuth();

  const isAdmin = Boolean((user as any)?.role === "admin" || (user as any)?.isAdmin);

  return (
    <div className="min-h-[calc(100vh-84px)] pb-10" data-testid="dashboard-layout">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr] lg:gap-8">
        <aside className="lg:sticky lg:top-[92px] lg:self-start">
          <div className="rounded-3xl glass ring-premium grain overflow-hidden">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="text-sm text-muted-foreground">Navigation</div>
              <div className="mt-1 text-lg">Member Console</div>
            </div>

            <nav className="p-2" data-testid="sidebar-nav">
              {nav.map((item) => {
                const active = loc === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    data-testid={item.testId}
                    className={cn(
                      "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                      "hover:bg-white/6 hover:ring-1 hover:ring-white/10",
                      active
                        ? "bg-gradient-to-r from-primary/18 to-transparent ring-1 ring-primary/25 text-foreground shadow-lg shadow-primary/10"
                        : "text-muted-foreground",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-4 w-4 transition-colors",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                    <span
                      className={cn(
                        "ml-auto h-1.5 w-1.5 rounded-full transition-opacity",
                        active ? "bg-primary opacity-100" : "bg-white/30 opacity-0 group-hover:opacity-100",
                      )}
                    />
                  </Link>
                );
              })}

              {isAdmin ? (
                <div className="mt-2 pt-2 border-t border-white/10">
                  <div className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Admin
                  </div>
                  {adminNav.map((item) => {
                    const active = loc === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-testid={item.testId}
                        className={cn(
                          "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                          "hover:bg-white/6 hover:ring-1 hover:ring-white/10",
                          active
                            ? "bg-gradient-to-r from-accent/18 to-transparent ring-1 ring-accent/25 text-foreground shadow-lg shadow-accent/10"
                            : "text-muted-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4 transition-colors",
                            active ? "text-accent" : "text-muted-foreground group-hover:text-foreground",
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </nav>

            <div className="border-t border-white/10 px-5 py-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Session</span>
                <span className="text-foreground/80">{(user as any)?.email ?? "Member"}</span>
              </div>
            </div>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <h1 className="text-3xl sm:text-4xl leading-[1.05] text-balance" data-testid="page-title">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-muted-foreground" data-testid="page-subtitle">
                  {subtitle}
                </p>
              ) : null}
            </div>
            {right ? <div className="shrink-0">{right}</div> : null}
          </div>

          <div className="space-y-6" data-testid="page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
