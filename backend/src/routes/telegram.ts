import { Bot, type Context, type CommandContext } from 'grammy';
import type { Update } from 'grammy/types';
import { eq, isNull, ne, and } from 'drizzle-orm';
import { db, profiles, telegramLinkTokens } from '../db/index.ts';
import { getCurrentUser, requireAuth } from '../middleware/auth.ts';

const BOT_TOKEN     = process.env.TELEGRAM_BOT_TOKEN;
const BOT_USERNAME  = process.env.TELEGRAM_BOT_USERNAME;

if (!BOT_TOKEN)    console.warn('TELEGRAM_BOT_TOKEN not set — Telegram bot will not start');
if (!BOT_USERNAME) console.warn('TELEGRAM_BOT_USERNAME not set — deep links will not work');

// ──────────────────────────────────────────────────────────
// Bot setup (webhook mode — no polling)
// ──────────────────────────────────────────────────────────
let bot: Bot | null = null;
if (BOT_TOKEN) {
  bot = new Bot(BOT_TOKEN);
  setupBotHandlers(bot);
}

function setupBotHandlers(bot: Bot) {
  // /start [token]  — entry point for deep-link account linking
  bot.command('start', async (ctx) => {
    const payload         = ctx.match;   // everything after /start
    const telegramUserId  = String(ctx.from?.id);
    const telegramUsername = ctx.from?.username ?? null;

    if (!payload) {
      await ctx.reply(
        '👋 Welcome to Sery 🌼!\n\nTo link your account, generate a connection link from the web app and click it.'
      );
      return;
    }

    await handleTelegramLinking(ctx, payload, telegramUserId, telegramUsername);
  });

  // Catch-all — handle messages from already-linked users
  bot.on('message', async (ctx) => {
    const telegramUserId = String(ctx.from?.id);

    const [profile] = await db
      .select({ id: profiles.id, full_name: profiles.full_name })
      .from(profiles)
      .where(eq(profiles.telegram_user_id, telegramUserId))
      .limit(1);

    if (profile) {
      await ctx.reply(
        `Hi ${profile.full_name ?? 'there'}! Your account is connected. Email workflow coming soon.`
      );
    } else {
      await ctx.reply(
        '⚠️ Your Telegram account is not linked to a Sery 🌼 account yet.\n\nVisit the web app and click "Connect Telegram".'
      );
    }
  });
}

// ──────────────────────────────────────────────────────────
// Token linking logic
// ──────────────────────────────────────────────────────────
async function handleTelegramLinking(
  ctx: CommandContext<Context>,
  rawToken: string,
  telegramUserId: string,
  telegramUsername: string | null
) {
  const tokenHash = await hashToken(rawToken);
  const now       = new Date();

  // Look up the hashed token
  const [tokenRecord] = await db
    .select()
    .from(telegramLinkTokens)
    .where(eq(telegramLinkTokens.token_hash, tokenHash))
    .limit(1);

  if (!tokenRecord) {
    console.warn(`[Telegram] Unknown token hash attempted — tg_user_id=${telegramUserId}`);
    await ctx.reply('❌ Invalid connection link. Please generate a new one from the web app.');
    return;
  }

  // Check expiry
  if (tokenRecord.expires_at < now) {
    await ctx.reply('⏰ This connection link has expired. Please generate a new one from the web app.');
    return;
  }

  // Check already used
  if (tokenRecord.used_at !== null) {
    await ctx.reply('⚠️ This connection link has already been used. Please generate a new one.');
    return;
  }

  // Prevent linking this Telegram account to a DIFFERENT Sery 🌼 user
  const [existingLink] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(
      and(
        eq(profiles.telegram_user_id, telegramUserId),
        ne(profiles.id, tokenRecord.user_id)
      )
    )
    .limit(1);

  if (existingLink) {
    await ctx.reply('⚠️ This Telegram account is already linked to a different Sery 🌼 account.');
    return;
  }

  // Consume the token
  await db
    .update(telegramLinkTokens)
    .set({ used_at: now })
    .where(eq(telegramLinkTokens.id, tokenRecord.id));

  // Associate Telegram identity with the profile
  await db
    .update(profiles)
    .set({
      telegram_user_id:   telegramUserId,
      telegram_username:  telegramUsername,
      telegram_linked_at: now,
      updated_at:         now,
    })
    .where(eq(profiles.id, tokenRecord.user_id));

  console.log(`[Telegram] Linked telegram_user_id=${telegramUserId} → profile user_id=${tokenRecord.user_id}`);
  await ctx.reply(
    '✅ Telegram connected successfully!\n\nYou can now use Sery 🌼 through Telegram. The email workflow is coming soon.'
  );
}

// ──────────────────────────────────────────────────────────
// Crypto helpers
// ──────────────────────────────────────────────────────────

/** SHA-256 hex digest of a raw token string */
async function hashToken(token: string): Promise<string> {
  const data       = new TextEncoder().encode(token);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/** 24-byte cryptographically random URL-safe base64 token (32 chars) */
function generateToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// ──────────────────────────────────────────────────────────
// POST /api/telegram/link/start
// Generates a short-lived deep-link token and returns the URL.
// ──────────────────────────────────────────────────────────
export async function handleTelegramLinkStart(req: Request): Promise<Response> {
  const authUser  = await getCurrentUser(req);
  const authError = requireAuth(authUser);
  if (authError) return authError;

  if (!authUser!.profile?.phone_number) {
    return Response.json(
      { error: 'Please complete your profile before linking Telegram' },
      { status: 400 }
    );
  }

  if (!BOT_USERNAME) {
    return Response.json({ error: 'Telegram bot not configured' }, { status: 503 });
  }

  const rawToken  = generateToken();
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min TTL

  // Invalidate any outstanding (unused) tokens for this user
  await db
    .update(telegramLinkTokens)
    .set({ used_at: new Date() })
    .where(
      and(
        eq(telegramLinkTokens.user_id, authUser!.id),
        isNull(telegramLinkTokens.used_at)
      )
    );

  // Insert the new token (only hash stored — raw token only travels via the deep link)
  await db.insert(telegramLinkTokens).values({
    user_id:    authUser!.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  const deepLink = `https://t.me/${BOT_USERNAME}?start=${rawToken}`;
  console.log(`[Telegram] Generated link token for user_id=${authUser!.id}`);

  return Response.json({ deep_link: deepLink });
}

// ──────────────────────────────────────────────────────────
// POST /api/telegram/webhook
// Receives Telegram Update objects from the Bot API.
// ──────────────────────────────────────────────────────────
export async function handleTelegramWebhook(req: Request): Promise<Response> {
  if (!bot) {
    return Response.json({ error: 'Bot not initialized' }, { status: 503 });
  }

  // Verify optional webhook secret
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secretToken) {
    const provided = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    if (provided !== secretToken) {
      return Response.json({ error: 'Invalid secret' }, { status: 403 });
    }
  }

  try {
    const update = await req.json() as Update;
    await bot.handleUpdate(update);
    return Response.json({ ok: true });
  } catch (err) {
    console.error('Webhook processing error:', err);
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
