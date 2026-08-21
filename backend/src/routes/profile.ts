import { eq } from 'drizzle-orm';
import { db, profiles } from '../db/index.ts';
import { getCurrentUser, requireAuth } from '../middleware/auth.ts';

// ──────────────────────────────────────────────────────────
// Phone normalization — E.164 format
// ──────────────────────────────────────────────────────────
function normalizePhone(phone: string): string {
  // Strip everything except digits and leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;       // Already E.164-ish
  if (cleaned.length === 10) return `+91${cleaned}`; // Indian 10-digit shorthand
  return `+${cleaned}`;                               // Fallback: prepend +
}

// ──────────────────────────────────────────────────────────
// GET /api/profile
// ──────────────────────────────────────────────────────────
export async function handleGetProfile(req: Request): Promise<Response> {
  const authUser = await getCurrentUser(req);
  const authError = requireAuth(authUser);
  if (authError) return authError;

  return Response.json({ profile: authUser!.profile });
}

// ──────────────────────────────────────────────────────────
// POST /api/profile
// Body: { full_name: string; phone_number: string }
// ──────────────────────────────────────────────────────────
export async function handlePostProfile(req: Request): Promise<Response> {
  const authUser = await getCurrentUser(req);
  const authError = requireAuth(authUser);
  if (authError) return authError;

  let body: { full_name?: string; phone_number?: string };
  try {
    body = await req.json() as { full_name?: string; phone_number?: string };
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { full_name, phone_number } = body;

  if (!phone_number?.trim()) {
    return Response.json({ error: 'phone_number is required' }, { status: 400 });
  }
  if (!full_name?.trim()) {
    return Response.json({ error: 'full_name is required' }, { status: 400 });
  }

  const normalizedPhone = normalizePhone(phone_number.trim());
  const now = new Date();

  try {
    const [profile] = await db
      .insert(profiles)
      .values({
        id:           authUser!.id,
        email:        authUser!.email,
        full_name:    full_name.trim(),
        phone_number: normalizedPhone,
        updated_at:   now,
      })
      .onConflictDoUpdate({
        target: profiles.id,
        set: {
          full_name:    full_name.trim(),
          phone_number: normalizedPhone,
          updated_at:   now,
        },
      })
      .returning();

    return Response.json({ profile }, { status: 200 });
  } catch (err) {
    console.error('Profile upsert error:', err);
    return Response.json({ error: 'Failed to save profile' }, { status: 500 });
  }
}
