import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Estratégias de trading (ex: ULTIMATE, ALAVANCADA)
 */
export const strategies = mysqlTable("strategies", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Strategy = typeof strategies.$inferSelect;
export type InsertStrategy = typeof strategies.$inferInsert;

/**
 * Contas MT4/MT5 dos usuários
 */
export const accounts = mysqlTable("accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  strategyId: int("strategy_id").notNull().references(() => strategies.id, { onDelete: "restrict" }),
  accountNumber: varchar("account_number", { length: 50 }).notNull(),
  initialDeposit: varchar("initial_deposit", { length: 50 }).notNull(),
  approvalDate: timestamp("approval_date").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Account = typeof accounts.$inferSelect;
export type InsertAccount = typeof accounts.$inferInsert;

/**
 * Resultados mensais por estratégia (percentual de rentabilidade)
 */
export const monthlyStrategyResults = mysqlTable("monthly_strategy_results", {
  id: int("id").autoincrement().primaryKey(),
  strategyId: int("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
  year: int("year").notNull(),
  month: int("month").notNull(),
  returnPercentage: varchar("return_percentage", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyStrategyResult = typeof monthlyStrategyResults.$inferSelect;
export type InsertMonthlyStrategyResult = typeof monthlyStrategyResults.$inferInsert;

/**
 * Resultados mensais do CDI/Renda Fixa
 */
export const monthlyCDIResults = mysqlTable("monthly_cdi_results", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  month: int("month").notNull(),
  returnPercentage: varchar("return_percentage", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type MonthlyCDIResult = typeof monthlyCDIResults.$inferSelect;
export type InsertMonthlyCDIResult = typeof monthlyCDIResults.$inferInsert;