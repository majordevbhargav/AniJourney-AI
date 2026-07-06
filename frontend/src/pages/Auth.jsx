import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { Cherry } from "lucide-react";

export function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-sky-50 relative overflow-hidden grain px-6">
      <img src="https://images.unsplash.com/photo-1512692723619-8b3e68365c9c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxqYXBhbiUyMGt5b3RvJTIwdGVtcGxlJTIwc3Vuc2V0fGVufDB8fHx8MTc4MzMzMjAwNnww&ixlib=rb-4.1.0&q=85"
           alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0D14] via-[#0A0D14]/80 to-[#0A0D14]" />

      <div className="relative w-full max-w-md sticker-card rounded-3xl p-10">
        <Link to="/" className="flex items-center gap-2 mb-8">
          <Cherry className="text-rose-500" size={20} strokeWidth={1.5} />
          <span className="font-display text-xl">AniJourney</span>
        </Link>
        <div className="font-accent text-[10px] text-rose-500 mb-3">{subtitle}</div>
        <h1 className="font-display text-4xl mb-8">{title}</h1>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back, traveler.");
      nav("/explore");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Return to the journey" subtitle="SIGN IN">
      <form onSubmit={submit} className="space-y-5" data-testid="login-form">
        <div>
          <label className="font-accent text-[10px] text-slate-500 mb-2 block">EMAIL</label>
          <input data-testid="login-email-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-3 text-slate-900 transition" />
        </div>
        <div>
          <label className="font-accent text-[10px] text-slate-500 mb-2 block">PASSWORD</label>
          <input data-testid="login-password-input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-3 text-slate-900 transition" />
        </div>
        <button disabled={busy} type="submit" className="btn-coral w-full mt-8" data-testid="login-submit-btn">
          {busy ? "Signing in..." : "Enter"}
        </button>
        <p className="text-center text-sm text-slate-400 mt-6">
          No account? <Link to="/register" className="text-rose-500 hover:text-slate-900 transition" data-testid="login-to-register-link">Begin your journey</Link>
        </p>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await register(name, email, password);
      toast.success("Your journey begins.");
      nav("/explore");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Registration failed");
    } finally { setBusy(false); }
  };

  return (
    <AuthShell title="Begin your pilgrimage" subtitle="CREATE ACCOUNT">
      <form onSubmit={submit} className="space-y-5" data-testid="register-form">
        <div>
          <label className="font-accent text-[10px] text-slate-500 mb-2 block">NAME</label>
          <input data-testid="register-name-input" required value={name} onChange={(e) => setName(e.target.value)}
                 className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-3 text-slate-900" />
        </div>
        <div>
          <label className="font-accent text-[10px] text-slate-500 mb-2 block">EMAIL</label>
          <input data-testid="register-email-input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                 className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-3 text-slate-900" />
        </div>
        <div>
          <label className="font-accent text-[10px] text-slate-500 mb-2 block">PASSWORD</label>
          <input data-testid="register-password-input" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                 className="w-full bg-transparent border-b border-sky-200 focus:border-rose-500 outline-none py-3 text-slate-900" />
        </div>
        <button disabled={busy} type="submit" className="btn-coral w-full mt-8" data-testid="register-submit-btn">
          {busy ? "Creating..." : "Begin Journey"}
        </button>
        <p className="text-center text-sm text-slate-400 mt-6">
          Already a traveler? <Link to="/login" className="text-rose-500 hover:text-slate-900 transition" data-testid="register-to-login-link">Sign in</Link>
        </p>
      </form>
    </AuthShell>
  );
}
