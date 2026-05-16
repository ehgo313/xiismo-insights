import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.331c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z"/>
  </svg>
);
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/xiismo-logo.png";

type Article = { id: string; title: string; slug: string; excerpt: string | null; featured: boolean };

const Index = () => {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    supabase
      .from("articles")
      .select("id, title, slug, excerpt, featured")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .then(({ data }) => setArticles((data as Article[]) ?? []));
  }, []);

  const visible = query ? articles : articles.filter((a) => a.featured);
  const filtered = visible.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    (a.excerpt ?? "").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-hero">
      {/* Header */}
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-50 bg-background/70">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Logo Xiismo" className="h-10 w-10" />
            <span className="text-2xl font-semibold tracking-tight">Xiismo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#artigos" className="hover:text-foreground transition-colors">Artigos</a>
            
            <a href="#sobre" className="hover:text-foreground transition-colors">Sobre</a>
          </nav>
        </div>
      </header>

      {/* Hero + Search */}
      <section className="container py-20 md:py-32 text-center">
        <div className="mx-auto max-w-3xl">
          <img
            src={logo}
            alt="Xiismo - Portal de conhecimento xiita"
            className="mx-auto h-32 w-32 md:h-40 md:w-40 mb-8 object-contain"
          />
          <h1 className="text-5xl md:text-7xl font-semibold text-balance mb-6">
            Xiismo
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground text-balance mb-12 max-w-2xl mx-auto">
            Conhecimento, espiritualidade e a tradição dos Ahlul Bayt (a.s.).
            Um portal dedicado ao estudo do Islam Xiita.
          </p>

          {/* Search */}
          <div className="relative max-w-2xl mx-auto mb-8">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Procurar artigo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-14 pl-14 pr-4 text-base bg-card border-border focus-visible:ring-foreground/40"
            />
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-whatsapp hover:bg-whatsapp/90 text-white"
            >
              <a href="https://whatsapp.com/channel/0029Vb7QkKRKGGGLsj37VQ0B" target="_blank" rel="noopener noreferrer">
                <WhatsAppIcon className="mr-2 h-5 w-5" />
                Canal no WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-discord hover:bg-discord/90 text-white"
            >
              <a href="https://discord.gg/jg5mFAs9kz" target="_blank" rel="noopener noreferrer">
                <DiscordIcon className="mr-2 h-5 w-5" />
                Servidor no Discord
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Articles */}
      <section id="artigos" className="container pb-24">
        <div className="flex items-center gap-3 mb-10">
          <BookOpen className="h-6 w-6 text-muted-foreground" />
          <h2 className="text-3xl md:text-4xl font-semibold">
            {query ? `Resultados (${filtered.length})` : "Artigos em destaque"}
          </h2>
        </div>

        {filtered.length === 0 ? (
          <p className="text-muted-foreground text-center py-16">
            Nenhum artigo encontrado para "{query}".
          </p>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((article) => (
              <Link
                to={`/artigo/${article.slug}`}
                key={article.id}
                className="group p-6 bg-card border border-border rounded-md hover:border-foreground/40 transition-all block"
              >
                <h3 className="text-2xl font-semibold mb-3 group-hover:text-foreground transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {article.excerpt}
                </p>
                <span className="inline-block mt-4 text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                  Ler artigo →
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* About */}
      <section id="sobre" className="container pb-24">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-3xl md:text-4xl font-semibold">Sobre</h2>
          </div>
          <div className="p-8 md:p-10 bg-card border border-border rounded-md">
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              O portal Xiismo nasceu do desejo de centralizar e difundir o conhecimento, a espiritualidade e as ricas tradições dos Ahlul Bayt (a.s.). O projeto começou em 2024, quando criei um perfil dedicado a partilhar conteúdos e reflexões sobre o Islam Xiita. Agora, em 2026, com o objetivo de dar um passo mais além e facilitar o acesso à informação de qualidade para a comunidade, desenvolvi este site para reunir artigos e materiais de estudo num único espaço.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60">
        <div className="container py-10 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-3">
            <img src={logo} alt="" className="h-6 w-6" />
            <span className="font-semibold text-foreground">Xiismo</span>
          </div>
          <p>"Estou deixando entre vocês duas coisas pesadas: o Livro de Allah e minha família" — Hadith Thaqalain</p>
          <p className="mt-2 opacity-60">© {new Date().getFullYear()} Xiismo. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
