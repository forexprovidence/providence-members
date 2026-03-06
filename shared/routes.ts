import { z } from "zod";
import {
  createAccountSchema,
  createFinancialRecordSchema,
  createStrategyHistorySchema,
  createStrategySchema,
  insertAppUserSchema,
} from "@shared/schema";

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
  forbidden: z.object({
    message: z.string(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

const idParam = z.object({ id: z.string().uuid() });

export const api = {
  auth: {
    register: {
      method: "POST" as const,
      path: "/api/auth/register",
      input: insertAppUserSchema.extend({
        password: z.string().min(8),
      }),
      responses: {
        201: z.object({ id: z.string().uuid(), email: z.string().email() }),
        400: errorSchemas.validation,
      },
    },
    confirmEmail: {
      method: "POST" as const,
      path: "/api/auth/confirm-email",
      input: z.object({ token: z.string().min(10) }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
      },
    },
    resendConfirmation: {
      method: "POST" as const,
      path: "/api/auth/resend-confirmation",
      input: z.object({ email: z.string().email() }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
      },
    },
    forgotPassword: {
      method: "POST" as const,
      path: "/api/auth/forgot-password",
      input: z.object({ email: z.string().email() }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
      },
    },
    resetPassword: {
      method: "POST" as const,
      path: "/api/auth/reset-password",
      input: z.object({ token: z.string().min(10), newPassword: z.string().min(8) }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
      },
    },
  },
  strategies: {
    list: {
      method: "GET" as const,
      path: "/api/strategies",
      input: z.object({ search: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.object({ id: z.string().uuid(), name: z.string(), description: z.string().nullable() })),
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/strategies/:id",
      responses: {
        200: z.object({ id: z.string().uuid(), name: z.string(), description: z.string().nullable() }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/strategies",
      input: createStrategySchema,
      responses: {
        201: z.object({ id: z.string().uuid() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/strategies/:id",
      input: createStrategySchema.partial(),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/strategies/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  me: {
    get: {
      method: "GET" as const,
      path: "/api/me",
      responses: {
        200: z.object({
          id: z.string().uuid(),
          email: z.string().email(),
          isAdmin: z.boolean(),
          emailConfirmed: z.boolean(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
  dashboard: {
    overview: {
      method: "GET" as const,
      path: "/api/dashboard/overview",
      responses: {
        200: z.object({
          accounts: z.array(
            z.object({
              id: z.string().uuid(),
              name: z.string(),
              strategyId: z.string().uuid(),
              profit: z.string(),
              loss: z.string(),
              net: z.string(),
            }),
          ),
        }),
        401: errorSchemas.unauthorized,
      },
    },
    accountSummary: {
      method: "GET" as const,
      path: "/api/dashboard/account/:id/summary",
      responses: {
        200: z.object({
          accountId: z.string().uuid(),
          profit: z.string(),
          loss: z.string(),
          net: z.string(),
        }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
  },
  admin: {
    users: {
      list: {
        method: "GET" as const,
        path: "/api/admin/users",
        input: z.object({ search: z.string().optional() }).optional(),
        responses: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              email: z.string().email(),
              isAdmin: z.boolean(),
              emailConfirmedAt: z.string().nullable(),
              createdAt: z.string(),
            }),
          ),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
        },
      },
      get: {
        method: "GET" as const,
        path: "/api/admin/users/:id",
        responses: {
          200: z.object({
            id: z.string().uuid(),
            email: z.string().email(),
            isAdmin: z.boolean(),
            emailConfirmedAt: z.string().nullable(),
            createdAt: z.string(),
          }),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/users/:id",
        input: z.object({
          email: z.string().email().optional(),
          isAdmin: z.boolean().optional(),
          emailConfirmed: z.boolean().optional(),
        }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      setPassword: {
        method: "POST" as const,
        path: "/api/admin/users/:id/set-password",
        input: z.object({ newPassword: z.string().min(8) }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      resetPassword: {
        method: "POST" as const,
        path: "/api/admin/users/:id/reset-password",
        input: z.object({ newPassword: z.string().min(8) }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
    strategies: {
      list: {
        method: "GET" as const,
        path: "/api/admin/strategies",
        responses: {
          200: z.array(
            z.object({ id: z.string().uuid(), name: z.string(), description: z.string().nullable() }),
          ),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/strategies",
        input: createStrategySchema,
        responses: {
          201: z.object({ id: z.string().uuid() }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/strategies/:id",
        input: createStrategySchema.partial(),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/strategies/:id",
        responses: {
          204: z.void(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
    history: {
      listByStrategy: {
        method: "GET" as const,
        path: "/api/admin/strategies/:id/history",
        responses: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              strategyId: z.string().uuid(),
              occurredAt: z.string(),
              profit: z.string(),
              loss: z.string(),
              note: z.string().nullable(),
            }),
          ),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/strategies/:id/history",
        input: createStrategyHistorySchema.omit({ strategyId: true }).extend({
          occurredAt: z.coerce.date(),
          profit: z.coerce.number(),
          loss: z.coerce.number(),
        }),
        responses: {
          201: z.object({ id: z.string().uuid() }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/history/:id",
        input: createStrategyHistorySchema.partial().extend({
          occurredAt: z.coerce.date().optional(),
          profit: z.coerce.number().optional(),
          loss: z.coerce.number().optional(),
        }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/history/:id",
        responses: {
          204: z.void(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
    accounts: {
      list: {
        method: "GET" as const,
        path: "/api/admin/accounts",
        responses: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              userId: z.string().uuid(),
              strategyId: z.string().uuid(),
              name: z.string(),
              startingBalance: z.string(),
            }),
          ),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/accounts",
        input: createAccountSchema.extend({ startingBalance: z.coerce.number().optional() }),
        responses: {
          201: z.object({ id: z.string().uuid() }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/accounts/:id",
        input: createAccountSchema.partial().extend({ startingBalance: z.coerce.number().optional() }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/accounts/:id",
        responses: {
          204: z.void(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
    financial: {
      listByAccount: {
        method: "GET" as const,
        path: "/api/admin/accounts/:id/financial-records",
        responses: {
          200: z.array(
            z.object({
              id: z.string().uuid(),
              accountId: z.string().uuid(),
              type: z.string(),
              amount: z.string(),
              occurredAt: z.string(),
              note: z.string().nullable(),
            }),
          ),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      create: {
        method: "POST" as const,
        path: "/api/admin/accounts/:id/financial-records",
        input: createFinancialRecordSchema.omit({ accountId: true }).extend({
          occurredAt: z.coerce.date(),
          amount: z.coerce.number(),
        }),
        responses: {
          201: z.object({ id: z.string().uuid() }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      update: {
        method: "PATCH" as const,
        path: "/api/admin/financial-records/:id",
        input: createFinancialRecordSchema.partial().extend({
          occurredAt: z.coerce.date().optional(),
          amount: z.coerce.number().optional(),
        }),
        responses: {
          200: z.object({ ok: z.literal(true) }),
          400: errorSchemas.validation,
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
      delete: {
        method: "DELETE" as const,
        path: "/api/admin/financial-records/:id",
        responses: {
          204: z.void(),
          401: errorSchemas.unauthorized,
          403: errorSchemas.forbidden,
          404: errorSchemas.notFound,
        },
      },
    },
  },
  strategyHistory: {
    list: {
      method: "GET" as const,
      path: "/api/strategies/:strategyId/history",
      input: z.object({ limit: z.coerce.number().optional() }).optional(),
      responses: {
        200: z.array(
          z.object({
            id: z.string().uuid(),
            strategyId: z.string().uuid(),
            occurredAt: z.string(),
            profit: z.string(),
            loss: z.string(),
            note: z.string().nullable(),
          }),
        ),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/strategies/:strategyId/history",
      input: createStrategyHistorySchema.omit({ strategyId: true }).extend({
        occurredAt: z.coerce.date(),
        profit: z.coerce.number(),
        loss: z.coerce.number(),
      }),
      responses: {
        201: z.object({ id: z.string().uuid() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/strategy-history/:id",
      input: createStrategyHistorySchema.partial().extend({
        occurredAt: z.coerce.date().optional(),
        profit: z.coerce.number().optional(),
        loss: z.coerce.number().optional(),
      }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/strategy-history/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  accounts: {
    list: {
      method: "GET" as const,
      path: "/api/accounts",
      input: z.object({ userId: z.string().uuid().optional() }).optional(),
      responses: {
        200: z.array(
          z.object({
            id: z.string().uuid(),
            userId: z.string().uuid(),
            strategyId: z.string().uuid(),
            name: z.string(),
            startingBalance: z.string(),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: "GET" as const,
      path: "/api/accounts/:id",
      responses: {
        200: z.object({
          id: z.string().uuid(),
          userId: z.string().uuid(),
          strategyId: z.string().uuid(),
          name: z.string(),
          startingBalance: z.string(),
        }),
        401: errorSchemas.unauthorized,
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/accounts",
      input: createAccountSchema.extend({ startingBalance: z.coerce.number().optional() }),
      responses: {
        201: z.object({ id: z.string().uuid() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/accounts/:id",
      input: createAccountSchema.partial().extend({ startingBalance: z.coerce.number().optional() }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/accounts/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
  financialRecords: {
    list: {
      method: "GET" as const,
      path: "/api/financial-records",
      input: z.object({ accountId: z.string().uuid() }).optional(),
      responses: {
        200: z.array(
          z.object({
            id: z.string().uuid(),
            accountId: z.string().uuid(),
            type: z.string(),
            amount: z.string(),
            occurredAt: z.string(),
            note: z.string().nullable(),
          }),
        ),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: "POST" as const,
      path: "/api/financial-records",
      input: createFinancialRecordSchema.extend({
        occurredAt: z.coerce.date(),
        amount: z.coerce.number(),
      }),
      responses: {
        201: z.object({ id: z.string().uuid() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/financial-records/:id",
      input: createFinancialRecordSchema.partial().extend({
        occurredAt: z.coerce.date().optional(),
        amount: z.coerce.number().optional(),
      }),
      responses: {
        200: z.object({ ok: z.literal(true) }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/financial-records/:id",
      responses: {
        204: z.void(),
        401: errorSchemas.unauthorized,
        403: errorSchemas.forbidden,
        404: errorSchemas.notFound,
      },
    },
  },
} as const;

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}

export type RegisterRequest = z.infer<typeof api.auth.register.input>;
export type MeResponse = z.infer<typeof api.me.get.responses[200]>;