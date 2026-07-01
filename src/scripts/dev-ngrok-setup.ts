import { Bot } from "grammy";
import crypto from "crypto";
import fs from "fs";
import path from "path";

function loadEnvFile(filePath: string): void {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile(path.resolve(process.cwd(), ".env.local"));
loadEnvFile(path.resolve(process.cwd(), ".env"));

async function main() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!token || !secret) {
    console.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_WEBHOOK_SECRET");
    process.exit(1);
  }

  const bot = new Bot(token);
  await bot.init();
  console.log(`Bot: @${bot.botInfo.username}`);
  if (channelId) console.log(`Channel: ${channelId}`);

  const ngrokUrl = process.env.NGROK_URL;
  if (!ngrokUrl) {
    console.error("Missing NGROK_URL");
    process.exit(1);
  }
  const secretHash = crypto.createHash("sha256").update(secret).digest("hex");

  console.log("\n1. Setting webhook...");
  await bot.api.setWebhook(ngrokUrl, { secret_token: secretHash });
  console.log(`   Webhook: ${ngrokUrl}`);

  console.log("\n2. Registering commands...");
  await bot.api.setMyCommands([
    { command: "start", description: "Show help" },
    { command: "byte", description: "Create a byte (short thought)" },
    { command: "blip", description: "Create a blip (term:meaning)" },
    { command: "list", description: "List bytes or blips" },
    { command: "get", description: "Get a byte or blip" },
    { command: "edit", description: "Edit a byte or blip" },
    { command: "del", description: "Delete a byte or blip" },
    { command: "livesession", description: "Manage live bloq sessions" },
  ]);
  console.log("   Commands registered (including /livesession)");

  console.log("\n3. Verifying webhook...");
  const info = await bot.api.getWebhookInfo();
  console.log(`   Status: ${info.url ? "Active" : "Not set"}`);
  console.log(`   URL: ${info.url || "N/A"}`);
  console.log(`   Pending: ${info.pending_update_count}`);

  console.log("\nDone! Open your Telegram bot and type / to see the new /livesession command.");
  console.log(`After testing, re-run: npm run telegram:setup`);
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
