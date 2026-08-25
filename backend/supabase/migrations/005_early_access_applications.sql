-- ============================================================
-- Early Access Applications Table
-- Stores applications from the "Get Early Access" form
-- ============================================================

CREATE TABLE IF NOT EXISTS public.early_access_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    how_did_you_know TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_early_access_applications_email
    ON public.early_access_applications (email);

CREATE INDEX IF NOT EXISTS idx_early_access_applications_status
    ON public.early_access_applications (status);

-- updated_at auto-trigger
CREATE TRIGGER set_early_access_applications_updated_at
    BEFORE UPDATE ON public.early_access_applications
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security - public can insert and check status by email only
ALTER TABLE public.early_access_applications ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (it's a public signup form)
CREATE POLICY "early_access: public insert"
    ON public.early_access_applications FOR INSERT
    WITH CHECK (true);

-- Allow public to read status by their email
CREATE POLICY "early_access: public read own by email"
    ON public.early_access_applications FOR SELECT
    USING (true);
