import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/xiismo-logo.png";
import { getReligion, DEFAULT_PROFILE_COLOR } from "@/lib/profileMeta";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Instagram, Twitter } from "lucide-react";

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.71a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1.84-.09Z" />
  </svg>
);

type Profile = {
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: string;
  description: string | null;
  religion: string | null;
  profile_color: string | null;
  tiktok: string | null;
  instagram: string | null;
  twitter: string | null;
};

type Article = { id: string; title: string; slug: string; excerpt: string | null };

const stripHandle = (h: string) => h.trim().replace(/^@+/, "");

const Profile = () => {
  const { username } = useParams();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArticles, setShowArticles] = useState(false);

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
          .or(`author_username.eq.${username},author_username_2.eq.${username},author_username_3.eq.${username}`)
          .eq("published", true)
          .order("published_at", { ascending: false });
        setArticles((arts as Article[]) ?? []);
      }
      setLoading(false);
    })();
  }, [username]);

  const religion = getReligion(profile?.religion);
  const color = profile?.profile_color || DEFAULT_PROFILE_COLOR;
  const canShowArticles = profile && profile.role !== "Membro";

  const socials = profile
    ? [
        profile.instagram && { name: "Instagram", Icon: Instagram, url: `https://instagram.com/${stripHandle(profile.instagram)}` },
        profile.tiktok && { name: "TikTok", Icon: TikTokIcon, url: `https://tiktok.com/@${stripHandle(profile.tiktok)}` },
        profile.twitter && { name: "Twitter", Icon: Twitter, url: `https://twitter.com/${stripHandle(profile.twitter)}` },
      ].filter(Boolean) as { name: string; Icon: React.ComponentType<{ className?: string }>; url: string }[]
    : [];

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
            <div className="relative">
              <div className="relative flex flex-col items-center text-center">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.display_name}
                    className="h-28 w-28 rounded-full object-cover border-4"
                    style={{ borderColor: color }}
                  />
                ) : (
                  <div
                    className="h-28 w-28 rounded-full bg-background border-4 flex items-center justify-center text-3xl font-semibold"
                    style={{ borderColor: color }}
                  >
                    {profile.display_name.charAt(0)}
                  </div>
                )}
                <h1 className="mt-4 text-2xl font-semibold tracking-tight">{profile.display_name}</h1>
                <p className="text-sm text-muted-foreground">@{profile.username}</p>

                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  <span className="text-xs font-medium px-3 py-1 rounded-full border border-border bg-background/40 text-foreground/80">
                    {profile.role}
                  </span>
                  {religion && (
                    <span
                      className="text-xs font-medium px-3 py-1 rounded-full border inline-flex items-center gap-1.5"
                      style={{ color, borderColor: `${color}66`, background: `${color}14` }}
                    >
                      {religion.image ? (
                        <span
                          className="inline-block h-3.5 w-3.5"
                          style={{
                            backgroundColor: color,
                            WebkitMaskImage: `url(${religion.image})`,
                            maskImage: `url(${religion.image})`,
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                          }}
                          aria-hidden
                        />
                      ) : (
                        <span aria-hidden style={{ color }}>{religion.symbol}</span>
                      )}
                      {religion.name}
                    </span>
                  )}
                </div>

                {profile.description && (
                  <p className="mt-5 text-sm text-muted-foreground leading-relaxed max-w-md whitespace-pre-line">
                    {profile.description}
                  </p>
                )}

                {socials.length > 0 && (
                  <div className="mt-5 flex gap-3 justify-center">
                    {socials.map((s) => (
                      <a
                        key={s.name}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.name}
                        className="h-10 w-10 rounded-full border border-border bg-background/40 hover:bg-background/70 transition flex items-center justify-center"
                        style={{ color }}
                      >
                        <s.Icon className="h-5 w-5" />
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {canShowArticles && (
              <div className="mt-10">
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => setShowArticles((v) => !v)}
                >
                  <span>Artigos escritos ({articles.length})</span>
                  {showArticles ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
                {showArticles && (
                  <div className="mt-4">
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
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Profile;
