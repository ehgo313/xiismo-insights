// All Brazilian municipalities (5570+) with coordinates.
// Source: kelvins/municipios-brasileiros (IBGE-based).
import data from "./brazilCitiesData.json";

export type BrazilCity = { name: string; state: string; lat: number; lng: number };

export const BRAZIL_CITIES: BrazilCity[] = (data as [string, string, number, number][]).map(
  ([name, state, lat, lng]) => ({ name, state, lat, lng }),
);

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export const findCity = (query: string, state?: string): BrazilCity | null => {
  if (!query) return null;
  const q = norm(query);
  const filt = state
    ? BRAZIL_CITIES.filter((c) => c.state === state.toUpperCase())
    : BRAZIL_CITIES;
  return (
    filt.find((c) => norm(c.name) === q) ||
    filt.find((c) => norm(c.name).startsWith(q)) ||
    filt.find((c) => norm(c.name).includes(q)) ||
    null
  );
};

export const searchCities = (query: string, limit = 20): BrazilCity[] => {
  if (!query.trim()) return [];
  const q = norm(query);
  const starts: BrazilCity[] = [];
  const includes: BrazilCity[] = [];
  for (const c of BRAZIL_CITIES) {
    const n = norm(c.name);
    if (n.startsWith(q)) starts.push(c);
    else if (n.includes(q)) includes.push(c);
    if (starts.length >= limit) break;
  }
  return [...starts, ...includes].slice(0, limit);
};

// Haversine distance in km
export const distanceKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
};
