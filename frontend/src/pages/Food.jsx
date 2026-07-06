import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { Loader2, Utensils, PartyPopper } from "lucide-react";
import { toast } from "sonner";

export default function Food() {
  const [anime, setAnime] = useState([]);
  const [selected, setSelected] = useState([]);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => { api.get("/anime").then((r) => setAnime(r.data)); }, []);
  const toggle = (id) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const fetchItems = async () => {
    if (!selected.length) { toast.error("Pick at least one anime"); return; }
    setBusy(true); setItems([]);
    try {
      const r = await api.post("/food-festivals", { anime_ids: selected, kind: "both" });
      setItems(r.data.items || []);
      if (!r.data.items?.length) toast.error("Couldn't parse. Try again.");
    } catch { toast.error("Failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="section-label mb-6"><span className="en">Taste</span><span className="jp">食と祭り</span></div>
        <h1 className="font-display text-5xl md:text-6xl text-slate-900 leading-tight mb-4">Eat like your <span className="italic text-rose-500">favorite scene.</span></h1>
        <p className="text-slate-600 text-lg max-w-2xl mb-10">Real ramen from Naruto. Wisteria festivals from Demon Slayer. Mochi from Your Name. Claude picks the food & festivals for your fandom.</p>

        <div className="sticker-card p-6 rounded-3xl mb-10">
          <div className="font-accent text-[10px] text-slate-500 mb-3">SELECT YOUR ANIME</div>
          <div className="flex flex-wrap gap-2 mb-6" data-testid="food-anime-picker">
            {anime.map((a) => (
              <button key={a.id} onClick={() => toggle(a.id)} data-testid={`food-anime-${a.id}`}
                      className={`px-4 py-2 rounded-full border-2 text-sm font-body transition ${selected.includes(a.id) ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-700 border-sky-200 hover:border-sky-400"}`}>
                {a.title}
              </button>
            ))}
          </div>
          <button onClick={fetchItems} disabled={busy} className="btn-sky" data-testid="food-generate-btn">
            {busy ? <><Loader2 className="animate-spin" size={14} /> Cooking...</> : "Discover Food & Festivals"}
          </button>
        </div>

        {busy && <div className="text-center text-slate-500 py-12">Claude is exploring Japan's kitchens...</div>}

        <div className="grid md:grid-cols-2 gap-6" data-testid="food-results">
          {items.map((it, i) => (
            <div key={i} className="sticker-card p-6 rounded-3xl">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${it.kind === "food" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>
                  {it.kind === "food" ? <Utensils size={20} /> : <PartyPopper size={20} />}
                </div>
                <div>
                  <div className="font-accent text-[10px] text-slate-400">{it.kind?.toUpperCase()} · {it.anime}</div>
                  <div className="font-display text-2xl text-slate-900">{it.name}</div>
                </div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed mb-3">{it.description}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="font-body text-sky-600">📍 {it.location}</span>
                <span className="font-body text-rose-500">🗓 {it.best_time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
