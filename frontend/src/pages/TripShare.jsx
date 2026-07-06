import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api, { API } from "../lib/api";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { Copy, FileDown, CalendarPlus } from "lucide-react";
import jsPDF from "jspdf";

export default function TripShare() {
  const { slug } = useParams();
  const [trip, setTrip] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    api.get(`/trips/share/${slug}`).then((r) => setTrip(r.data)).catch(() => setErr(true));
  }, [slug]);

  const shareUrl = `${window.location.origin}/trip/${slug}`;
  const copy = () => { navigator.clipboard.writeText(shareUrl); toast.success("Link copied!"); };
  const downloadIcs = () => { window.location.href = `${API}/trips/share/${slug}/ics`; };

  const downloadPdf = () => {
    if (!trip) return;
    const it = trip.itinerary;
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const M = 40;
    const W = doc.internal.pageSize.getWidth();
    const H = doc.internal.pageSize.getHeight();
    let y = M;

    const ensureRoom = (delta) => {
      if (y + delta > H - M) { doc.addPage(); y = M; }
    };

    // Header band
    doc.setFillColor(240, 249, 255);
    doc.rect(0, 0, W, 80, "F");
    doc.setTextColor(225, 77, 69);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("ANIJOURNEY AI · 花", M, 30);
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(22);
    doc.text(trip.title || "Anime Journey", M, 60);
    y = 100;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Crafted by ${trip.user_name}`, M, y); y += 16;

    if (it.summary) {
      const lines = doc.splitTextToSize(it.summary, W - M * 2);
      doc.text(lines, M, y);
      y += lines.length * 12 + 10;
    }
    if (it.estimated_cost_inr) {
      doc.setTextColor(202, 138, 4);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`ESTIMATED COST · Rs ${Number(it.estimated_cost_inr).toLocaleString()}`, M, y);
      y += 20;
    }

    (it.days || []).forEach((d) => {
      ensureRoom(60);
      doc.setDrawColor(226, 232, 240);
      doc.line(M, y, W - M, y); y += 12;
      doc.setTextColor(225, 77, 69);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text(`DAY ${d.day} · ${(d.city || "").toUpperCase()}`, M, y); y += 14;
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(14);
      doc.text(d.theme || "", M, y); y += 18;

      (d.activities || []).forEach((a) => {
        ensureRoom(50);
        doc.setTextColor(148, 163, 184);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.text((a.time || "").toUpperCase(), M, y); y += 12;
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(11);
        doc.text(a.place || "", M, y); y += 14;
        if (a.anime) {
          doc.setTextColor(225, 77, 69);
          doc.setFont("helvetica", "italic");
          doc.setFontSize(9);
          doc.text(`from ${a.anime}`, M, y); y += 12;
        }
        if (a.description) {
          doc.setTextColor(71, 85, 105);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9);
          const lines = doc.splitTextToSize(a.description, W - M * 2);
          doc.text(lines, M, y);
          y += lines.length * 11 + 6;
        }
        if (a.cost_inr != null) {
          doc.setTextColor(100, 116, 139);
          doc.setFontSize(8);
          doc.text(`Rs ${Number(a.cost_inr).toLocaleString()}`, M, y); y += 12;
        }
        y += 4;
      });
      y += 6;
    });

    if (Array.isArray(it.tips) && it.tips.length) {
      ensureRoom(60);
      doc.setTextColor(225, 77, 69);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("TRAVELER TIPS", M, y); y += 14;
      doc.setTextColor(71, 85, 105);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      it.tips.forEach((t) => {
        ensureRoom(24);
        const lines = doc.splitTextToSize(`• ${t}`, W - M * 2);
        doc.text(lines, M, y);
        y += lines.length * 12 + 4;
      });
    }

    // Footer on last page
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(`Shared at ${shareUrl}`, M, H - 20);

    const safe = (trip.title || "anijourney").replace(/[^a-z0-9-_ ]/gi, "").slice(0, 40) || "trip";
    doc.save(`${safe}.pdf`);
    toast.success("PDF downloaded!");
  };

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
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={copy} className="btn-outline inline-flex" data-testid="trip-copy-link"><Copy size={14} /> Copy Link</button>
          <button onClick={downloadIcs} className="btn-outline inline-flex" data-testid="trip-ics-btn"><CalendarPlus size={14} /> Add to Calendar</button>
          <button onClick={downloadPdf} className="btn-coral inline-flex" data-testid="trip-pdf-btn"><FileDown size={14} /> Download PDF</button>
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
