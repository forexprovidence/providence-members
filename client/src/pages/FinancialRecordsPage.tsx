import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { useFinancialRecords } from "@/hooks/use-financial-records";
import { Input } from "@/components/ui/input";
import { Database, Search } from "lucide-react";

export default function FinancialRecordsPage() {
  const [search, setSearch] = React.useState("");
  const q = useFinancialRecords({ search });

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Registros Financeiros"
        subtitle="Uma visão apenas de leitura das entradas financeiras vinculadas ao seu desempenho."
        right={
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar registros…"
              className="h-11 w-full rounded-2xl bg-white/5 pl-11 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15 sm:w-[320px]"
              data-testid="financial-search"
            />
          </div>
        }
      >
        <SectionCard title="Lista" description="Apenas leitura para membros." data-testid="financial-list">
          {q.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-16 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse"
                  data-testid={`financial-skeleton-${i}`}
                />
              ))}
            </div>
          ) : q.error ? (
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Não foi possível carregar os registros</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as any)?.message}</div>
            </div>
          ) : (q.data as any[])?.length ? (
            <div className="space-y-3">
              {(q.data as any[]).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-4 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 shadow-lg shadow-black/35 hover:bg-white/7 transition-colors"
                  data-testid={`financial-row-${r.id}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-2xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
                      <Database className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {r.title ?? r.type ?? "Registro"}
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        Conta: {r.accountName ?? r.accountId ?? "—"} · {r.date ?? r.createdAt ?? "—"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{r.amount ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">ID: {r.id}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
              <div className="text-sm font-semibold">Nenhum registro</div>
              <div className="mt-1 text-sm text-muted-foreground">Assim que existirem entradas, elas aparecerão aqui.</div>
            </div>
          )}
        </SectionCard>
      </DashboardLayout>
    </PageShell>
  );
}
