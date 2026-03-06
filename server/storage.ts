import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "./db";
import {
  accounts,
  appUsers,
  authTokens,
  financialRecords,
  strategies,
  strategyHistory,
  monthlyStrategyReturns,
  monthlyCDIReturns,
  type Account,
  type AppUser,
  type CreateAccountRequest,
  type CreateFinancialRecordRequest,
  type CreateStrategyHistoryRequest,
  type CreateStrategyRequest,
  type FinancialRecord,
  type InsertAppUser,
  type ProfitLossSummary,
  type Strategy,
  type StrategyHistoryRow,
  type UpdateAccountRequest,
  type UpdateFinancialRecordRequest,
  type UpdateStrategyHistoryRequest,
  type UpdateStrategyRequest,
  type CreateMonthlyStrategyReturnsRequest,
  type MonthlyStrategyReturn,
  type CreateMonthlyCDIReturnsRequest,
  type MonthlyCDIReturn,
} from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  createAppUser(user: InsertAppUser & { passwordHash: string }): Promise<AppUser>;
  getAppUserById(id: string): Promise<AppUser | undefined>;
  getAppUserByEmail(email: string): Promise<AppUser | undefined>;
  listAppUsers(): Promise<AppUser[]>;
  updateAppUser(id: string, updates: Partial<Pick<AppUser, "email" | "isAdmin" | "emailConfirmedAt" | "passwordHash">>): Promise<void>;

  createAuthToken(input: { userId: string; type: string; tokenHash: string; expiresAt: Date }): Promise<void>;
  useAuthToken(input: { type: string; tokenHash: string }): Promise<{ userId: string } | undefined>;

  listStrategies(): Promise<Strategy[]>;
  createStrategy(input: CreateStrategyRequest): Promise<Strategy>;
  updateStrategy(id: string, updates: UpdateStrategyRequest): Promise<void>;
  deleteStrategy(id: string): Promise<void>;

  listStrategyHistory(strategyId: string): Promise<StrategyHistoryRow[]>;
  createStrategyHistory(strategyId: string, input: Omit<CreateStrategyHistoryRequest, "strategyId">): Promise<StrategyHistoryRow>;
  updateStrategyHistory(id: string, updates: UpdateStrategyHistoryRequest): Promise<void>;
  deleteStrategyHistory(id: string): Promise<void>;

  listAccounts(): Promise<Account[]>;
  createAccount(input: CreateAccountRequest): Promise<Account>;
  updateAccount(id: string, updates: UpdateAccountRequest): Promise<void>;
  deleteAccount(id: string): Promise<void>;

  listFinancialRecords(accountId: string): Promise<FinancialRecord[]>;
  createFinancialRecord(accountId: string, input: Omit<CreateFinancialRecordRequest, "accountId">): Promise<FinancialRecord>;
  updateFinancialRecord(id: string, updates: UpdateFinancialRecordRequest): Promise<void>;
  deleteFinancialRecord(id: string): Promise<void>;

  getAllMonthlyStrategyReturns(): Promise<MonthlyStrategyReturn[]>;
  getMonthlyStrategyReturnsByStrategy(strategyId: string): Promise<MonthlyStrategyReturn[]>;
  upsertMonthlyStrategyReturn(input: CreateMonthlyStrategyReturnsRequest): Promise<MonthlyStrategyReturn>;

  getAllMonthlyCDIReturns(): Promise<MonthlyCDIReturn[]>;
  upsertMonthlyCDIReturn(input: CreateMonthlyCDIReturnsRequest): Promise<MonthlyCDIReturn>;

  getAccountSummary(accountId: string): Promise<ProfitLossSummary | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createAppUser(user: InsertAppUser & { passwordHash: string }): Promise<AppUser> {
    const [created] = await db
      .insert(appUsers)
      .values({
        email: user.email,
        passwordHash: user.passwordHash,
        firstName: (user as any).firstName,
        lastName: (user as any).lastName,
        isAdmin: false,
      })
      .returning();
    return created;
  }

  async getAppUserById(id: string): Promise<AppUser | undefined> {
    const [u] = await db.select().from(appUsers).where(eq(appUsers.id, id));
    return u;
  }

  async getAppUserByEmail(email: string): Promise<AppUser | undefined> {
    const [u] = await db.select().from(appUsers).where(eq(appUsers.email, email));
    return u;
  }

  async listAppUsers(): Promise<AppUser[]> {
    return await db.select().from(appUsers).orderBy(desc(appUsers.createdAt));
  }

  async updateAppUser(
    id: string,
    updates: Partial<Pick<AppUser, "email" | "isAdmin" | "emailConfirmedAt" | "passwordHash">>,
  ): Promise<void> {
    await db
      .update(appUsers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(appUsers.id, id));
  }

  async createAuthToken(input: { userId: string; type: string; tokenHash: string; expiresAt: Date }): Promise<void> {
    await db.insert(authTokens).values({
      userId: input.userId,
      type: input.type,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    });
  }

  async useAuthToken(input: { type: string; tokenHash: string }): Promise<{ userId: string } | undefined> {
    const now = new Date();
    const [token] = await db
      .select({ id: authTokens.id, userId: authTokens.userId })
      .from(authTokens)
      .where(
        and(
          eq(authTokens.type, input.type),
          eq(authTokens.tokenHash, input.tokenHash),
          isNull(authTokens.usedAt),
        ),
      );
    if (!token) return undefined;

    const [full] = await db.select().from(authTokens).where(eq(authTokens.id, token.id));
    if (!full) return undefined;
    if (full.expiresAt.getTime() < now.getTime()) return undefined;

    await db.update(authTokens).set({ usedAt: now }).where(eq(authTokens.id, token.id));
    return { userId: token.userId };
  }

  async listStrategies(): Promise<Strategy[]> {
    return await db.select().from(strategies).orderBy(desc(strategies.createdAt));
  }

  async createStrategy(input: CreateStrategyRequest): Promise<Strategy> {
    const [created] = await db.insert(strategies).values(input).returning();
    return created;
  }

  async updateStrategy(id: string, updates: UpdateStrategyRequest): Promise<void> {
    await db.update(strategies).set(updates).where(eq(strategies.id, id));
  }

  async deleteStrategy(id: string): Promise<void> {
    await db.delete(strategies).where(eq(strategies.id, id));
  }

  async listStrategyHistory(strategyId: string): Promise<StrategyHistoryRow[]> {
    return await db
      .select()
      .from(strategyHistory)
      .where(eq(strategyHistory.strategyId, strategyId))
      .orderBy(desc(strategyHistory.occurredAt));
  }

  async createStrategyHistory(
    strategyId: string,
    input: Omit<CreateStrategyHistoryRequest, "strategyId">,
  ): Promise<StrategyHistoryRow> {
    const [created] = await db
      .insert(strategyHistory)
      .values({ ...input, strategyId })
      .returning();
    return created;
  }

  async updateStrategyHistory(id: string, updates: UpdateStrategyHistoryRequest): Promise<void> {
    await db.update(strategyHistory).set(updates).where(eq(strategyHistory.id, id));
  }

  async deleteStrategyHistory(id: string): Promise<void> {
    await db.delete(strategyHistory).where(eq(strategyHistory.id, id));
  }

  async listAccounts(): Promise<Account[]> {
    return await db.select().from(accounts).orderBy(desc(accounts.createdAt));
  }

  async createAccount(input: CreateAccountRequest): Promise<Account> {
    const [created] = await db.insert(accounts).values(input).returning();
    return created;
  }

  async updateAccount(id: string, updates: UpdateAccountRequest): Promise<void> {
    await db.update(accounts).set(updates).where(eq(accounts.id, id));
  }

  async deleteAccount(id: string): Promise<void> {
    await db.delete(accounts).where(eq(accounts.id, id));
  }

  async listFinancialRecords(accountId: string): Promise<FinancialRecord[]> {
    return await db
      .select()
      .from(financialRecords)
      .where(eq(financialRecords.accountId, accountId))
      .orderBy(desc(financialRecords.occurredAt));
  }

  async createFinancialRecord(
    accountId: string,
    input: Omit<CreateFinancialRecordRequest, "accountId">,
  ): Promise<FinancialRecord> {
    const [created] = await db
      .insert(financialRecords)
      .values({ ...input, accountId })
      .returning();
    return created;
  }

  async updateFinancialRecord(id: string, updates: UpdateFinancialRecordRequest): Promise<void> {
    await db.update(financialRecords).set(updates).where(eq(financialRecords.id, id));
  }

  async deleteFinancialRecord(id: string): Promise<void> {
    await db.delete(financialRecords).where(eq(financialRecords.id, id));
  }

  async getAccountSummary(accountId: string): Promise<ProfitLossSummary | undefined> {
    const [acct] = await db.select().from(accounts).where(eq(accounts.id, accountId));
    if (!acct) return undefined;
    const history = await db
      .select({ profit: strategyHistory.profit, loss: strategyHistory.loss })
      .from(strategyHistory)
      .where(eq(strategyHistory.strategyId, acct.strategyId));

    const profit = history.reduce((sum, row) => sum + Number(row.profit), 0);
    const loss = history.reduce((sum, row) => sum + Number(row.loss), 0);
    const net = profit - loss;
    return {
      profit: profit.toFixed(2),
      loss: loss.toFixed(2),
      net: net.toFixed(2),
    };
  }

  // Monthly Strategy Returns
  async getAllMonthlyStrategyReturns(): Promise<MonthlyStrategyReturn[]> {
    return await db.select().from(monthlyStrategyReturns).orderBy(monthlyStrategyReturns.year, monthlyStrategyReturns.month);
  }

  async getMonthlyStrategyReturnsByStrategy(strategyId: string): Promise<MonthlyStrategyReturn[]> {
    return await db
      .select()
      .from(monthlyStrategyReturns)
      .where(eq(monthlyStrategyReturns.strategyId, strategyId))
      .orderBy(monthlyStrategyReturns.year, monthlyStrategyReturns.month);
  }

  async upsertMonthlyStrategyReturn(input: CreateMonthlyStrategyReturnsRequest): Promise<MonthlyStrategyReturn> {
    const existing = await db
      .select()
      .from(monthlyStrategyReturns)
      .where(
        and(
          eq(monthlyStrategyReturns.strategyId, input.strategyId),
          eq(monthlyStrategyReturns.year, input.year),
          eq(monthlyStrategyReturns.month, input.month)
        )
      );

    if (existing.length > 0) {
      await db
        .update(monthlyStrategyReturns)
        .set({ returnPercentage: input.returnPercentage, updatedAt: new Date() })
        .where(
          and(
            eq(monthlyStrategyReturns.strategyId, input.strategyId),
            eq(monthlyStrategyReturns.year, input.year),
            eq(monthlyStrategyReturns.month, input.month)
          )
        );
      return existing[0];
    }

    const [result] = await db.insert(monthlyStrategyReturns).values(input).returning();
    return result;
  }

  // Monthly CDI Returns
  async getAllMonthlyCDIReturns(): Promise<MonthlyCDIReturn[]> {
    return await db.select().from(monthlyCDIReturns).orderBy(monthlyCDIReturns.year, monthlyCDIReturns.month);
  }

  async upsertMonthlyCDIReturn(input: CreateMonthlyCDIReturnsRequest): Promise<MonthlyCDIReturn> {
    const existing = await db
      .select()
      .from(monthlyCDIReturns)
      .where(
        and(
          eq(monthlyCDIReturns.year, input.year),
          eq(monthlyCDIReturns.month, input.month)
        )
      );

    if (existing.length > 0) {
      await db
        .update(monthlyCDIReturns)
        .set({ returnPercentage: input.returnPercentage, updatedAt: new Date() })
        .where(
          and(
            eq(monthlyCDIReturns.year, input.year),
            eq(monthlyCDIReturns.month, input.month)
          )
        );
      return existing[0];
    }

    const [result] = await db.insert(monthlyCDIReturns).values(input).returning();
    return result;
  }
}

export const storage = new DatabaseStorage();
