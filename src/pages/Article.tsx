import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/xiismo-logo.png";

type Article = {
  title: string;
  excerpt: string | null;
  content: string;
  published_at: string;
};

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    supabase
      .from("articles")
      .select("title, excerpt, content, published_at")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle()
      .then(({ data }) => {
        setArticle(data as Article | null);
        setLoading(false);
        if (data) document.title = `${data.title} · Xiismo`;
      });
  }, [slug]);

  return (
    <div className="min-h-screen bg-hero">
      <header className="border-b border-border/60 backdrop-blur-sm sticky top-0 z-50 bg-background/70">
        <div className="container flex items-center justify-between py-4">
          <Link to="/" className="flex items-center gap-3">
            <img src={logo} alt="Xiismo" className="h-10 w-10" />
            <span className="text-2xl font-semibold tracking-tight">Xiismo</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>
        </div>
      </header>

      <main className="container py-16 max-w-3xl">
        {loading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : !article ? (
          <div>
            <h1 className="text-3xl font-semibold mb-4">Artigo não encontrado</h1>
            <Link to="/" className="text-muted-foreground hover:text-foreground">← Voltar ao início</Link>
          </div>
        ) : (
          <article>
            <h1 className="text-4xl md:text-5xl font-semibold mb-4 text-balance">{article.title}</h1>
            <p className="text-sm text-muted-foreground mb-10">
              {new Date(article.published_at).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}
            </p>
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">{article.excerpt}</p>
            )}
            <div className="prose prose-invert max-w-none whitespace-pre-wrap text-base leading-relaxed text-foreground/90">
              {article.content}
            </div>
          </article>
        )}
      </main>
    </div>
  );
};

export default Article;
