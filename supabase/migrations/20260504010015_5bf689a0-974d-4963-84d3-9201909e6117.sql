DROP POLICY IF EXISTS "Admins delete articles" ON public.articles;
DROP POLICY IF EXISTS "Admins insert articles" ON public.articles;
DROP POLICY IF EXISTS "Admins update articles" ON public.articles;

CREATE POLICY "Public can insert articles" ON public.articles FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public can update articles" ON public.articles FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Public can delete articles" ON public.articles FOR DELETE TO anon, authenticated USING (true);