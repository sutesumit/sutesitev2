import { Bot, Context } from "grammy";
import { handleStart, handleByte, handleBlip, handleList, handleGet, handleEdit, handleDel, handleMessage } from './commands/handlers';
import { handleLiveSession } from './commands/live-session';
import { BOT_COMMANDS } from './bot-commands';

type MyContext = Context;

let botInstance: Bot<MyContext> | null = null;

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
  botInstance.command("livesession", (ctx) => handleLiveSession(ctx, botInstance!));
  botInstance.on("message", (ctx) => handleMessage(ctx, botInstance!));

  return botInstance;
}
