import * as React from "react";
import { AppTopNav } from "@/components/AppTopNav";
import { PageShell } from "@/components/PageShell";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SectionCard } from "@/components/SectionCard";
import { Link } from "wouter";
import { ArrowUpRight, ShieldCheck, Users, LineChart, Database, Wallet } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

function AdminTile({
  href,
  title,
  description,
  icon,
  tone = "primary",
  testId,
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  tone?: "primary" | "accent";
  testId: string;
}) {
  const toneCls =
    tone === "accent"
      ? "from-accent/18 to-transparent ring-accent/25 hover:shadow-accent/12"
      : "from-primary/18 to-transparent ring-primary/25 hover:shadow-primary/12";

  return (
    <Link
      href={href}
      className={`group rounded-3xl bg-gradient-to-br ${toneCls} ring-1 p-5 shadow-lg shadow-black/35 hover:shadow-xl hover:shadow-black/50 transition-all duration-300`}
      data-testid={testId}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{description}</div>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-white/6 ring-1 ring-white/10 grid place-items-center">
          {icon}
        </div>
      </div>
      <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-foreground/90">
        Open <ArrowUpRight className="h-3.5 w-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

export default function AdminHome() {
  const { user } = useAuth();
  const isAdmin = Boolean((user as any)?.role === "admin" || (user as any)?.isAdmin);

  return (
    <PageShell>
      <AppTopNav />
      <DashboardLayout
        title={
          <span className="inline-flex items-center gap-3">
            <ShieldCheck className="h-7 w-7 text-accent" />
            Painel Administrativo
          </span>
        }
        subtitle="Gerenciamento completo de usuários, estratégias, histórico, contas e registros financeiros."
      >
        {!isAdmin ? (
          <SectionCard title="Acesso negado" description="Permissões de administrador necessárias." data-testid="admin-denied">
            <div className="rounded-3xl bg-destructive/10 ring-1 ring-destructive/25 p-5">
              <div className="text-sm font-semibold">Você não tem acesso de administrador.</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Se você acredita que isso é um erro, entre em contato com o suporte da Providence Forex.
              </div>
            </div>
          </SectionCard>
        ) : (
          <>
            <SectionCard
              title="Ações rápidas"
              description="Navegue por qualquer conjunto de dados. Todas as alterações refletem imediatamente nos painéis dos membros."
              data-testid="admin-quick-actions"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AdminTile
                  href="/admin/users"
                  title="Usuários"
                  description="Visualizar, editar, confirmar e redefinir senhas."
                  icon={<Users className="h-5 w-5 text-primary" />}
                  testId="admin-tile-users"
                />
                <AdminTile
                  href="/admin/strategies"
                  title="Estratégias"
                  description="Criar, editar e excluir estratégias."
                  icon={<LineChart className="h-5 w-5 text-primary" />}
                  testId="admin-tile-strategies"
                />
                <AdminTile
                  href="/admin/strategy-history"
                  title="Histórico de Estratégias"
                  description="Gerenciar conjuntos de dados de desempenho."
                  icon={<Database className="h-5 w-5 text-accent" />}
                  tone="accent"
                  testId="admin-tile-history"
                />
                <AdminTile
                  href="/admin/accounts"
                  title="Contas"
                  description="Vincular usuários a estratégias."
                  icon={<Wallet className="h-5 w-5 text-accent" />}
                  tone="accent"
                  testId="admin-tile-accounts"
                />
                <AdminTile
                  href="/admin/financial-records"
                  title="Registros Financeiros"
                  description="Editar todos os históricos financeiros."
                  icon={<Database className="h-5 w-5 text-primary" />}
                  testId="admin-tile-financial"
                />
              </div>
            </SectionCard>

            <SectionCard title="Notas" description="Orientação operacional." data-testid="admin-notes">
              <div className="space-y-3 text-sm text-muted-foreground">
                <p>
                  As rotas de administrador são protegidas no lado do servidor. O frontend também oculta a navegação de administrador quando não permitido.
                </p>
                <p>
                  Use os diálogos de CRUD para garantir que cada ação esteja conectada a mutações e invalidação de consulta.
                </p>
              </div>
            </SectionCard>
          </>
        )}
      </DashboardLayout>
    </PageShell>
  );
}
