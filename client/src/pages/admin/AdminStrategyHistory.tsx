import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStrategies } from "@/hooks/use-strategies";
import {
  useCreateStrategyHistory,
  useDeleteStrategyHistory,
  useStrategyHistory,
  useUpdateStrategyHistory,
} from "@/hooks/use-strategy-history";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Database } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminStrategyHistory() {
  const { user } = useAuth();
  const isAdmin = Boolean((user as any)?.role === "admin" || (user as any)?.isAdmin);

  const { toast } = useToast();
  const strategies = useStrategies();

  const [strategyId, setStrategyId] = React.useState<number>(() => {
    const first = (strategies.data as any[])?.[0]?.id;
    return typeof first === "number" ? first : 0;
  });

  React.useEffect(() => {
    const first = (strategies.data as any[])?.[0]?.id;
    if (!strategyId && typeof first === "number") setStrategyId(first);
  }, [strategies.data, strategyId]);

  const history = useStrategyHistory(strategyId);

  const create = useCreateStrategyHistory();
  const update = useUpdateStrategyHistory();
  const del = useDeleteStrategyHistory();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Admin · Histórico de Estratégias"
        subtitle="Gerencie o conjunto de dados de desempenho anexado a cada estratégia."
        right={
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={strategyId}
              onChange={(e) => setStrategyId(String(e.target.value))}
              className="h-11 rounded-2xl bg-white/5 px-4 text-sm font-semibold ring-1 ring-white/10 focus:outline-none focus:ring-4 focus:ring-primary/15"
              data-testid="admin-history-strategy-select"
            >
              {(strategies.data as any[])?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name ?? `Estratégia #${s.id}`}
                </option>
              ))}
            </select>
            <GradientButton
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              data-testid="admin-history-create"
            >
              <Plus className="h-4 w-4" />
              Adicionar linha
            </GradientButton>
          </div>
        }
      >
        {!isAdmin ? (
          <SectionCard title="Acesso negado" description="Permissões de administrador necessárias." data-testid="admin-history-denied">
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Você não tem acesso de administrador.</div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard
            title="Linhas de histórico"
            description="Edite retornos/métricas usados nos cálculos."
            data-testid="admin-history-card"
          >
            {history.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
                ))}
              </div>
            ) : history.error ? (
              <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
                <div className="text-sm font-semibold">Não foi possível carregar o histórico</div>
                <div className="mt-1 text-sm text-muted-foreground">{(history.error as any)?.message}</div>
              </div>
            ) : (history.data as any[])?.length ? (
              <div className="space-y-3">
                {(history.data as any[]).map((row) => (
                  <div
                    key={row.id}
                    className="flex flex-col gap-3 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 shadow-lg shadow-black/35 hover:bg-white/7 transition-colors sm:flex-row sm:items-center sm:justify-between"
                    data-testid={`admin-history-row-${row.id}`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{row.occurredAt ? new Date(row.occurredAt).toLocaleDateString('pt-BR') : `Linha #${row.id}`}</div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        Lucro: {row.profit ?? "—"} · Prejuízo: {row.loss ?? "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GradientButton
                        variant="secondary"
                        className="px-4 py-2.5"
                        onClick={() => {
                          setEditing(row);
                          setOpen(true);
                        }}
                        data-testid={`admin-history-edit-${row.id}`}
                      >
                        <Pencil className="h-4 w-4" /> Editar
                      </GradientButton>
                      <GradientButton
                        variant="danger"
                        className="px-4 py-2.5"
                        onClick={() => {
                          setDeleteId(row.id);
                          setConfirmOpen(true);
                        }}
                        data-testid={`admin-history-delete-${row.id}`}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </GradientButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
                <div className="text-sm font-semibold">Sem linhas de histórico</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Adicione o primeiro ponto de dados de desempenho para esta estratégia.
                </div>
              </div>
            )}
          </SectionCard>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl bg-popover text-popover-foreground border border-white/10 rounded-3xl shadow-lift">
            <DialogHeader>
              <DialogTitle data-testid="admin-history-dialog-title">
                {editing ? "Editar linha de histórico" : "Adicionar linha de histórico"}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);

                const payload: any = {
                  strategyId,
                  occurredAt: String(fd.get("occurredAt") ?? ""),
                  profit: String(fd.get("profit") ?? "0"),
                  loss: String(fd.get("loss") ?? "0"),
                  note: String(fd.get("note") ?? ""),
                };

                const action = editing
                  ? update.mutateAsync({ id: editing.id, ...payload })
                  : create.mutateAsync(payload);

                action
                  .then(() => {
                    toast({ title: editing ? "Histórico atualizado" : "Histórico adicionado" });
                    setOpen(false);
                  })
                  .catch((err: any) => {
                    toast({
                      title: "Falha ao salvar",
                      description: err?.message ?? "Por favor, tente novamente.",
                      variant: "destructive",
                    });
                  });
              }}
              data-testid="admin-history-form"
            >
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-primary/10 ring-1 ring-primary/20 grid place-items-center">
                  <Database className="h-5 w-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold">Estratégia</div>
                  <div className="text-xs text-muted-foreground truncate">
                    ID: {strategyId}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Data</label>
                  <Input
                    name="occurredAt"
                    type="date"
                    defaultValue={editing?.occurredAt ? new Date(editing.occurredAt).toISOString().split('T')[0] : ""}
                    className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-history-date"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Lucro</label>
                  <Input
                    name="profit"
                    defaultValue={editing?.profit ?? "0"}
                    className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-history-profit"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold">Prejuízo</label>
                  <Input
                    name="loss"
                    defaultValue={editing?.loss ?? "0"}
                    className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-history-loss"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold">Nota</label>
                <Input
                  name="note"
                  defaultValue={editing?.note ?? ""}
                  className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                  data-testid="admin-history-note"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <GradientButton
                  variant="secondary"
                  type="button"
                  onClick={() => setOpen(false)}
                  data-testid="admin-history-cancel"
                >
                  Cancelar
                </GradientButton>
                <GradientButton
                  type="submit"
                  isLoading={create.isPending || update.isPending}
                  data-testid="admin-history-save"
                >
                  Salvar
                </GradientButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Excluir linha de histórico?"
          description="Isso afeta os cálculos de desempenho."
          confirmText="Excluir"
          onConfirm={() => {
            if (deleteId == null) return;
            del.mutate(deleteId, {
              onSuccess: () => {
                toast({ title: "Linha excluída" });
                setConfirmOpen(false);
              },
              onError: (err: any) => {
                toast({
                  title: "Falha ao excluir",
                  description: err?.message ?? "Por favor, tente novamente.",
                  variant: "destructive",
                });
              },
            });
          }}
          isPending={del.isPending}
          data-testid="admin-history-delete-confirm"
        />
      </DashboardLayout>
    </PageShell>
  );
}
