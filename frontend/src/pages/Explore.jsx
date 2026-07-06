import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Explore() {
  const [anime, setAnime] = useState([]);
  const [query, setQuery] = useState("");
  const [recs, setRecs] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/anime").then((r) => setAnime(r.data)); }, []);

  const recommend = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setBusy(true);
    try {
      const r = await api.post("/recommend", { query });
      setRecs(r.data.recommendations || []);
      if (!r.data.recommendations?.length) toast.error("Couldn't parse recommendations. Try again.");
    } catch { toast.error("Recommendation failed"); }
    finally { setBusy(false); }
  };

  const recSet = new Set(recs.map(r => r.id));

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white grain">
      <Navbar />
      <div className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="font-accent text-[11px] text-[#F4C5D6] mb-4">EXPLORE</div>
        <h1 className="font-serif-display text-5xl md:text-6xl font-light mb-4">The Anime Atlas</h1>
        <p className="text-zinc-400 max-w-2xl text-lg leading-relaxed mb-12">
          Describe a feeling and let Claude Sonnet discover your next series, or browse the curated library.
        </p>

        {/* AI Recommender */}
        <form onSubmit={recommend} className="glass p-6 mb-16" data-testid="recommend-form">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles size={16} className="text-[#F4C5D6]" strokeWidth={1.5} />
            <span className="font-accent text-[10px] text-zinc-400">MOOD-BASED AI RECOMMENDER</span>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              data-testid="recommend-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="I want something peaceful like Frieren but with mystery..."
              className="flex-1 bg-transparent border-b border-white/20 focus:border-[#E14D45] outline-none py-3 text-white text-lg"
            />
            <button disabled={busy} className="btn-primary" data-testid="recommend-submit-btn">
              {busy ? <Loader2 className="animate-spin" size={14} /> : "Recommend"}
            </button>
          </div>
          {recs.length > 0 && (
            <div className="mt-6 grid gap-3" data-testid="recommendation-results">
              {recs.map((r, i) => (
                <div key={i} className="border-l-2 border-[#E14D45] pl-4 py-2">
                  <div className="font-serif-display text-xl">{r.title}</div>
                  <div className="text-sm text-zinc-400 italic">{r.reason}</div>
                </div>
              ))}
            </div>
          )}
        </form>

        {/* Anime Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="anime-grid">
          {anime.map((a) => (
            <Link key={a.id} to={`/anime/${a.id}`} className="card-anime overflow-hidden block group" data-testid={`anime-card-${a.id}`}>
              <div className="relative h-64 overflow-hidden">
                <img src={a.poster} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                {recSet.has(a.id) && (
                  <div className="absolute top-4 right-4 font-accent text-[9px] bg-[#E14D45] px-3 py-1">AI PICK</div>
                )}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="font-accent text-[9px] text-[#F4C5D6] mb-1">{a.year} · {a.genres.slice(0, 2).join(" · ")}</div>
                  <div className="font-serif-display text-2xl leading-tight">{a.title}</div>
                </div>
              </div>
              <div className="p-5">
                <p className="text-sm text-zinc-400 leading-relaxed line-clamp-2">{a.synopsis}</p>
                <div className="mt-3 flex gap-2 flex-wrap">
                  {a.mood.map((m) => <span key={m} className="font-accent text-[9px] text-zinc-500 border border-white/10 px-2 py-1">{m}</span>)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
