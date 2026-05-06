import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";
import { RELIGIONS, PROFILE_COLORS, DEFAULT_PROFILE_COLOR } from "@/lib/profileMeta";

const ADMIN_PASSWORD = "Muhammad11_1213?";
const STORAGE_KEY = "admin_unlocked";
const ROLES = ["Membro", "Admin", "Fundador", "Escritor"] as const;

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
  featured: boolean;
  author_username: string | null;
  references_footer: string | null;
};

type Profile = {
  id: string;
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

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const emptyArticle: Omit<Article, "id"> = {
  title: "", slug: "", excerpt: "", content: "", published: true, featured: false,
  author_username: null, references_footer: "",
};
const emptyProfile: Omit<Profile, "id"> = {
  username: "", display_name: "", avatar_url: null, role: "Membro", description: "", religion: "",
  profile_color: DEFAULT_PROFILE_COLOR, tiktok: "", instagram: "", twitter: "",
};

const Admin = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const [pwd, setPwd] = useState("");
  const [tab, setTab] = useState<"articles" | "profiles">("articles");
  const [articles, setArticles] = useState<Article[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [editingArticle, setEditingArticle] = useState<(Partial<Article> & Omit<Article, "id">) | null>(null);
  const [editingProfile, setEditingProfile] = useState<(Partial<Profile> & Omit<Profile, "id">) | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { if (unlocked) { loadArticles(); loadProfiles(); } }, [unlocked]);

  const loadArticles = async () => {
    const { data, error } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
    if (error) toast.error(error.message); else setArticles(data as Article[]);
  };
  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setProfiles(data as Profile[]);
  };

  const saveArticle = async () => {
    if (!editingArticle) return;
    const a = editingArticle;
    if (!a.title || !a.content) return toast.error("Título e conteúdo obrigatórios");
    const payload = {
      title: a.title, slug: a.slug || slugify(a.title), excerpt: a.excerpt,
      content: a.content, published: a.published, featured: a.featured,
      author_username: a.author_username || null, references_footer: a.references_footer || null,
    };
    const { error } = a.id
      ? await supabase.from("articles").update(payload).eq("id", a.id)
      : await supabase.from("articles").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setEditingArticle(null); loadArticles(); }
  };

  const removeArticle = async (id: string) => {
    if (!confirm("Eliminar este artigo?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); loadArticles(); }
  };

  const saveProfile = async () => {
    if (!editingProfile) return;
    const p = editingProfile;
    if (!p.username || !p.display_name) return toast.error("Username e nome obrigatórios");
    const username = slugify(p.username);
    const payload = { ...p, username };
    const { error } = p.id
      ? await supabase.from("profiles").update(payload).eq("id", p.id)
      : await supabase.from("profiles").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setEditingProfile(null); loadProfiles(); }
  };

  const removeProfile = async (id: string) => {
    if (!confirm("Eliminar este perfil?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); loadProfiles(); }
  };

  const uploadAvatar = async (file: File) => {
    if (!editingProfile) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setEditingProfile({ ...editingProfile, avatar_url: data.publicUrl });
    setUploading(false);
  };

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) { sessionStorage.setItem(STORAGE_KEY, "1"); setUnlocked(true); }
    else toast.error("Palavra-passe incorreta");
  };
  const lock = () => { sessionStorage.removeItem(STORAGE_KEY); setUnlocked(false); setPwd(""); };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-6">
        <form onSubmit={tryUnlock} className="w-full max-w-md bg-card border border-border rounded-md p-8 space-y-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>
          <h1 className="text-3xl font-semibold">Admin</h1>
          <div>
            <Label htmlFor="pwd">Palavra-passe</Label>
            <Input id="pwd" type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="border-b border-border/60">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-semibold">Admin</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/">Ver site</Link></Button>
            <Button onClick={lock} variant="outline" size="sm"><LogOut className="h-4 w-4 mr-2" />Sair</Button>
          </div>
        </div>
        <div className="container flex gap-2 pb-3">
          <Button size="sm" variant={tab === "articles" ? "default" : "outline"} onClick={() => { setTab("articles"); setEditingProfile(null); }}>Artigos</Button>
          <Button size="sm" variant={tab === "profiles" ? "default" : "outline"} onClick={() => { setTab("profiles"); setEditingArticle(null); }}>Perfis</Button>
        </div>
      </header>

      <main className="container py-10">
        {tab === "articles" && (editingArticle ? (
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">{editingArticle.id ? "Editar" : "Novo"} artigo</h2>
            <div>
              <Label>Título</Label>
              <Input value={editingArticle.title} onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value, slug: editingArticle.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={editingArticle.slug} onChange={(e) => setEditingArticle({ ...editingArticle, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Autor (username)</Label>
              <Select value={editingArticle.author_username ?? "__none"} onValueChange={(v) => setEditingArticle({ ...editingArticle, author_username: v === "__none" ? null : v })}>
                <SelectTrigger><SelectValue placeholder="Sem autor" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Sem autor</SelectItem>
                  {profiles.map((p) => <SelectItem key={p.id} value={p.username}>{p.display_name} (@{p.username})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Resumo</Label>
              <Textarea rows={2} value={editingArticle.excerpt ?? ""} onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Conteúdo</Label>
              <p className="text-xs text-muted-foreground mb-1">Use # para títulos. Link clicável: <code>palavra[exemplo.com]</code> ou frase: <code>(frase aqui[exemplo.com])</code></p>
              <Textarea rows={16} value={editingArticle.content} onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })} className="font-mono text-sm" />
            </div>
            <div>
              <Label>Rodapé / Referências</Label>
              <p className="text-xs text-muted-foreground mb-1">Aparece em fonte menor no fim do artigo. Suporta <code>palavra[link]</code>.</p>
              <Textarea rows={5} value={editingArticle.references_footer ?? ""} onChange={(e) => setEditingArticle({ ...editingArticle, references_footer: e.target.value })} className="font-mono text-sm" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editingArticle.published} onChange={(e) => setEditingArticle({ ...editingArticle, published: e.target.checked })} />
                Publicado
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={editingArticle.featured} onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })} />
                Em destaque
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={saveArticle}>Guardar</Button>
              <Button variant="outline" onClick={() => setEditingArticle(null)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditingArticle(emptyArticle)} className="mb-6"><Plus className="h-4 w-4 mr-2" />Novo artigo</Button>
            <div className="space-y-2">
              {articles.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-card border border-border rounded-md p-4">
                  <div>
                    <div className="font-semibold">
                      {a.title}
                      {a.featured && <span className="ml-2 text-xs px-2 py-0.5 rounded bg-foreground/10">Destaque</span>}
                      {!a.published && <span className="ml-2 text-xs text-muted-foreground">(rascunho)</span>}
                    </div>
                    <div className="text-sm text-muted-foreground">/{a.slug}{a.author_username && ` · @${a.author_username}`}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingArticle(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => removeArticle(a.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ))}

        {tab === "profiles" && (editingProfile ? (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">{editingProfile.id ? "Editar" : "Novo"} perfil</h2>
            <div className="flex items-center gap-4">
              {editingProfile.avatar_url ? (
                <img src={editingProfile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover border border-border" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-background border border-border" />
              )}
              <div>
                <Label>Foto de perfil</Label>
                <Input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} />
              </div>
            </div>
            <div>
              <Label>Username (URL: /username)</Label>
              <Input value={editingProfile.username} onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })} />
            </div>
            <div>
              <Label>Nome de exibição</Label>
              <Input value={editingProfile.display_name} onChange={(e) => setEditingProfile({ ...editingProfile, display_name: e.target.value })} />
            </div>
            <div>
              <Label>Cargo</Label>
              <Select value={editingProfile.role} onValueChange={(v) => setEditingProfile({ ...editingProfile, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Religião</Label>
              <Select value={editingProfile.religion || "__none"} onValueChange={(v) => setEditingProfile({ ...editingProfile, religion: v === "__none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">Nenhuma</SelectItem>
                  {RELIGIONS.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      <span className="inline-flex items-center gap-2">
                        {r.image ? (
                          <img src={r.image} alt="" className="h-3.5 w-3.5 object-contain" />
                        ) : (
                          <span style={{ color: r.color }}>{r.symbol}</span>
                        )}
                        {r.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cor do perfil</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROFILE_COLORS.map((c) => {
                  const selected = (editingProfile.profile_color || DEFAULT_PROFILE_COLOR) === c.value;
                  return (
                    <button
                      key={c.value}
                      type="button"
                      title={c.name}
                      onClick={() => setEditingProfile({ ...editingProfile, profile_color: c.value })}
                      className={`h-8 w-8 rounded-full border-2 transition ${selected ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : "border-border"}`}
                      style={{ background: c.value, borderColor: selected ? c.value : undefined }}
                    />
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <Label>Instagram (user)</Label>
                <Input placeholder="ex: meuuser" value={editingProfile.instagram ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, instagram: e.target.value })} />
              </div>
              <div>
                <Label>TikTok (user)</Label>
                <Input placeholder="ex: meuuser" value={editingProfile.tiktok ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, tiktok: e.target.value })} />
              </div>
              <div>
                <Label>Twitter (user)</Label>
                <Input placeholder="ex: meuuser" value={editingProfile.twitter ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, twitter: e.target.value })} />
              </div>
            </div>
            <div>
              <Label>Descrição</Label>
              <Textarea rows={4} value={editingProfile.description ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveProfile}>Guardar</Button>
              <Button variant="outline" onClick={() => setEditingProfile(null)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditingProfile(emptyProfile)} className="mb-6"><Plus className="h-4 w-4 mr-2" />Novo perfil</Button>
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-card border border-border rounded-md p-4">
                  <div className="flex items-center gap-3">
                    {p.avatar_url ? <img src={p.avatar_url} className="h-10 w-10 rounded-full object-cover" alt="" /> : <div className="h-10 w-10 rounded-full bg-background border border-border" />}
                    <div>
                      <div className="font-semibold">{p.display_name} <span className="text-xs text-muted-foreground">@{p.username} · {p.role}</span></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" asChild><Link to={`/${p.username}`}>Ver</Link></Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingProfile(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => removeProfile(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ))}
      </main>
    </div>
  );
};

export default Admin;
