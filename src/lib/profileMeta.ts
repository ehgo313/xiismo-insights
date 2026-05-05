export const RELIGIONS: { name: string; symbol: string; color: string }[] = [
  { name: "Islam (Xiita)", symbol: "☪︎", color: "#10b981" },
  { name: "Islam (Sunita)", symbol: "☪︎", color: "#059669" },
  { name: "Islam (Ibadi)", symbol: "☪︎", color: "#0d9488" },
  { name: "Islam (Outro)", symbol: "☪︎", color: "#14b8a6" },
  { name: "Cristão (Protestante)", symbol: "✝", color: "#3b82f6" },
  { name: "Cristão (Católico)", symbol: "✝", color: "#eab308" },
  { name: "Cristão (Ortodoxo)", symbol: "☦", color: "#a16207" },
  { name: "Cristão (Mórmon)", symbol: "✝", color: "#f59e0b" },
  { name: "Cristão (Outro)", symbol: "✝", color: "#6366f1" },
  { name: "Testemunha de Jeová", symbol: "✝", color: "#0ea5e9" },
  { name: "Bahá'í", symbol: "✴", color: "#d97706" },
  { name: "Druzo", symbol: "★", color: "#16a34a" },
  { name: "Babista", symbol: "✦", color: "#c026d3" },
  { name: "Espírita", symbol: "✶", color: "#0891b2" },
  { name: "Hindu", symbol: "ॐ", color: "#f97316" },
  { name: "Hare Krishna", symbol: "ॐ", color: "#fb923c" },
  { name: "Judeu", symbol: "✡", color: "#2563eb" },
  { name: "Ateu", symbol: "⊘", color: "#6b7280" },
  { name: "Outro", symbol: "•", color: "#94a3b8" },
];

export const getReligion = (name?: string | null) =>
  RELIGIONS.find((r) => r.name === name);

export const ROLE_COLORS: Record<string, string> = {
  Fundador: "#f59e0b",
  Admin: "#ef4444",
  Escritor: "#8b5cf6",
  Membro: "#64748b",
};

export const getRoleColor = (role?: string | null) =>
  (role && ROLE_COLORS[role]) || ROLE_COLORS.Membro;
