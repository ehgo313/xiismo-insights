import { useEffect, useMemo, useState } from "react";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import { Link } from "react-router-dom";
import { MapPin, Building2, ExternalLink, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { findCity, searchCities } from "@/lib/brazilCities";

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

type ProfileLite = { username: string; display_name: string; avatar_url: string | null; profile_color: string | null };

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

export function BrazilMap() {
  const [pins, setPins] = useState<CityPin[]>([]);
  const [profilesMap, setProfilesMap] = useState<Record<string, ProfileLite>>({});
  const [selected, setSelected] = useState<{ city: string; state?: string | null; lat?: number; lng?: number } | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("city_pins").select("*").then(({ data }) => setPins(((data as CityPin[]) ?? []).filter(Boolean)));
    supabase.from("profiles").select("username, display_name, avatar_url, profile_color").then(({ data }) => {
      const m: Record<string, ProfileLite> = {};
      (data as ProfileLite[] ?? []).forEach((p) => { m[p.username] = p; });
      setProfilesMap(m);
    });
  }, []);

  const cityPins = useMemo(() => {
    if (!selected) return [];
    const list = pins.filter((p) => norm(p.city) === norm(selected.city));
    return list.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "mosque" ? -1 : 1));
  }, [pins, selected]);

  const statePins = useMemo(() => {
    if (!selectedState) return [];
    return pins.filter((p) => (p.state ?? "").toUpperCase() === selectedState);
  }, [pins, selectedState]);

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

  const clearAll = () => { setSelected(null); setSelectedState(null); };

  return (
    <div className="grid md:grid-cols-[1fr_320px] gap-6">
      <div className="bg-card border border-border rounded-md p-4 relative overflow-hidden">
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
            <p className="text-sm">Clique num estado ou num marcador no mapa.</p>
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
                <MapPin className="h-3.5 w-3.5" /> Cidade selecionada
              </div>
              <h3 className="text-2xl font-semibold mt-1">{selected.city}</h3>
              {selected.state && <p className="text-xs text-muted-foreground mt-0.5">{selected.state}</p>}
            </div>

            {cityPins.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sem registos nesta cidade.</p>
            ) : (
              <div className="space-y-3">
                {cityPins.map((p) =>
                  p.kind === "mosque" ? (
                    <div key={p.id} className="p-3 rounded border border-border">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                          <Building2 className="h-5 w-5 text-emerald-400" />
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
                  ) : (() => {
                    const prof = p.profile_username ? profilesMap[p.profile_username] : null;
                    return (
                      <Link key={p.id} to={`/${p.profile_username ?? ""}`}
                        className="flex items-center gap-3 p-3 rounded border border-border hover:border-foreground/40 transition">
                        {prof?.avatar_url ? (
                          <img src={prof.avatar_url} alt="" className="h-10 w-10 rounded-full object-cover border-2"
                            style={{ borderColor: prof.profile_color ?? "transparent" }} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="text-sm font-medium">{prof?.display_name ?? `@${p.profile_username}`}</div>
                          <div className="text-xs text-muted-foreground">@{p.profile_username}</div>
                          {p.notes && <div className="text-xs text-muted-foreground mt-0.5">{p.notes}</div>}
                        </div>
                      </Link>
                    );
                  })(),
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
