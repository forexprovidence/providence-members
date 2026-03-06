import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

export default function AdminPage() {
  const { user } = useAuth();
  const [strategyForm, setStrategyForm] = useState({ name: "", description: "" });
  const [monthlyStrategyForm, setMonthlyStrategyForm] = useState({
    strategyId: "",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    returnPercentage: "",
  });
  const [monthlyCDIForm, setMonthlyCDIForm] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    returnPercentage: "",
  });

  const utils = trpc.useUtils();
  const strategiesQuery = trpc.strategies.list.useQuery();
  const cdiQuery = trpc.admin.monthlyResults.getCDI.useQuery();
  const createStrategyMutation = trpc.admin.strategies.create.useMutation();
  const upsertStrategyResultMutation = trpc.admin.monthlyResults.upsertStrategy.useMutation();
  const upsertCDIResultMutation = trpc.admin.monthlyResults.upsertCDI.useMutation();

  if (!user?.role || user.role !== "admin") {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Acesso Negado</h1>
            <p className="text-muted-foreground mt-2">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleCreateStrategy = async () => {
    if (!strategyForm.name) {
      toast.error("Nome da estratégia é obrigatório");
      return;
    }
    try {
      await createStrategyMutation.mutateAsync({
        name: strategyForm.name,
        description: strategyForm.description,
      });
      toast.success("Estratégia criada com sucesso");
      setStrategyForm({ name: "", description: "" });
      utils.strategies.list.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar estratégia");
    }
  };

  const handleUpsertStrategyResult = async () => {
    if (!monthlyStrategyForm.strategyId || !monthlyStrategyForm.returnPercentage) {
      toast.error("Preencha todos os campos");
      return;
    }
    try {
      await upsertStrategyResultMutation.mutateAsync({
        strategyId: parseInt(monthlyStrategyForm.strategyId),
        year: monthlyStrategyForm.year,
        month: monthlyStrategyForm.month,
        returnPercentage: monthlyStrategyForm.returnPercentage,
      });
      toast.success("Resultado da estratégia salvo com sucesso");
      utils.admin.monthlyResults.getStrategyHistory.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar resultado");
    }
  };

  const handleUpsertCDIResult = async () => {
    if (!monthlyCDIForm.returnPercentage) {
      toast.error("Preencha o percentual de retorno");
      return;
    }
    try {
      await upsertCDIResultMutation.mutateAsync({
        year: monthlyCDIForm.year,
        month: monthlyCDIForm.month,
        returnPercentage: monthlyCDIForm.returnPercentage,
      });
      toast.success("Resultado do CDI salvo com sucesso");
      utils.admin.monthlyResults.getCDI.invalidate();
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar resultado");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Administração</h1>
          <p className="text-muted-foreground mt-2">Gerencie estratégias e resultados mensais</p>
        </div>

        <Tabs defaultValue="strategies" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="strategies">Estratégias</TabsTrigger>
            <TabsTrigger value="strategy-results">Resultados de Estratégias</TabsTrigger>
            <TabsTrigger value="cdi-results">CDI/Renda Fixa</TabsTrigger>
          </TabsList>

          {/* Aba de Estratégias */}
          <TabsContent value="strategies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Criar Nova Estratégia</CardTitle>
                <CardDescription>Adicione uma nova estratégia de trading</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="strategy-name">Nome da Estratégia</Label>
                  <Input
                    id="strategy-name"
                    placeholder="Ex: ULTIMATE, ALAVANCADA"
                    value={strategyForm.name}
                    onChange={(e) => setStrategyForm({ ...strategyForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="strategy-description">Descrição (Opcional)</Label>
                  <Input
                    id="strategy-description"
                    placeholder="Descreva a estratégia"
                    value={strategyForm.description}
                    onChange={(e) => setStrategyForm({ ...strategyForm, description: e.target.value })}
                  />
                </div>
                <Button onClick={handleCreateStrategy} disabled={createStrategyMutation.isPending}>
                  {createStrategyMutation.isPending ? "Criando..." : "Criar Estratégia"}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de Estratégias */}
            <Card>
              <CardHeader>
                <CardTitle>Estratégias Existentes</CardTitle>
              </CardHeader>
              <CardContent>
                {strategiesQuery.isLoading ? (
                  <div className="text-muted-foreground">Carregando...</div>
                ) : strategiesQuery.data?.length === 0 ? (
                  <div className="text-muted-foreground">Nenhuma estratégia cadastrada</div>
                ) : (
                  <div className="space-y-2">
                    {strategiesQuery.data?.map((strategy) => (
                      <div key={strategy.id} className="p-3 border rounded-lg">
                        <div className="font-semibold">{strategy.name}</div>
                        {strategy.description && (
                          <div className="text-sm text-muted-foreground">{strategy.description}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Resultados de Estratégias */}
          <TabsContent value="strategy-results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registrar Resultado Mensal</CardTitle>
                <CardDescription>Informe o retorno percentual mensal de uma estratégia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="strategy-select">Estratégia</Label>
                    <Select
                      value={monthlyStrategyForm.strategyId}
                      onValueChange={(value) =>
                        setMonthlyStrategyForm({ ...monthlyStrategyForm, strategyId: value })
                      }
                    >
                      <SelectTrigger id="strategy-select">
                        <SelectValue placeholder="Selecione uma estratégia" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategiesQuery.data?.map((strategy) => (
                          <SelectItem key={strategy.id} value={strategy.id.toString()}>
                            {strategy.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year-select">Ano</Label>
                    <Select
                      value={monthlyStrategyForm.year.toString()}
                      onValueChange={(value) =>
                        setMonthlyStrategyForm({ ...monthlyStrategyForm, year: parseInt(value) })
                      }
                    >
                      <SelectTrigger id="year-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="month-select">Mês</Label>
                    <Select
                      value={monthlyStrategyForm.month.toString()}
                      onValueChange={(value) =>
                        setMonthlyStrategyForm({ ...monthlyStrategyForm, month: parseInt(value) })
                      }
                    >
                      <SelectTrigger id="month-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {new Date(2024, month - 1).toLocaleString("pt-BR", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="return-percentage">Retorno (%)</Label>
                    <Input
                      id="return-percentage"
                      type="number"
                      placeholder="Ex: 5.25"
                      step="0.01"
                      value={monthlyStrategyForm.returnPercentage}
                      onChange={(e) =>
                        setMonthlyStrategyForm({
                          ...monthlyStrategyForm,
                          returnPercentage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button
                  onClick={handleUpsertStrategyResult}
                  disabled={upsertStrategyResultMutation.isPending}
                >
                  {upsertStrategyResultMutation.isPending ? "Salvando..." : "Salvar Resultado"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de CDI */}
          <TabsContent value="cdi-results" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Registrar CDI/Renda Fixa</CardTitle>
                <CardDescription>Informe o retorno percentual mensal do CDI</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="cdi-year">Ano</Label>
                    <Select
                      value={monthlyCDIForm.year.toString()}
                      onValueChange={(value) =>
                        setMonthlyCDIForm({ ...monthlyCDIForm, year: parseInt(value) })
                      }
                    >
                      <SelectTrigger id="cdi-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cdi-month">Mês</Label>
                    <Select
                      value={monthlyCDIForm.month.toString()}
                      onValueChange={(value) =>
                        setMonthlyCDIForm({ ...monthlyCDIForm, month: parseInt(value) })
                      }
                    >
                      <SelectTrigger id="cdi-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((month) => (
                          <SelectItem key={month} value={month.toString()}>
                            {new Date(2024, month - 1).toLocaleString("pt-BR", { month: "long" })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cdi-return">Retorno (%)</Label>
                    <Input
                      id="cdi-return"
                      type="number"
                      placeholder="Ex: 1.25"
                      step="0.01"
                      value={monthlyCDIForm.returnPercentage}
                      onChange={(e) =>
                        setMonthlyCDIForm({
                          ...monthlyCDIForm,
                          returnPercentage: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <Button onClick={handleUpsertCDIResult} disabled={upsertCDIResultMutation.isPending}>
                  {upsertCDIResultMutation.isPending ? "Salvando..." : "Salvar CDI"}
                </Button>
              </CardContent>
            </Card>

            {/* Lista de CDI */}
            <Card>
              <CardHeader>
                <CardTitle>Histórico de CDI</CardTitle>
              </CardHeader>
              <CardContent>
                {cdiQuery.isLoading ? (
                  <div className="text-muted-foreground">Carregando...</div>
                ) : cdiQuery.data?.length === 0 ? (
                  <div className="text-muted-foreground">Nenhum resultado de CDI registrado</div>
                ) : (
                  <div className="space-y-2">
                    {cdiQuery.data?.map((cdi) => (
                      <div key={cdi.id} className="p-3 border rounded-lg flex justify-between">
                        <div>
                          <div className="font-semibold">
                            {cdi.month}/{cdi.year}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{cdi.returnPercentage}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
