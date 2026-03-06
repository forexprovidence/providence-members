import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { useStrategies } from "@/hooks/use-strategies";
import { Input } from "@/components/ui/input";
import { LineChart, Search } from "lucide-react";

export default function StrategiesPage() {
  const [search, setSearch] = React.useState("");
  const q = useStrategies({ search });

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Estratégias"
        subtitle="Navegue pelas estratégias que alimentam suas contas. Os administradores podem editá-las no painel de Administração."
        right={
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar estratégias…"
              className="h-11 w-full rounded-2xl bg-white/5 pl-11 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15 sm:w-[320px]"
              data-testid="strategies-search"
            />
          </div>
        }
      >
        <SectionCard title="Lista" description="Apenas leitura para membros." data-testid="strategies-list">
          {q.isLoading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse"
                  data-testid={`strategy-skeleton-${i}`}
                />
              ))}
            </div>
          ) : q.error ? (
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Não foi possível carregar as estratégias</div>
              <div className="mt-1 text-sm text-muted-foreground">{(q.error as any)?.message}</div>
            </div>
          ) : (q.data as any[])?.length ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(q.data as any[]).map((s) => (
                <div
                  key={s.id}
                  className="group rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 shadow-lg shadow-black/35 hover:bg-white/7 hover:shadow-xl hover:shadow-black/45 transition-all duration-300"
                  data-testid={`strategy-card-${s.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{s.name ?? `Estratégia #${s.id}`}</div>
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                        {s.description ?? "Nenhuma descrição fornecida."}
                      </div>
                    </div>
                    <div className="h-9 w-9 rounded-2xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
                      <LineChart className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <span>ID: {s.id}</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Apenas leitura
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
              <div className="text-sm font-semibold">Nenhuma estratégia</div>
              <div className="mt-1 text-sm text-muted-foreground">Tente ajustar sua pesquisa.</div>
            </div>
          )}
        </SectionCard>
      </DashboardLayout>
    </PageShell>
  );
}
