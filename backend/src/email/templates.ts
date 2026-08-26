// ──────────────────────────────────────────────────────────
// Transactional email templates (HTML)
//
// One email: adminNewApplication — sent to the admin whenever someone
// applies for early access. User-controlled values (name, email, "how did
// you hear") are always passed through escapeHtml() before interpolation.
// ──────────────────────────────────────────────────────────

// User-facing brand name. The frontend ships as "Sery"; override via env if it changes.
const PRODUCT_NAME = process.env.PRODUCT_NAME ?? 'Sery';

// Logo source for emails. Must be a public URL (or base64 data URI) —
// email clients cannot load local filesystem paths.
// Swap this once the frontend is deployed, e.g.:
// const LOGO_SRC = 'https://yourdomain.com/assets/app_logo.png';
const LOGO_SRC = process.env.LOGO_URL ?? '';

export interface EmailContent {
  subject: string;
  html: string;
}

/** Escapes the five HTML-significant characters. */
function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Shared responsive shell around each email's body. */
function layout(bodyHtml: string): string {
  const logoBlock = LOGO_SRC
    ? `<img src="${LOGO_SRC}" alt="${PRODUCT_NAME}" width="28" height="28" style="display:block;border-radius:6px;" />`
    : '';

  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background-color:#0b0b0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b0b0f;padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#15151c;border-radius:16px;overflow:hidden;border:1px solid #26262f;">

            <!-- Header -->
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid #21212a;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    ${logoBlock ? `<td style="padding-right:10px;">${logoBlock}</td>` : ''}
                    <td>
                      <span style="font-size:16px;font-weight:700;letter-spacing:0.01em;color:#ffffff;">${PRODUCT_NAME}</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:32px;color:#c9c9d4;font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 32px 28px;border-top:1px solid #21212a;">
                <span style="font-size:12px;color:#5a5a66;">This is an automated notification from ${PRODUCT_NAME}.</span>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export interface AdminNewApplicationArgs {
  name: string;
  email: string;
  howDidYouKnow: string;
  status: string;
}

/** Sent to the admin whenever someone applies for early access. */
export function adminNewApplication({
  name,
  email,
  howDidYouKnow,
  status,
}: AdminNewApplicationArgs): EmailContent {
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeHow = escapeHtml(howDidYouKnow);
  const isRepeat = status !== 'pending';

  const row = (label: string, value: string) =>
    `<tr>
      <td style="padding:10px 0;color:#7a7a86;font-size:13px;width:140px;vertical-align:top;border-bottom:1px solid #1e1e26;">${label}</td>
      <td style="padding:10px 0;color:#ffffff;font-size:14px;border-bottom:1px solid #1e1e26;">${value}</td>
    </tr>`;

  const statusBadge = isRepeat
    ? `<span style="display:inline-block;padding:3px 10px;border-radius:20px;background-color:#2a2410;color:#e8d48a;font-size:12px;font-weight:600;">re-submitted · ${escapeHtml(status)}</span>`
    : `<span style="display:inline-block;padding:3px 10px;border-radius:20px;background-color:#132a1c;color:#7ee8a8;font-size:12px;font-weight:600;">new applicant</span>`;

  return {
    subject: `New ${PRODUCT_NAME} early-access request — ${safeName}`,
    html: layout(`
      <div style="margin-bottom:20px;">
        ${statusBadge}
      </div>
      <h1 style="margin:0 0 24px;font-size:20px;color:#ffffff;font-weight:700;">New early-access request</h1>
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${row('Name', safeName)}
        ${row('Email', `<a href="mailto:${safeEmail}" style="color:#8ab4f8;text-decoration:none;">${safeEmail}</a>`)}
        ${row('How they heard', safeHow)}
      </table>
      <p style="margin:24px 0 0;color:#7a7a86;font-size:13px;">Reply to this email to reach the applicant directly.</p>
    `),
  };
}