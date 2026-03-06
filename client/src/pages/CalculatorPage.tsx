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
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";

interface SimulationResult {
  strategy: string;
  initialAmount: number;
  finalAmount: number;
  totalReturn: number;
  returnPercentage: number;
}

export default function CalculatorPage() {
  const { user } = useAuth();
  const [simulationForm, setSimulationForm] = useState({
    initialAmount: "10000",
    startDate: "2024-01-01",
    strategyId: "",
  });
  const [results, setResults] = useState<SimulationResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  const strategiesQuery = trpc.strategies.list.useQuery();
  const cdiQuery = trpc.admin.monthlyResults.getCDI.useQuery();

  const handleCalculate = async () => {
    if (!simulationForm.initialAmount || !simulationForm.startDate || !simulationForm.strategyId) {
      alert("Preencha todos os campos");
      return;
    }

    setIsCalculating(true);

    try {
      const strategyId = parseInt(simulationForm.strategyId);
      const strategy = strategiesQuery.data?.find((s) => s.id === strategyId);

      if (!strategy) {
        alert("Estratégia não encontrada");
        return;
      }

      const initialAmount = parseFloat(simulationForm.initialAmount);
      const startDate = new Date(simulationForm.startDate);
      const endDate = new Date();

      // Simular retornos da estratégia
      let strategyBalance = initialAmount;
      let cdiBalance = initialAmount;

      const strategyHistoryQuery = await fetch(
        `/api/trpc/admin.monthlyResults.getStrategyHistory?input=${JSON.stringify({ strategyId })}`
      ).then((r) => r.json());

      const strategyResults: Record<string, number> = {};
      if (strategyHistoryQuery.result?.data) {
        strategyHistoryQuery.result.data.forEach((result: any) => {
          const key = `${result.year}-${String(result.month).padStart(2, "0")}`;
          strategyResults[key] = parseFloat(result.returnPercentage) / 100;
        });
      }

      const cdiResults: Record<string, number> = {};
      if (cdiQuery.data) {
        cdiQuery.data.forEach((result) => {
          const key = `${result.year}-${String(result.month).padStart(2, "0")}`;
          cdiResults[key] = parseFloat(result.returnPercentage) / 100;
        });
      }

      // Calcular evolução mês a mês
      let currentDate = new Date(startDate);
      currentDate.setDate(1);

      while (currentDate <= endDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth() + 1;
        const key = `${year}-${String(month).padStart(2, "0")}`;

        const strategyReturn = strategyResults[key] || 0;
        const cdiReturn = cdiResults[key] || 0;

        strategyBalance *= 1 + strategyReturn;
        cdiBalance *= 1 + cdiReturn;

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      const newResults: SimulationResult[] = [
        {
          strategy: strategy.name,
          initialAmount,
          finalAmount: parseFloat(strategyBalance.toFixed(2)),
          totalReturn: parseFloat((strategyBalance - initialAmount).toFixed(2)),
          returnPercentage: parseFloat((((strategyBalance - initialAmount) / initialAmount) * 100).toFixed(2)),
        },
        {
          strategy: "CDI/Renda Fixa",
          initialAmount,
          finalAmount: parseFloat(cdiBalance.toFixed(2)),
          totalReturn: parseFloat((cdiBalance - initialAmount).toFixed(2)),
          returnPercentage: parseFloat((((cdiBalance - initialAmount) / initialAmount) * 100).toFixed(2)),
        },
      ];

      setResults(newResults);
    } catch (error) {
      console.error("Erro ao calcular simulação:", error);
      alert("Erro ao calcular simulação");
    } finally {
      setIsCalculating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calculadora de Simulação</h1>
          <p className="text-muted-foreground mt-2">
            Simule quanto você teria ganhado investindo em diferentes estratégias
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Parâmetros da Simulação</CardTitle>
            <CardDescription>Defina o valor inicial, data de início e estratégia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="initial-amount">Valor Inicial (USD)</Label>
                <Input
                  id="initial-amount"
                  type="number"
                  placeholder="Ex: 10000"
                  step="100"
                  value={simulationForm.initialAmount}
                  onChange={(e) =>
                    setSimulationForm({ ...simulationForm, initialAmount: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="start-date">Data de Início</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={simulationForm.startDate}
                  onChange={(e) =>
                    setSimulationForm({ ...simulationForm, startDate: e.target.value })
                  }
                />
              </div>
              <div>
                <Label htmlFor="strategy-select">Estratégia</Label>
                <Select
                  value={simulationForm.strategyId}
                  onValueChange={(value) =>
                    setSimulationForm({ ...simulationForm, strategyId: value })
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
            </div>
            <Button onClick={handleCalculate} disabled={isCalculating} className="w-full">
              {isCalculating ? "Calculando..." : "Calcular Simulação"}
            </Button>
          </CardContent>
        </Card>

        {results.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Simulação</CardTitle>
              <CardDescription>
                Simulação de {simulationForm.initialAmount} USD de {simulationForm.startDate} até hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.map((result, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                      <div>
                        <div className="text-sm text-muted-foreground">Estratégia</div>
                        <div className="font-semibold">{result.strategy}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Valor Inicial</div>
                        <div className="font-semibold">USD {result.initialAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Valor Final</div>
                        <div className="font-semibold text-lg">USD {result.finalAmount.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Ganho Total</div>
                        <div
                          className={`font-semibold text-lg ${
                            result.totalReturn >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          USD {result.totalReturn.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Retorno %</div>
                        <div
                          className={`font-semibold text-lg ${
                            result.returnPercentage >= 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {result.returnPercentage.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {results.length === 2 && (
                <div className="mt-6 p-4 border rounded-lg bg-muted/50">
                  <div className="text-sm font-semibold mb-2">Comparação</div>
                  <div className="text-sm text-muted-foreground">
                    {results[0].finalAmount > results[1].finalAmount ? (
                      <>
                        A estratégia <span className="font-semibold">{results[0].strategy}</span> teria
                        rendido <span className="font-semibold text-green-600">
                          USD {(results[0].finalAmount - results[1].finalAmount).toFixed(2)}
                        </span>{" "}
                        a mais que o CDI.
                      </>
                    ) : (
                      <>
                        O CDI teria rendido{" "}
                        <span className="font-semibold text-green-600">
                          USD {(results[1].finalAmount - results[0].finalAmount).toFixed(2)}
                        </span>{" "}
                        a mais que a estratégia <span className="font-semibold">{results[0].strategy}</span>.
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
