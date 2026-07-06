import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Star, MapPin, Calendar, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function Marketplace() {
  const { user } = useAuth();
  const [tab, setTab] = useState("hotels");
  const [hotels, setHotels] = useState([]);
  const [events, setEvents] = useState([]);
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("rating");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState({});

  const loadHotels = async () => {
    setLoading(true);
    try {
      const p = new URLSearchParams();
      if (city) p.set("city", city);
      if (maxPrice) p.set("max_price", maxPrice);
      p.set("sort", sort);
      const r = await api.get(`/marketplace/hotels?${p.toString()}`);
      setHotels(r.data);
    } finally { setLoading(false); }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const r = await api.get("/marketplace/events");
      setEvents(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (tab === "hotels") loadHotels();
    else loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, city, maxPrice, sort]);

  const book = async (item_type, item_id) => {
    if (!user) { toast.error("Sign in to reserve"); return; }
    try {
      const r = await api.post("/marketplace/book", { item_type, item_id });
      setBooked((b) => ({ ...b, [item_id]: r.data.status }));
      toast.success("Reserved! We'll email confirmation shortly.");
    } catch { toast.error("Booking failed"); }
  };

  const cities = [...new Set(hotels.map((h) => h.city))];

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="section-label mb-4"><span className="en">Marketplace</span><span className="jp">市場</span></div>
        <h1 className="font-display text-5xl md:text-6xl font-light mb-4">Book your pilgrimage.</h1>
        <p className="text-slate-500 max-w-2xl text-lg mb-10">Curated ryokans, anime-adjacent hotels, festivals and exhibitions — all in one place.</p>

        <div className="flex gap-3 mb-8" data-testid="marketplace-tabs">
          {["hotels", "events"].map((t) => (
            <button key={t} onClick={() => setTab(t)} data-testid={`tab-${t}`}
                    className={`px-6 py-2 rounded-full font-body text-sm capitalize transition-all ${tab === t ? "bg-rose-500 text-white shadow" : "bg-white text-slate-700 border-2 border-sky-100"}`}>
              {t}
            </button>
          ))}
        </div>

        {tab === "hotels" && (
          <>
            <div className="sticker-card rounded-3xl p-5 mb-8 flex flex-wrap gap-3 items-center" data-testid="hotel-filters">
              <select value={city} onChange={(e) => setCity(e.target.value)}
                      className="bg-white border-2 border-sky-100 rounded-full px-4 py-2 text-sm">
                <option value="">All Cities</option>
                {[...new Set([...cities, "Tokyo", "Kyoto", "Osaka", "Hakone", "Sapporo", "Uji", "Obanazawa"])].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <input type="number" placeholder="Max ₹ / night" value={maxPrice}
                     onChange={(e) => setMaxPrice(e.target.value)}
                     className="bg-white border-2 border-sky-100 rounded-full px-4 py-2 text-sm w-40 outline-none" />
              <select value={sort} onChange={(e) => setSort(e.target.value)}
                      className="bg-white border-2 border-sky-100 rounded-full px-4 py-2 text-sm">
                <option value="rating">Sort · Rating</option>
                <option value="price">Sort · Price</option>
              </select>
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="hotels-grid">
                {hotels.map((h) => (
                  <div key={h.id} className="sticker-card rounded-3xl overflow-hidden" data-testid={`hotel-${h.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 right-3 bg-white/90 rounded-full px-3 py-1 flex items-center gap-1">
                        <Star size={12} className="fill-amber-400 text-amber-400" />
                        <span className="text-xs font-body font-medium">{h.rating}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="font-display text-xl text-slate-900 mb-1">{h.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-1 mb-2"><MapPin size={11} /> {h.city}, {h.region}</div>
                      <div className="text-xs text-rose-500 italic mb-3">{h.anime_ref}</div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {h.amenities.map((a) => <span key={a} className="text-[10px] border border-sky-100 rounded-full px-2 py-0.5 text-slate-600">{a}</span>)}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-display text-2xl text-slate-900">₹{h.price_inr.toLocaleString()}<span className="text-xs text-slate-400 font-body ml-1">/ night</span></div>
                        {booked[h.id] ? (
                          <button className="btn-outline text-xs" disabled data-testid={`booked-${h.id}`}><CheckCircle2 size={12} /> Reserved</button>
                        ) : (
                          <button onClick={() => book("hotel", h.id)} className="btn-coral text-xs" data-testid={`book-hotel-${h.id}`}>Reserve</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "events" && (
          <>
            {loading ? (
              <div className="text-center py-16 text-slate-400"><Loader2 className="animate-spin mx-auto" /></div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="events-grid">
                {events.map((e) => (
                  <div key={e.id} className="sticker-card rounded-3xl overflow-hidden" data-testid={`event-${e.id}`}>
                    <div className="relative h-48 overflow-hidden">
                      <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                      <div className="absolute top-3 left-3 bg-rose-500 text-white rounded-full px-3 py-1 font-accent text-[9px]">{e.type.toUpperCase()}</div>
                    </div>
                    <div className="p-5">
                      <div className="font-display text-xl text-slate-900 mb-2">{e.name}</div>
                      <div className="text-xs text-slate-500 flex items-center gap-3 mb-2">
                        <span className="flex items-center gap-1"><Calendar size={11} /> {e.date}</span>
                        <span className="flex items-center gap-1"><MapPin size={11} /> {e.city}</span>
                      </div>
                      <p className="text-sm text-slate-600 mb-4 line-clamp-2">{e.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="font-display text-lg text-slate-900">{e.price_inr === 0 ? "Free" : `₹${e.price_inr.toLocaleString()}`}</div>
                        {booked[e.id] ? (
                          <button className="btn-outline text-xs" disabled><CheckCircle2 size={12} /> Reserved</button>
                        ) : (
                          <button onClick={() => book("event", e.id)} className="btn-coral text-xs" data-testid={`book-event-${e.id}`}>
                            {e.price_inr === 0 ? "Reserve" : "Buy Ticket"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
