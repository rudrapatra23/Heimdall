import { Bot } from "gramio";
import { registerAuthHandlers } from "./handlers/auth.ts";

const token = process.env.TELEGRAM_BOT_TOKEN 

if (!token) {
    throw new Error("BOT_TOKEN is missing!");
}

export const bot = new Bot(token);

// Register command and event handlers
registerAuthHandlers(bot);

bot.onStart(({ info }) => {
    console.log(`Telegram bot running as @${info.username}`);
});