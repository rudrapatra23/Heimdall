import { Bot } from "gramio";
import { registerAuthHandlers, getProfileByTelegramId } from "./handlers/auth.ts";
import { learnFromMessage } from "../worker/memory-service.ts";
import { runChatTask } from "../worker/agent.ts";

const token = process.env.TELEGRAM_BOT_TOKEN;
const WORKER_URL = process.env.WORKER_URL ?? "http://localhost:4000";

if (!token) {
  throw new Error("BOT_TOKEN is missing!");
}

export const bot = new Bot(token);

// Auth handlers (contact-share linking) — must be registered first.
// The auth handler's on("message") calls next() for non-contact messages,
// which lets our free-text handler below receive them.
registerAuthHandlers(bot);

// ─── Built-in commands ─────────────────────────────────────────────────────────

bot.command("help", (context) => {
  return context.send(
    "Hi! Just talk to me naturally. I can:\n" +
      "• Answer questions\n" +
      "• Read and send your emails\n" +
      "• Remember things you tell me\n" +
      "• Learn your preferences over time\n\n" +
      "No special commands needed — just chat!"
  );
});

bot.command("summary", async (context) => {
  try {
    const telegramId = context.from?.id;
    if (!telegramId) return context.send("Couldn't identify you — try /start again.");

    const profile = await getProfileByTelegramId(telegramId.toString());
    if (!profile) return context.send("Send /start first to link your Heimdall account.");

    const res = await fetch(`${WORKER_URL}/worker/test-email-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: profile.id, instruction: "Summarize my latest email" }),
    });

    if (!res.ok) throw new Error(`Worker returned ${res.status}`);
    type EmailTaskResponse = { result?: string };
    const data = (await res.json()) as EmailTaskResponse;
    return context.send(data.result ?? "No summary available right now.");
  } catch (error) {
    console.error("Failed to get email summary:", error);
    return context.send("Sorry, I could not get your email summary right now.");
  }
});

// ─── Free-text handler (the main conversational flow) ─────────────────────────
//
// Registered after registerAuthHandlers so it only receives messages that the
// auth handler passed through via next() (i.e. non-contact-share messages).
//
// Flow:
//   user message
//     → learnFromMessage()     [memory extraction, runs in parallel, non-blocking]
//     → runChatTask()          [Groq agent with user context + Gmail tools]
//     → bot sends Groq response back to the user
//
bot.on("message", async (context) => {
  // Skip contact-share (handled by auth), voice, stickers, etc.
  if (context.contact) return;
  const text = context.text;
  if (!text) return;

  const telegramId = context.from?.id;
  if (!telegramId) return;

  const profile = await getProfileByTelegramId(telegramId.toString());
  if (!profile) {
    return context.send(
      "Hi! Please use /start first to link your Heimdall account before we can chat."
    );
  }

  // Run memory extraction and the chat response in parallel.
  // Memory extraction failure is silently swallowed — it must never block the reply.
  const [, response] = await Promise.all([
    learnFromMessage(profile.id, text).catch((err) =>
      console.warn("[telegram] Memory extraction failed:", err)
    ),
    runChatTask(profile.id, text).catch((err) => {
      console.error("[telegram] Chat task failed:", err);
      return "Sorry, something went wrong. Please try again.";
    }),
  ]);

  return context.send(response as string);
});

bot.onStart(({ info }) => {
  console.log(`Telegram bot running as @${info.username}`);
});