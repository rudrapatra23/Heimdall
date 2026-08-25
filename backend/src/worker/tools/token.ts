import { google } from "googleapis";
import { sql } from "../../heimdall/db";

interface GmailCredentialRow {
  id: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string; // timestamptz
  scope: string;
}

/**
 * Returns a valid Gmail access token for the user, refreshing it first
 * if it's expired (or about to expire within 60s). Requires GOOGLE_CLIENT_ID
 * and GOOGLE_CLIENT_SECRET env vars -- the same OAuth client Supabase uses
 * for the Google login, so reuse those values.
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const rows = await sql<GmailCredentialRow[]>`
    select * from gmail_credentials where user_id = ${userId} limit 1
  `;
  const cred = rows[0];
  if (!cred) {
    throw new Error(`No gmail_credentials row for user ${userId} -- they haven't connected Gmail yet.`);
  }

  const expiresAt = new Date(cred.token_expiry).getTime();
  const isExpiringSoon = expiresAt - Date.now() < 60_000;

  if (!isExpiringSoon) {
    return cred.access_token;
  }

  // Token's expired or close to it -- refresh using the stored refresh_token.
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  oauth2Client.setCredentials({ refresh_token: cred.refresh_token });

  const { credentials } = await oauth2Client.refreshAccessToken();
  if (!credentials.access_token) {
    throw new Error(`Failed to refresh Gmail token for user ${userId} -- refresh_token may be invalid/revoked.`);
  }

  const newExpiry = credentials.expiry_date
    ? new Date(credentials.expiry_date).toISOString()
    : new Date(Date.now() + 3600_000).toISOString();

  await sql`
    update gmail_credentials
    set access_token = ${credentials.access_token},
        token_expiry = ${newExpiry},
        updated_at = now()
    where user_id = ${userId}
  `;

  return credentials.access_token;
}
