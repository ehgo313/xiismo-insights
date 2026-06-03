import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

type Props = { lat: number | null; lng: number | null; onPick: (lat: number, lng: number) => void };

const Picker = ({ onPick }: { onPick: (lat: number, lng: number) => void }) => {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
};

const MapPicker = ({ lat, lng, onPick }: Props) => {
  const [pos, setPos] = useState<[number, number] | null>(lat != null && lng != null ? [lat, lng] : null);
  useEffect(() => { if (lat != null && lng != null) setPos([lat, lng]); }, [lat, lng]);
  return (
    <div className="rounded-md overflow-hidden border border-border" style={{ height: 300 }}>
      <MapContainer center={pos ?? [-14.235, -51.9253]} zoom={pos ? 10 : 4} style={{ height: "100%", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Picker onPick={(la, ln) => { setPos([la, ln]); onPick(la, ln); }} />
        {pos && <Marker position={pos} />}
      </MapContainer>
    </div>
  );
};

export default MapPicker;
