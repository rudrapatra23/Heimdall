// ──────────────────────────────────────────────────────────
// Gmail SMTP email client
// Sends mail from a personal Gmail account via nodemailer, authenticating
// with a Gmail App Password (requires 2-Step Verification on the account).
// The From: address is your Gmail address.
//
// Sends are best-effort: a failure is logged and returns false, and callers
// MUST NOT let it break the surrounding request flow.
// ──────────────────────────────────────────────────────────

import nodemailer, { type Transporter } from 'nodemailer';

const GMAIL_USER = process.env.GMAIL_USER;
// App password (https://myaccount.google.com/apppasswords). Spaces are tolerated.
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
// Optional display name/address. Gmail forces the address to GMAIL_USER, but a
// display name works, e.g. "Sery <you@gmail.com>". Defaults to GMAIL_USER.
const EMAIL_FROM = process.env.EMAIL_FROM || GMAIL_USER;

export interface SendEmailArgs {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

let transporter: Transporter | null = null;

/** Lazily builds (and memoizes) the Gmail SMTP transport. Null if creds are missing. */
function getTransporter(): Transporter | null {
  if (transporter) return transporter;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });
  return transporter;
}

/**
 * Sends an email from the configured Gmail account. Returns true on success,
 * false on any failure (missing credentials, auth error, send error). Never throws.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs): Promise<boolean> {
  const tx = getTransporter();
  if (!tx) {
    console.warn(`[email] GMAIL_USER / GMAIL_APP_PASSWORD not set — skipping send: "${subject}"`);
    return false;
  }

  try {
    await tx.sendMail({
      from: EMAIL_FROM,
      to,
      subject,
      html,
      ...(replyTo ? { replyTo } : {}),
    });
    return true;
  } catch (err) {
    console.error(`[email] Gmail send error for "${subject}":`, err);
    return false;
  }
}
