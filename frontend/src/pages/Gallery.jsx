import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

export default function Gallery() {
  const [items, setItems] = useState([]);
  const [mine, setMine] = useState(false);
  const [anime, setAnime] = useState({});

  useEffect(() => {
    api.get("/anime").then((r) => setAnime(Object.fromEntries(r.data.map((a) => [a.id, a]))));
  }, []);
  useEffect(() => {
    api.get(`/cosplay/gallery?mine=${mine}`).then((r) => setItems(r.data)).catch(() => setItems([]));
  }, [mine]);

  const backend = process.env.REACT_APP_BACKEND_URL;

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <div className="section-label mb-4"><span className="en">Gallery</span><span className="jp">画廊</span></div>
            <h1 className="font-display text-5xl md:text-6xl text-slate-900 leading-tight">Community <span className="italic text-rose-500">cosplay</span> board.</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setMine(false)} data-testid="gallery-all-tab"
                    className={`px-4 py-2 rounded-full border-2 text-sm font-body ${!mine ? "bg-sky-500 text-white border-sky-500" : "bg-white text-slate-700 border-sky-200"}`}>Everyone</button>
            <button onClick={() => setMine(true)} data-testid="gallery-mine-tab"
                    className={`px-4 py-2 rounded-full border-2 text-sm font-body ${mine ? "bg-rose-500 text-white border-rose-500" : "bg-white text-slate-700 border-sky-200"}`}>Mine</button>
            <Link to="/cosplay" className="btn-coral" data-testid="gallery-new-btn">+ New</Link>
          </div>
        </div>

        {items.length === 0 && <div className="sticker-card rounded-3xl p-16 text-center text-slate-500 font-display text-2xl italic">No cosplay yet. Create one!</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="gallery-grid">
          {items.map((it) => (
            <div key={it.id} className="sticker-card rounded-3xl overflow-hidden" data-testid={`gallery-item-${it.id}`}>
              <img src={`${backend}/api/cosplay/image/${it.id}`} alt={it.anime_id} className="w-full aspect-square object-cover" />
              <div className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-accent text-[10px] text-rose-500 mb-1">{anime[it.anime_id]?.title || it.anime_id}</div>
                  <div className="font-body text-sm text-slate-700">by <span className="font-display text-slate-900">{it.user_name}</span></div>
                </div>
                <button data-testid={`gallery-share-${it.id}`} onClick={() => {
                  const url = `${window.location.origin}/api/share/cosplay/${it.id}`;
                  navigator.clipboard.writeText(url);
                  toast.success("Share URL copied!");
                }} className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 hover:bg-sky-200 flex items-center justify-center">
                  <Share2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
