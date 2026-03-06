import * as React from "react";
import { Link } from "wouter";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { GradientButton } from "@/components/GradientButton";
import { SectionCard } from "@/components/SectionCard";
import { ArrowRight, BadgeCheck, CandlestickChart, Lock, Shield, Sparkles } from "lucide-react";

export default function Landing() {
  return (
    <PageShell>
      <AppTopNav />

      <div className="pb-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="animate-float-in">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-3 py-1 text-xs text-muted-foreground ring-1 ring-white/10">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Members-only analytics & admin controls
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl leading-[0.95] text-balance">
              PROVIDENCE FOREX
              <span className="block bg-gradient-to-r from-primary via-primary/70 to-accent bg-clip-text text-transparent uppercase tracking-tighter">
                Área de Membros
              </span>
            </h1>

            <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground">
              Um dashboard seguro para contas, estratégias e histórico de desempenho — construído para manter sua
              lógica financeira consistente e suas ferramentas de administração afiadas.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/login">
                <GradientButton
                  data-testid="landing-login"
                  className="px-6 py-3.5 rounded-2xl"
                >
                  Acessar Dashboard
                  <ArrowRight className="h-4 w-4" />
                </GradientButton>
              </Link>

              <Link
                href="/forgot-password"
                className="inline-flex items-center justify-center rounded-2xl px-6 py-3.5 text-sm font-semibold text-foreground ring-1 ring-white/12 bg-white/5 hover:bg-white/8 transition-colors"
                data-testid="landing-forgot"
              >
                Recuperar Senha
              </Link>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Lock, title: "Secure Access", desc: "Session-based auth + gated dashboard." },
                { icon: CandlestickChart, title: "Strategy Data", desc: "History-driven performance." },
                { icon: Shield, title: "Admin Controls", desc: "Manage users & records." },
              ].map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.title}
                    className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 shadow-lg shadow-black/40 hover:bg-white/7 transition-colors"
                    data-testid={`landing-feature-${f.title.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <Icon className="h-5 w-5 text-primary" />
                    <div className="mt-2 text-sm font-semibold">{f.title}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{f.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="animate-float-in" style={{ animationDelay: "120ms" }}>
            <SectionCard
              title={
                <div className="flex items-center gap-2">
                  <BadgeCheck className="h-5 w-5 text-accent" />
                  <span>What you get</span>
                </div>
              }
              description="Premium, audit-friendly admin and member views."
              data-testid="landing-card"
            >
              <ul className="space-y-3 text-sm">
                {[
                  "Accounts linked to strategies (no orphan data).",
                  "Automatic profit/loss/net calculations from history.",
                  "Full CRUD for strategies, history, accounts, financial records.",
                  "Admin-only routes with clear separation of powers.",
                ].map((t, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-primary/80 shadow-[0_0_0_4px_rgba(0,0,0,0.15)]" />
                    <span className="text-muted-foreground">
                      <span className="text-foreground">{t.split(" ")[0]}</span>{" "}
                      {t.slice(t.indexOf(" ") + 1)}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 rounded-3xl bg-gradient-to-br from-primary/12 via-white/4 to-accent/10 ring-1 ring-white/10 p-5">
                <div className="text-sm font-semibold">Ready when you are.</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Use your existing member account to authenticate.
                </div>
                <div className="mt-4">
                  <Link href="/login" className="block">
                    <GradientButton
                      variant="secondary"
                      data-testid="landing-secondary-login"
                      className="w-full justify-center"
                    >
                      Sign In
                      <ArrowRight className="h-4 w-4" />
                    </GradientButton>
                  </Link>
                </div>
              </div>
            </SectionCard>
          </div>
        </div>

        <footer className="mt-14 border-t border-white/10 pt-8 text-xs text-muted-foreground">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Providence Forex. All rights reserved.</div>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-primary" />
                Secure sessions
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Audit-friendly
              </span>
            </div>
          </div>
        </footer>
      </div>
    </PageShell>
  );
}
