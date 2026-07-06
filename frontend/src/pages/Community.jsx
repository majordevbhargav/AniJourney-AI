import { useEffect, useState } from "react";
import api, { API } from "../lib/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import { Heart, MessageSquare, Send, Loader2, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

function useDataUri(file) {
  const [uri, setUri] = useState(null);
  useEffect(() => {
    if (!file) { setUri(null); return; }
    const reader = new FileReader();
    reader.onload = (e) => setUri(e.target.result);
    reader.readAsDataURL(file);
  }, [file]);
  return uri;
}

export default function Community() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [anime, setAnime] = useState([]);
  const [animeId, setAnimeId] = useState("");
  const [expanded, setExpanded] = useState({});
  const imgUri = useDataUri(imageFile);

  const load = async () => {
    setLoading(true);
    try {
      const r = await api.get("/community/posts");
      setPosts(r.data);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    load();
    api.get("/anime").then((r) => setAnime(r.data));
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Sign in to post"); return; }
    if (!title.trim() || !body.trim()) { toast.error("Title & story required"); return; }
    setBusy(true);
    try {
      let image_b64 = null;
      if (imgUri) image_b64 = imgUri.split(",")[1];
      await api.post("/community/posts", {
        title, body, anime_id: animeId || null, image_b64
      });
      toast.success("Story shared!");
      setTitle(""); setBody(""); setImageFile(null); setAnimeId(""); setShowForm(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.detail || "Failed to post");
    } finally { setBusy(false); }
  };

  const toggleLike = async (id) => {
    if (!user) { toast.error("Sign in to like"); return; }
    try {
      const r = await api.post(`/community/posts/${id}/like`);
      setPosts((p) => p.map((x) => x.id === id ? { ...x, like_count: x.like_count + (r.data.liked ? 1 : -1), _liked: r.data.liked } : x));
    } catch { toast.error("Failed"); }
  };

  const addComment = async (postId, text, done) => {
    if (!user) { toast.error("Sign in to comment"); return; }
    try {
      await api.post("/community/comments", { post_id: postId, text });
      toast.success("Comment posted");
      done();
      // refresh comments
      const r = await api.get(`/community/posts/${postId}`);
      setExpanded((e) => ({ ...e, [postId]: r.data.comments }));
      setPosts((p) => p.map((x) => x.id === postId ? { ...x, comment_count: (x.comment_count || 0) + 1 } : x));
    } catch { toast.error("Failed to comment"); }
  };

  const openComments = async (postId) => {
    if (expanded[postId]) { setExpanded((e) => ({ ...e, [postId]: null })); return; }
    const r = await api.get(`/community/posts/${postId}`);
    setExpanded((e) => ({ ...e, [postId]: r.data.comments }));
  };

  return (
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-6 md:px-16 max-w-4xl mx-auto">
        <div className="section-label mb-4"><span className="en">Community</span><span className="jp">巡礼者たち</span></div>
        <h1 className="font-display text-5xl md:text-6xl font-light mb-4">Travel stories from pilgrims.</h1>
        <p className="text-slate-500 max-w-2xl text-lg mb-10">Share your anime pilgrimage. Every torii, every shrine step, every ramen bowl — tell the story.</p>

        {!showForm ? (
          <button onClick={() => user ? setShowForm(true) : toast.error("Sign in to share your journey")}
                  className="btn-coral mb-10" data-testid="new-post-btn">
            Share Your Journey →
          </button>
        ) : (
          <form onSubmit={submit} className="sticker-card rounded-3xl p-6 mb-10 space-y-4" data-testid="new-post-form">
            <div>
              <label className="font-accent text-[10px] text-slate-500">TITLE</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder="My day at Suga Shrine..."
                     maxLength={120}
                     data-testid="post-title-input"
                     className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-2 text-slate-900 font-display text-2xl" />
            </div>
            <div>
              <label className="font-accent text-[10px] text-slate-500">STORY</label>
              <textarea value={body} onChange={(e) => setBody(e.target.value)}
                        rows={5}
                        maxLength={3000}
                        placeholder="Share the moment, the light, the emotion..."
                        data-testid="post-body-input"
                        className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-2 text-slate-700" />
            </div>
            <div className="flex flex-wrap gap-4 items-center">
              <select value={animeId} onChange={(e) => setAnimeId(e.target.value)} data-testid="post-anime-select"
                      className="bg-white border-2 border-sky-100 rounded-full px-4 py-2 text-sm">
                <option value="">Tag anime (optional)</option>
                {anime.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <ImageIcon size={14} />
                <span>{imageFile ? "Change image" : "Add image"}</span>
                <input type="file" accept="image/*" hidden onChange={(e) => setImageFile(e.target.files?.[0] || null)} data-testid="post-image-input" />
              </label>
              {imageFile && (
                <button type="button" onClick={() => setImageFile(null)} className="text-xs text-rose-500 flex items-center gap-1">
                  <X size={12} /> Remove image
                </button>
              )}
            </div>
            {imgUri && <img src={imgUri} alt="preview" className="max-h-56 rounded-2xl" />}
            <div className="flex gap-3">
              <button disabled={busy} type="submit" className="btn-coral" data-testid="post-submit-btn">
                {busy ? <Loader2 className="animate-spin" size={14} /> : "Publish"}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-16 text-slate-400"><Loader2 className="animate-spin mx-auto" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-16 text-slate-400 font-display text-2xl italic">Be the first pilgrim to share.</div>
        ) : (
          <div className="space-y-6" data-testid="posts-list">
            {posts.map((p) => (
              <article key={p.id} className="sticker-card rounded-3xl p-6" data-testid={`post-${p.id}`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center font-display text-slate-700">{(p.user_name || "?")[0]}</div>
                  <div>
                    <div className="font-body text-sm font-medium text-slate-800">{p.user_name}</div>
                    <div className="font-accent text-[9px] text-slate-400">{new Date(p.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <h3 className="font-display text-2xl text-slate-900 mb-2">{p.title}</h3>
                <p className="text-slate-600 whitespace-pre-wrap mb-3">{p.body}</p>
                {p.storage_path && (
                  <img src={`${API}/community/image/${p.id}`} alt="" className="rounded-2xl max-h-96 w-full object-cover mb-3" />
                )}
                {p.anime_id && (
                  <Link to={`/anime/${p.anime_id}`} className="inline-block font-accent text-[10px] text-rose-500 mb-3 hover:underline">
                    #{anime.find((a) => a.id === p.anime_id)?.title || p.anime_id}
                  </Link>
                )}
                <div className="flex items-center gap-6 border-t border-sky-100 pt-3">
                  <button onClick={() => toggleLike(p.id)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-rose-500" data-testid={`like-btn-${p.id}`}>
                    <Heart size={14} className={p._liked ? "fill-rose-500 text-rose-500" : ""} /> {p.like_count}
                  </button>
                  <button onClick={() => openComments(p.id)} className="flex items-center gap-1 text-sm text-slate-600 hover:text-sky-500" data-testid={`comment-btn-${p.id}`}>
                    <MessageSquare size={14} /> {p.comment_count}
                  </button>
                </div>
                {expanded[p.id] !== undefined && expanded[p.id] !== null && (
                  <div className="mt-4 space-y-2 border-t border-sky-100 pt-4">
                    {expanded[p.id].map((c) => (
                      <div key={c.id} className="text-sm">
                        <span className="font-display text-slate-800">{c.user_name}: </span>
                        <span className="text-slate-600">{c.text}</span>
                      </div>
                    ))}
                    <CommentBox onSend={(t, done) => addComment(p.id, t, done)} />
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CommentBox({ onSend }) {
  const [t, setT] = useState("");
  const send = (e) => {
    e.preventDefault();
    if (!t.trim()) return;
    onSend(t, () => setT(""));
  };
  return (
    <form onSubmit={send} className="flex gap-2">
      <input value={t} onChange={(e) => setT(e.target.value)}
             placeholder="Write a comment..." maxLength={500}
             className="flex-1 bg-white border-2 border-sky-100 rounded-full px-4 py-2 text-sm outline-none focus:border-rose-300" />
      <button type="submit" className="btn-coral text-xs"><Send size={12} /></button>
    </form>
  );
}
