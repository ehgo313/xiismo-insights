import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Fix default marker icon paths (Vite-friendly)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const mosqueIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  className: "marker-mosque",
});

type Marker = {
  id: string;
  type: "person" | "mosque";
  lat: number;
  lng: number;
  profile_username: string | null;
  mosque_name: string | null;
  mosque_photo_url: string | null;
  mosque_address: string | null;
};

type ProfileLite = { username: string; display_name: string; avatar_url: string | null };

const MapSection = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLite>>({});

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("map_markers").select("*");
      const ms = (data as Marker[]) ?? [];
      setMarkers(ms);
      const usernames = Array.from(new Set(ms.filter((m) => m.profile_username).map((m) => m.profile_username!)));
      if (usernames.length) {
        const { data: ps } = await supabase.from("profiles").select("username,display_name,avatar_url").in("username", usernames);
        const map: Record<string, ProfileLite> = {};
        (ps ?? []).forEach((p: any) => { map[p.username] = p; });
        setProfiles(map);
      }
    })();
  }, []);

  return (
    <section className="container pb-24">
      <div className="flex items-center gap-3 mb-10">
        <MapPin className="h-6 w-6 text-muted-foreground" />
        <h2 className="text-3xl md:text-4xl font-semibold">Procure Xiitas e Mesquitas próximas</h2>
      </div>
      <div className="rounded-md overflow-hidden border border-border" style={{ height: 500 }}>
        <MapContainer center={[-14.235, -51.9253]} zoom={4} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {markers.map((m) => (
            <Marker key={m.id} position={[m.lat, m.lng]} {...(m.type === "mosque" ? { icon: mosqueIcon } : {})}>
              <Popup>
                {m.type === "person" && m.profile_username ? (
                  <div className="flex items-center gap-2">
                    {profiles[m.profile_username]?.avatar_url && (
                      <img src={profiles[m.profile_username]!.avatar_url!} alt="" className="h-10 w-10 rounded-full object-cover" />
                    )}
                    <div>
                      <div className="font-semibold">{profiles[m.profile_username]?.display_name ?? m.profile_username}</div>
                      <Link to={`/${m.profile_username}`} className="text-xs underline">Ver perfil</Link>
                    </div>
                  </div>
                ) : (
                  <div className="max-w-[200px]">
                    {m.mosque_photo_url && <img src={m.mosque_photo_url} alt="" className="w-full h-24 object-cover rounded mb-1" />}
                    <div className="font-semibold">{m.mosque_name}</div>
                    {m.mosque_address && <div className="text-xs opacity-80">{m.mosque_address}</div>}
                  </div>
                )}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
};

export default MapSection;
