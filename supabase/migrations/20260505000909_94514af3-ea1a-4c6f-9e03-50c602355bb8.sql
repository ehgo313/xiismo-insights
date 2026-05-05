
-- Articles: add featured, author, references footer
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS author_username text,
  ADD COLUMN IF NOT EXISTS references_footer text;

-- Profiles table (public-managed via password-protected admin)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL UNIQUE,
  display_name text NOT NULL,
  avatar_url text,
  role text NOT NULL DEFAULT 'Membro',
  description text,
  religion text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public can insert profiles" ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update profiles" ON public.profiles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete profiles" ON public.profiles FOR DELETE TO anon, authenticated USING (true);

CREATE TRIGGER profiles_set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Avatar storage
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Avatars public read" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatars public write" ON storage.objects FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatars public update" ON storage.objects FOR UPDATE TO anon, authenticated USING (bucket_id = 'avatars');
CREATE POLICY "Avatars public delete" ON storage.objects FOR DELETE TO anon, authenticated USING (bucket_id = 'avatars');
