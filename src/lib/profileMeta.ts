import judeu from "@/assets/religions/judeu.png";
import babista from "@/assets/religions/babista.png";
import islamSunita from "@/assets/religions/islam-sunita.png";
import islamXiita from "@/assets/religions/islam-xiita.png";
import cristaoOutro from "@/assets/religions/cristao-outro.png";
import cristaoProtestante from "@/assets/religions/cristao-protestante.png";
import cristaoOrtodoxo from "@/assets/religions/cristao-ortodoxo.png";
import cristaoCatolico from "@/assets/religions/cristao-catolico.png";
import espirita from "@/assets/religions/espirita.png";
import bahai from "@/assets/religions/bahai.png";
import islamOutro from "@/assets/religions/islam-outro.png";
import islamIbadi from "@/assets/religions/islam-ibadi.png";

export type Religion = { name: string; symbol: string; image?: string; color: string };

export const RELIGIONS: Religion[] = [
  { name: "Islam (Xiita)", symbol: "☪︎", image: islamXiita, color: "#3b82f6" },
  { name: "Islam (Sunita)", symbol: "☪︎", image: islamSunita, color: "#16a34a" },
  { name: "Islam (Ibadi)", symbol: "☪︎", image: islamIbadi, color: "#eab308" },
  { name: "Islam (Outro)", symbol: "☪︎", image: islamOutro, color: "#f97316" },
  { name: "Cristão (Protestante)", symbol: "✝", image: cristaoProtestante, color: "#0ea5e9" },
  { name: "Cristão (Católico)", symbol: "✝", image: cristaoCatolico, color: "#f59e0b" },
  { name: "Cristão (Ortodoxo)", symbol: "☦", image: cristaoOrtodoxo, color: "#dc2626" },
  { name: "Cristão (Mórmon)", symbol: "✝", color: "#f59e0b" },
  { name: "Cristão (Outro)", symbol: "✝", image: cristaoOutro, color: "#1e3a8a" },
  { name: "Testemunha de Jeová", symbol: "✝", color: "#0ea5e9" },
  { name: "Bahá'í", symbol: "✴", image: bahai, color: "#9f1239" },
  { name: "Druzo", symbol: "★", color: "#16a34a" },
  { name: "Babista", symbol: "✦", image: babista, color: "#e5e7eb" },
  { name: "Espírita", symbol: "✶", image: espirita, color: "#4c1d95" },
  { name: "Hindu", symbol: "ॐ", color: "#f97316" },
  { name: "Hare Krishna", symbol: "ॐ", color: "#fb923c" },
  { name: "Judeu", symbol: "✡", image: judeu, color: "#2563eb" },
  { name: "Ateu", symbol: "⊘", color: "#6b7280" },
  { name: "Outro", symbol: "•", color: "#94a3b8" },
];

export const getReligion = (name?: string | null) =>
  RELIGIONS.find((r) => r.name === name);

// Profile color options (independent of role)
export const PROFILE_COLORS: { name: string; value: string }[] = [
  { name: "Âmbar", value: "#f59e0b" },
  { name: "Amarelo", value: "#facc15" },
  { name: "Dourado", value: "#d4af37" },
  { name: "Laranja", value: "#f97316" },
  { name: "Coral", value: "#fb7185" },
  { name: "Vermelho", value: "#ef4444" },
  { name: "Bordô", value: "#9f1239" },
  { name: "Rosa", value: "#ec4899" },
  { name: "Magenta", value: "#d946ef" },
  { name: "Roxo", value: "#8b5cf6" },
  { name: "Violeta", value: "#7c3aed" },
  { name: "Índigo", value: "#6366f1" },
  { name: "Azul", value: "#3b82f6" },
  { name: "Azul-marinho", value: "#1e3a8a" },
  { name: "Ciano", value: "#06b6d4" },
  { name: "Turquesa", value: "#14b8a6" },
  { name: "Verde", value: "#10b981" },
  { name: "Esmeralda", value: "#059669" },
  { name: "Lima", value: "#84cc16" },
  { name: "Oliva", value: "#65a30d" },
  { name: "Marrom", value: "#92400e" },
  { name: "Bege", value: "#d6c7a7" },
  { name: "Cinza", value: "#64748b" },
  { name: "Grafite", value: "#374151" },
  { name: "Branco", value: "#e5e7eb" },
  { name: "Preto", value: "#1f2937" },
];

export const DEFAULT_PROFILE_COLOR = "#8b5cf6";
