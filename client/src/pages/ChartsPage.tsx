import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

export default function ChartsPage() {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const accountsQuery = trpc.accounts.list.useQuery();
  const strategiesQuery = trpc.strategies.list.useQuery();
  const cdiQuery = trpc.admin.monthlyResults.getCDI.useQuery();

  const selectedAccount = selectedAccountId
    ? accountsQuery.data?.find((a) => a.id === parseInt(selectedAccountId))
    : null;

  const selectedStrategy = selectedAccount
    ? strategiesQuery.data?.find((s) => s.id === selectedAccount.strategyId)
    : null;

  const strategyHistoryQuery = trpc.admin.monthlyResults.getStrategyHistory.useQuery(
    { strategyId: selectedAccount?.strategyId || 0 },
    { enabled: !!selectedAccount }
  );

  // Calcular dados do gráfico
  const chartData = (() => {
    if (!selectedAccount || !strategyHistoryQuery.data || !cdiQuery.data) return [];

    const approvalDate = new Date(selectedAccount.approvalDate);
    const initialDeposit = parseFloat(selectedAccount.initialDeposit);

    const data: any[] = [];
    let strategyBalance = initialDeposit;
    let cdiBalance = initialDeposit;

    // Agrupar resultados mensais por ano/mês
    const strategyResults: Record<string, number> = {};
    strategyHistoryQuery.data.forEach((result) => {
      const key = `${result.year}-${String(result.month).padStart(2, "0")}`;
      strategyResults[key] = parseFloat(result.returnPercentage) / 100;
    });

    const cdiResults: Record<string, number> = {};
    cdiQuery.data.forEach((result) => {
      const key = `${result.year}-${String(result.month).padStart(2, "0")}`;
      cdiResults[key] = parseFloat(result.returnPercentage) / 100;
    });

    // Gerar dados de janeiro do ano de aprovação até dezembro do ano atual
    const startDate = new Date(approvalDate);
    startDate.setDate(1);
    const endDate = new Date();
    endDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);

    let currentDate = new Date(startDate);
    while (currentDate < endDate) {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const key = `${year}-${String(month).padStart(2, "0")}`;
      const monthName = currentDate.toLocaleString("pt-BR", { month: "short", year: "2-digit" });

      const strategyReturn = strategyResults[key] || 0;
      const cdiReturn = cdiResults[key] || 0;

      strategyBalance *= 1 + strategyReturn;
      cdiBalance *= 1 + cdiReturn;

      data.push({
        month: monthName,
        estrategia: parseFloat(strategyBalance.toFixed(2)),
        cdi: parseFloat(cdiBalance.toFixed(2)),
      });

      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return data;
  })();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gráficos de Rentabilidade</h1>
          <p className="text-muted-foreground mt-2">
            Acompanhe a evolução do seu capital comparado com o CDI
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Selecione uma Conta</CardTitle>
            <CardDescription>Escolha uma conta para visualizar seu gráfico de performance</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma conta" />
              </SelectTrigger>
              <SelectContent>
                {accountsQuery.data?.map((account) => {
                  const strategy = strategiesQuery.data?.find((s) => s.id === account.strategyId);
                  return (
                    <SelectItem key={account.id} value={account.id.toString()}>
                      Conta {account.accountNumber} - {strategy?.name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedAccount && (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Evolução do Capital</CardTitle>
                <CardDescription>
                  Conta {selectedAccount.accountNumber} ({selectedStrategy?.name})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    Nenhum dado disponível para esta conta
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => `USD ${typeof value === 'number' ? value.toFixed(2) : value}`}
                        labelFormatter={(label) => `Período: ${label}`}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="estrategia"
                        stroke="#3b82f6"
                        name={selectedStrategy?.name || "Estratégia"}
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="cdi"
                        stroke="#10b981"
                        name="CDI/Renda Fixa"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Resumo da Performance</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Depósito Inicial</div>
                      <div className="text-2xl font-bold">USD {selectedAccount.initialDeposit}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Saldo Atual ({selectedStrategy?.name})</div>
                      <div className="text-2xl font-bold text-blue-600">
                        USD {typeof chartData[chartData.length - 1]?.estrategia === 'number' ? chartData[chartData.length - 1]?.estrategia.toFixed(2) : '0.00'}
                      </div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground">Saldo Atual (CDI)</div>
                      <div className="text-2xl font-bold text-green-600">
                        USD {typeof chartData[chartData.length - 1]?.cdi === 'number' ? chartData[chartData.length - 1]?.cdi.toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
