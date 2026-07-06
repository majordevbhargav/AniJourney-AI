import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { MapPin, ArrowLeft } from "lucide-react";

export default function AnimeDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => { api.get(`/anime/${id}`).then((r) => setData(r.data)); }, [id]);

  if (!data) return <div className="min-h-screen bg-[#0A0D14] text-zinc-500 flex items-center justify-center">Loading pilgrimage...</div>;
  const { anime, locations } = data;

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white grain">
      <Navbar />
      <div className="relative h-[60vh]">
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/50 to-[#0A0D14]/20" />
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 max-w-7xl mx-auto">
          <Link to="/explore" className="inline-flex items-center gap-2 font-accent text-[10px] text-zinc-400 hover:text-white mb-4" data-testid="back-to-explore-link">
            <ArrowLeft size={14} strokeWidth={1.5} /> BACK TO ATLAS
          </Link>
          <div className="font-accent text-[10px] text-[#F4C5D6] mb-3">{anime.year} · {anime.genres.join(" · ")}</div>
          <h1 className="font-serif-display text-5xl md:text-7xl font-light mb-4" data-testid="anime-detail-title">{anime.title}</h1>
          <p className="text-lg text-zinc-300 max-w-2xl">{anime.synopsis}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 py-16">
        <div className="font-accent text-[11px] text-[#F4C5D6] mb-3">PILGRIMAGE LOCATIONS</div>
        <h2 className="font-serif-display text-4xl mb-10">Real places from {anime.title}</h2>

        {locations.length === 0 ? (
          <p className="text-zinc-500">More pilgrimage locations coming soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6" data-testid="locations-grid">
            {locations.map((l) => (
              <div key={l.id} className="card-anime overflow-hidden" data-testid={`location-card-${l.id}`}>
                <div className="relative h-56">
                  <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 font-accent text-[10px] text-[#F4C5D6]">
                      <MapPin size={12} strokeWidth={1.5} /> {l.city} · {l.region}
                    </div>
                    <div className="font-serif-display text-2xl mt-1">{l.name}</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-zinc-400 leading-relaxed mb-3">{l.description}</p>
                  <p className="text-sm text-zinc-500 italic">{l.cultural_note}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
