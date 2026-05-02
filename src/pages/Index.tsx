import { useState } from "react";
import { Search, MessageCircle, Hash, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import logo from "@/assets/xiismo-logo.png";

const ARTICLES = [
  { title: "Quem foi o Imam Ali (a.s.)?", excerpt: "A vida e o legado do primeiro Imam dos xiitas, primo e genro do Profeta Muhammad (s.a.w.)." },
  { title: "O Significado de Ashura", excerpt: "Compreendendo o martírio do Imam Hussein (a.s.) em Karbala e suas lições eternas." },
  { title: "Os Doze Imames", excerpt: "Uma introdução à linhagem dos Ahlul Bayt e a doutrina da Imamah." },
  { title: "Ghadir Khumm", excerpt: "O evento histórico em que o Profeta declarou Ali como seu sucessor." },
  { title: "Taqiyya: Verdade e Mal-entendidos", excerpt: "Esclarecendo um dos conceitos mais debatidos da jurisprudência xiita." },
  { title: "A Ocultação do Imam Mahdi (a.j.)", excerpt: "A crença na vinda do salvador prometido e o tempo da Ghaybah." },
];

const Index = () => {
  const [query, setQuery] = useState("");
  const filtered = ARTICLES.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.excerpt.toLowerCase().includes(query.toLowerCase())
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
            <a href="#comunidade" className="hover:text-foreground transition-colors">Comunidade</a>
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
            className="mx-auto h-32 w-32 md:h-40 md:w-40 mb-8 shadow-glow"
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
              <a href="https://wa.me/" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Canal no WhatsApp
              </a>
            </Button>
            <Button
              asChild
              size="lg"
              className="h-12 px-8 bg-discord hover:bg-discord/90 text-white"
            >
              <a href="https://discord.gg/" target="_blank" rel="noopener noreferrer">
                <Hash className="mr-2 h-5 w-5" />
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
              <article
                key={article.title}
                className="group p-6 bg-card border border-border rounded-md hover:border-foreground/40 transition-all hover:shadow-glow cursor-pointer"
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
              </article>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer id="sobre" className="border-t border-border/60 mt-16">
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
