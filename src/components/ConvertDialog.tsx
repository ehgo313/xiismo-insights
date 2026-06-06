import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VALID_DDDS = new Set([
  "11","12","13","14","15","16","17","18","19","21","22","24","27","28","31","32","33","34","35","37","38",
  "41","42","43","44","45","46","47","48","49","51","53","54","55","61","62","63","64","65","66","67","68","69",
  "71","73","74","75","77","79","81","82","83","84","85","86","87","88","89","91","92","93","94","95","96","97","98","99",
]);

function formatWhats(raw: string) {
  const d = raw.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `${d.slice(0, 2)} ${d.slice(2)}`;
  if (d.length <= 10) return `${d.slice(0, 2)} ${d.slice(2, 6)} ${d.slice(6)}`;
  return `${d.slice(0, 2)} ${d.slice(2, 7)} ${d.slice(7)}`;
}
function isValidWhats(formatted: string) {
  const d = formatted.replace(/\D/g, "");
  if (d.length !== 10 && d.length !== 11) return false;
  return VALID_DDDS.has(d.slice(0, 2));
}

export const ConvertDialog = ({ trigger }: { trigger: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [whats, setWhats] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city.trim()) return toast.error("Preencha todos os campos");
    if (!isValidWhats(whats)) return toast.error("Número de WhatsApp inválido");
    setSubmitting(true);
    const { error } = await supabase.from("conversion_requests").insert({
      name: name.trim(), city: city.trim(), whatsapp: whats,
    });
    setSubmitting(false);
    if (error) return toast.error(error.message);
    toast.success("Pedido enviado. As-salamu alaykum!");
    setName(""); setCity(""); setWhats(""); setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Quero me converter</DialogTitle>
          <DialogDescription>Deixe os seus dados e entraremos em contacto.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div><Label htmlFor="cv-name">Nome</Label><Input id="cv-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={120} /></div>
          <div><Label htmlFor="cv-city">Cidade</Label><Input id="cv-city" value={city} onChange={(e) => setCity(e.target.value)} maxLength={120} /></div>
          <div>
            <Label htmlFor="cv-w">WhatsApp</Label>
            <Input id="cv-w" placeholder="11 91234 5678" value={whats} onChange={(e) => setWhats(formatWhats(e.target.value))} inputMode="numeric" />
            <p className="text-xs text-muted-foreground mt-1">Formato: XX XXXX XXXX ou XX XXXXX XXXX</p>
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "A enviar..." : "Enviar"}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ConvertDialog;
