import { Link } from "react-router-dom";
import { Sparkles, Map, MessageCircle, Compass } from "lucide-react";

const HERO = "https://images.unsplash.com/photo-1665706896821-319040b81753?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwyfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85";
const TOKYO = "https://images.pexels.com/photos/1510610/pexels-photo-1510610.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940";
const FUJI = "https://images.unsplash.com/photo-1712976692892-07d78428215d?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHw0fHxtb3VudCUyMGZ1amklMjBjaGVycnklMjBibG9zc29tc3xlbnwwfHx8fDE3ODMzMzIwMDV8MA&ixlib=rb-4.1.0&q=85";
const SHRINE = "https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85";

const features = [
  { icon: Sparkles, title: "Mood-Based Anime AI", copy: "Describe a feeling — 'peaceful like Frieren but with mystery' — and Claude discovers your next series." },
  { icon: Compass, title: "Pilgrimage Atlas", copy: "Every shrine, stairway and neon crossing that inspired your favorite scenes, mapped and annotated." },
  { icon: Map, title: "AI Trip Architect", copy: "Feed it your anime, budget and season. Get a full multi-day itinerary with real costs." },
  { icon: MessageCircle, title: "Character Companions", copy: "Walk Kyoto with Frieren's calm reflection or Shibuya with Gojo's swagger. AI voices in-character." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white grain overflow-x-hidden">
      {/* HERO */}
      <section className="relative h-screen flex items-end pb-24 px-8 md:px-16" data-testid="landing-hero">
        <div className="absolute inset-0">
          <img src={HERO} alt="Kyoto sunset" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/60 to-[#0A0D14]/30" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D14]/80 via-transparent to-transparent" />
        </div>

        {[...Array(14)].map((_, i) => (
          <div key={i} className="sakura-petal" style={{ left: `${Math.random() * 100}%`, animationDuration: `${8 + Math.random() * 10}s`, animationDelay: `${Math.random() * 8}s` }} />
        ))}

        <div className="relative z-10 max-w-4xl">
          <div className="font-accent text-[11px] text-[#F4C5D6] mb-6" data-testid="hero-eyebrow">A CINEMATIC PILGRIMAGE PLATFORM</div>
          <h1 className="font-serif-display text-5xl md:text-7xl lg:text-8xl font-light leading-[0.95] mb-8" data-testid="hero-title">
            Travel through the<br />
            <em className="text-[#F4C5D6] font-normal">worlds</em> that inspired<br />
            your favorite <span className="text-[#E14D45]">anime</span>.
          </h1>
          <p className="text-lg text-zinc-300 max-w-xl mb-10 leading-relaxed">
            AniJourney AI blends fandom, culture and computer intelligence into a single journey — from Suga Shrine's staircase to the wisteria of Ashikaga.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/register" className="btn-primary" data-testid="hero-cta-primary">Begin Your Journey</Link>
            <Link to="/explore" className="btn-ghost" data-testid="hero-cta-secondary">Explore the Atlas</Link>
          </div>
        </div>
      </section>

      {/* FEATURE TETRIS GRID */}
      <section className="relative max-w-7xl mx-auto px-8 py-24" data-testid="features-section">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card-anime p-8 group" data-testid={`feature-card-${i}`}>
              <f.icon className="text-[#E14D45] mb-6 group-hover:text-[#F4C5D6] transition-colors" size={26} strokeWidth={1.5} />
              <h3 className="font-serif-display text-2xl mb-3">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.copy}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SPLIT IMAGES */}
      <section className="relative max-w-7xl mx-auto px-8 py-24">
        <div className="grid md:grid-cols-12 gap-6">
          <div className="md:col-span-7 md:row-span-2 relative h-[520px] overflow-hidden">
            <img src={TOKYO} alt="Neon Tokyo" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <div className="font-accent text-[10px] text-[#F4C5D6] mb-2">JUJUTSU KAISEN · SHIBUYA</div>
              <div className="font-serif-display text-3xl">Neon after the curse</div>
            </div>
          </div>
          <div className="md:col-span-5 relative h-[250px] overflow-hidden">
            <img src={FUJI} alt="Mount Fuji" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="font-accent text-[10px] text-[#F4C5D6] mb-1">FRIEREN · GIFU</div>
              <div className="font-serif-display text-2xl">Elven silence</div>
            </div>
          </div>
          <div className="md:col-span-5 relative h-[250px] overflow-hidden">
            <img src={SHRINE} alt="Shrine" className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="font-accent text-[10px] text-[#F4C5D6] mb-1">SPIRITED AWAY · YAMAGATA</div>
              <div className="font-serif-display text-2xl">The bathhouse road</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-4xl mx-auto px-8 py-32 text-center">
        <div className="font-accent text-[11px] text-[#F4C5D6] mb-6">READY WHEN YOU ARE</div>
        <h2 className="font-serif-display text-4xl md:text-6xl font-light mb-8">
          Your first <em className="text-[#F4C5D6]">torii gate</em> is one prompt away.
        </h2>
        <Link to="/register" className="btn-primary" data-testid="footer-cta">Start Your Pilgrimage</Link>
      </section>

      <footer className="border-t border-white/5 py-10 text-center font-accent text-[10px] text-zinc-500">
        ANIJOURNEY AI · 花 · CRAFTED FOR ANIME PILGRIMS
      </footer>
    </div>
  );
}
