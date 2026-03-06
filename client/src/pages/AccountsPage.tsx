import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { useAccounts } from "@/hooks/use-accounts";
import { Input } from "@/components/ui/input";
import { Search, Wallet } from "lucide-react";

export default function AccountsPage() {
  const [search, setSearch] = React.useState("");
  const q = useAccounts({ search });

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Contas"
        subtitle="Suas contas estão vinculadas a estratégias para cálculos consistentes. Os administradores gerenciam o vínculo."
        right={
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar contas…"
              className="h-11 w-full rounded-2xl bg-white/5 pl-11 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15 sm:w-[320px]"
              data-testid="accounts-search"
            />
          </div>
        }
      >
        <SectionCard title="Lista" description="Apenas leitura para membros." data-testid="accounts-list">
          {q.isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse"
                  data-testid={`account-skeleton-${i}`}
                />
              ))}
            </div>
          ) : q.error ? (
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Não foi possível carregar as contas</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as any)?.message}</div>
            </div>
          ) : (q.data as any[])?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(q.data as any[]).map((a) => (
                <div
                  key={a.id}
                  className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 shadow-lg shadow-black/35 hover:bg-white/7 hover:shadow-xl hover:shadow-black/45 transition-all duration-300"
                  data-testid={`account-card-${a.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{a.name ?? `Conta #${a.id}`}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Estratégia: {a.strategyName ?? a.strategyId ?? "—"}
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Status: {a.status ?? "ativa"}
                      </div>
                    </div>
                    <div className="h-9 w-9 rounded-2xl bg-accent/10 ring-1 ring-accent/20 grid place-items-center">
                      <Wallet className="h-4 w-4 text-accent" />
                    </div>
                  </div>
                  <div className="mt-4 text-xs text-muted-foreground">ID: {a.id}</div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
              <div className="text-sm font-semibold">Nenhuma conta</div>
              <div className="mt-1 text-sm text-muted-foreground">Peça a um administrador para criar e vincular suas contas.</div>
            </div>
          )}
        </SectionCard>
      </DashboardLayout>
    </PageShell>
  );
}
