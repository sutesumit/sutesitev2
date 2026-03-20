import { Bot, Context } from "grammy";
import { handleStart, handleByte, handleBlip, handleList, handleGet, handleEdit, handleDel, handleMessage } from './commands/handlers';

type MyContext = Context;

let botInstance: Bot<MyContext> | null = null;

const BOT_COMMANDS = [
  { command: "start", description: "Show help" },
  { command: "byte", description: "Create a byte (short thought)" },
  { command: "blip", description: "Create a blip (term:meaning)" },
  { command: "list", description: "List bytes or blips" },
  { command: "get", description: "Get a byte or blip" },
  { command: "edit", description: "Edit a byte or blip" },
  { command: "del", description: "Delete a byte or blip" },
] as const;

export { BOT_COMMANDS };

export async function initBot(): Promise<Bot<MyContext>> {
  if (botInstance) {
    return botInstance;
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not configured");
  }

  botInstance = new Bot<MyContext>(token);

  await botInstance.init();

  botInstance.command("start", handleStart);
  botInstance.command("byte", (ctx) => handleByte(ctx, botInstance!));
  botInstance.command("blip", (ctx) => handleBlip(ctx, botInstance!));
  botInstance.command("list", handleList);
  botInstance.command("get", handleGet);
  botInstance.command("edit", handleEdit);
  botInstance.command("del", handleDel);
  botInstance.on("message", (ctx) => handleMessage(ctx, botInstance!));

  return botInstance;
}
