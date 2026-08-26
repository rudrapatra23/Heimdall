import { eq } from 'drizzle-orm';
import { db, earlyAccessApplications } from '../db/index.ts';
import { sendAdminNewApplication } from '../email/index.ts';

const HEARD_OPTIONS = [
  'Search Engine (Google, etc.)',
  'LinkedIn / Twitter / Social Media',
  'Friend / Colleague referral',
  'Newsletter / Blog',
  'Event / Conference',
  'Other',
];

export async function handleGetHeardOptions(): Promise<Response> {
  return Response.json({ options: HEARD_OPTIONS });
}

export async function handleGetApplicationStatus(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const application = await db
    .select({
      id: earlyAccessApplications.id,
      email: earlyAccessApplications.email,
      status: earlyAccessApplications.status,
      created_at: earlyAccessApplications.created_at,
    })
    .from(earlyAccessApplications)
    .where(eq(earlyAccessApplications.email, email))
    .limit(1);

  if (application.length === 0) {
    return Response.json({ exists: false, approved: false });
  }

  const app = application[0];
  return Response.json({
    exists: true,
    approved: app.status === 'approved',
    status: app.status,
    applied_at: app.created_at,
  });
}

export async function handleCreateEarlyAccess(req: Request): Promise<Response> {
  let body: { name?: string; email?: string; how_did_you_know?: string };
  try {
    body = await req.json() as { name?: string; email?: string; how_did_you_know?: string };
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, email, how_did_you_know } = body;

  if (!name?.trim()) {
    return Response.json({ error: 'Name is required' }, { status: 400 });
  }
  if (!email?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: 'A valid email is required' }, { status: 400 });
  }
  if (!how_did_you_know?.trim()) {
    return Response.json({ error: 'Please tell us how you heard about Sery' }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const now = new Date();

  try {
    const [application] = await db
      .insert(earlyAccessApplications)
      .values({
        name:             name.trim(),
        email:            normalizedEmail,
        how_did_you_know: how_did_you_know.trim(),
        status:           'pending',
        created_at:       now,
        updated_at:       now,
      })
      .onConflictDoUpdate({
        target: earlyAccessApplications.email,
        set: {
          name:             name.trim(),
          how_did_you_know: how_did_you_know.trim(),
          updated_at:       now,
        },
      })
      .returning({
        id: earlyAccessApplications.id,
        email: earlyAccessApplications.email,
        status: earlyAccessApplications.status,
        created_at: earlyAccessApplications.created_at,
      });

    if (!application) {
      return Response.json({ error: 'Failed to submit application' }, { status: 500 });
    }

    // Notify the admin of the new request. Best-effort: the sender logs and
    // returns false on failure and never throws, so a saved application is
    // never turned into an error response. reply_to is the applicant, so the
    // admin can reply directly to reach them.
    await sendAdminNewApplication({
      name:          name.trim(),
      email:         application.email,
      howDidYouKnow: how_did_you_know.trim(),
      status:        application.status,
    });

    return Response.json(
      {
        application: {
          id: application.id,
          email: application.email,
          status: application.status,
          created_at: application.created_at,
        },
        message: 'Application received. We review every request personally.',
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Early access application error:', err);
    return Response.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
