import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { MapPin } from "lucide-react";

const icon = L.divIcon({
  className: "aj-marker",
  html: `<div style="width:16px;height:16px;background:#E14D45;border:2px solid #F4C5D6;border-radius:50%;box-shadow:0 0 20px rgba(225,77,69,0.7);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8]
});

export default function MapView() {
  const [locs, setLocs] = useState([]);
  const [anime, setAnime] = useState({});
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/locations"), api.get("/anime")]).then(([l, a]) => {
      setLocs(l.data);
      setAnime(Object.fromEntries(a.data.map((x) => [x.id, x])));
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white">
      <Navbar />
      <div className="pt-20 relative">
        <div className="absolute top-24 left-8 z-[500] glass p-5 max-w-sm" data-testid="map-header-card">
          <div className="font-accent text-[10px] text-[#F4C5D6] mb-2">PILGRIMAGE ATLAS</div>
          <div className="font-serif-display text-3xl">Japan, mapped by anime.</div>
          <div className="text-sm text-zinc-400 mt-2">{locs.length} pilgrimage locations across the archipelago.</div>
        </div>

        <div style={{ height: "calc(100vh - 80px)", width: "100%" }}>
          <MapContainer center={[36.5, 138]} zoom={5} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                       attribution='&copy; OpenStreetMap' />
            {locs.map((l) => (
              <Marker key={l.id} position={[l.lat, l.lng]} icon={icon}
                      eventHandlers={{ click: () => setSelected(l) }}>
                <Popup>
                  <div style={{ minWidth: 220 }}>
                    <div style={{ fontFamily: "'Outfit'", fontSize: 9, letterSpacing: 2, color: "#F4C5D6" }}>
                      {anime[l.anime_id]?.title?.toUpperCase()}
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond'", fontSize: 20, marginTop: 4 }}>{l.name}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 6 }}>{l.city} · {l.region}</div>
                    <p style={{ fontSize: 12, color: "#CBD5E1", marginTop: 8 }}>{l.description}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {selected && (
          <div className="absolute bottom-8 right-8 z-[500] glass p-6 max-w-sm" data-testid="map-selected-card">
            <div className="flex items-center gap-2 font-accent text-[10px] text-[#F4C5D6] mb-2">
              <MapPin size={12} strokeWidth={1.5} /> {selected.city}, {selected.region}
            </div>
            <div className="font-serif-display text-2xl mb-2">{selected.name}</div>
            <div className="text-sm text-zinc-400 mb-3">{anime[selected.anime_id]?.title}</div>
            <p className="text-sm text-zinc-300 leading-relaxed">{selected.description}</p>
            <p className="text-xs italic text-zinc-500 mt-3">{selected.cultural_note}</p>
          </div>
        )}
      </div>
    </div>
  );
}
