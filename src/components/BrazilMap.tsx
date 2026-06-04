import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Link } from "react-router-dom";
import { MapPin, Search, User, Building2, ExternalLink, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { findCity, distanceKm, searchCities } from "@/lib/brazilCities";

const BR_GEO_URL =
  "https://raw.githubusercontent.com/codeforgermany/click_that_hood/main/public/data/brazil-states.geojson";

export type CityPin = {
  id: string;
  city: string;
  state: string | null;
  lat: number;
  lng: number;
  kind: "profile" | "mosque";
  profile_username: string | null;
  mosque_name: string | null;
  address: string | null;
  link: string | null;
  notes: string | null;
};

type IbgeCity = { name: string; state: string };

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

const STATE_NAME_TO_UF: Record<string, string> = {
  "acre": "AC", "alagoas": "AL", "amapa": "AP", "amazonas": "AM",
  "bahia": "BA", "ceara": "CE", "distrito federal": "DF", "espirito santo": "ES",
  "goias": "GO", "maranhao": "MA", "mato grosso": "MT", "mato grosso do sul": "MS",
  "minas gerais": "MG", "para": "PA", "paraiba": "PB", "parana": "PR",
  "pernambuco": "PE", "piaui": "PI", "rio de janeiro": "RJ", "rio grande do norte": "RN",
  "rio grande do sul": "RS", "rondonia": "RO", "roraima": "RR", "santa catarina": "SC",
  "sao paulo": "SP", "sergipe": "SE", "tocantins": "TO",
};
const geoNameToUF = (name: string): string | null => STATE_NAME_TO_UF[norm(name)] ?? null;

async function geocodeCity(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&q=${encodeURIComponent(query)}`;
    const r = await fetch(url, { headers: { Accept: "application/json" } });
    const j = (await r.json()) as Array<{ lat: string; lon: string }>;
    if (!j.length) return null;
    return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) };
  } catch { return null; }
}

export function BrazilMap() {
  const [pins, setPins] = useState<CityPin[]>([]);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{ city: string; state?: string | null; lat?: number; lng?: number; nearest?: boolean } | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<IbgeCity[]>([]);

  useEffect(() => {
    supabase.from("city_pins").select("*").then(({ data }) => setPins(((data as CityPin[]) ?? []).filter(Boolean)));
  }, []);

  useEffect(() => {
    if (!query.trim()) return setSuggestions([]);
    const matches = searchCities(query, 10).map((c) => ({ name: c.name, state: c.state }));
    setSuggestions(matches);
  }, [query]);

  const cityPins = useMemo(() => {
    if (!selected) return [];
    return pins.filter((p) => norm(p.city) === norm(selected.city));
  }, [pins, selected]);

  const statePins = useMemo(() => {
    if (!selectedState) return [];
    return pins.filter((p) => (p.state ?? "").toUpperCase() === selectedState);
  }, [pins, selectedState]);

  const handleSearch = async (cityName?: string, cityState?: string) => {
    const target = cityName ?? query;
    if (!target.trim()) return;
    setSuggestions([]);
    setQuery(target);
    setSelectedState(null);

    const matched = pins.find((p) => norm(p.city) === norm(target));
    if (matched) {
      setSelected({ city: matched.city, state: matched.state, lat: matched.lat, lng: matched.lng });
      return;
    }

    const known = findCity(target);
    let coords: { lat: number; lng: number } | null = known ? { lat: known.lat, lng: known.lng } : null;
    if (!coords) coords = await geocodeCity(cityState ? `${target}, ${cityState}, Brasil` : `${target}, Brasil`);

    if (coords && pins.length > 0) {
      const nearest = pins.map((p) => ({ p, d: distanceKm(coords!, p) })).sort((a, b) => a.d - b.d)[0];
      setSelected({ city: nearest.p.city, state: nearest.p.state, lat: nearest.p.lat, lng: nearest.p.lng, nearest: true });
      return;
    }
    setSelected({ city: target, state: cityState ?? null });
  };

  const groupedMarkers = useMemo(() => {
    const map = new Map<string, { city: string; lat: number; lng: number; count: number }>();
    pins.forEach((p) => {
      const key = norm(p.city);
      const cur = map.get(key);
      if (cur) cur.count += 1;
      else map.set(key, { city: p.city, lat: p.lat, lng: p.lng, count: 1 });
    });
    return Array.from(map.values());
  }, [pins]);

  const clearAll = () => { setSelected(null); setSelectedState(null); setQuery(""); };

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <div className="bg-card border border-border rounded-md p-4 relative overflow-hidden">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
            placeholder="Procurar qualquer cidade do Brasil..."
            className="pl-10 h-11 bg-background"
          />
          {suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-popover border border-border rounded-md shadow-lg max-h-72 overflow-auto">
              {suggestions.map((c) => (
                <button key={`${c.name}-${c.state}`} onClick={() => handleSearch(c.name, c.state)}
                  className="w-full text-left px-3 py-2 hover:bg-accent text-sm flex justify-between">
                  <span>{c.name}</span>
                  <span className="text-muted-foreground text-xs">{c.state}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 750, center: [-54, -15] }}
          width={600} height={600} style={{ width: "100%", height: "auto" }}>
          <Geographies geography={BR_GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const uf = geoNameToUF(geo.properties.name ?? "");
                const isSel = uf && uf === selectedState;
                return (
                  <Geography key={geo.rsmKey} geography={geo}
                    onClick={() => { if (!uf) return; setSelectedState(uf); setSelected(null); }}
                    style={{
                      default: { fill: isSel ? "hsl(142 70% 22%)" : "hsl(0 0% 14%)", stroke: "hsl(0 0% 30%)", strokeWidth: 0.6, outline: "none", cursor: "pointer" },
                      hover: { fill: "hsl(142 60% 18%)", outline: "none", cursor: "pointer" },
                      pressed: { fill: "hsl(142 70% 22%)", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
          {groupedMarkers.map((m) => {
            const isSel = selected && norm(selected.city) === norm(m.city);
            return (
              <Marker key={m.city} coordinates={[m.lng, m.lat]}
                onClick={() => setSelected({ city: m.city, lat: m.lat, lng: m.lng })}
                style={{ default: { cursor: "pointer" }, hover: { cursor: "pointer" }, pressed: { cursor: "pointer" } }}>
                <circle r={isSel ? 8 : 5} fill="#22c55e" stroke="#fff" strokeWidth={1.5} opacity={isSel ? 1 : 0.85} />
                {m.count > 1 && (
                  <text textAnchor="middle" y={3} style={{ fontSize: 8, fill: "#fff", fontWeight: 700, pointerEvents: "none" }}>
                    {m.count}
                  </text>
                )}
              </Marker>
            );
          })}
        </ComposableMap>
      </div>

      <aside className="bg-card border border-border rounded-md p-5">
        {!selected && !selectedState ? (
          <div className="text-center text-muted-foreground py-10">
            <MapPin className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Clique num estado, num marcador, ou pesquise qualquer cidade do Brasil.</p>
          </div>
        ) : selectedState && !selected ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" /> Estado selecionado
                </div>
                <h3 className="text-2xl font-semibold mt-1">{selectedState}</h3>
              </div>
              <button onClick={clearAll} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
            </div>
            {statePins.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem registos neste estado ainda.</p>
            ) : (
              <div className="space-y-2">
                {Array.from(new Set(statePins.map((p) => p.city))).map((city) => {
                  const p = statePins.find((x) => x.city === city)!;
                  const count = statePins.filter((x) => x.city === city).length;
                  return (
                    <button key={city} onClick={() => setSelected({ city: p.city, state: p.state, lat: p.lat, lng: p.lng })}
                      className="w-full text-left p-3 rounded border border-border hover:border-foreground/40 flex justify-between items-center">
                      <span className="text-sm font-medium">{city}</span>
                      <span className="text-xs text-muted-foreground">{count}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : selected ? (
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                {selected.nearest ? "Cidade mais próxima" : "Cidade selecionada"}
              </div>
              <h3 className="text-2xl font-semibold mt-1">{selected.city}</h3>
              {selected.state && <p className="text-xs text-muted-foreground mt-0.5">{selected.state}</p>}
              {selected.nearest && (
                <p className="text-xs text-muted-foreground mt-1">Não encontramos registos em "{query}". Resultado mais próximo:</p>
              )}
            </div>

            {cityPins.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem registos nesta cidade.</p>
            ) : (
              <div className="space-y-3">
                {cityPins.map((p) =>
                  p.kind === "profile" ? (
                    <Link key={p.id} to={`/${p.profile_username ?? ""}`}
                      className="flex items-center gap-3 p-3 rounded border border-border hover:border-foreground/40 transition">
                      <div className="h-9 w-9 rounded-full bg-primary/15 flex items-center justify-center">
                        <User className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">@{p.profile_username}</div>
                        {p.notes && <div className="text-xs text-muted-foreground">{p.notes}</div>}
                      </div>
                    </Link>
                  ) : (
                    <div key={p.id} className="p-3 rounded border border-border">
                      <div className="flex items-start gap-3">
                        <div className="h-9 w-9 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <Building2 className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium">{p.mosque_name}</div>
                          {p.address && <div className="text-xs text-muted-foreground">{p.address}</div>}
                          {p.link && (
                            <a href={p.link} target="_blank" rel="noopener noreferrer"
                              className="text-xs text-foreground/80 hover:text-foreground inline-flex items-center gap-1 mt-1">
                              <ExternalLink className="h-3 w-3" /> abrir
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            )}

            <Button variant="outline" size="sm" onClick={clearAll} className="w-full">Limpar</Button>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
