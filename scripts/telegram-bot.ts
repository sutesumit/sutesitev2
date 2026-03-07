import { config } from "dotenv";
config({ path: ".env.local" });

import { startBot } from "@/lib/telegram-bot";

startBot().catch((err) => {
  console.error("Failed to start bot:", err);
  process.exit(1);
});
