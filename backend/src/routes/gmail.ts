import { eq } from 'drizzle-orm';
import { db, gmailCredentials, profiles } from '../db/index.ts';
import { getCurrentUser, requireAuth } from '../middleware/auth.ts';

interface StoreCredentialsBody {
  access_token?: string;
  refresh_token?: string;
}

/**
 * POST /api/gmail/store-credentials
 *
 * Called right after the OAuth callback, while the browser still has the
 * short-lived provider_token/provider_refresh_token from Supabase's session.
 * Upserts them into gmail_credentials keyed by user_id, so the backend can
 * later mint fresh Gmail/Calendar access tokens independent of the user's
 * Supabase session state.
 */
export async function handleStoreGmailCredentials(req: Request): Promise<Response> {
  const authUser = await getCurrentUser(req);
  const authError = requireAuth(authUser);
  if (authError) return authError;

  let body: StoreCredentialsBody;
  try {
        body = (await req.json()) as StoreCredentialsBody;
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { access_token, refresh_token } = body;
  if (!access_token || !refresh_token) {
    return Response.json(
      { error: 'access_token and refresh_token are required' },
      { status: 400 }
    );
  }

  // Google access tokens are short-lived (~1hr). Store an expiry estimate so
  // the refresh logic knows when to mint a new one rather than guessing.
  const tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);

  try {
    // Defense-in-depth: gmail_credentials.user_id FKs to profiles.id. The
    // handle_new_user DB trigger normally guarantees a profile exists at
    // sign-up, but this callback can fire before onboarding creates one — so
    // ensure a minimal profile row exists rather than surfacing an FK error.
    if (!authUser!.profile) {
      await db
        .insert(profiles)
        .values({ id: authUser!.id, email: authUser!.email })
        .onConflictDoNothing({ target: profiles.id });
    }

    const existing = await db
      .select()
      .from(gmailCredentials)
      .where(eq(gmailCredentials.user_id, authUser!.id))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(gmailCredentials)
        .set({
          access_token,
          refresh_token,
          token_expiry: tokenExpiry,
          updated_at: new Date(),
        })
        .where(eq(gmailCredentials.user_id, authUser!.id));
    } else {
      await db.insert(gmailCredentials).values({
        user_id: authUser!.id,
        access_token,
        refresh_token,
        token_expiry: tokenExpiry,
      });
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error('Failed to store Gmail credentials:', err);
    return Response.json({ error: 'Failed to store credentials' }, { status: 500 });
  }
}