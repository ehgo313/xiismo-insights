CREATE TABLE public.conversion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  whatsapp text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.conversion_requests TO anon, authenticated;
GRANT ALL ON public.conversion_requests TO service_role;
ALTER TABLE public.conversion_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public insert conversion" ON public.conversion_requests FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public read conversion" ON public.conversion_requests FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Public delete conversion" ON public.conversion_requests FOR DELETE TO anon, authenticated USING (true);