import { MapPin } from "lucide-react";
import { BrazilMap } from "./BrazilMap";

const MapSection = () => (
  <section className="container pb-24">
    <div className="flex items-center gap-3 mb-10">
      <MapPin className="h-6 w-6 text-muted-foreground" />
      <h2 className="text-3xl md:text-4xl font-semibold">Procure Xiitas e Mesquitas próximas</h2>
    </div>
    <BrazilMap />
  </section>
);

export default MapSection;
