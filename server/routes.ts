import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { sendConfirmationEmail, sendPasswordResetEmail } from "./email";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { api } from "@shared/routes";

declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      isAdmin: boolean;
      emailConfirmedAt: Date | null;
    }
  }
}

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated || !req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.user.isAdmin) {
    return res.status(403).json({ message: "Forbidden" });
  }
  next();
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ==================== AUTH ROUTES ====================

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      if (!email || !password || password.length < 8) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const existing = await storage.getAppUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "Email already registered" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createAppUser({ email, passwordHash, firstName, lastName });

      // Create confirmation token
      const token = generateToken();
      await storage.createAuthToken({
        userId: user.id,
        type: "email_confirmation",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      try {
        await sendConfirmationEmail(email, token);
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }

      res.status(201).json({ id: user.id, email: user.email });
    } catch (err) {
      console.error("Register error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Confirm email
  app.post("/api/auth/confirm-email", async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ message: "Token required" });
      }

      const result = await storage.useAuthToken({
        type: "email_confirmation",
        tokenHash: hashToken(token),
      });

      if (!result) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      await storage.updateAppUser(result.userId, { emailConfirmedAt: new Date() });
      res.json({ ok: true });
    } catch (err) {
      console.error("Confirm email error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Resend confirmation email
  app.post("/api/auth/resend-confirmation", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const user = await storage.getAppUserByEmail(email);
      if (!user) {
        return res.json({ ok: true }); // Don't reveal if user exists
      }

      if (user.emailConfirmedAt) {
        return res.json({ ok: true }); // Already confirmed
      }

      const token = generateToken();
      await storage.createAuthToken({
        userId: user.id,
        type: "email_confirmation",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      try {
        await sendConfirmationEmail(email, token);
      } catch (emailErr) {
        console.error("Failed to send confirmation email:", emailErr);
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("Resend confirmation error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email required" });
      }

      const user = await storage.getAppUserByEmail(email);
      if (!user) {
        return res.json({ ok: true }); // Don't reveal if user exists
      }

      const token = generateToken();
      await storage.createAuthToken({
        userId: user.id,
        type: "password_reset",
        tokenHash: hashToken(token),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      });

      try {
        await sendPasswordResetEmail(email, token);
      } catch (emailErr) {
        console.error("Failed to send password reset email:", emailErr);
      }

      res.json({ ok: true });
    } catch (err) {
      console.error("Forgot password error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Invalid token or password" });
      }

      const result = await storage.useAuthToken({
        type: "password_reset",
        tokenHash: hashToken(token),
      });

      if (!result) {
        return res.status(400).json({ message: "Invalid or expired token" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateAppUser(result.userId, { passwordHash });
      res.json({ ok: true });
    } catch (err) {
      console.error("Reset password error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
      }

      const user = await storage.getAppUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.login(
        {
          id: user.id,
          email: user.email,
          isAdmin: user.isAdmin,
          emailConfirmedAt: user.emailConfirmedAt,
        },
        (err) => {
          if (err) {
            console.error("Login session error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          res.json({
            id: user.id,
            email: user.email,
            isAdmin: user.isAdmin,
            emailConfirmed: !!user.emailConfirmedAt,
          });
        }
      );
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ ok: true });
    });
  });

  // ==================== ME ROUTE ====================

  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getAppUserById(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        emailConfirmed: !!user.emailConfirmedAt,
      });
    } catch (err) {
      console.error("Get me error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== DASHBOARD ROUTES ====================

  app.get("/api/dashboard/overview", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const allAccounts = await storage.listAccounts();
      const userAccounts = allAccounts.filter((a) => a.userId === userId);

      const accountsWithSummary = await Promise.all(
        userAccounts.map(async (acc) => {
          const summary = await storage.getAccountSummary(acc.id);
          return {
            id: acc.id,
            name: acc.name,
            strategyId: acc.strategyId,
            profit: summary?.profit || "0.00",
            loss: summary?.loss || "0.00",
            net: summary?.net || "0.00",
          };
        })
      );

      res.json({ accounts: accountsWithSummary });
    } catch (err) {
      console.error("Dashboard overview error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/dashboard/account/:id/summary", requireAuth, async (req, res) => {
    try {
      const summary = await storage.getAccountSummary(req.params.id as string);
      if (!summary) {
        return res.status(404).json({ message: "Account not found" });
      }
      res.json({ accountId: req.params.id as string, ...summary });
    } catch (err) {
      console.error("Account summary error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== STRATEGIES ROUTES ====================

  app.get("/api/strategies", requireAuth, async (req, res) => {
    try {
      const strats = await storage.listStrategies();
      res.json(strats.map((s) => ({ id: s.id, name: s.name, description: s.description })));
    } catch (err) {
      console.error("List strategies error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/strategies/:id", requireAuth, async (req, res) => {
    try {
      const strats = await storage.listStrategies();
      const strat = strats.find((s) => s.id === req.params.id as string);
      if (!strat) {
        return res.status(404).json({ message: "Strategy not found" });
      }
      res.json({ id: strat.id, name: strat.name, description: strat.description });
    } catch (err) {
      console.error("Get strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/strategies", requireAdmin, async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name required" });
      }
      const strat = await storage.createStrategy({ name, description });
      res.status(201).json({ id: strat.id });
    } catch (err) {
      console.error("Create strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/strategies/:id", requireAdmin, async (req, res) => {
    try {
      await storage.updateStrategy(req.params.id as string, req.body);
      res.json({ ok: true });
    } catch (err) {
      console.error("Update strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/strategies/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStrategy(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Delete strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== STRATEGY HISTORY ROUTES ====================

  app.get("/api/strategies/:strategyId/history", requireAuth, async (req, res) => {
    try {
      const history = await storage.listStrategyHistory(req.params.strategyId as string);
      res.json(
        history.map((h) => ({
          id: h.id,
          strategyId: h.strategyId,
          occurredAt: h.occurredAt.toISOString(),
          profit: h.profit,
          loss: h.loss,
          note: h.note,
        }))
      );
    } catch (err) {
      console.error("List strategy history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/strategies/:strategyId/history", requireAdmin, async (req, res) => {
    try {
      const { occurredAt, profit, loss, note } = req.body;
      const entry = await storage.createStrategyHistory(req.params.strategyId as string, {
        occurredAt: new Date(occurredAt),
        profit: String(profit || 0),
        loss: String(loss || 0),
        note,
      });
      res.status(201).json({ id: entry.id });
    } catch (err) {
      console.error("Create strategy history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/strategy-history/:id", requireAdmin, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.occurredAt) updates.occurredAt = new Date(req.body.occurredAt);
      if (req.body.profit !== undefined) updates.profit = String(req.body.profit);
      if (req.body.loss !== undefined) updates.loss = String(req.body.loss);
      if (req.body.note !== undefined) updates.note = req.body.note;
      await storage.updateStrategyHistory(req.params.id as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Update strategy history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/strategy-history/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStrategyHistory(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Delete strategy history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== ACCOUNTS ROUTES ====================

  app.get("/api/accounts", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const allAccounts = await storage.listAccounts();
      const userAccounts = req.user!.isAdmin
        ? allAccounts
        : allAccounts.filter((a) => a.userId === userId);
      res.json(
        userAccounts.map((a) => ({
          id: a.id,
          userId: a.userId,
          strategyId: a.strategyId,
          name: a.name,
          startingBalance: a.startingBalance,
        }))
      );
    } catch (err) {
      console.error("List accounts error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const allAccounts = await storage.listAccounts();
      const acc = allAccounts.find((a) => a.id === req.params.id as string);
      if (!acc) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (acc.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      res.json({
        id: acc.id,
        userId: acc.userId,
        strategyId: acc.strategyId,
        name: acc.name,
        startingBalance: acc.startingBalance,
      });
    } catch (err) {
      console.error("Get account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/accounts", requireAuth, async (req, res) => {
    try {
      const { strategyId, name, startingBalance } = req.body;
      if (!strategyId || !name) {
        return res.status(400).json({ message: "Strategy and name required" });
      }
      const acc = await storage.createAccount({
        userId: req.user!.id,
        strategyId,
        name,
        startingBalance: String(startingBalance || 0),
      });
      res.status(201).json({ id: acc.id });
    } catch (err) {
      console.error("Create account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const allAccounts = await storage.listAccounts();
      const acc = allAccounts.find((a) => a.id === req.params.id as string);
      if (!acc) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (acc.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const updates: any = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.strategyId) updates.strategyId = req.body.strategyId;
      if (req.body.startingBalance !== undefined)
        updates.startingBalance = String(req.body.startingBalance);
      await storage.updateAccount(req.params.id as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Update account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/accounts/:id", requireAuth, async (req, res) => {
    try {
      const allAccounts = await storage.listAccounts();
      const acc = allAccounts.find((a) => a.id === req.params.id as string);
      if (!acc) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (acc.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      await storage.deleteAccount(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Delete account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== FINANCIAL RECORDS ROUTES ====================

  app.get("/api/financial-records", requireAuth, async (req, res) => {
    try {
      const accountId = req.query.accountId as string | undefined;
      if (!accountId) {
        return res.status(400).json({ message: "accountId required" });
      }

      const allAccounts = await storage.listAccounts();
      const acc = allAccounts.find((a) => a.id === accountId);
      if (!acc) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (acc.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const records = await storage.listFinancialRecords(accountId);
      res.json(
        records.map((r) => ({
          id: r.id,
          accountId: r.accountId,
          type: r.type,
          amount: r.amount,
          occurredAt: r.occurredAt.toISOString(),
          note: r.note,
        }))
      );
    } catch (err) {
      console.error("List financial records error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/financial-records", requireAuth, async (req, res) => {
    try {
      const { accountId, type, amount, occurredAt, note } = req.body;
      if (!accountId || !type) {
        return res.status(400).json({ message: "accountId and type required" });
      }

      const allAccounts = await storage.listAccounts();
      const acc = allAccounts.find((a) => a.id === accountId);
      if (!acc) {
        return res.status(404).json({ message: "Account not found" });
      }
      if (acc.userId !== req.user!.id && !req.user!.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const record = await storage.createFinancialRecord(accountId, {
        type,
        amount: String(amount || 0),
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        note,
      });
      res.status(201).json({ id: record.id });
    } catch (err) {
      console.error("Create financial record error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/financial-records/:id", requireAuth, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.type) updates.type = req.body.type;
      if (req.body.amount !== undefined) updates.amount = String(req.body.amount);
      if (req.body.occurredAt) updates.occurredAt = new Date(req.body.occurredAt);
      if (req.body.note !== undefined) updates.note = req.body.note;
      await storage.updateFinancialRecord(req.params.id as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Update financial record error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/financial-records/:id", requireAuth, async (req, res) => {
    try {
      await storage.deleteFinancialRecord(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Delete financial record error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== ADMIN ROUTES ====================

  // Admin users
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.listAppUsers();
      res.json(
        users.map((u) => ({
          id: u.id,
          email: u.email,
          isAdmin: u.isAdmin,
          emailConfirmedAt: u.emailConfirmedAt?.toISOString() || null,
          createdAt: u.createdAt.toISOString(),
        }))
      );
    } catch (err) {
      console.error("Admin list users error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const user = await storage.getAppUserById(req.params.id as string);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
        emailConfirmedAt: user.emailConfirmedAt?.toISOString() || null,
        createdAt: user.createdAt.toISOString(),
      });
    } catch (err) {
      console.error("Admin get user error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.email) updates.email = req.body.email;
      if (req.body.isAdmin !== undefined) updates.isAdmin = req.body.isAdmin;
      if (req.body.emailConfirmed !== undefined) {
        updates.emailConfirmedAt = req.body.emailConfirmed ? new Date() : null;
      }
      await storage.updateAppUser(req.params.id as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin update user error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/users/:id/set-password", requireAdmin, async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateAppUser(req.params.id as string, { passwordHash });
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin set password error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
    try {
      const { newPassword } = req.body;
      if (!newPassword || newPassword.length < 8) {
        return res.status(400).json({ message: "Password must be at least 8 characters" });
      }
      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateAppUser(req.params.id as string, { passwordHash });
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin reset password error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin strategies
  app.get("/api/admin/strategies", requireAdmin, async (req, res) => {
    try {
      const strats = await storage.listStrategies();
      res.json(strats.map((s) => ({ id: s.id, name: s.name, description: s.description })));
    } catch (err) {
      console.error("Admin list strategies error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/strategies", requireAdmin, async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) {
        return res.status(400).json({ message: "Name required" });
      }
      const strat = await storage.createStrategy({ name, description });
      res.status(201).json({ id: strat.id });
    } catch (err) {
      console.error("Admin create strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/strategies/:id", requireAdmin, async (req, res) => {
    try {
      await storage.updateStrategy(req.params.id as string, req.body);
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin update strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/strategies/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStrategy(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Admin delete strategy error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin strategy history
  app.get("/api/admin/strategies/:id/history", requireAdmin, async (req, res) => {
    try {
      const history = await storage.listStrategyHistory(req.params.id as string);
      res.json(
        history.map((h) => ({
          id: h.id,
          strategyId: h.strategyId,
          occurredAt: h.occurredAt.toISOString(),
          profit: h.profit,
          loss: h.loss,
          note: h.note,
        }))
      );
    } catch (err) {
      console.error("Admin list strategy history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/strategies/:id/history", requireAdmin, async (req, res) => {
    try {
      const { occurredAt, profit, loss, note } = req.body;
      const entry = await storage.createStrategyHistory(req.params.id as string, {
        occurredAt: new Date(occurredAt),
        profit: String(profit || 0),
        loss: String(loss || 0),
        note,
      });
      res.status(201).json({ id: entry.id });
    } catch (err) {
      console.error("Admin create strategy history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/history/:id", requireAdmin, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.occurredAt) updates.occurredAt = new Date(req.body.occurredAt);
      if (req.body.profit !== undefined) updates.profit = String(req.body.profit);
      if (req.body.loss !== undefined) updates.loss = String(req.body.loss);
      if (req.body.note !== undefined) updates.note = req.body.note;
      await storage.updateStrategyHistory(req.params.id as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin update history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/history/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteStrategyHistory(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Admin delete history error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin accounts
  app.get("/api/admin/accounts", requireAdmin, async (req, res) => {
    try {
      const accts = await storage.listAccounts();
      res.json(
        accts.map((a) => ({
          id: a.id,
          userId: a.userId,
          strategyId: a.strategyId,
          name: a.name,
          startingBalance: a.startingBalance,
        }))
      );
    } catch (err) {
      console.error("Admin list accounts error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/accounts", requireAdmin, async (req, res) => {
    try {
      const { userId, strategyId, name, startingBalance } = req.body;
      if (!userId || !strategyId || !name) {
        return res.status(400).json({ message: "userId, strategyId and name required" });
      }
      const acc = await storage.createAccount({
        userId,
        strategyId,
        name,
        startingBalance: String(startingBalance || 0),
      });
      res.status(201).json({ id: acc.id });
    } catch (err) {
      console.error("Admin create account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/accounts/:id", requireAdmin, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.name) updates.name = req.body.name;
      if (req.body.strategyId) updates.strategyId = req.body.strategyId;
      if (req.body.userId) updates.userId = req.body.userId;
      if (req.body.startingBalance !== undefined)
        updates.startingBalance = String(req.body.startingBalance);
      await storage.updateAccount(req.params.id as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin update account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/accounts/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteAccount(req.params.id as string);
      res.status(204).send();
    } catch (err) {
      console.error("Admin delete account error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Admin financial records
  app.get("/api/admin/accounts/:id/financial-records", requireAdmin, async (req, res) => {
    try {
      const records = await storage.listFinancialRecords(req.params.id as string as string);
      res.json(
        records.map((r) => ({
          id: r.id,
          accountId: r.accountId,
          type: r.type,
          amount: r.amount,
          occurredAt: r.occurredAt.toISOString(),
          note: r.note,
        }))
      );
    } catch (err) {
      console.error("Admin list financial records error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/admin/accounts/:id/financial-records", requireAdmin, async (req, res) => {
    try {
      const { type, amount, occurredAt, note } = req.body;
      if (!type) {
        return res.status(400).json({ message: "type required" });
      }
      const record = await storage.createFinancialRecord(req.params.id as string as string, {
        type,
        amount: String(amount || 0),
        occurredAt: occurredAt ? new Date(occurredAt) : new Date(),
        note,
      });
      res.status(201).json({ id: record.id });
    } catch (err) {
      console.error("Admin create financial record error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch("/api/admin/financial-records/:id", requireAdmin, async (req, res) => {
    try {
      const updates: any = {};
      if (req.body.type) updates.type = req.body.type;
      if (req.body.amount !== undefined) updates.amount = String(req.body.amount);
      if (req.body.occurredAt) updates.occurredAt = new Date(req.body.occurredAt);
      if (req.body.note !== undefined) updates.note = req.body.note;
      await storage.updateFinancialRecord(req.params.id as string as string, updates);
      res.json({ ok: true });
    } catch (err) {
      console.error("Admin update financial record error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/admin/financial-records/:id", requireAdmin, async (req, res) => {
    try {
      await storage.deleteFinancialRecord(req.params.id as string as string);
      res.status(204).send();
    } catch (err) {
      console.error("Admin delete financial record error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== MONTHLY RETURNS ROUTES ====================

  // Get all monthly strategy returns
  app.get("/api/monthly-strategy-returns", async (req, res) => {
    try {
      const returns = await storage.getAllMonthlyStrategyReturns();
      res.json(returns);
    } catch (err) {
      console.error("Get monthly strategy returns error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get monthly strategy returns by strategy
  app.get("/api/monthly-strategy-returns/:strategyId", async (req, res) => {
    try {
      const returns = await storage.getMonthlyStrategyReturnsByStrategy(req.params.strategyId);
      res.json(returns);
    } catch (err) {
      console.error("Get monthly strategy returns error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update monthly strategy return (admin only)
  app.post("/api/admin/monthly-strategy-returns", requireAdmin, async (req, res) => {
    try {
      const { strategyId, year, month, returnPercentage } = req.body;
      if (!strategyId || !year || !month || returnPercentage === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const result = await storage.upsertMonthlyStrategyReturn({
        strategyId,
        year,
        month,
        returnPercentage,
      });
      res.json(result);
    } catch (err) {
      console.error("Create monthly strategy return error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all monthly CDI returns
  app.get("/api/monthly-cdi-returns", async (req, res) => {
    try {
      const returns = await storage.getAllMonthlyCDIReturns();
      res.json(returns);
    } catch (err) {
      console.error("Get monthly CDI returns error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create or update monthly CDI return (admin only)
  app.post("/api/admin/monthly-cdi-returns", requireAdmin, async (req, res) => {
    try {
      const { year, month, returnPercentage } = req.body;
      if (!year || !month || returnPercentage === undefined) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      const result = await storage.upsertMonthlyCDIReturn({
        year,
        month,
        returnPercentage,
      });
      res.json(result);
    } catch (err) {
      console.error("Create monthly CDI return error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  return httpServer;
}
