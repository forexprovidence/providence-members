import bcrypt from "bcryptjs";
import { db } from "./db";
import { appUsers, strategies, strategyHistory, accounts } from "@shared/schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Starting database seed...");

  // Check if admin already exists
  const [existingAdmin] = await db
    .select()
    .from(appUsers)
    .where(eq(appUsers.email, "Forexprovidence@gmail.com"));

  let adminId: string;

  if (existingAdmin) {
    console.log("Admin user already exists");
    adminId = existingAdmin.id;
  } else {
    // Create admin user with hashed password
    const passwordHash = await bcrypt.hash("ProvidenceAdmin!@#123", 10);
    const [admin] = await db
      .insert(appUsers)
      .values({
        email: "Forexprovidence@gmail.com",
        passwordHash,
        isAdmin: true,
        emailConfirmedAt: new Date(),
      })
      .returning();
    console.log("Created admin user:", admin.email);
    adminId = admin.id;
  }

  // Check if strategies exist
  const existingStrategies = await db.select().from(strategies);
  
  if (existingStrategies.length === 0) {
    // Create sample strategies
    const sampleStrategies = [
      { name: "Momentum Trading", description: "High-frequency trading strategy based on market momentum indicators" },
      { name: "Swing Trading", description: "Medium-term position trading capturing price swings over days to weeks" },
      { name: "Scalping Pro", description: "Quick trades capturing small price movements throughout the day" },
      { name: "Trend Following", description: "Long-term strategy following established market trends" },
    ];

    const createdStrategies = await db.insert(strategies).values(sampleStrategies).returning();
    console.log(`Created ${createdStrategies.length} strategies`);

    // Add sample history for first strategy
    const firstStrategy = createdStrategies[0];
    const historyEntries = [
      { strategyId: firstStrategy.id, occurredAt: new Date("2025-01-15"), profit: "1250.00", loss: "0", note: "Strong bullish momentum in EUR/USD" },
      { strategyId: firstStrategy.id, occurredAt: new Date("2025-01-20"), profit: "0", loss: "320.00", note: "Market reversal caused stop-loss trigger" },
      { strategyId: firstStrategy.id, occurredAt: new Date("2025-01-25"), profit: "890.00", loss: "0", note: "GBP/JPY breakout trade" },
      { strategyId: firstStrategy.id, occurredAt: new Date("2025-02-01"), profit: "2100.00", loss: "0", note: "Multiple winning trades on NFP release" },
    ];

    await db.insert(strategyHistory).values(historyEntries);
    console.log(`Created ${historyEntries.length} strategy history entries`);

    // Create a sample account for admin
    const [account] = await db
      .insert(accounts)
      .values({
        userId: adminId,
        strategyId: firstStrategy.id,
        name: "Admin Primary Account",
        startingBalance: "10000.00",
      })
      .returning();
    console.log("Created sample account:", account.name);
  } else {
    console.log("Strategies already exist, skipping seed data");
  }

  console.log("Seed completed successfully!");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
