
-- Roles enum + table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Articles
CREATE TABLE public.articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  published BOOLEAN NOT NULL DEFAULT true,
  published_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read published articles" ON public.articles
  FOR SELECT USING (published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins insert articles" ON public.articles
  FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update articles" ON public.articles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete articles" ON public.articles
  FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER articles_updated_at BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seed initial articles
INSERT INTO public.articles (title, slug, excerpt, content) VALUES
('Quem foi o Imam Ali (a.s.)?', 'quem-foi-imam-ali', 'A vida e o legado do primeiro Imam dos xiitas, primo e genro do Profeta Muhammad (s.a.w.).', E'# Quem foi o Imam Ali (a.s.)?\n\nEscreva aqui o conteúdo completo do artigo.'),
('O Significado de Ashura', 'significado-de-ashura', 'Compreendendo o martírio do Imam Hussein (a.s.) em Karbala e suas lições eternas.', E'# O Significado de Ashura\n\nEscreva aqui o conteúdo completo do artigo.'),
('Os Doze Imames', 'os-doze-imames', 'Uma introdução à linhagem dos Ahlul Bayt e a doutrina da Imamah.', E'# Os Doze Imames\n\nEscreva aqui o conteúdo completo do artigo.'),
('Ghadir Khumm', 'ghadir-khumm', 'O evento histórico em que o Profeta declarou Ali como seu sucessor.', E'# Ghadir Khumm\n\nEscreva aqui o conteúdo completo do artigo.'),
('Taqiyya: Verdade e Mal-entendidos', 'taqiyya', 'Esclarecendo um dos conceitos mais debatidos da jurisprudência xiita.', E'# Taqiyya\n\nEscreva aqui o conteúdo completo do artigo.'),
('A Ocultação do Imam Mahdi (a.j.)', 'ocultacao-imam-mahdi', 'A crença na vinda do salvador prometido e o tempo da Ghaybah.', E'# A Ocultação do Imam Mahdi\n\nEscreva aqui o conteúdo completo do artigo.');
