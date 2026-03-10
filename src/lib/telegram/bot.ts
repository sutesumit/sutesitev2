import { Bot, Context } from "grammy";
import { handleStart, handleSubscribe, handleList, handleGet, handleEdit, handleDel, handleMessage } from './commands/handlers';

type MyContext = Context;

let botInstance: Bot<MyContext> | null = null;

const BOT_COMMANDS = [
  { command: "start", description: "Show help" },
  { command: "subscribe", description: "Get updates" },
  { command: "list", description: "List recent blips" },
  { command: "get", description: "Get a specific blip" },
  { command: "edit", description: "Edit a blip" },
  { command: "del", description: "Delete a blip" },
] as const;

export async function initBot(): Promise<Bot<MyContext>> {
  if (botInstance) {
    await botInstance.api.setMyCommands([...BOT_COMMANDS]);
    return botInstance;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  botInstance = new Bot<MyContext>(token);

  await botInstance.init();

  await botInstance.api.setMyCommands([...BOT_COMMANDS]);

  botInstance.command("start", handleStart);
  botInstance.command("subscribe", handleSubscribe);
  botInstance.command("list", handleList);
  botInstance.command("get", handleGet);
  botInstance.command("edit", handleEdit);
  botInstance.command("del", handleDel);
  botInstance.on("message", (ctx) => handleMessage(ctx, botInstance!));

  return botInstance;
}
