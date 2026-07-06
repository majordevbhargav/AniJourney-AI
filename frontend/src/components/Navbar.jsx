import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useI18n } from "../context/I18nContext";
import { Cherry, Menu, X, Languages } from "lucide-react";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useI18n();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/explore", en: "Explore", jp: "巡礼" },
    { to: "/map", en: "Atlas", jp: "地図" },
    { to: "/planner", en: "Planner", jp: "計画" },
    { to: "/companion", en: "Companion", jp: "同行" },
    { to: "/food", en: "Taste", jp: "食祭" },
    { to: "/passport", en: "Passport", jp: "手帳" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-b border-sky-100" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" data-testid="nav-home-logo">
          <Cherry className="text-rose-500" size={22} strokeWidth={2} />
          <div>
            <div className="font-display text-xl text-slate-900 leading-none">AniJourney</div>
            <div className="font-accent text-[9px] text-sky-500 tracking-[0.3em]">AI · 花</div>
          </div>
        </Link>
        <div className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <Link key={l.to} to={l.to} data-testid={`nav-${l.en.toLowerCase()}`}
                  className="px-3 py-2 rounded-full hover:bg-sky-50 transition group">
              <span className="font-body font-medium text-sm text-slate-700 group-hover:text-sky-600">{l.en}</span>
              <span className="ml-1 font-body text-[10px] text-rose-400">{l.jp}</span>
            </Link>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => setLang(lang === "en" ? "jp" : "en")} data-testid="lang-toggle"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-sky-200 text-xs font-body text-slate-700 hover:bg-sky-50">
            <Languages size={14} /> {lang === "en" ? "日本語" : "English"}
          </button>
          {user ? (
            <>
              <span className="font-body text-sm text-slate-600">Hi, {user.name}</span>
              <button onClick={() => { logout(); nav("/"); }} className="btn-outline" data-testid="nav-logout-btn">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="font-body text-sm text-slate-700 hover:text-sky-600" data-testid="nav-login-btn">Sign In</Link>
              <Link to="/register" className="btn-coral" data-testid="nav-register-btn">Begin</Link>
            </>
          )}
        </div>
        <button className="lg:hidden text-slate-700" onClick={() => setOpen(!open)} data-testid="nav-mobile-toggle">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-sky-100 bg-white px-6 py-4 space-y-2">
          {links.map((l) => (
            <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="block font-body text-slate-700 py-2">
              {l.en} · <span className="text-rose-400 text-sm">{l.jp}</span>
            </Link>
          ))}
          {!user && <Link to="/register" onClick={() => setOpen(false)} className="btn-coral w-full justify-center">Begin</Link>}
        </div>
      )}
    </nav>
  );
}
