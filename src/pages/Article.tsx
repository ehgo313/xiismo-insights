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
  author_username_2: string | null;
  author_username_3: string | null;
  references_footer: string | null;
};

type Author = { username: string; display_name: string; avatar_url: string | null; role: string };

const Article = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from("articles")
        .select("title, excerpt, content, published_at, author_username, author_username_2, author_username_3, references_footer")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      setArticle(data as Article | null);
      setLoading(false);
      if (data) {
        document.title = `${data.title} · Xiismo`;
        const d = data as Article;
        const usernames = [d.author_username, d.author_username_2, d.author_username_3].filter(Boolean) as string[];
        if (usernames.length) {
          const { data: ps } = await supabase
            .from("profiles")
            .select("username, display_name, avatar_url, role")
            .in("username", usernames);
          const list = (ps as Author[]) ?? [];
          // preserve ordering
          setAuthors(usernames.map((u) => list.find((a) => a.username === u)).filter(Boolean) as Author[]);
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
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-10 flex-wrap">
              {authors.map((a, idx) => (
                <span key={a.username} className="flex items-center gap-2">
                  <Link to={`/${a.username}`} className="flex items-center gap-2 hover:text-foreground">
                    {a.avatar_url && <img src={a.avatar_url} alt="" className="h-7 w-7 rounded-full object-cover" />}
                    <span>{a.display_name}</span>
                  </Link>
                  {idx < authors.length - 1 && <span>,</span>}
                </span>
              ))}
              {authors.length > 0 && <span>·</span>}
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
