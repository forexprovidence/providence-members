import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useAccounts, useCreateAccount, useDeleteAccount, useUpdateAccount } from "@/hooks/use-accounts";
import { useStrategies } from "@/hooks/use-strategies";
import { useAdminUsers } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminAccounts() {
  const { user } = useAuth();
  const isAdmin = Boolean((user as any)?.role === "admin" || (user as any)?.isAdmin);

  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const q = useAccounts({ search });

  const strategies = useStrategies();
  const users = useAdminUsers();

  const create = useCreateAccount();
  const update = useUpdateAccount();
  const del = useDeleteAccount();

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<any | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<number | null>(null);

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Admin · Contas"
        subtitle="Vincule usuários a estratégias."
        right={
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar…"
                className="h-11 w-[280px] rounded-2xl bg-white/5 pl-11 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                data-testid="admin-accounts-search"
              />
            </div>
            <GradientButton
              onClick={() => {
                setEditing(null);
                setOpen(true);
              }}
              data-testid="admin-accounts-create"
            >
              <Plus className="h-4 w-4" />
              Novo
            </GradientButton>
          </div>
        }
      >
        {!isAdmin ? (
          <SectionCard title="Acesso negado" description="Permissões de administrador necessárias." data-testid="admin-accounts-denied">
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Você não tem acesso de administrador.</div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Contas" description="Crie e vincule contas." data-testid="admin-accounts-card">
            {q.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse" />
                ))}
              </div>
            ) : q.error ? (
              <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
                <div className="text-sm font-semibold">Não foi possível carregar as contas</div>
                <div className="mt-1 text-sm text-muted-foreground">{(q.error as any)?.message}</div>
              </div>
            ) : (q.data as any[])?.length ? (
              <div className="space-y-3">
                {(q.data as any[]).map((a) => (
                  <div
                    key={a.id}
                    className="flex flex-col gap-3 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 shadow-lg shadow-black/35 hover:bg-white/7 transition-colors sm:flex-row sm:items-center sm:justify-between"
                    data-testid={`admin-account-row-${a.id}`}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{a.name ?? `Conta #${a.id}`}</div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">
                        Usuário: {a.userEmail ?? a.userId ?? "—"} · Estratégia: {a.strategyName ?? a.strategyId ?? "—"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GradientButton
                        variant="secondary"
                        className="px-4 py-2.5"
                        onClick={() => {
                          setEditing(a);
                          setOpen(true);
                        }}
                        data-testid={`admin-account-edit-${a.id}`}
                      >
                        <Pencil className="h-4 w-4" /> Editar
                      </GradientButton>
                      <GradientButton
                        variant="danger"
                        className="px-4 py-2.5"
                        onClick={() => {
                          setDeleteId(a.id);
                          setConfirmOpen(true);
                        }}
                        data-testid={`admin-account-delete-${a.id}`}
                      >
                        <Trash2 className="h-4 w-4" /> Excluir
                      </GradientButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
                <div className="text-sm font-semibold">Sem contas</div>
                <div className="mt-1 text-sm text-muted-foreground">Crie a primeira conta.</div>
              </div>
            )}
          </SectionCard>
        )}

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl bg-popover text-popover-foreground border border-white/10 rounded-3xl shadow-lift">
            <DialogHeader>
              <DialogTitle data-testid="admin-account-dialog-title">
                {editing ? "Editar conta" : "Nova conta"}
              </DialogTitle>
            </DialogHeader>

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);

                const payload: any = {
                  name: String(fd.get("name") ?? ""),
                  userId: String(fd.get("userId") ?? ""),
                  strategyId: String(fd.get("strategyId") ?? ""),
                  status: String(fd.get("status") ?? "active"),
                };

                const action = editing
                  ? update.mutateAsync({ id: editing.id, ...payload })
                  : create.mutateAsync(payload);

                action
                  .then(() => {
                    toast({ title: editing ? "Conta atualizada" : "Conta criada" });
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
              data-testid="admin-account-form"
            >
              <div>
                <label className="text-sm font-semibold">Nome</label>
                <Input
                  name="name"
                  defaultValue={editing?.name ?? ""}
                  className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                  data-testid="admin-account-name"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold">Usuário</label>
                  <select
                    name="userId"
                    defaultValue={editing?.userId ?? ""}
                    className="mt-2 h-11 w-full rounded-2xl bg-white/5 px-4 text-sm font-semibold ring-1 ring-white/10 focus:outline-none focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-account-userId"
                    required
                  >
                    <option value="" disabled>
                      Selecionar usuário…
                    </option>
                    {(users.data as any[])?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.email ?? u.username ?? u.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Estratégia</label>
                  <select
                    name="strategyId"
                    defaultValue={editing?.strategyId ?? ""}
                    className="mt-2 h-11 w-full rounded-2xl bg-white/5 px-4 text-sm font-semibold ring-1 ring-white/10 focus:outline-none focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-account-strategyId"
                    required
                  >
                    <option value="" disabled>
                      Selecionar estratégia…
                    </option>
                    {(strategies.data as any[])?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name ?? `Estratégia #${s.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold">Status</label>
                  <Input
                    name="status"
                    defaultValue={editing?.status ?? "active"}
                    className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-account-status"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                <GradientButton
                  variant="secondary"
                  type="button"
                  onClick={() => setOpen(false)}
                  data-testid="admin-account-cancel"
                >
                  Cancelar
                </GradientButton>
                <GradientButton
                  type="submit"
                  isLoading={create.isPending || update.isPending}
                  data-testid="admin-account-save"
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
          title="Excluir conta?"
          description="Isso não pode ser desfeito."
          confirmText="Excluir"
          onConfirm={() => {
            if (deleteId == null) return;
            del.mutate(deleteId, {
              onSuccess: () => {
                toast({ title: "Conta excluída" });
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
          data-testid="admin-account-delete-confirm"
        />
      </DashboardLayout>
    </PageShell>
  );
}
