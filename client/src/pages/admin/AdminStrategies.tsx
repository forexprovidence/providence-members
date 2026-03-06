import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateStrategy, useDeleteStrategy, useStrategies, useUpdateStrategy } from "@/hooks/use-strategies";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminStrategies() {
  const { user } = useAuth();
  const isAdmin = Boolean((user as any)?.role === "admin" || (user as any)?.isAdmin);

  console.log("Admin Check:", { user, isAdmin });

  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const q = useStrategies({ search });

  const create = useCreateStrategy();
  const update = useUpdateStrategy();
  const del = useDeleteStrategy();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Admin · Estratégias"
        subtitle="Crie, edite e exclua estratégias."
        right={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar…"
                className="h-11 w-[280px] rounded-2xl bg-white/5 pl-11 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                data-testid="admin-strategies-search"
              />
            </div>
            <GradientButton
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              data-testid="admin-strategies-create"
            >
              <Plus className="h-4 w-4" />
              Novo
            </GradientButton>
          </div>
        }
      >
        {!isAdmin ? (
          <SectionCard title="Acesso negado" description="Permissões de administrador necessárias." data-testid="admin-strategies-denied">
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Você não tem acesso de administrador.</div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Estratégias" description="Todas as edições invalidam os painéis dos membros." data-testid="admin-strategies-card">
            {q.isLoading ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-28 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
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
                    className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5 shadow-lg shadow-black/35 hover:bg-white/7 transition-colors"
                    data-testid={`admin-strategy-card-${s.id}`}
                  >
                    <div className="text-sm font-semibold truncate">{s.name ?? `Estratégia #${s.id}`}</div>
                    <div className="mt-1 text-xs text-muted-foreground line-clamp-3">
                      {s.description ?? "—"}
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                      <GradientButton
                        variant="secondary"
                        className="px-4 py-2.5"
                        onClick={() => {
                          setEditing(s);
                          setOpen(true);
                        }}
                        data-testid={`admin-strategy-edit-${s.id}`}
                      >
                        <Pencil className="h-4 w-4" /> Editar
                      </GradientButton>
                      <GradientButton
                        variant="danger"
                        className="px-4 py-2.5"
                        onClick={() => {
                          setDeleteId(s.id);
                          setConfirmOpen(true);
                        }}
                        data-testid={`admin-strategy-delete-${s.id}`}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </GradientButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
                <div className="text-sm font-semibold">Sem estratégias</div>
                <div className="mt-1 text-sm text-muted-foreground">Crie sua primeira estratégia.</div>
              </div>
            )}
          </SectionCard>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl bg-popover text-popover-foreground border border-white/10 rounded-3xl shadow-lift">
            <DialogHeader>
              <DialogTitle data-testid="admin-strategy-dialog-title">
                {editing ? "Editar estratégia" : "Nova estratégia"}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const payload: any = {
                  name: String(fd.get("name") ?? ""),
                  description: String(fd.get("description") ?? ""),
                };

                const action = editing
                  ? update.mutateAsync({ id: editing.id, ...payload })
                  : create.mutateAsync(payload);

                action
                  .then(() => {
                    toast({ title: editing ? "Estratégia atualizada" : "Estratégia criada" });
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
              data-testid="admin-strategy-form"
            >
              <div>
                <label className="text-sm font-semibold">Nome</label>
                <Input
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                  data-testid="admin-strategy-name"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-semibold">Descrição</label>
                <Textarea
                  name="description"
                  defaultValue={editing?.description ?? ""}
                  className="mt-2 min-h-[120px] rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                  data-testid="admin-strategy-description"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <GradientButton
                  variant="secondary"
                  type="button"
                  onClick={() => setOpen(false)}
                  data-testid="admin-strategy-cancel"
                >
                  Cancelar
                </GradientButton>
                <GradientButton
                  type="submit"
                  isLoading={create.isPending || update.isPending}
                  data-testid="admin-strategy-save"
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
          title="Excluir estratégia?"
          description="Isso não pode ser desfeito. Contas vinculadas podem ser afetadas."
          confirmText="Excluir"
          onConfirm={() => {
            if (deleteId == null) return;
            del.mutate(deleteId, {
              onSuccess: () => {
                toast({ title: "Estratégia excluída" });
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
          data-testid="admin-strategy-delete-confirm"
        />
      </DashboardLayout>
    </PageShell>
  );
}
