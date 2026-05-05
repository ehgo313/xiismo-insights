import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/xiismo-logo.png";
import { getReligion, getRoleColor } from "@/lib/profileMeta";

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

  const religion = getReligion(profile?.religion);
  const roleColor = getRoleColor(profile?.role);
  const showArticles = profile && profile.role !== "Membro";

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

      <main className="container py-16 max-w-2xl">
        {loading ? (
          <p className="text-muted-foreground">A carregar...</p>
        ) : !profile ? (
          <div>
            <h1 className="text-3xl font-semibold mb-4">Perfil não encontrado</h1>
            <Link to="/" className="text-muted-foreground hover:text-foreground">← Voltar ao início</Link>
          </div>
        ) : (
          <>
            <div
              className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-sm p-8 overflow-hidden"
              style={{ boxShadow: `0 0 80px -20px ${roleColor}40` }}
            >
              <div
                className="absolute inset-x-0 top-0 h-24"
                style={{ background: `linear-gradient(135deg, ${roleColor}30, transparent 70%)` }}
              />
              <div className="relative flex flex-col items-center text-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="h-28 w-28 rounded-full object-cover border-4"
                    style={{ borderColor: roleColor }}
                  />
                ) : (
                  <div
                    className="h-28 w-28 rounded-full bg-background border-4 flex items-center justify-center text-3xl font-semibold"
                    style={{ borderColor: roleColor }}
                  >
                    {profile.display_name.charAt(0)}
                  </div>
                )}
                <h1 className="mt-4 text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>

                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  <span
                    className="text-xs font-medium px-3 py-1 rounded-full border"
                    style={{ color: roleColor, borderColor: `${roleColor}66`, background: `${roleColor}14` }}
                  >
                    {profile.role}
                  </span>
                  {religion && (
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border inline-flex items-center gap-1.5"
                      style={{ color: religion.color, borderColor: `${religion.color}66`, background: `${religion.color}14` }}
                    >
                      <span aria-hidden>{religion.symbol}</span>
                      {religion.name}
                    </span>
                  )}
                </div>

                {profile.description && (
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-md whitespace-pre-line">
                    {profile.description}
                  </p>
                )}
              </div>
            </div>

            {showArticles && (
              <div className="mt-12">
                <h2 className="text-xl font-semibold mb-4">Artigos escritos ({articles.length})</h2>
                {articles.length === 0 ? (
                  <p className="text-muted-foreground text-sm">Nenhum artigo ainda.</p>
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
