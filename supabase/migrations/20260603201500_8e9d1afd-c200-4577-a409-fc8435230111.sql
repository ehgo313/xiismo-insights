
CREATE TABLE public.map_markers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('person','mosque')),
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  profile_username text,
  mosque_name text,
  mosque_photo_url text,
  mosque_address text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.map_markers TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.map_markers TO authenticated;
GRANT ALL ON public.map_markers TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.map_markers TO anon;
ALTER TABLE public.map_markers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read markers" ON public.map_markers FOR SELECT USING (true);
CREATE POLICY "Public insert markers" ON public.map_markers FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update markers" ON public.map_markers FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete markers" ON public.map_markers FOR DELETE USING (true);
CREATE TRIGGER trg_map_markers_updated BEFORE UPDATE ON public.map_markers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.site_settings (
  key text PRIMARY KEY,
  value text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.site_settings TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_settings TO anon;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read settings" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Public insert settings" ON public.site_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update settings" ON public.site_settings FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete settings" ON public.site_settings FOR DELETE USING (true);

CREATE TABLE public.access_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  label text NOT NULL,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.access_keys TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.access_keys TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.access_keys TO anon;
GRANT ALL ON public.access_keys TO service_role;
ALTER TABLE public.access_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone read keys" ON public.access_keys FOR SELECT USING (true);
CREATE POLICY "Public insert keys" ON public.access_keys FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update keys" ON public.access_keys FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete keys" ON public.access_keys FOR DELETE USING (true);
