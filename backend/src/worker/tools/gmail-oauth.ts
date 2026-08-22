import { google } from "googleapis";
import { sql } from "../../heimdall/db";

const GMAIL_SCOPES = [
  "https://www.googleapis.com/auth/gmail.readonly",
  "https://www.googleapis.com/auth/gmail.send",
];

function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI // e.g. http://localhost:4000/auth/gmail/callback
  );
}

/**
 * Step 1: send the user here to grant Gmail access.
 * userId is threaded through as `state` so the callback knows who to save
 * the tokens against -- swap this for your real session/JWT lookup if you'd
 * rather not trust a client-supplied userId.
 */
export function getGoogleAuthUrl(userId: string): string {
  const client = oauthClient();
  return client.generateAuthUrl({
    access_type: "offline", // required to get a refresh_token
    prompt: "consent",      // forces Google to re-issue a refresh_token even on repeat connects
    scope: GMAIL_SCOPES,
    state: userId,
  });
}

/**
 * Step 2: Google redirects here with ?code=...&state=<userId> after consent.
 * Exchanges the code for tokens and upserts them into gmail_credentials.
 */
export async function handleGoogleCallback(code: string, userId: string) {
  const client = oauthClient();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token) {
    throw new Error(
      "Google did not return a refresh_token. This usually means the user already " +
        "granted access before without revoking it first -- have them remove app access " +
        "at https://myaccount.google.com/permissions and try connecting again."
    );
  }

  const expiry = tokens.expiry_date
    ? new Date(tokens.expiry_date).toISOString()
    : new Date(Date.now() + 3600_000).toISOString();

  await sql`
    insert into gmail_credentials (user_id, access_token, refresh_token, token_expiry, scope)
    values (${userId}, ${tokens.access_token}, ${tokens.refresh_token}, ${expiry}, ${GMAIL_SCOPES.join(" ")})
    on conflict (user_id) do update set
      access_token = excluded.access_token,
      refresh_token = excluded.refresh_token,
      token_expiry = excluded.token_expiry,
      scope = excluded.scope,
      updated_at = now()
  `;
}
