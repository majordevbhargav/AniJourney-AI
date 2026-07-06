import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { toast } from "sonner";

export default function Passport() {
  const [data, setData] = useState(null);
  const [locs, setLocs] = useState([]);

  const load = () => {
    api.get("/passport").then((r) => setData(r.data)).catch(() => setData({ error: true }));
    api.get("/locations").then((r) => setLocs(r.data));
  };
  useEffect(load, []);

  const checkin = async (loc_id) => {
    try {
      const r = await api.post("/visits/checkin", { location_id: loc_id });
      if (r.data.already) toast("Already stamped.");
      else toast.success(`+${r.data.xp_gained} XP · stamp collected!`);
      load();
    } catch { toast.error("Check-in failed. Login required."); }
  };

  if (!data) return <div className="min-h-screen bg-sky-texture"><Navbar /><div className="pt-32 text-center text-slate-500">Loading passport...</div></div>;
  if (data.error) return <div className="min-h-screen bg-sky-texture"><Navbar /><div className="pt-32 text-center text-slate-500">Sign in to open your passport.</div></div>;

  const stampedIds = new Set(data.stamps.map((s) => s.location.id));

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="section-label mb-6"><span className="en">Passport</span><span className="jp">アニメ手帳</span></div>
        <h1 className="font-display text-5xl md:text-6xl text-slate-900 leading-tight mb-8">Your <span className="italic text-sky-500">pilgrimage</span> book.</h1>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="sticker-card p-6 rounded-3xl text-center" data-testid="passport-level">
            <div className="font-accent text-[10px] text-slate-500">LEVEL</div>
            <div className="font-display text-5xl text-sky-500">{data.level}</div>
          </div>
          <div className="sticker-card p-6 rounded-3xl text-center" data-testid="passport-xp">
            <div className="font-accent text-[10px] text-slate-500">TOTAL XP</div>
            <div className="font-display text-5xl text-rose-500">{data.total_xp}</div>
          </div>
          <div className="sticker-card p-6 rounded-3xl text-center" data-testid="passport-stamps">
            <div className="font-accent text-[10px] text-slate-500">STAMPS</div>
            <div className="font-display text-5xl text-amber-500">{data.count}</div>
          </div>
        </div>

        {/* Badges */}
        <h2 className="font-display text-3xl text-slate-900 mb-4">Badges · 記章</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-12" data-testid="passport-badges">
          {data.badges.map((b) => (
            <div key={b.id} className={`sticker-card p-5 rounded-3xl text-center ${b.unlocked ? "" : "opacity-40 grayscale"}`}>
              <div className="text-5xl mb-2">{b.emoji}</div>
              <div className="font-display text-sm text-slate-900">{b.name}</div>
              <div className="font-accent text-[9px] text-slate-500 mt-1">{b.unlocked ? "UNLOCKED" : `${b.requires} STAMPS`}</div>
            </div>
          ))}
        </div>

        {/* Check-in list */}
        <h2 className="font-display text-3xl text-slate-900 mb-4">Check In · チェックイン</h2>
        <div className="grid md:grid-cols-2 gap-4" data-testid="passport-checkin-list">
          {locs.map((l) => (
            <div key={l.id} className="sticker-card p-5 rounded-3xl flex items-center justify-between">
              <div>
                <div className="font-display text-lg text-slate-900">{l.name}</div>
                <div className="font-body text-xs text-slate-500">{l.city} · {l.region}</div>
              </div>
              {stampedIds.has(l.id) ? (
                <div className="text-3xl">🌸</div>
              ) : (
                <button onClick={() => checkin(l.id)} className="btn-sky" data-testid={`checkin-btn-${l.id}`}>Check In</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
