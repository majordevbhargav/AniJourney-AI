import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { MapPin, ArrowLeft, Star } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";

export default function AnimeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [openLoc, setOpenLoc] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newText, setNewText] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => { api.get(`/anime/${id}`).then((r) => setData(r.data)); }, [id]);

  const openReviews = async (loc) => {
    setOpenLoc(loc);
    const r = await api.get(`/reviews/${loc.id}`);
    setReviews(r.data);
    setNewText(""); setNewRating(5);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to review"); return; }
    if (!newText.trim()) return;
    setPosting(true);
    try {
      await api.post("/reviews", { location_id: openLoc.id, rating: newRating, text: newText });
      const r = await api.get(`/reviews/${openLoc.id}`);
      setReviews(r.data);
      setNewText("");
      toast.success("Review posted!");
    } catch { toast.error("Failed to post"); }
    finally { setPosting(false); }
  };

  if (!data) return <div className="min-h-screen bg-sky-50 text-slate-400 flex items-center justify-center">Loading pilgrimage...</div>;
  const { anime, locations } = data;

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="relative h-[60vh]">
        <img src={anime.poster} alt={anime.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/50 to-[#0A0D14]/20" />
        <div className="absolute bottom-0 left-0 right-0 px-8 md:px-16 pb-12 max-w-7xl mx-auto">
          <Link to="/explore" className="inline-flex items-center gap-2 font-accent text-[10px] text-slate-500 hover:text-slate-900 mb-4" data-testid="back-to-explore-link">
            <ArrowLeft size={14} strokeWidth={1.5} /> BACK TO ATLAS
          </Link>
          <div className="font-accent text-[10px] text-rose-500 mb-3">{anime.year} · {anime.genres.join(" · ")}</div>
          <h1 className="font-display text-5xl md:text-7xl font-light mb-4 text-white" data-testid="anime-detail-title">{anime.title}</h1>
          <p className="text-lg text-slate-100 max-w-2xl">{anime.synopsis}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 md:px-16 py-16">
        <div className="font-accent text-[11px] text-rose-500 mb-3">PILGRIMAGE LOCATIONS</div>
        <h2 className="font-display text-4xl mb-10">Real places from {anime.title}</h2>

        {locations.length === 0 ? (
          <p className="text-slate-400">More pilgrimage locations coming soon.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6" data-testid="locations-grid">
            {locations.map((l) => (
              <div key={l.id} className="sticker-card rounded-3xl overflow-hidden" data-testid={`location-card-${l.id}`}>
                <div className="relative h-56">
                  <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center gap-2 font-accent text-[10px] text-rose-300">
                      <MapPin size={12} strokeWidth={1.5} /> {l.city} · {l.region}
                    </div>
                    <div className="font-display text-2xl mt-1 text-white">{l.name}</div>
                  </div>
                </div>
                <div className="p-6">
                  <p className="text-slate-500 leading-relaxed mb-3">{l.description}</p>
                  <p className="text-sm text-slate-400 italic mb-4">{l.cultural_note}</p>
                  <button onClick={() => openReviews(l)} data-testid={`location-reviews-btn-${l.id}`} className="btn-outline text-xs">Reviews & Discuss</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews Modal */}
      {openLoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setOpenLoc(null)} data-testid="reviews-modal">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="font-accent text-[10px] text-rose-500 mb-1">REVIEWS · {openLoc.city.toUpperCase()}</div>
            <h3 className="font-display text-3xl text-slate-900 mb-6">{openLoc.name}</h3>

            <form onSubmit={submitReview} className="border-b border-sky-100 pb-6 mb-6" data-testid="review-form">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map((n) => (
                  <button type="button" key={n} onClick={() => setNewRating(n)} data-testid={`star-${n}`}>
                    <Star size={22} fill={n <= newRating ? "#F59E0B" : "none"} stroke="#F59E0B" />
                  </button>
                ))}
              </div>
              <textarea value={newText} onChange={(e) => setNewText(e.target.value)} rows={3} data-testid="review-textarea"
                        placeholder={user ? "Share your pilgrimage..." : "Sign in to leave a review"}
                        disabled={!user}
                        className="w-full bg-sky-50 border-2 border-sky-100 rounded-2xl p-3 text-slate-800 mb-3" />
              <button disabled={posting || !user} className="btn-coral" data-testid="review-submit-btn">{posting ? "Posting..." : "Post Review"}</button>
            </form>

            <div className="space-y-4" data-testid="reviews-list">
              {reviews.length === 0 && <div className="text-slate-400 italic text-center py-6">No reviews yet. Be the first.</div>}
              {reviews.map((r) => (
                <div key={r.id} className="border-b border-sky-50 pb-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-display text-lg text-slate-900">{r.user_name}</div>
                    <div className="flex">{[...Array(r.rating)].map((_, i) => <Star key={i} size={14} fill="#F59E0B" stroke="#F59E0B" />)}</div>
                  </div>
                  <p className="text-sm text-slate-600">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
