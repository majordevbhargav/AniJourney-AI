import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { API } from "../lib/api";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Copy, FileDown, CalendarPlus, Printer } from "lucide-react";

export default function TripShare() {
  const { slug } = useParams();
  const [trip, setTrip] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/trips/share/${slug}`).then((r) => setTrip(r.data)).catch(() => setErr(true));
  }, [slug]);

  const shareUrl = `${window.location.origin}/api/share/trip/${slug}`;
  const copy = () => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); };
  const downloadIcs = () => { window.location.href = `${API}/trips/share/${slug}/ics`; };
  const printPdf = () => window.print();

  if (err) return <div className="min-h-screen bg-sky-texture"><Navbar /><div className="pt-32 text-center text-slate-500">Trip not found.</div></div>;
  if (!trip) return <div className="min-h-screen bg-sky-texture"><Navbar /><div className="pt-32 text-center text-slate-500">Loading...</div></div>;

  const it = trip.itinerary;
  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-4xl mx-auto">
        <div className="section-label mb-4"><span className="en">Shared Trip</span><span className="jp">旅の共有</span></div>
        <h1 className="font-display text-5xl text-slate-900 mb-2" data-testid="trip-share-title">{trip.title}</h1>
        <div className="font-body text-slate-500 mb-6">Crafted by <span className="font-display text-slate-900">{trip.user_name}</span></div>
        <div className="flex flex-wrap gap-2 mb-8 print:hidden">
          <button onClick={copy} className="btn-outline inline-flex" data-testid="trip-copy-link"><Copy size={14} /> Copy Link</button>
          <button onClick={downloadIcs} className="btn-outline inline-flex" data-testid="trip-ics-btn"><CalendarPlus size={14} /> Add to Calendar</button>
          <button onClick={printPdf} className="btn-coral inline-flex" data-testid="trip-pdf-btn"><Printer size={14} /> Print / PDF</button>
        </div>

        <div className="sticker-card rounded-3xl p-6 mb-6">
          <p className="text-slate-600 mb-3">{it.summary}</p>
          <div className="font-accent text-[11px] text-amber-600">EST. COST · ₹{it.estimated_cost_inr?.toLocaleString?.() || it.estimated_cost_inr}</div>
        </div>

        {it.days?.map((d) => (
          <div key={d.day} className="sticker-card rounded-3xl p-6 mb-4">
            <div className="font-accent text-[10px] text-rose-500">DAY {d.day} · {d.city?.toUpperCase()}</div>
            <div className="font-display text-2xl text-slate-900 mb-4">{d.theme}</div>
            <div className="space-y-3">
              {d.activities?.map((a, i) => (
                <div key={i} className="border-l-2 border-sky-200 pl-3">
                  <div className="font-accent text-[9px] text-slate-400">{a.time?.toUpperCase()}</div>
                  <div className="font-display text-lg text-slate-900">{a.place}</div>
                  {a.anime && <div className="text-xs text-rose-500 italic">from {a.anime}</div>}
                  <p className="text-sm text-slate-600">{a.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
