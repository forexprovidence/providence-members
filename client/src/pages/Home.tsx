import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { BarChart3, TrendingUp, Calculator, Settings } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Providence</h1>
            <p className="text-gray-400 mb-8">Acompanhe suas contas de copy trading</p>
          </div>

          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">Bem-vindo</h2>
              <p className="text-sm text-gray-400">
                Faça login para acessar sua área de membros e acompanhar o desempenho de suas estratégias.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => (window.location.href = "/api/oauth/login")}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                size="lg"
              >
                Entrar com Manus
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-slate-800 text-gray-400">Ou</span>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-gray-500 text-center">
                Não tem uma conta? Crie uma nova conta para começar a acompanhar suas contas de trading.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-400">100%</div>
              <p className="text-xs text-gray-400">Seguro</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">24/7</div>
              <p className="text-xs text-gray-400">Disponível</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">Rápido</div>
              <p className="text-xs text-gray-400">Acesso</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Bem-vindo, <span className="text-blue-600">{user.name || user.email}</span>
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas contas de copy trading e acompanhe a performance de suas estratégias
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/contas")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Minhas Contas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Cadastre e gerencie suas contas MT4/MT5
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/graficos")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Gráficos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Visualize a evolução do seu capital
              </p>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setLocation("/calculadora")}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calculator className="h-5 w-5 text-purple-600" />
                Calculadora
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Simule cenários de investimento
              </p>
            </CardContent>
          </Card>

          {user.role === "admin" && (
            <Card
              className="cursor-pointer hover:shadow-lg transition-all"
              onClick={() => setLocation("/admin")}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5 text-orange-600" />
                  Administração
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Gerencie estratégias e resultados
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Funcionalidades</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cadastro de Contas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Registre suas contas MT4/MT5 com os seguintes dados:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Número da conta</li>
                  <li>Estratégia selecionada</li>
                  <li>Data de aprovação do copy</li>
                  <li>Depósito inicial em dólares</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acompanhamento de Performance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Visualize em tempo real:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Evolução do seu capital</li>
                  <li>Comparação com CDI/Renda Fixa</li>
                  <li>Retorno percentual acumulado</li>
                  <li>Histórico mensal detalhado</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Gráficos Comparativos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Compare a performance de suas estratégias:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Linha de evolução do capital</li>
                  <li>Comparação com CDI mensal</li>
                  <li>Visualização de ganhos/perdas</li>
                  <li>Dados atualizados mensalmente</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Calculadora de Simulação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Simule cenários hipotéticos:
                </p>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                  <li>Valor inicial customizável</li>
                  <li>Data de início no passado</li>
                  <li>Comparação entre estratégias</li>
                  <li>Comparação com renda fixa</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* How It Works */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">Como Funciona</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-blue-600 text-white font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Cadastre sua Conta</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Acesse "Minhas Contas" e informe os dados de sua conta MT4/MT5
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-green-600 text-white font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Acompanhe a Performance</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Visualize os gráficos e veja a evolução do seu capital em tempo real
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-md bg-purple-600 text-white font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Simule Cenários</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Use a calculadora para explorar diferentes possibilidades de investimento
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-2">
            <p>
              • Todos os valores são armazenados em dólares (USD)
            </p>
            <p>
              • Os retornos são atualizados mensalmente pelos administradores
            </p>
            <p>
              • Você pode cadastrar múltiplas contas em diferentes estratégias
            </p>
            <p>
              • Os cálculos usam juros compostos para refletir a realidade do mercado
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
