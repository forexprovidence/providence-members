import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  strategies: router({
    list: publicProcedure.query(async () => {
      return await db.getAllStrategies();
    }),
  }),

  accounts: router({
    list: publicProcedure.query(async ({ ctx }) => {
      if (!ctx.user) throw new Error("Unauthorized");
      return await db.getUserAccounts(ctx.user.id);
    }),
    create: publicProcedure
      .input(
        z.object({
          strategyId: z.number(),
          accountNumber: z.string(),
          initialDeposit: z.string(),
          approvalDate: z.date(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        return await db.createAccount({
          userId: ctx.user.id,
          strategyId: input.strategyId,
          accountNumber: input.accountNumber,
          initialDeposit: input.initialDeposit,
          approvalDate: input.approvalDate,
        });
      }),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user) throw new Error("Unauthorized");
        const account = await db.getAccountById(input.id);
        if (account?.userId !== ctx.user.id) throw new Error("Forbidden");
        return await db.deleteAccount(input.id);
      }),
  }),

  admin: router({
    strategies: router({
      create: publicProcedure
        .input(
          z.object({
            name: z.string(),
            description: z.string().optional(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user?.role || ctx.user.role !== "admin") throw new Error("Forbidden");
          return await db.createStrategy(input);
        }),
    }),
    monthlyResults: router({
      upsertStrategy: publicProcedure
        .input(
          z.object({
            strategyId: z.number(),
            year: z.number(),
            month: z.number(),
            returnPercentage: z.string(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user?.role || ctx.user.role !== "admin") throw new Error("Forbidden");
          return await db.upsertMonthlyStrategyResult(input);
        }),
      upsertCDI: publicProcedure
        .input(
          z.object({
            year: z.number(),
            month: z.number(),
            returnPercentage: z.string(),
          })
        )
        .mutation(async ({ input, ctx }) => {
          if (!ctx.user?.role || ctx.user.role !== "admin") throw new Error("Forbidden");
          return await db.upsertMonthlyCDIResult(input);
        }),
      getCDI: publicProcedure.query(async () => {
        return await db.getAllCDIResults();
      }),
      getStrategyHistory: publicProcedure
        .input(z.object({ strategyId: z.number() }))
        .query(async ({ input }) => {
          return await db.getStrategyResultsHistory(input.strategyId);
        }),
    }),
  }),
});

export type AppRouter = typeof appRouter;
