import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut, Copy } from "lucide-react";
import { RELIGIONS, PROFILE_COLORS, DEFAULT_PROFILE_COLOR } from "@/lib/profileMeta";
import { searchCities, findCity } from "@/lib/brazilCities";

const ADMIN_PASSWORD = "Muhammad11_1213?";
const STORAGE_KEY = "admin_unlocked";
const PERMS_KEY = "admin_perms";
const ROLES = ["Membro", "Admin", "Fundador", "Escritor"] as const;

type Perms = {
  articles: boolean;
  profiles: boolean;
  markers: boolean;
  keys: boolean;
  conversions: boolean;
};
const ALL_PERMS: Perms = { articles: true, profiles: true, markers: true, keys: true, conversions: true };
const PERM_LABELS: { key: keyof Perms; label: string }[] = [
  { key: "articles", label: "Gerir artigos" },
  { key: "profiles", label: "Gerir perfis" },
  { key: "markers", label: "Gerir mapa (mesquitas/pessoas)" },
  { key: "keys", label: "Criar chaves de acesso" },
  { key: "conversions", label: "Ver pedidos de conversão" },
];

type Article = {
  id: string; title: string; slug: string; excerpt: string | null; content: string;
  published: boolean; featured: boolean;
  author_username: string | null; author_username_2: string | null; author_username_3: string | null;
  references_footer: string | null;
};
type Profile = {
  id: string; username: string; display_name: string; avatar_url: string | null; role: string;
  description: string | null; religion: string | null; profile_color: string | null;
  tiktok: string | null; instagram: string | null; twitter: string | null;
};
type CityPin = {
  id: string; city: string; state: string | null; lat: number; lng: number;
  kind: "profile" | "mosque"; profile_username: string | null;
  mosque_name: string | null; address: string | null; link: string | null; notes: string | null;
};
type AccessKey = { id: string; key: string; label: string; permissions: Perms; active: boolean; created_at: string };

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const randomKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16))).map((b) => b.toString(16).padStart(2, "0")).join("");

const emptyArticle: Omit<Article, "id"> = {
  title: "", slug: "", excerpt: "", content: "", published: true, featured: false,
  author_username: null, author_username_2: null, author_username_3: null, references_footer: "",
};
const emptyProfile: Omit<Profile, "id"> = {
  username: "", display_name: "", avatar_url: null, role: "Membro", description: "", religion: "",
  profile_color: DEFAULT_PROFILE_COLOR, tiktok: "", instagram: "", twitter: "",
};
const emptyPin: Omit<CityPin, "id"> = {
  city: "", state: "", lat: 0, lng: 0, kind: "profile",
  profile_username: null, mosque_name: "", address: "", link: "", notes: "",
};

type Tab = "articles" | "profiles" | "pins" | "keys";

const Admin = () => {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const [perms, setPerms] = useState<Perms>(() => {
    try { return { ...ALL_PERMS, ...(JSON.parse(sessionStorage.getItem(PERMS_KEY) || "{}") || {}) }; } catch { return ALL_PERMS; }
  });
  const [pwd, setPwd] = useState("");
  const [tab, setTab] = useState<Tab>("articles");

  const [articles, setArticles] = useState<Article[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [pins, setPins] = useState<CityPin[]>([]);
  const [keys, setKeys] = useState<AccessKey[]>([]);

  const [editingArticle, setEditingArticle] = useState<(Partial<Article> & Omit<Article, "id">) | null>(null);
  const [editingProfile, setEditingProfile] = useState<(Partial<Profile> & Omit<Profile, "id">) | null>(null);
  const [editingPin, setEditingPin] = useState<(Partial<CityPin> & Omit<CityPin, "id">) | null>(null);
  const [editingKey, setEditingKey] = useState<{ label: string; permissions: Perms } | null>(null);

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    if (perms.articles) loadArticles();
    loadProfiles();
    if (perms.markers) loadPins();
    if (perms.keys) loadKeys();
    const order: Tab[] = ["articles", "profiles", "pins", "keys"];
    const permKey: Record<Tab, keyof Perms> = { articles: "articles", profiles: "profiles", pins: "markers", keys: "keys" };
    const first = order.find((t) => perms[permKey[t]]);
    if (first && !perms[permKey[tab]]) setTab(first);
  }, [unlocked]);

  const loadArticles = async () => {
    const { data, error } = await supabase.from("articles").select("*").order("published_at", { ascending: false });
    if (error) toast.error(error.message); else setArticles(data as Article[]);
  };
  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setProfiles(data as Profile[]);
  };
  const loadPins = async () => {
    const { data, error } = await supabase.from("city_pins").select("*").order("city", { ascending: true });
    if (error) toast.error(error.message); else setPins(data as CityPin[]);
  };
  const loadKeys = async () => {
    const { data, error } = await supabase.from("access_keys").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message); else setKeys((data as any[]).map((k) => ({ ...k, permissions: k.permissions || {} })));
  };

  const saveArticle = async () => {
    if (!editingArticle) return;
    const a = editingArticle;
    if (!a.title || !a.content) return toast.error("Título e conteúdo obrigatórios");
    const payload = {
      title: a.title, slug: a.slug || slugify(a.title), excerpt: a.excerpt,
      content: a.content, published: a.published, featured: a.featured,
      author_username: a.author_username || null,
      author_username_2: a.author_username_2 || null,
      author_username_3: a.author_username_3 || null,
      references_footer: a.references_footer || null,
    };
    const { error } = a.id
      ? await supabase.from("articles").update(payload).eq("id", a.id)
      : await supabase.from("articles").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setEditingArticle(null); loadArticles(); }
  };
  const removeArticle = async (id: string) => {
    if (!confirm("Eliminar?")) return;
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
    if (!confirm("Eliminar?")) return;
    const { error } = await supabase.from("profiles").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); loadProfiles(); }
  };

  const savePin = async () => {
    if (!editingPin) return;
    const p = editingPin;
    if (!p.city) return toast.error("Cidade obrigatória");
    if (p.kind === "profile" && !p.profile_username) return toast.error("Escolhe um perfil");
    if (p.kind === "mosque" && !p.mosque_name) return toast.error("Nome da mesquita obrigatório");
    let { lat, lng, state } = p;
    if (!lat || !lng) {
      const known = findCity(p.city);
      if (!known) return toast.error("Cidade não encontrada. Preencha lat/lng manualmente.");
      lat = known.lat; lng = known.lng; state = state || known.state;
    }
    const payload = {
      city: p.city, state: state || null, lat, lng, kind: p.kind,
      profile_username: p.kind === "profile" ? p.profile_username : null,
      mosque_name: p.kind === "mosque" ? p.mosque_name : null,
      address: p.address || null, link: p.link || null, notes: p.notes || null,
    };
    const { error } = p.id
      ? await supabase.from("city_pins").update(payload).eq("id", p.id)
      : await supabase.from("city_pins").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Guardado"); setEditingPin(null); loadPins(); }
  };
  const removePin = async (id: string) => {
    if (!confirm("Eliminar pino?")) return;
    const { error } = await supabase.from("city_pins").delete().eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Eliminado"); loadPins(); }
  };

  const saveKey = async () => {
    if (!editingKey) return;
    if (!editingKey.label) return toast.error("Nome obrigatório");
    const key = randomKey();
    const { error } = await supabase.from("access_keys").insert({ key, label: editingKey.label, permissions: editingKey.permissions, active: true });
    if (error) toast.error(error.message);
    else { toast.success("Chave criada"); setEditingKey(null); loadKeys(); }
  };
  const toggleKey = async (k: AccessKey) => {
    const { error } = await supabase.from("access_keys").update({ active: !k.active }).eq("id", k.id);
    if (error) toast.error(error.message); else loadKeys();
  };
  const removeKey = async (id: string) => {
    if (!confirm("Eliminar chave?")) return;
    const { error } = await supabase.from("access_keys").delete().eq("id", id);
    if (error) toast.error(error.message); else loadKeys();
  };

  const uploadAvatar = async (file: File) => {
    if (!editingProfile) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: false });
      if (error) throw error;
      const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      setEditingProfile({ ...editingProfile, avatar_url: url });
    } catch (e: any) { toast.error(e.message); }
    setUploading(false);
  };

  const tryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      sessionStorage.setItem(PERMS_KEY, JSON.stringify(ALL_PERMS));
      setPerms(ALL_PERMS);
      setUnlocked(true);
      return;
    }
    const { data } = await supabase.from("access_keys").select("*").eq("key", pwd).eq("active", true).maybeSingle();
    if (data) {
      const p = { articles: false, profiles: false, markers: false, keys: false, ...((data as any).permissions || {}) };
      sessionStorage.setItem(STORAGE_KEY, "1");
      sessionStorage.setItem(PERMS_KEY, JSON.stringify(p));
      setPerms(p);
      setUnlocked(true);
    } else toast.error("Palavra-passe / chave inválida");
  };
  const lock = () => { sessionStorage.removeItem(STORAGE_KEY); sessionStorage.removeItem(PERMS_KEY); setUnlocked(false); setPwd(""); };

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-hero flex items-center justify-center p-6">
        <form onSubmit={tryUnlock} className="w-full max-w-md bg-card border border-border rounded-md p-8 space-y-4">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">← Voltar</Link>
          <h1 className="text-3xl font-semibold">Admin</h1>
          <div>
            <Label htmlFor="pwd">Palavra-passe ou chave de acesso</Label>
            <Input id="pwd" type="password" autoFocus value={pwd} onChange={(e) => setPwd(e.target.value)} />
          </div>
          <Button type="submit" className="w-full">Entrar</Button>
        </form>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; show: boolean }[] = [
    { key: "articles", label: "Artigos", show: perms.articles },
    { key: "profiles", label: "Perfis", show: perms.profiles },
    { key: "pins", label: "Mapa", show: perms.markers },
    { key: "keys", label: "Chaves", show: perms.keys },
  ];

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
        <div className="container flex gap-2 pb-3 flex-wrap">
          {tabs.filter((t) => t.show).map((t) => (
            <Button key={t.key} size="sm" variant={tab === t.key ? "default" : "outline"} onClick={() => { setTab(t.key); setEditingArticle(null); setEditingProfile(null); setEditingPin(null); setEditingKey(null); }}>
              {t.label}
            </Button>
          ))}
        </div>
      </header>

      <main className="container py-10">
        {/* ARTICLES */}
        {tab === "articles" && perms.articles && (editingArticle ? (
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">{editingArticle.id ? "Editar" : "Novo"} artigo</h2>
            <div><Label>Título</Label>
              <Input value={editingArticle.title} onChange={(e) => setEditingArticle({ ...editingArticle, title: e.target.value, slug: editingArticle.slug || slugify(e.target.value) })} />
            </div>
            <div><Label>Slug</Label><Input value={editingArticle.slug} onChange={(e) => setEditingArticle({ ...editingArticle, slug: slugify(e.target.value) })} /></div>
            {([["author_username","Autor 1"],["author_username_2","Autor 2 (opcional)"],["author_username_3","Autor 3 (opcional)"]] as const).map(([k, l]) => (
              <div key={k}><Label>{l}</Label>
                <Select value={(editingArticle as any)[k] ?? "__none"} onValueChange={(v) => setEditingArticle({ ...editingArticle, [k]: v === "__none" ? null : v } as any)}>
                  <SelectTrigger><SelectValue placeholder="Sem autor" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none">Sem autor</SelectItem>
                    {profiles.map((p) => <SelectItem key={p.id} value={p.username}>{p.display_name} (@{p.username})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div><Label>Resumo</Label><Textarea rows={2} value={editingArticle.excerpt ?? ""} onChange={(e) => setEditingArticle({ ...editingArticle, excerpt: e.target.value })} /></div>
            <div><Label>Conteúdo</Label>
              <p className="text-xs text-muted-foreground mb-1">Link: <code>palavra[exemplo.com]</code> ou <code>(frase aqui[exemplo.com])</code></p>
              <Textarea rows={16} value={editingArticle.content} onChange={(e) => setEditingArticle({ ...editingArticle, content: e.target.value })} className="font-mono text-sm" />
            </div>
            <div><Label>Rodapé / Referências</Label>
              <Textarea rows={5} value={editingArticle.references_footer ?? ""} onChange={(e) => setEditingArticle({ ...editingArticle, references_footer: e.target.value })} className="font-mono text-sm" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingArticle.published} onChange={(e) => setEditingArticle({ ...editingArticle, published: e.target.checked })} />Publicado</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editingArticle.featured} onChange={(e) => setEditingArticle({ ...editingArticle, featured: e.target.checked })} />Em destaque</label>
            </div>
            <div className="flex gap-2"><Button onClick={saveArticle}>Guardar</Button><Button variant="outline" onClick={() => setEditingArticle(null)}>Cancelar</Button></div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditingArticle(emptyArticle)} className="mb-6"><Plus className="h-4 w-4 mr-2" />Novo artigo</Button>
            <div className="space-y-2">
              {articles.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-card border border-border rounded-md p-4">
                  <div>
                    <div className="font-semibold">{a.title}
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

        {/* PROFILES */}
        {tab === "profiles" && perms.profiles && (editingProfile ? (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">{editingProfile.id ? "Editar" : "Novo"} perfil</h2>
            <div className="flex items-center gap-4">
              {editingProfile.avatar_url ? <img src={editingProfile.avatar_url} alt="" className="h-20 w-20 rounded-full object-cover border border-border" /> : <div className="h-20 w-20 rounded-full bg-background border border-border" />}
              <div><Label>Foto de perfil</Label><Input type="file" accept="image/*" disabled={uploading} onChange={(e) => e.target.files?.[0] && uploadAvatar(e.target.files[0])} /></div>
            </div>
            <div><Label>Username</Label><Input value={editingProfile.username} onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })} /></div>
            <div><Label>Nome de exibição</Label><Input value={editingProfile.display_name} onChange={(e) => setEditingProfile({ ...editingProfile, display_name: e.target.value })} /></div>
            <div><Label>Cargo</Label>
              <Select value={editingProfile.role} onValueChange={(v) => setEditingProfile({ ...editingProfile, role: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Religião</Label>
              <Select value={editingProfile.religion || "__none"} onValueChange={(v) => setEditingProfile({ ...editingProfile, religion: v === "__none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent><SelectItem value="__none">Nenhuma</SelectItem>
                  {RELIGIONS.map((r) => (
                    <SelectItem key={r.name} value={r.name}>
                      <span className="inline-flex items-center gap-2">
                        {r.image ? <img src={r.image} alt="" className="h-3.5 w-3.5 object-contain" /> : <span style={{ color: r.color }}>{r.symbol}</span>}
                        {r.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Cor do perfil</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PROFILE_COLORS.map((c) => {
                  const selected = (editingProfile.profile_color || DEFAULT_PROFILE_COLOR) === c.value;
                  return <button key={c.value} type="button" title={c.name} onClick={() => setEditingProfile({ ...editingProfile, profile_color: c.value })} className={`h-8 w-8 rounded-full border-2 transition ${selected ? "ring-2 ring-offset-2 ring-offset-background ring-foreground" : "border-border"}`} style={{ background: c.value }} />;
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><Label>Instagram</Label><Input placeholder="user" value={editingProfile.instagram ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, instagram: e.target.value })} /></div>
              <div><Label>TikTok</Label><Input placeholder="user" value={editingProfile.tiktok ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, tiktok: e.target.value })} /></div>
              <div><Label>Twitter</Label><Input placeholder="user" value={editingProfile.twitter ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, twitter: e.target.value })} /></div>
            </div>
            <div><Label>Descrição</Label><Textarea rows={4} value={editingProfile.description ?? ""} onChange={(e) => setEditingProfile({ ...editingProfile, description: e.target.value })} /></div>
            <div className="flex gap-2"><Button onClick={saveProfile}>Guardar</Button><Button variant="outline" onClick={() => setEditingProfile(null)}>Cancelar</Button></div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditingProfile(emptyProfile)} className="mb-6"><Plus className="h-4 w-4 mr-2" />Novo perfil</Button>
            <div className="space-y-2">
              {profiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-card border border-border rounded-md p-4">
                  <div className="flex items-center gap-3">
                    {p.avatar_url ? <img src={p.avatar_url} className="h-10 w-10 rounded-full object-cover" alt="" /> : <div className="h-10 w-10 rounded-full bg-background border border-border" />}
                    <div className="font-semibold">{p.display_name} <span className="text-xs text-muted-foreground">@{p.username} · {p.role}</span></div>
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

        {/* PINS */}
        {tab === "pins" && perms.markers && (editingPin ? (
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">{editingPin.id ? "Editar" : "Novo"} pino no mapa</h2>
            <div><Label>Tipo</Label>
              <Select value={editingPin.kind} onValueChange={(v: "profile" | "mosque") => setEditingPin({ ...editingPin, kind: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="profile">Perfil xiita</SelectItem>
                  <SelectItem value="mosque">Mesquita</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade</Label>
              <Input placeholder="Pesquisar qualquer cidade do Brasil..." value={editingPin.city}
                onChange={(e) => setEditingPin({ ...editingPin, city: e.target.value })} />
              {editingPin.city && searchCities(editingPin.city, 6).length > 0 &&
                !searchCities(editingPin.city, 1).some((c) => c.name.toLowerCase() === editingPin.city.toLowerCase()) && (
                <div className="mt-1 border border-border rounded-md bg-popover max-h-56 overflow-auto">
                  {searchCities(editingPin.city, 8).map((c) => (
                    <button type="button" key={`${c.name}-${c.state}`}
                      onClick={() => setEditingPin({ ...editingPin, city: c.name, state: c.state, lat: c.lat, lng: c.lng })}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-accent flex justify-between">
                      <span>{c.name}</span>
                      <span className="text-muted-foreground text-xs">{c.state}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Estado</Label><Input value={editingPin.state ?? ""} onChange={(e) => setEditingPin({ ...editingPin, state: e.target.value })} /></div>
              <div><Label>Latitude</Label><Input type="number" step="any" value={editingPin.lat || ""} onChange={(e) => setEditingPin({ ...editingPin, lat: parseFloat(e.target.value) })} /></div>
              <div><Label>Longitude</Label><Input type="number" step="any" value={editingPin.lng || ""} onChange={(e) => setEditingPin({ ...editingPin, lng: parseFloat(e.target.value) })} /></div>
            </div>
            {editingPin.kind === "profile" ? (
              <div><Label>Perfil</Label>
                <Select value={editingPin.profile_username ?? "__none"} onValueChange={(v) => setEditingPin({ ...editingPin, profile_username: v === "__none" ? null : v })}>
                  <SelectTrigger><SelectValue placeholder="Escolher perfil" /></SelectTrigger>
                  <SelectContent><SelectItem value="__none">Nenhum</SelectItem>
                    {profiles.map((p) => <SelectItem key={p.id} value={p.username}>{p.display_name} (@{p.username})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div><Label>Nome da mesquita</Label><Input value={editingPin.mosque_name ?? ""} onChange={(e) => setEditingPin({ ...editingPin, mosque_name: e.target.value })} /></div>
                <div><Label>Endereço</Label><Input value={editingPin.address ?? ""} onChange={(e) => setEditingPin({ ...editingPin, address: e.target.value })} /></div>
                <div><Label>Link (site, Google Maps)</Label><Input value={editingPin.link ?? ""} onChange={(e) => setEditingPin({ ...editingPin, link: e.target.value })} /></div>
              </>
            )}
            <div><Label>Notas (opcional)</Label><Textarea rows={2} value={editingPin.notes ?? ""} onChange={(e) => setEditingPin({ ...editingPin, notes: e.target.value })} /></div>
            <div className="flex gap-2"><Button onClick={savePin}>Guardar</Button><Button variant="outline" onClick={() => setEditingPin(null)}>Cancelar</Button></div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditingPin(emptyPin)} className="mb-6"><Plus className="h-4 w-4 mr-2" />Novo pino</Button>
            <div className="space-y-2">
              {pins.map((p) => (
                <div key={p.id} className="flex items-center justify-between bg-card border border-border rounded-md p-4">
                  <div>
                    <div className="font-semibold">{p.city}{p.state && <span className="text-muted-foreground"> — {p.state}</span>}
                      <span className="ml-2 text-xs px-2 py-0.5 rounded bg-foreground/10">{p.kind === "profile" ? "Perfil" : "Mesquita"}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{p.kind === "profile" ? `@${p.profile_username}` : p.mosque_name}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingPin(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => removePin(p.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
              {pins.length === 0 && <p className="text-muted-foreground text-sm">Sem pinos ainda.</p>}
            </div>
          </>
        ))}

        {/* KEYS */}
        {tab === "keys" && perms.keys && (editingKey ? (
          <div className="max-w-xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">Nova chave de acesso</h2>
            <div><Label>Nome / descrição</Label><Input value={editingKey.label} onChange={(e) => setEditingKey({ ...editingKey, label: e.target.value })} placeholder="Ex: João - escritor" /></div>
            <div>
              <Label>Permissões</Label>
              <div className="mt-2 space-y-2">
                {PERM_LABELS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={editingKey.permissions[p.key]} onCheckedChange={(c) => setEditingKey({ ...editingKey, permissions: { ...editingKey.permissions, [p.key]: !!c } })} />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-2"><Button onClick={saveKey}>Criar chave</Button><Button variant="outline" onClick={() => setEditingKey(null)}>Cancelar</Button></div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditingKey({ label: "", permissions: { articles: true, profiles: false, markers: false, keys: false, conversions: false } })} className="mb-6">
              <Plus className="h-4 w-4 mr-2" />Criar chave de acesso
            </Button>
            <div className="space-y-2">
              {keys.map((k) => (
                <div key={k.id} className="bg-card border border-border rounded-md p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">{k.label} {!k.active && <span className="text-xs text-muted-foreground">(desativada)</span>}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <code className="font-mono">{k.key}</code>
                        <button onClick={() => { navigator.clipboard.writeText(k.key); toast.success("Copiado"); }} title="Copiar"><Copy className="h-3 w-3" /></button>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {PERM_LABELS.filter((p) => k.permissions[p.key]).map((p) => p.label).join(", ") || "Sem permissões"}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => toggleKey(k)}>{k.active ? "Desativar" : "Ativar"}</Button>
                      <Button size="sm" variant="outline" onClick={() => removeKey(k.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
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
