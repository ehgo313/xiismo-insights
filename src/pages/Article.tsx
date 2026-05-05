import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/xiismo-logo.png";
import { renderArticleBody, renderInline } from "@/lib/articleContent";

type Article = {
  title: string;
  excerpt: string | null;
  content: string;
  published_at: string;
  author_username: string | null;
  references_footer: string | null;
};

type Author = { username: string; display_name: string; avatar_url: string | null; role: string };

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [author, setAuthor] = useState<Author | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("articles")
        .select("title, excerpt, content, published_at, author_username, references_footer")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setArticle(data as Article | null);
      setLoading(false);
      if (data) {
        document.title = `${data.title} · Xiismo`;
        if ((data as Article).author_username) {
          const { data: p } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url, role")
            .eq("username", (data as Article).author_username!)
            .maybeSingle();
          setAuthor(p as Author | null);
        }
      }
    })();
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
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-10">
              {author && (
                <Link to={`/${author.username}`} className="flex items-center gap-2 hover:text-foreground">
                  {author.avatar_url && <img src={author.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />}
                  <span>{author.display_name}</span>
                </Link>
              )}
              {author && <span>·</span>}
              <span>{new Date(article.published_at).toLocaleDateString("pt-PT", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            {article.excerpt && (
              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">{article.excerpt}</p>
            )}
            <div className="max-w-none text-base leading-relaxed text-foreground/90 space-y-4">
              {renderArticleBody(article.content)}
            </div>

            {article.references_footer && article.references_footer.trim() && (
              <footer className="mt-16 pt-6 border-t border-border/60">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">Referências</h2>
                <div className="text-xs text-muted-foreground/90 leading-relaxed space-y-2">
                  {article.references_footer.split("\n").map((line, i) =>
                    line.trim() === "" ? <div key={i} className="h-1" /> : <p key={i}>{renderInline(line)}</p>
                  )}
                </div>
              </footer>
            )}
          </article>
        )}
      </main>
    </div>
  );
};

export default Article;
