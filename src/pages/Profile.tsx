import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/xiismo-logo.png";

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  description: string | null;
  religion: string | null;
};

type Article = { id: string; title: string; slug: string; excerpt: string | null };

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!username) return;
    (async () => {
      const { data: p } = await supabase
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();
      setProfile(p as Profile | null);
      if (p) {
        document.title = `${(p as Profile).display_name} · Xiismo`;
        const { data: arts } = await supabase
          .from("articles")
          .select("id, title, slug, excerpt")
          .eq("author_username", username)
          .eq("published", true)
          .order("published_at", { ascending: false });
        setArticles((arts as Article[]) ?? []);
      }
      setLoading(false);
    })();
  }, [username]);

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
        ) : !profile ? (
          <div>
            <h1 className="text-3xl font-semibold mb-4">Perfil não encontrado</h1>
            <Link to="/" className="text-muted-foreground hover:text-foreground">← Voltar ao início</Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-12">
              {profile.avatar_url ? (
                <img src={profile.avatar_url} alt={profile.display_name} className="h-32 w-32 rounded-full object-cover border border-border" />
              ) : (
                <div className="h-32 w-32 rounded-full bg-card border border-border flex items-center justify-center text-3xl text-muted-foreground">
                  {profile.display_name.charAt(0)}
                </div>
              )}
              <div className="text-center sm:text-left">
                <h1 className="text-3xl font-semibold">{profile.display_name}</h1>
                <p className="text-muted-foreground">@{profile.username}</p>
                <div className="mt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="text-xs px-2 py-1 rounded bg-card border border-border">{profile.role}</span>
                  {profile.religion && <span className="text-xs px-2 py-1 rounded bg-card border border-border">{profile.religion}</span>}
                </div>
                {profile.description && (
                  <p className="mt-4 text-muted-foreground leading-relaxed max-w-xl">{profile.description}</p>
                )}
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-4">Artigos escritos ({articles.length})</h2>
            {articles.length === 0 ? (
              <p className="text-muted-foreground">Nenhum artigo ainda.</p>
            ) : (
              <div className="space-y-3">
                {articles.map((a) => (
                  <Link key={a.id} to={`/artigo/${a.slug}`} className="block p-4 bg-card border border-border rounded-md hover:border-foreground/40">
                    <h3 className="font-semibold">{a.title}</h3>
                    {a.excerpt && <p className="text-sm text-muted-foreground mt-1">{a.excerpt}</p>}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
