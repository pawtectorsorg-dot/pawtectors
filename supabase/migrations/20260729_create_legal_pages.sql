BEGIN;

CREATE TABLE IF NOT EXISTS public.legal_pages (
    slug TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.legal_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view legal pages"
    ON public.legal_pages FOR SELECT
    USING (true);

COMMIT;