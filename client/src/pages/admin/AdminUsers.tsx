import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { GradientButton } from "@/components/GradientButton";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAdminUsers, useAdminResetUserPassword, useUpdateUser } from "@/hooks/use-users";
import { useToast } from "@/hooks/use-toast";
import { Search, UserCog, KeyRound, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function AdminUsers() {
  const { user } = useAuth();
  const isAdmin = Boolean((user as any)?.role === "admin" || (user as any)?.isAdmin);

  const { toast } = useToast();
  const [search, setSearch] = React.useState("");
  const q = useAdminUsers({ search });

  const updateUser = useUpdateUser();
  const resetPassword = useAdminResetUserPassword();

  const [editOpen, setEditOpen] = React.useState(false);
  const [editUser, setEditUser] = React.useState<any | null>(null);

  const [pwOpen, setPwOpen] = React.useState(false);
  const [pwUser, setPwUser] = React.useState<any | null>(null);
  const [newPassword, setNewPassword] = React.useState("");

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [confirmTarget, setConfirmTarget] = React.useState<any | null>(null);

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title="Admin · Usuários"
        subtitle="Editar metadados de usuário, status de confirmação e senhas."
        right={
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar usuários…"
              className="h-11 w-full rounded-2xl bg-white/5 pl-11 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15 sm:w-[320px]"
              data-testid="admin-users-search"
            />
          </div>
        }
      >
        {!isAdmin ? (
          <SectionCard title="Acesso negado" description="Permissões de administrador necessárias." data-testid="admin-users-denied">
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Você não tem acesso de administrador.</div>
            </div>
          </SectionCard>
        ) : (
          <SectionCard title="Usuários" description="Clique em um usuário para gerenciar os detalhes." data-testid="admin-users-card">
            {q.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-16 rounded-3xl bg-white/5 ring-1 ring-white/10 animate-pulse"
                    data-testid={`admin-users-skeleton-${i}`}
                  />
                ))}
              </div>
            ) : q.error ? (
              <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
                <div className="text-sm font-semibold">Não foi possível carregar os usuários</div>
                <div className="mt-1 text-sm text-muted-foreground">{(q.error as any)?.message}</div>
              </div>
            ) : (q.data as any[])?.length ? (
              <div className="space-y-3">
                {(q.data as any[]).map((u) => {
                  const confirmed = Boolean(u.emailConfirmed ?? u.isConfirmed ?? u.confirmed);
                  return (
                    <div
                      key={u.id}
                      className="flex flex-col gap-3 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4 shadow-lg shadow-black/35 hover:bg-white/7 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      data-testid={`admin-user-row-${u.id}`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-semibold truncate">{(u.firstName && u.lastName) ? `${u.firstName} ${u.lastName}` : (u.email ?? u.username ?? u.id)}</div>
                          {confirmed ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-primary/12 px-2 py-1 text-[11px] text-primary ring-1 ring-primary/25">
                              <CheckCircle2 className="h-3.5 w-3.5" /> confirmado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-destructive/12 px-2 py-1 text-[11px] text-destructive ring-1 ring-destructive/25">
                              <XCircle className="h-3.5 w-3.5" /> não confirmado
                            </span>
                          )}
                          {u.role ? (
                            <span className="inline-flex items-center rounded-full bg-accent/12 px-2 py-1 text-[11px] text-accent ring-1 ring-accent/25">
                              {u.role}
                            </span>
                          ) : null}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground truncate">
                          ID: {u.id}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <GradientButton
                          variant="secondary"
                          onClick={() => {
                            setEditUser(u);
                            setEditOpen(true);
                          }}
                          data-testid={`admin-user-edit-${u.id}`}
                          className="px-4 py-2.5"
                        >
                          <UserCog className="h-4 w-4" />
                          Editar
                        </GradientButton>

                        <GradientButton
                          variant="secondary"
                          onClick={() => {
                            setPwUser(u);
                            setNewPassword("");
                            setPwOpen(true);
                          }}
                          data-testid={`admin-user-password-${u.id}`}
                          className="px-4 py-2.5"
                        >
                          <KeyRound className="h-4 w-4" />
                          Redefinir senha
                        </GradientButton>

                        <GradientButton
                          variant={confirmed ? "secondary" : "primary"}
                          onClick={() => {
                            setConfirmTarget(u);
                            setConfirmOpen(true);
                          }}
                          data-testid={`admin-user-toggle-confirm-${u.id}`}
                          className="px-4 py-2.5"
                        >
                          {confirmed ? "Marcar como não confirmado" : "Marcar como confirmado"}
                        </GradientButton>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-7 text-center">
                <div className="text-sm font-semibold">Nenhum usuário</div>
                <div className="mt-1 text-sm text-muted-foreground">Tente ajustar sua pesquisa.</div>
              </div>
            )}
          </SectionCard>
        )}

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-xl bg-popover text-popover-foreground border border-white/10 rounded-3xl shadow-lift">
            <DialogHeader>
              <DialogTitle data-testid="admin-user-edit-title">Editar usuário</DialogTitle>
            </DialogHeader>

            {editUser ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const updates: any = {
                    email: String(fd.get("email") ?? ""),
                    firstName: String(fd.get("firstName") ?? ""),
                    lastName: String(fd.get("lastName") ?? ""),
                    role: String(fd.get("role") ?? ""),
                  };
                  updateUser.mutate(
                    { id: editUser.id, ...updates },
                    {
                      onSuccess: () => {
                        toast({ title: "Usuário atualizado" });
                        setEditOpen(false);
                      },
                      onError: (err: any) => {
                        toast({
                          title: "Falha na atualização",
                          description: err?.message ?? "Tente novamente.",
                          variant: "destructive",
                        });
                      },
                    },
                  );
                }}
                data-testid="admin-user-edit-form"
              >
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-semibold">E-mail</label>
                    <Input
                      name="email"
                      defaultValue={editUser.email ?? ""}
                      className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                      data-testid="admin-user-edit-email"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Papel</label>
                    <Input
                      name="role"
                      defaultValue={editUser.role ?? ""}
                      className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                      data-testid="admin-user-edit-role"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Nome</label>
                    <Input
                      name="firstName"
                      defaultValue={editUser.firstName ?? ""}
                      className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                      data-testid="admin-user-edit-firstName"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold">Sobrenome</label>
                    <Input
                      name="lastName"
                      defaultValue={editUser.lastName ?? ""}
                      className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                      data-testid="admin-user-edit-lastName"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <GradientButton
                    variant="secondary"
                    type="button"
                    onClick={() => setEditOpen(false)}
                    data-testid="admin-user-edit-cancel"
                  >
                    Cancelar
                  </GradientButton>
                  <GradientButton
                    type="submit"
                    isLoading={updateUser.isPending}
                    data-testid="admin-user-edit-save"
                  >
                    Salvar alterações
                  </GradientButton>
                </div>
              </form>
            ) : null}
          </DialogContent>
        </Dialog>

        <Dialog open={pwOpen} onOpenChange={setPwOpen}>
          <DialogContent className="max-w-lg bg-popover text-popover-foreground border border-white/10 rounded-3xl shadow-lift">
            <DialogHeader>
              <DialogTitle data-testid="admin-user-password-title">Redefinir senha</DialogTitle>
            </DialogHeader>

            {pwUser ? (
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  resetPassword.mutate(
                    { id: pwUser.id, password: newPassword },
                    {
                      onSuccess: () => {
                        toast({ title: "Senha redefinida" });
                        setPwOpen(false);
                      },
                      onError: (err: any) => {
                        toast({
                          title: "Falha na redefinição",
                          description: err?.message ?? "Tente novamente.",
                          variant: "destructive",
                        });
                      },
                    },
                  );
                }}
                data-testid="admin-user-password-form"
              >
                <div className="rounded-3xl bg-white/5 ring-1 ring-white/10 p-5">
                  <div className="text-sm font-semibold">Usuário</div>
                  <div className="mt-1 text-sm text-muted-foreground truncate">
                    {pwUser.email ?? pwUser.username ?? pwUser.id}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold">Nova senha</label>
                  <Input
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    type="password"
                    className="mt-2 h-11 rounded-2xl bg-background/40 ring-1 ring-white/10 focus:ring-4 focus:ring-primary/15"
                    data-testid="admin-user-password-input"
                    minLength={8}
                    required
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <GradientButton
                    variant="secondary"
                    type="button"
                    onClick={() => setPwOpen(false)}
                    data-testid="admin-user-password-cancel"
                  >
                    Cancelar
                  </GradientButton>
                  <GradientButton
                    type="submit"
                    isLoading={resetPassword.isPending}
                    data-testid="admin-user-password-save"
                  >
                    Definir senha
                  </GradientButton>
                </div>
              </form>
            ) : null}
          </DialogContent>
        </Dialog>

        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Alterar status de confirmação?"
          description="Isso afetará imediatamente o acesso ao painel para este usuário."
          confirmText="Aplicar"
          onConfirm={() => {
            const u = confirmTarget;
            if (!u) return;
            const confirmed = Boolean(u.emailConfirmed ?? u.isConfirmed ?? u.confirmed);
            updateUser.mutate(
              { id: u.id, emailConfirmed: !confirmed, confirmed: !confirmed, isConfirmed: !confirmed },
              {
                onSuccess: () => {
                  toast({ title: "Status de confirmação atualizado" });
                  setConfirmOpen(false);
                },
                onError: (err: any) => {
                  toast({
                    title: "Falha na atualização",
                    description: err?.message ?? "Tente novamente.",
                    variant: "destructive",
                  });
                },
              },
            );
          }}
          isPending={updateUser.isPending}
          data-testid="admin-user-confirm-dialog"
        />
      </DashboardLayout>
    </PageShell>
  );
}
