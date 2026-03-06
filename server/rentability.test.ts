import { describe, it, expect } from "vitest";

/**
 * Função auxiliar para calcular o saldo final baseado em depósito inicial e retornos mensais
 */
function calculateFinalBalance(
  initialDeposit: number,
  monthlyReturns: number[]
): number {
  let balance = initialDeposit;
  for (const returnPercentage of monthlyReturns) {
    balance *= 1 + returnPercentage / 100;
  }
  return balance;
}

/**
 * Função auxiliar para calcular o retorno total em percentual
 */
function calculateTotalReturn(initialDeposit: number, finalBalance: number): number {
  return ((finalBalance - initialDeposit) / initialDeposit) * 100;
}

describe("Rentability Calculations", () => {
  it("should calculate final balance with positive returns", () => {
    const initialDeposit = 1000;
    const monthlyReturns = [5, 3, 2]; // 5%, 3%, 2%
    const expectedBalance = 1000 * 1.05 * 1.03 * 1.02; // 1102.53
    const actualBalance = calculateFinalBalance(initialDeposit, monthlyReturns);
    expect(actualBalance).toBeCloseTo(expectedBalance, 2);
  });

  it("should calculate final balance with negative returns", () => {
    const initialDeposit = 1000;
    const monthlyReturns = [-5, -3, 2]; // -5%, -3%, 2%
    const expectedBalance = 1000 * 0.95 * 0.97 * 1.02; // 931.59
    const actualBalance = calculateFinalBalance(initialDeposit, monthlyReturns);
    expect(actualBalance).toBeCloseTo(expectedBalance, 2);
  });

  it("should calculate final balance with mixed returns", () => {
    const initialDeposit = 5000;
    const monthlyReturns = [10, -5, 3, 2, -1];
    let expected = 5000;
    for (const ret of monthlyReturns) {
      expected *= 1 + ret / 100;
    }
    const actual = calculateFinalBalance(initialDeposit, monthlyReturns);
    expect(actual).toBeCloseTo(expected, 2);
  });

  it("should calculate total return percentage correctly", () => {
    const initialDeposit = 1000;
    const finalBalance = 1100;
    const expectedReturn = 10;
    const actualReturn = calculateTotalReturn(initialDeposit, finalBalance);
    expect(actualReturn).toBeCloseTo(expectedReturn, 2);
  });

  it("should handle zero returns", () => {
    const initialDeposit = 1000;
    const monthlyReturns = [0, 0, 0];
    const expectedBalance = 1000;
    const actualBalance = calculateFinalBalance(initialDeposit, monthlyReturns);
    expect(actualBalance).toBeCloseTo(expectedBalance, 2);
  });

  it("should compare strategy vs CDI performance", () => {
    const initialDeposit = 10000;
    const strategyReturns = [5, 4, 3, 2, 1]; // Estratégia
    const cdiReturns = [1, 1, 1, 1, 1]; // CDI (1% ao mês)

    const strategyBalance = calculateFinalBalance(initialDeposit, strategyReturns);
    const cdiBalance = calculateFinalBalance(initialDeposit, cdiReturns);

    const strategyReturn = calculateTotalReturn(initialDeposit, strategyBalance);
    const cdiReturn = calculateTotalReturn(initialDeposit, cdiBalance);

    // Estratégia deve ter maior retorno
    expect(strategyReturn).toBeGreaterThan(cdiReturn);
    expect(strategyBalance).toBeGreaterThan(cdiBalance);
  });

  it("should handle large deposit amounts", () => {
    const initialDeposit = 1000000; // 1 milhão
    const monthlyReturns = [2, 2, 2];
    const expectedBalance = 1000000 * 1.02 * 1.02 * 1.02; // 1061208
    const actualBalance = calculateFinalBalance(initialDeposit, monthlyReturns);
    expect(actualBalance).toBeCloseTo(expectedBalance, 2);
  });

  it("should handle small deposit amounts", () => {
    const initialDeposit = 10; // 10 dólares
    const monthlyReturns = [5, 5, 5];
    const expectedBalance = 10 * 1.05 * 1.05 * 1.05; // 11.576
    const actualBalance = calculateFinalBalance(initialDeposit, monthlyReturns);
    expect(actualBalance).toBeCloseTo(expectedBalance, 2);
  });

  it("should calculate compound returns correctly", () => {
    // Teste de juros compostos
    const initialDeposit = 1000;
    const monthlyReturn = 1; // 1% ao mês
    const months = 12;
    const monthlyReturns = Array(months).fill(monthlyReturn);

    const finalBalance = calculateFinalBalance(initialDeposit, monthlyReturns);
    // (1.01)^12 ≈ 1.1268
    const expectedBalance = 1000 * Math.pow(1.01, 12);

    expect(finalBalance).toBeCloseTo(expectedBalance, 2);
  });

  it("should handle scenario with loss recovery", () => {
    const initialDeposit = 1000;
    const monthlyReturns = [-10, 5, 5, 5]; // Começa com perda, depois recupera
    const finalBalance = calculateFinalBalance(initialDeposit, monthlyReturns);

    // 1000 * 0.9 * 1.05 * 1.05 * 1.05 = 1044.73
    const expected = 1000 * 0.9 * 1.05 * 1.05 * 1.05;
    expect(finalBalance).toBeCloseTo(expected, 2);

    // Deve terminar com ganho positivo
    expect(finalBalance).toBeGreaterThan(initialDeposit);
  });
});
