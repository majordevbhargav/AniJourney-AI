import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { Loader2, Wallet, CalendarDays, Cloud } from "lucide-react";
import { toast } from "sonner";

export default function Planner() {
  const [anime, setAnime] = useState([]);
  const [selected, setSelected] = useState([]);
  const [duration, setDuration] = useState(5);
  const [budget, setBudget] = useState(150000);
  const [season, setSeason] = useState("Spring");
  const [startCity, setStartCity] = useState("Tokyo");
  const [busy, setBusy] = useState(false);
  const [itinerary, setItinerary] = useState(null);

  useEffect(() => { api.get("/anime").then((r) => setAnime(r.data)); }, []);

  const toggle = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const generate = async () => {
    if (!selected.length) { toast.error("Select at least one anime"); return; }
    setBusy(true);
    setItinerary(null);
    try {
      const r = await api.post("/trip/generate", {
        anime_ids: selected,
        duration_days: parseInt(duration),
        budget_inr: parseInt(budget),
        season,
        start_city: startCity
      });
      if (r.data.error) { toast.error("AI response couldn't be parsed. Retry."); return; }
      setItinerary(r.data);
      toast.success("Itinerary crafted.");
    } catch { toast.error("Trip generation failed"); }
    finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="font-accent text-[11px] text-rose-500 mb-4">AI TRIP ARCHITECT</div>
        <h1 className="font-display text-5xl md:text-6xl font-light mb-4">Craft your pilgrimage</h1>
        <p className="text-slate-500 max-w-2xl text-lg mb-12">Pick your favorite anime. Set your budget. Claude will architect the entire journey.</p>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Form */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <div className="font-accent text-[10px] text-slate-500 mb-4">FAVORITE ANIME (SELECT MULTIPLE)</div>
              <div className="grid grid-cols-2 gap-3" data-testid="anime-selector-grid">
                {anime.map((a) => (
                  <button key={a.id} onClick={() => toggle(a.id)}
                          data-testid={`planner-anime-${a.id}`}
                          className={`text-left p-3 border transition-all ${selected.includes(a.id) ? "border-rose-500 bg-rose-100" : "border-sky-100 hover:border-sky-300"}`}>
                    <div className="font-display text-sm leading-tight">{a.title}</div>
                    <div className="font-accent text-[9px] text-slate-400 mt-1">{a.year}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="font-accent text-[10px] text-slate-500 mb-3 flex items-center gap-2"><CalendarDays size={12} strokeWidth={1.5} /> DURATION (DAYS)</label>
                <input type="number" min={3} max={21} value={duration} onChange={(e) => setDuration(e.target.value)}
                       data-testid="planner-duration-input"
                       className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-2 text-slate-900 text-2xl font-display" />
              </div>
              <div>
                <label className="font-accent text-[10px] text-slate-500 mb-3 flex items-center gap-2"><Wallet size={12} strokeWidth={1.5} /> BUDGET (₹)</label>
                <input type="number" step={10000} value={budget} onChange={(e) => setBudget(e.target.value)}
                       data-testid="planner-budget-input"
                       className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-2 text-slate-900 text-2xl font-display" />
              </div>
              <div>
                <label className="font-accent text-[10px] text-slate-500 mb-3 flex items-center gap-2"><Cloud size={12} strokeWidth={1.5} /> SEASON</label>
                <select value={season} onChange={(e) => setSeason(e.target.value)} data-testid="planner-season-select"
                        className="w-full bg-white border-sky-200 border border-sky-100 py-2 px-3 text-slate-900">
                  {["Spring", "Summer", "Autumn", "Winter"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="font-accent text-[10px] text-slate-500 mb-3 block">START CITY</label>
                <select value={startCity} onChange={(e) => setStartCity(e.target.value)} data-testid="planner-city-select"
                        className="w-full bg-white border-sky-200 border border-sky-100 py-2 px-3 text-slate-900">
                  {["Tokyo", "Osaka", "Kyoto", "Sapporo"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <button onClick={generate} disabled={busy} className="btn-coral w-full" data-testid="planner-generate-btn">
              {busy ? <span className="flex items-center justify-center gap-2"><Loader2 className="animate-spin" size={14} /> Crafting...</span> : "Generate Itinerary"}
            </button>
          </div>

          {/* Result */}
          <div className="lg:col-span-7">
            {busy && <div className="sticker-card rounded-3xl p-12 text-center text-slate-500" data-testid="planner-loading"><Loader2 className="animate-spin mx-auto mb-4" /> Claude is architecting your journey...</div>}
            {!busy && !itinerary && (
              <div className="sticker-card rounded-3xl p-12 text-center text-slate-400">
                <div className="font-display text-2xl mb-2 italic">"A journey of a thousand miles begins with a single step."</div>
                <div className="font-accent text-[10px]">— LAO TZU</div>
              </div>
            )}
            {itinerary && (
              <div className="space-y-6" data-testid="itinerary-result">
                <div className="sticker-card rounded-3xl p-6">
                  <div className="font-accent text-[10px] text-rose-500 mb-2">YOUR ITINERARY</div>
                  <h2 className="font-display text-3xl mb-2" data-testid="itinerary-title">{itinerary.title}</h2>
                  <p className="text-slate-500 mb-4">{itinerary.summary}</p>
                  <div className="font-accent text-[11px] text-amber-600">EST. COST · ₹{itinerary.estimated_cost_inr?.toLocaleString?.() || itinerary.estimated_cost_inr}</div>
                </div>

                {itinerary.days?.map((d) => (
                  <div key={d.day} className="sticker-card rounded-3xl p-6" data-testid={`itinerary-day-${d.day}`}>
                    <div className="flex items-baseline justify-between mb-4">
                      <div>
                        <div className="font-accent text-[10px] text-rose-500">DAY {d.day} · {d.city?.toUpperCase()}</div>
                        <div className="font-display text-2xl mt-1">{d.theme}</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {d.activities?.map((act, i) => (
                        <div key={i} className="border-l border-sky-100 pl-4">
                          <div className="font-accent text-[9px] text-slate-400 mb-1">{act.time?.toUpperCase()}</div>
                          <div className="font-display text-lg">{act.place}</div>
                          {act.anime && <div className="text-xs text-rose-500 italic">from {act.anime}</div>}
                          <p className="text-sm text-slate-500 mt-1">{act.description}</p>
                          {act.cost_inr != null && <div className="text-xs text-slate-400 mt-1">₹{act.cost_inr?.toLocaleString?.() || act.cost_inr}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {itinerary.tips?.length > 0 && (
                  <div className="sticker-card rounded-3xl p-6">
                    <div className="font-accent text-[10px] text-rose-500 mb-3">TRAVELER TIPS</div>
                    <ul className="space-y-2 text-sm text-slate-600">
                      {itinerary.tips.map((t, i) => <li key={i} className="flex gap-2"><span className="text-rose-600">◆</span>{t}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
