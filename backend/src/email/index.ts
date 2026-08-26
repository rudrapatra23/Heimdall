// ──────────────────────────────────────────────────────────
// Email module — public surface
// Best-effort sender for the early-access admin notification: it returns
// false (and logs) on failure and never throws, so callers can fire it
// without wrapping every call site.
// ──────────────────────────────────────────────────────────

import { sendEmail } from './client.ts';
import { adminNewApplication, type AdminNewApplicationArgs } from './templates.ts';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

export { sendEmail } from './client.ts';

/** Emails the admin (ADMIN_EMAIL) about a new applicant, with reply_to set to the applicant. */
export function sendAdminNewApplication(args: AdminNewApplicationArgs): Promise<boolean> {
  if (!ADMIN_EMAIL) {
    console.warn('[email] ADMIN_EMAIL not set — skipping admin new-application notification');
    return Promise.resolve(false);
  }
  const { subject, html } = adminNewApplication(args);
  return sendEmail({ to: ADMIN_EMAIL, subject, html, replyTo: args.email });
}
