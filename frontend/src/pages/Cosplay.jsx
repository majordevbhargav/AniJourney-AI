import { useEffect, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { Loader2, Sparkles, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export default function Cosplay() {
  const [anime, setAnime] = useState([]);
  const [pick, setPick] = useState("");
  const [style, setStyle] = useState("photorealistic");
  const [notes, setNotes] = useState("");
  const [img, setImg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [meta, setMeta] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState(null);

  const saveToGallery = async () => {
    if (!img || !meta) return;
    setSaving(true);
    try {
      const b64 = img.replace(/^data:image\/png;base64,/, "");
      const r = await api.post("/cosplay/save", { image_b64: b64, anime_id: pick, prompt: meta.prompt });
      setSavedId(r.data.id);
      toast.success("Saved to gallery!");
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Save failed — sign in?");
    } finally { setSaving(false); }
  };

  useEffect(() => { api.get("/anime").then((r) => { setAnime(r.data); setPick(r.data[0]?.id || ""); }); }, []);

  const gen = async (e) => {
    e.preventDefault();
    if (!pick) return;
    setBusy(true); setImg(null); setMeta(null);
    try {
      const r = await api.post("/cosplay/generate", { anime_id: pick, style, notes });
      setImg(`data:image/png;base64,${r.data.image_b64}`);
      setMeta({ anime: r.data.anime, prompt: r.data.prompt });
      toast.success("Cosplay generated!");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Generation failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-7xl mx-auto">
        <div className="section-label mb-6"><span className="en">Cosplay</span><span className="jp">コスプレ設計</span></div>
        <h1 className="font-display text-5xl md:text-6xl text-slate-900 leading-tight mb-4">Design your <span className="italic text-rose-500">cosplay.</span></h1>
        <p className="text-slate-600 text-lg max-w-2xl mb-10">Powered by OpenAI GPT-Image-1. Pick an anime, choose a style, add notes — get a cinematic reference sheet.</p>

        <div className="grid lg:grid-cols-12 gap-8">
          <form onSubmit={gen} className="lg:col-span-5 sticker-card rounded-3xl p-6 space-y-5" data-testid="cosplay-form">
            <div>
              <label className="font-accent text-[10px] text-slate-500 mb-2 block">ANIME</label>
              <select value={pick} onChange={(e) => setPick(e.target.value)} data-testid="cosplay-anime-select"
                      className="w-full bg-white border-2 border-sky-200 rounded-full px-4 py-2 text-slate-800">
                {anime.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
            </div>
            <div>
              <label className="font-accent text-[10px] text-slate-500 mb-2 block">STYLE</label>
              <div className="flex flex-wrap gap-2">
                {["photorealistic","anime","studio-portrait"].map((s) => (
                  <button type="button" key={s} onClick={() => setStyle(s)} data-testid={`cosplay-style-${s}`}
                          className={`px-4 py-2 rounded-full border-2 text-sm ${style === s ? "bg-sky-500 border-sky-500 text-white" : "bg-white border-sky-200 text-slate-700"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-accent text-[10px] text-slate-500 mb-2 block">NOTES (OPTIONAL)</label>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="cosplay-notes-input"
                        placeholder="e.g. add a katana, autumn leaves..." rows={3}
                        className="w-full bg-white border-2 border-sky-200 rounded-2xl p-3 text-slate-800" />
            </div>
            <button disabled={busy} className="btn-coral w-full" data-testid="cosplay-generate-btn">
              {busy ? <><Loader2 className="animate-spin" size={14} /> Rendering...</> : <><Sparkles size={14} /> Generate Cosplay</>}
            </button>
          </form>

          <div className="lg:col-span-7">
            {busy && <div className="sticker-card rounded-3xl p-16 text-center text-slate-500">Rendering your cosplay reference sheet... (10-20s)</div>}
            {!busy && !img && <div className="sticker-card rounded-3xl p-16 text-center text-slate-500 font-display text-2xl italic">Your reference sheet will appear here.</div>}
            {img && (
              <div className="sticker-card rounded-3xl p-4" data-testid="cosplay-result">
                <img src={img} alt="cosplay" className="w-full rounded-2xl" />
                {meta && (
                  <div className="p-4">
                    <div className="font-accent text-[10px] text-slate-500 mb-1">{meta.anime.toUpperCase()}</div>
                    <div className="font-body text-xs text-slate-600">{meta.prompt}</div>
                    <a href={img} download={`cosplay-${pick}.png`} className="btn-outline mt-4 inline-flex mr-2" data-testid="cosplay-download-btn">Download</a>
                    <button onClick={saveToGallery} disabled={saving || savedId} className="btn-coral mt-4 inline-flex" data-testid="cosplay-save-btn">
                      {saving ? <><Loader2 className="animate-spin" size={14} /> Saving...</> : savedId ? "Saved ✓" : <><Save size={14} /> Save to Gallery</>}
                    </button>
                    <Link to="/gallery" className="btn-outline mt-4 ml-2 inline-flex" data-testid="cosplay-gallery-link">View Gallery →</Link>
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
