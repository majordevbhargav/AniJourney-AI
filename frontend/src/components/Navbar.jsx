import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Cherry } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <nav className="fixed top-0 left-0 right-0 z-40 glass" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-8 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3" data-testid="nav-home-logo">
          <Cherry className="text-[#F4C5D6]" size={22} strokeWidth={1.5} />
          <span className="font-serif-display text-2xl text-white">AniJourney</span>
          <span className="font-accent text-[10px] text-[#F4C5D6]">AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 font-accent text-[11px] text-zinc-300">
          <Link to="/explore" data-testid="nav-explore" className="hover:text-white transition">Explore</Link>
          <Link to="/map" data-testid="nav-map" className="hover:text-white transition">Atlas</Link>
          <Link to="/planner" data-testid="nav-planner" className="hover:text-white transition">Trip Planner</Link>
          <Link to="/companion" data-testid="nav-companion" className="hover:text-white transition">Companion</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden md:inline font-accent text-[10px] text-zinc-400">{user.name}</span>
              <button onClick={() => { logout(); nav("/"); }} className="btn-ghost" data-testid="nav-logout-btn">Sign Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost" data-testid="nav-login-btn">Sign In</Link>
              <Link to="/register" className="btn-primary" data-testid="nav-register-btn">Begin Journey</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
