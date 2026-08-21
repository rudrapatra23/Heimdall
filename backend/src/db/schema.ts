import {
  pgTable,
  uuid,
  text,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// ──────────────────────────────────────────────────────────
// profiles
// One row per Supabase auth.users entry (1:1 mapping).
// id = auth.users.id — the canonical user identity.
// ──────────────────────────────────────────────────────────
export const profiles = pgTable('profiles', {
  // Must match auth.users.id exactly — set by the DB trigger on sign-up.
  id:               uuid('id').primaryKey(),
  email:            text('email').notNull(),
  full_name:        text('full_name'),
  // Contact phone — NOT OTP-verified. Stored in E.164 format where possible.
  phone_number:     text('phone_number'),
  // Stable Telegram numeric user ID. Prefer this over telegram_username.
  telegram_user_id: text('telegram_user_id').unique(),
  telegram_username:  text('telegram_username'),
  telegram_linked_at: timestamp('telegram_linked_at', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// ──────────────────────────────────────────────────────────
// telegram_link_tokens
// Single-use, 15-minute TTL tokens for Telegram deep-link
// account linking. Only the SHA-256 hash is stored.
// ──────────────────────────────────────────────────────────
export const telegramLinkTokens = pgTable(
  'telegram_link_tokens',
  {
    id:         uuid('id').primaryKey().defaultRandom(),
    user_id:    uuid('user_id').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
    // SHA-256 hex of the raw token. Raw token is never stored.
    token_hash: text('token_hash').notNull().unique(),
    expires_at: timestamp('expires_at', { withTimezone: true }).notNull(),
    // Non-null once consumed (linked or intentionally invalidated).
    used_at:    timestamp('used_at', { withTimezone: true }),
    created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_telegram_link_tokens_user_id').on(table.user_id),
  ]
);

// ──────────────────────────────────────────────────────────
// gmail_credentials
// Future: Gmail OAuth tokens per user.
// Schema prepared now; NOT used in current phase.
// NEVER expose these columns to the frontend.
// ──────────────────────────────────────────────────────────
export const gmailCredentials = pgTable('gmail_credentials', {
  id:            uuid('id').primaryKey().defaultRandom(),
  user_id:       uuid('user_id').notNull().unique().references(() => profiles.id, { onDelete: 'cascade' }),
  access_token:  text('access_token'),   // Short-lived; refresh before use.
  refresh_token: text('refresh_token'),  // Long-lived; store securely.
  token_expiry:  timestamp('token_expiry', { withTimezone: true }),
  scope:         text('scope'),          // Comma-separated OAuth scopes granted.
  created_at:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

// Exported type helpers — inferred directly from schema
export type Profile             = typeof profiles.$inferSelect;
export type NewProfile          = typeof profiles.$inferInsert;
export type TelegramLinkToken   = typeof telegramLinkTokens.$inferSelect;
export type NewTelegramLinkToken = typeof telegramLinkTokens.$inferInsert;
export type GmailCredential     = typeof gmailCredentials.$inferSelect;
