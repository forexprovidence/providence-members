import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const appUsers = pgTable(
  "app_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: varchar("email", { length: 320 }).notNull().unique(),
    firstName: text("first_name"),
    lastName: text("last_name"),
    passwordHash: text("password_hash"),
    isAdmin: boolean("is_admin").notNull().default(false),
    emailConfirmedAt: timestamp("email_confirmed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("app_users_email_idx").on(t.email)],
);

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    usedAt: timestamp("used_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("auth_tokens_user_id_idx").on(t.userId),
    index("auth_tokens_type_idx").on(t.type),
    index("auth_tokens_expires_idx").on(t.expiresAt),
  ],
);

export const strategies = pgTable(
  "strategies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 200 }).notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [index("strategies_name_idx").on(t.name)],
);

export const strategyHistory = pgTable(
  "strategy_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    strategyId: uuid("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
    occurredAt: timestamp("occurred_at").notNull(),
    profit: numeric("profit", { precision: 14, scale: 2 }).notNull().default("0"),
    loss: numeric("loss", { precision: 14, scale: 2 }).notNull().default("0"),
    note: text("note"),
  },
  (t) => [
    index("strategy_history_strategy_id_idx").on(t.strategyId),
    index("strategy_history_occurred_at_idx").on(t.occurredAt),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull().references(() => appUsers.id, { onDelete: "cascade" }),
    strategyId: uuid("strategy_id").notNull().references(() => strategies.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 200 }).notNull(),
    startingBalance: numeric("starting_balance", { precision: 14, scale: 2 }).notNull().default("0"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("accounts_user_id_idx").on(t.userId),
    index("accounts_strategy_id_idx").on(t.strategyId),
  ],
);

export const financialRecords = pgTable(
  "financial_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id").notNull().references(() => accounts.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 32 }).notNull(),
    amount: numeric("amount", { precision: 14, scale: 2 }).notNull(),
    occurredAt: timestamp("occurred_at").notNull(),
    note: text("note"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => [
    index("financial_records_account_id_idx").on(t.accountId),
    index("financial_records_occurred_at_idx").on(t.occurredAt),
  ],
);

export const monthlyStrategyReturns = pgTable(
  "monthly_strategy_returns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    strategyId: uuid("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    returnPercentage: numeric("return_percentage", { precision: 8, scale: 4 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("monthly_strategy_returns_strategy_id_idx").on(t.strategyId),
    index("monthly_strategy_returns_year_month_idx").on(t.year, t.month),
  ],
);

export const monthlyCDIReturns = pgTable(
  "monthly_cdi_returns",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    returnPercentage: numeric("return_percentage", { precision: 8, scale: 4 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [
    index("monthly_cdi_returns_year_month_idx").on(t.year, t.month),
  ],
);

export const insertAppUserSchema = createInsertSchema(appUsers).omit({
  id: true,
  isAdmin: true,
  emailConfirmedAt: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAppUser = z.infer<typeof insertAppUserSchema>;
export type AppUser = typeof appUsers.$inferSelect;

export const createStrategySchema = createInsertSchema(strategies).omit({
  id: true,
  createdAt: true,
});
export type CreateStrategyRequest = z.infer<typeof createStrategySchema>;
export type Strategy = typeof strategies.$inferSelect;

export const createStrategyHistorySchema = createInsertSchema(strategyHistory).omit({
  id: true,
});
export type CreateStrategyHistoryRequest = z.infer<typeof createStrategyHistorySchema>;
export type StrategyHistoryRow = typeof strategyHistory.$inferSelect;

export const createAccountSchema = createInsertSchema(accounts).omit({
  id: true,
  createdAt: true,
});
export type CreateAccountRequest = z.infer<typeof createAccountSchema>;
export type Account = typeof accounts.$inferSelect;

export const createFinancialRecordSchema = createInsertSchema(financialRecords).omit({
  id: true,
  createdAt: true,
});
export type CreateFinancialRecordRequest = z.infer<typeof createFinancialRecordSchema>;
export type FinancialRecord = typeof financialRecords.$inferSelect;

export type UpdateStrategyRequest = Partial<CreateStrategyRequest>;
export type UpdateStrategyHistoryRequest = Partial<CreateStrategyHistoryRequest>;
export type UpdateAccountRequest = Partial<CreateAccountRequest>;
export type UpdateFinancialRecordRequest = Partial<CreateFinancialRecordRequest>;

export type ProfitLossSummary = {
  profit: string;
  loss: string;
  net: string;
};

export const createMonthlyStrategyReturnsSchema = createInsertSchema(monthlyStrategyReturns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateMonthlyStrategyReturnsRequest = z.infer<typeof createMonthlyStrategyReturnsSchema>;
export type MonthlyStrategyReturn = typeof monthlyStrategyReturns.$inferSelect;

export const createMonthlyCDIReturnsSchema = createInsertSchema(monthlyCDIReturns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateMonthlyCDIReturnsRequest = z.infer<typeof createMonthlyCDIReturnsSchema>;
export type MonthlyCDIReturn = typeof monthlyCDIReturns.$inferSelect;