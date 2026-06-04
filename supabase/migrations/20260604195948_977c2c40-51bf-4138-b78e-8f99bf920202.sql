
CREATE TABLE IF NOT EXISTS public.city_pins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  state text,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  kind text NOT NULL CHECK (kind IN ('profile','mosque')),
  profile_username text,
  mosque_name text,
  address text,
  link text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.city_pins TO anon, authenticated;
GRANT ALL ON public.city_pins TO service_role;
ALTER TABLE public.city_pins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read city_pins" ON public.city_pins FOR SELECT USING (true);
CREATE POLICY "Public insert city_pins" ON public.city_pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update city_pins" ON public.city_pins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete city_pins" ON public.city_pins FOR DELETE USING (true);

DELETE FROM public.site_settings WHERE key IN ('logo_url','og_image_url');
