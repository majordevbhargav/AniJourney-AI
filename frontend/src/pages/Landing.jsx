import { Link } from "react-router-dom";
import { Sparkles, Map, MessageCircle, Utensils, Award, Compass } from "lucide-react";
import { useI18n } from "../context/I18nContext";
import Navbar from "../components/Navbar";

const HERO_1 = "https://images.unsplash.com/photo-1712976692892-07d78428215d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtb3VudCUyMGZ1amklMjBjaGVycnklMjBibG9zc29tc3xlbnwwfHx8fDE3ODMzMzIwMDV8MA&ixlib=rb-4.1.0&q=85";
const HERO_2 = "https://images.unsplash.com/photo-1665706896821-319040b81753?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85";
const HERO_3 = "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85";
const HERO_4 = "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";

const features = [
  { icon: Sparkles, tone: "sky", en: "Recommend", jp: "気分で選ぶ", copy: "Tell Claude a feeling — 'peaceful like Frieren with mystery' — and get your next series." },
  { icon: Compass, tone: "coral", en: "Atlas", jp: "巡礼地図", copy: "Every shrine, staircase and neon crossing that inspired your favorite scenes." },
  { icon: Map, tone: "sun", en: "Plan", jp: "旅の設計", copy: "Feed your anime, budget & season — get a full multi-day itinerary." },
  { icon: MessageCircle, tone: "sky", en: "Companion", jp: "同行者", copy: "Walk Kyoto with Frieren's calm reflection or Shibuya with Gojo's swagger." },
  { icon: Utensils, tone: "coral", en: "Taste", jp: "食と祭り", copy: "Ramen from Naruto, mochi from Your Name, festivals from Demon Slayer." },
  { icon: Award, tone: "sun", en: "Passport", jp: "アニメ手帳", copy: "Collect stamps, unlock badges, earn XP — Pokémon GO meets Ghibli." },
];

const toneMap = {
  sky: "bg-sky-100 text-sky-700 border-sky-300",
  coral: "bg-rose-100 text-rose-700 border-rose-300",
  sun: "bg-amber-100 text-amber-700 border-amber-300",
};

export default function Landing() {
  const { t } = useI18n();
  return (
    <div className="min-h-screen bg-sky-texture overflow-x-hidden">
      <Navbar />
      {/* Sakura petals */}
      {[...Array(16)].map((_, i) => (
        <div key={i} className="petal" style={{ left: `${Math.random() * 100}%`, animationDuration: `${10 + Math.random() * 12}s`, animationDelay: `${Math.random() * 10}s` }} />
      ))}

      {/* HERO */}
      <section className="relative pt-40 pb-24 px-6 md:px-16 max-w-7xl mx-auto" data-testid="landing-hero">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 relative z-10">
            <div className="tape-tag mb-6">{t("eyebrow")}</div>
            <div className="text-rose-500 font-body font-bold text-sm mb-3 tracking-[0.2em]">アニジャーニー · AI</div>
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-slate-900 mb-6" data-testid="hero-title">
              {t("heroTitle")}
            </h1>
            <p className="text-slate-600 text-lg leading-relaxed max-w-lg mb-8">
              {t("heroSub")}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/register" className="btn-coral" data-testid="hero-cta-primary">{t("beginJourney")} →</Link>
              <Link to="/explore" className="btn-outline" data-testid="hero-cta-secondary">{t("exploreAtlas")}</Link>
            </div>
          </div>

          {/* Poster collage */}
          <div className="lg:col-span-6 relative h-[520px]" data-testid="hero-collage">
            <div className="absolute top-0 right-0 w-64 h-80 sticker-card overflow-hidden" style={{ transform: "rotate(4deg)" }}>
              <img src={HERO_1} alt="" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div className="absolute top-24 left-4 w-56 h-72 sticker-card overflow-hidden" style={{ transform: "rotate(-6deg)" }}>
              <img src={HERO_2} alt="" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div className="absolute bottom-0 right-16 w-48 h-60 sticker-card overflow-hidden" style={{ transform: "rotate(-3deg)" }}>
              <img src={HERO_3} alt="" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div className="absolute bottom-8 left-24 w-44 h-56 sticker-card overflow-hidden" style={{ transform: "rotate(8deg)" }}>
              <img src={HERO_4} alt="" className="w-full h-full object-cover rounded-2xl" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-amber-300 flex items-center justify-center font-display text-2xl text-slate-900 shadow-2xl" style={{ transform: "rotate(-8deg) translate(-50%, -50%)", transformOrigin: "top left" }}>
              花
            </div>
          </div>
        </div>
      </section>

      {/* Marquee */}
      <section className="bg-sky-500 text-white py-4 overflow-hidden">
        <div className="marquee font-accent text-sm">
          {[..."FRIEREN · YOUR NAME · SPIRITED AWAY · DEMON SLAYER · JUJUTSU KAISEN · VIOLET EVERGARDEN".split(" · "), ..."FRIEREN · YOUR NAME · SPIRITED AWAY · DEMON SLAYER · JUJUTSU KAISEN · VIOLET EVERGARDEN".split(" · ")].map((t, i) => (
            <span key={i} className="flex items-center gap-3">🌸 {t}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-24" data-testid="features-section">
        <div className="section-label mb-12">
          <span className="en">Features</span>
          <span className="jp">機能</span>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="sticker-card p-8 rounded-3xl" data-testid={`feature-card-${i}`}>
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl border-2 ${toneMap[f.tone]} mb-5`}>
                <f.icon size={22} strokeWidth={2} />
              </div>
              <div className="font-accent text-[10px] text-slate-400 mb-1">{f.en}</div>
              <div className="font-display text-2xl text-slate-900 mb-3">{f.jp}</div>
              <p className="text-slate-600 leading-relaxed text-sm">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CHARACTER COMPANIONS teaser */}
      <section className="bg-sky-50 polka py-24 px-6 md:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <div className="section-label mb-6">
              <span className="en">Companion</span>
              <span className="jp">同行者</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-slate-900 mb-6">
              Walk Japan with a <span className="text-sky-500 italic">voice you love.</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Frieren whispers the history of temples. Gojo cracks jokes near Shibuya. Luffy shouts about ramen. Every companion, powered by Claude Sonnet 4.5 — fully in character.
            </p>
            <Link to="/companion" className="btn-sky" data-testid="companion-cta">Meet Companions</Link>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-4">
            {[
              { name: "Frieren", jp: "フリーレン", color: "bg-sky-200" },
              { name: "Gojo", jp: "五条 悟", color: "bg-rose-200" },
              { name: "Luffy", jp: "ルフィ", color: "bg-amber-200" },
              { name: "Violet", jp: "ヴァイオレット", color: "bg-emerald-200" },
            ].map((c, i) => (
              <div key={i} className={`sticker-card p-8 ${c.color} rounded-3xl`} style={{ transform: `rotate(${(i % 2 === 0 ? -2 : 2)}deg)` }}>
                <div className="font-accent text-[10px] text-slate-600 mb-2">CV · CLAUDE</div>
                <div className="font-display text-3xl text-slate-900">{c.name}</div>
                <div className="font-body text-sm text-slate-700 mt-1">{c.jp}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PASSPORT teaser */}
      <section className="max-w-7xl mx-auto px-6 md:px-16 py-24">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 grid grid-cols-3 gap-4">
            {["🏯","🌸","⛩️","🍜","🎌","👘"].map((e, i) => (
              <div key={i} className="sticker-card aspect-square rounded-full flex items-center justify-center text-6xl bg-white" style={{ transform: `rotate(${(i * 7) - 15}deg)` }}>
                {e}
              </div>
            ))}
          </div>
          <div className="lg:col-span-5">
            <div className="section-label mb-6">
              <span className="en">Passport</span>
              <span className="jp">アニメ手帳</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl leading-tight text-slate-900 mb-6">
              Collect stamps. Level up. <span className="italic text-rose-500">Become a pilgrim.</span>
            </h2>
            <p className="text-slate-600 leading-relaxed mb-8">
              Check in at each location, earn XP, unlock titles like 🏯 Shrine Explorer, 🌸 Sakura Master, and 👘 Kyoto Walker. Your journey, as a digital scrapbook.
            </p>
            <Link to="/passport" className="btn-coral" data-testid="passport-cta">View Passport</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-sky-500 text-white py-24 px-6 md:px-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 polka opacity-30" />
        <div className="relative max-w-3xl mx-auto">
          <div className="tape-tag mb-6" style={{ background: "white", color: "#0369A1" }}>STARTING SOON</div>
          <h2 className="font-display text-4xl md:text-6xl mb-6 leading-tight">
            Your first <em>torii gate</em><br />is one prompt away.
          </h2>
          <Link to="/register" className="btn-coral" data-testid="footer-cta">Begin Your Pilgrimage</Link>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-10 text-center">
        <div className="font-accent text-[10px] tracking-[0.3em]">ANIJOURNEY AI · 花 · CRAFTED FOR ANIME PILGRIMS · 2026</div>
      </footer>
    </div>
  );
}
