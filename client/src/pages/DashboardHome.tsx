import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { useDashboardOverview } from "@/hooks/use-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { ArrowUpRight, BarChart3, DollarSign, TrendingDown, TrendingUp } from "lucide-react";
import { GradientButton } from "@/components/GradientButton";
import { Link } from "wouter";

function StatPill({
  label,
  value,
  icon,
  tone = "primary",
  "data-testid": dataTestId,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tone?: "primary" | "accent" | "muted" | "danger";
  "data-testid"?: string;
}) {
  const toneStyles =
    tone === "primary"
      ? "from-primary/18 to-transparent ring-primary/20"
      : tone === "accent"
        ? "from-accent/16 to-transparent ring-accent/20"
        : tone === "danger"
          ? "from-destructive/16 to-transparent ring-destructive/25"
          : "from-white/8 to-transparent ring-white/10";

  return (
    <div
      className={`rounded-3xl bg-gradient-to-br ${toneStyles} ring-1 p-5 shadow-lg shadow-black/40 hover:shadow-xl hover:shadow-black/50 transition-all duration-300`}
      data-testid={dataTestId}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="h-9 w-9 rounded-2xl bg-white/6 ring-1 ring-white/10 grid place-items-center">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">Updated live from your linked data.</div>
    </div>
  );
}

export default function DashboardHome() {
  const { user } = useAuth();
  const overview = useDashboardOverview();

  const displayName = user?.email ?? "Member";

  return (
    <PageShell>
      <AppTopNav />

      <DashboardLayout
        title={
          <span>
            Bem-vindo de volta,{" "}
            <span className="bg-gradient-to-r from-primary via-primary/70 to-accent bg-clip-text text-transparent">
              {displayName}
            </span>
          </span>
        }
        subtitle="Sua visão geral de desempenho é calculada a partir das estratégias vinculadas às suas contas."
        right={
          <div className="flex items-center gap-2">
            <Link
              href="/accounts"
              className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2.5 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/8 transition-colors"
              data-testid="go-accounts"
            >
              Gerenciar Contas <ArrowUpRight className="h-4 w-4" />
            </Link>
            <GradientButton
              variant="secondary"
              onClick={() => window.location.href = "/admin"}
              data-testid="quick-admin"
              className="hidden md:inline-flex"
            >
              Administração
              <ArrowUpRight className="h-4 w-4" />
            </GradientButton>
          </div>
        }
      >
        <SectionCard
          title="Resumo"
          description="O resultado líquido é calculado a partir do lucro e prejuízo derivados do histórico de sua estratégia."
          data-testid="dashboard-snapshot"
        >
          {overview.isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-[120px] rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse"
                  data-testid={`snapshot-skeleton-${i}`}
                />
              ))}
            </div>
          ) : overview.error ? (
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Não foi possível carregar a visão geral</div>
              <div className="mt-1 text-sm text-muted-foreground">
                {(overview.error as any)?.message ?? "Tente novamente mais tarde."}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatPill
                label="Lucro"
                value={(overview.data as any)?.profit ?? "—"}
                icon={<TrendingUp className="h-4 w-4 text-primary" />}
                tone="primary"
                data-testid="stat-profit"
              />
              <StatPill
                label="Prejuízo"
                value={(overview.data as any)?.loss ?? "—"}
                icon={<TrendingDown className="h-4 w-4 text-destructive" />}
                tone="danger"
                data-testid="stat-loss"
              />
              <StatPill
                label="Líquido"
                value={(overview.data as any)?.net ?? "—"}
                icon={<DollarSign className="h-4 w-4 text-accent" />}
                tone="accent"
                data-testid="stat-net"
              />
            </div>
          )}
        </SectionCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard
            title="Contas"
            description="Suas contas são a ponte entre a identidade do membro e o desempenho da estratégia."
            data-testid="dashboard-accounts-card"
            right={
              <Link
                href="/accounts"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/8 transition-colors"
                data-testid="dashboard-accounts-link"
              >
                Abrir <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          >
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/12 ring-1 ring-primary/20 grid place-items-center">
                  <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Mantenha a consistência</div>
                  <div className="text-xs text-muted-foreground">
                    Vincular estratégias garante que o lucro/prejuízo permaneça automático.
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                As alterações do administrador refletem-se imediatamente nos painéis dos membros.
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Estratégias"
            description="Explore o conjunto de dados de desempenho que impulsiona seus cálculos."
            data-testid="dashboard-strategies-card"
            right={
              <Link
                href="/strategies"
                className="inline-flex items-center gap-2 rounded-2xl bg-white/5 px-4 py-2 text-sm font-semibold ring-1 ring-white/10 hover:bg-white/8 transition-colors"
                data-testid="dashboard-strategies-link"
              >
                Abrir <ArrowUpRight className="h-4 w-4" />
              </Link>
            }
          >
            <div className="rounded-3xl bg-gradient-to-br from-accent/10 via-white/4 to-primary/10 ring-1 ring-white/10 p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-accent/12 ring-1 ring-accent/20 grid place-items-center">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Histórico primeiro</div>
                  <div className="text-xs text-muted-foreground">
                    Os dados da estratégia impulsionam todos os resultados financeiros.
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                O administrador pode gerenciar estratégias e histórico.
              </div>
            </div>
          </SectionCard>
        </div>
      </DashboardLayout>
    </PageShell>
  );
}
