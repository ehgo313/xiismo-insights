import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";

const ADMIN_PASSWORD = "Muhammad11_1213?";
const STORAGE_KEY = "admin_unlocked";

type Article = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  published: boolean;
};

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const empty: Omit<Article, "id"> = { title: "", slug: "", excerpt: "", content: "", published: true };

const Admin = () => {
  const [unlocked, setUnlocked] = useState<boolean>(() => sessionStorage.getItem(STORAGE_KEY) === "1");
  const [pwd, setPwd] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | (Omit<Article, "id"> & { id?: string }) | null>(null);

  useEffect(() => {
    if (unlocked) load();
  }, [unlocked]);

  const load = async () => {
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .order("published_at", { ascending: false });
    if (error) toast.error(error.message);
    else setArticles(data as Article[]);
  };

  const save = async () => {
    if (!editing) return;
    const payload = {
      title: editing.title,
      slug: editing.slug || slugify(editing.title),
      excerpt: editing.excerpt,
      content: editing.content,
      published: editing.published,
    };
    if (!payload.title || !payload.content) {
      toast.error("Título e conteúdo obrigatórios");
      return;
    }
    const { error } = "id" in editing && editing.id
      ? await supabase.from("articles").update(payload).eq("id", editing.id)
      : await supabase.from("articles").insert(payload);
    if (error) toast.error(error.message);
    else {
      toast.success("Guardado");
      setEditing(null);
      load();
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Eliminar este artigo?")) return;
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Eliminado"); load(); }
  };

  const tryUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      toast.error("Palavra-passe incorreta");
    }
  };

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setUnlocked(false);
    setPwd("");
  };

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
          <h1 className="text-2xl font-semibold">Admin · Artigos</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/">Ver site</Link></Button>
            <Button onClick={lock} variant="outline" size="sm"><LogOut className="h-4 w-4 mr-2" />Sair</Button>
          </div>
        </div>
      </header>

      <main className="container py-10">
        {editing ? (
          <div className="max-w-3xl mx-auto bg-card border border-border rounded-md p-6 space-y-4">
            <h2 className="text-xl font-semibold">{("id" in editing && editing.id) ? "Editar" : "Novo"} artigo</h2>
            <div>
              <Label>Título</Label>
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Slug (URL)</Label>
              <Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
            </div>
            <div>
              <Label>Resumo</Label>
              <Textarea rows={2} value={editing.excerpt ?? ""} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} />
            </div>
            <div>
              <Label>Conteúdo (markdown suportado)</Label>
              <Textarea rows={16} value={editing.content} onChange={(e) => setEditing({ ...editing, content: e.target.value })} className="font-mono text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
              Publicado
            </label>
            <div className="flex gap-2">
              <Button onClick={save}>Guardar</Button>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
            </div>
          </div>
        ) : (
          <>
            <Button onClick={() => setEditing(empty)} className="mb-6"><Plus className="h-4 w-4 mr-2" />Novo artigo</Button>
            <div className="space-y-2">
              {articles.map((a) => (
                <div key={a.id} className="flex items-center justify-between bg-card border border-border rounded-md p-4">
                  <div>
                    <div className="font-semibold">{a.title} {!a.published && <span className="text-xs text-muted-foreground">(rascunho)</span>}</div>
                    <div className="text-sm text-muted-foreground">/{a.slug}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(a)}><Pencil className="h-4 w-4" /></Button>
                    <Button size="sm" variant="outline" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
