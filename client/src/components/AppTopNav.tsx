import * as React from "react";
import { Link } from "wouter";
import { BrandMark } from "@/components/BrandMark";
import { GradientButton } from "@/components/GradientButton";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Shield, Sparkles } from "lucide-react";

export function AppTopNav() {
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 -mx-4 sm:-mx-6 lg:-mx-8 mb-6 border-b border-white/10 bg-background/50 backdrop-blur-xl"
      data-testid="app-top-nav"
    >
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="group inline-flex items-center gap-3">
            <BrandMark />
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10 transition-colors group-hover:bg-white/8">
              <Sparkles className="h-3.5 w-3.5 text-primary/90" />
              dark pro dashboard
            </span>
          </Link>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div
                  className="hidden md:flex items-center gap-3 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10"
                  data-testid="nav-user"
                >
                  <div className="h-8 w-8 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-white/10 grid place-items-center text-xs font-bold">
                    {user?.email?.charAt(0).toUpperCase() ?? "M"}
                  </div>
                  <div className="leading-tight">
                    <div className="text-sm font-semibold">
                      {user?.firstName && user?.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user?.email ?? "Membro"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {user?.isAdmin ? "Administrador" : "Membro"}
                    </div>
                  </div>
                  <div className="ml-1 inline-flex items-center gap-1 rounded-full bg-accent/14 px-2 py-1 text-[11px] text-accent ring-1 ring-accent/25">
                    <Shield className="h-3.5 w-3.5" />
                    Secure
                  </div>
                </div>

                <GradientButton
                  variant="secondary"
                  isLoading={isLoggingOut}
                  onClick={() => logout()}
                  data-testid="logout-button"
                  className="px-4 py-2.5 rounded-2xl"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </GradientButton>
              </>
            ) : (
              <>
                <Link
                  href="/forgot-password"
                  className="hidden sm:inline-flex rounded-2xl px-4 py-2.5 text-sm font-semibold text-muted-foreground ring-1 ring-white/10 bg-white/0 hover:bg-white/6 transition-colors"
                  data-testid="nav-forgot-password"
                >
                  Forgot password
                </Link>
                <Link href="/login">
                  <GradientButton data-testid="login-cta">
                    Sign In
                  </GradientButton>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
