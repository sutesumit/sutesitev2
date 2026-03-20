import { Bot, Context } from "grammy";
import * as crypto from "crypto";
import * as fs from "fs";
import * as path from "path";

type MyContext = Context;

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    
    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

const BOT_COMMANDS = [
  { command: "start", description: "Show help" },
  { command: "byte", description: "Create a byte (short thought)" },
  { command: "blip", description: "Create a blip (term:meaning)" },
  { command: "list", description: "List bytes or blips" },
  { command: "get", description: "Get a byte or blip" },
  { command: "edit", description: "Edit a byte or blip" },
  { command: "del", description: "Delete a byte or blip" },
] as const;

async function main(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const webhookUrl = process.env.TELEGRAM_PROD_WEBHOOK_URL;
  const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;

  if (!token) {
    console.error("Error: TELEGRAM_BOT_TOKEN is required");
    process.exit(1);
  }

  if (!webhookUrl) {
    console.error("Error: TELEGRAM_PROD_WEBHOOK_URL is required");
    console.error("Example: TELEGRAM_PROD_WEBHOOK_URL=https://yourdomain.com/api/telegram/webhook");
    process.exit(1);
  }

  if (!webhookSecret) {
    console.error("Error: TELEGRAM_WEBHOOK_SECRET is required");
    process.exit(1);
  }

  const bot = new Bot<MyContext>(token);
  await bot.init();

  console.log(`Bot: @${bot.botInfo.username}`);

  console.log("\n1. Setting bot commands...");
  await bot.api.setMyCommands([...BOT_COMMANDS]);
  console.log("   Commands set successfully");

  console.log("\n2. Setting webhook...");
  const secretHash = crypto.createHash("sha256").update(webhookSecret).digest("hex");
  
  await bot.api.setWebhook(webhookUrl, {
    secret_token: secretHash,
  });
  console.log(`   Webhook set to: ${webhookUrl}`);

  console.log("\n3. Verifying webhook...");
  const webhookInfo = await bot.api.getWebhookInfo();
  console.log(`   Status: ${webhookInfo.url ? "Active" : "Not set"}`);
  console.log(`   URL: ${webhookInfo.url || "N/A"}`);
  console.log(`   Pending updates: ${webhookInfo.pending_update_count}`);

  console.log("\nSetup complete!");
  console.log("\nNext steps:");
  console.log("1. Deploy your application");
  console.log("2. Telegram will send updates to your webhook");
  console.log("3. The webhook endpoint verifies requests using X-Telegram-Webhook-Secret header");
}

main().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
