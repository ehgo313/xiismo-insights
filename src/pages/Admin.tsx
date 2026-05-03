import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, LogOut } from "lucide-react";

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
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article | (Omit<Article, "id"> & { id?: string }) | null>(null);

  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        navigate("/auth");
        return;
      }
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.session.user.id);
      const admin = roles?.some((r) => r.role === "admin") ?? false;
      setIsAdmin(admin);
      if (admin) await load();
    };
    init();
  }, [navigate]);

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

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (isAdmin === null) return <div className="min-h-screen bg-hero p-10 text-muted-foreground">A carregar...</div>;
  if (!isAdmin)
    return (
      <div className="min-h-screen bg-hero p-10 max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold mb-4">Sem permissões</h1>
        <p className="text-muted-foreground mb-6">
          A tua conta não tem acesso de administrador. Pede ao dono do site para te promover (no painel da Lovable Cloud, tabela <code>user_roles</code>, adiciona uma linha com o teu user_id e role = <code>admin</code>).
        </p>
        <div className="flex gap-3">
          <Button onClick={logout} variant="outline">Sair</Button>
          <Button asChild><Link to="/">Voltar ao site</Link></Button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-hero">
      <header className="border-b border-border/60">
        <div className="container flex items-center justify-between py-4">
          <h1 className="text-2xl font-semibold">Admin · Artigos</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm"><Link to="/">Ver site</Link></Button>
            <Button onClick={logout} variant="outline" size="sm"><LogOut className="h-4 w-4 mr-2" />Sair</Button>
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
