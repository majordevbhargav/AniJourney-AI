import { useEffect, useRef, useState } from "react";
import api from "../lib/api";
import Navbar from "../components/Navbar";
import { Send, Loader2 } from "lucide-react";

export default function Companion() {
  const [chars, setChars] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => { api.get("/characters").then((r) => setChars(r.data)); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const startChat = (c) => {
    setActive(c);
    sessionRef.current = `${c.id}-${Date.now()}`;
    setMessages([{ role: "assistant", text: greeting(c) }]);
  };

  const greeting = (c) => ({
    frieren: "The mountain path continues. Where shall we wander today, human?",
    gojo: "Yo. So you finally showed up. Ready to see the *real* Tokyo?",
    luffy: "OI! Where are we going? IS THERE FOOD? LET'S GO!!",
    violet: "It is a pleasure to walk with you. Where shall I deliver your journey?",
    l: "I calculate a 92% chance you're here for anime pilgrimage. Interesting. Ask away."
  }[c.id] || "Ready to travel.");

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || !active) return;
    const userMsg = input;
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setBusy(true);
    try {
      const r = await api.post("/companion/chat", {
        character_id: active.id,
        session_id: sessionRef.current,
        message: userMsg
      });
      setMessages((m) => [...m, { role: "assistant", text: r.data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "*static* ...try again." }]);
    } finally { setBusy(false); }
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-white grain">
      <Navbar />
      <div className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="font-accent text-[11px] text-[#F4C5D6] mb-4">AI CHARACTER COMPANION</div>
        <h1 className="font-serif-display text-5xl md:text-6xl font-light mb-4">Walk Japan with a voice you love</h1>
        <p className="text-zinc-400 max-w-2xl text-lg mb-12">Choose your companion. They will guide you through temples, alleys and stations — in-character, powered by Claude.</p>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Character picker */}
          <div className="lg:col-span-4 space-y-3" data-testid="companion-character-list">
            {chars.map((c) => (
              <button key={c.id} onClick={() => startChat(c)}
                      data-testid={`companion-select-${c.id}`}
                      className={`w-full text-left p-5 border transition-all ${active?.id === c.id ? "border-[#F4C5D6] bg-[#F4C5D6]/5" : "border-white/10 hover:border-white/30 card-anime"}`}>
                <div className="font-serif-display text-2xl">{c.name}</div>
                <div className="font-accent text-[10px] text-zinc-500 mt-1">FROM {c.anime.toUpperCase()}</div>
                <p className="text-xs text-zinc-400 mt-2 line-clamp-2">{c.persona}</p>
              </button>
            ))}
          </div>

          {/* Chat */}
          <div className="lg:col-span-8">
            {!active ? (
              <div className="glass p-16 text-center text-zinc-500 h-full flex flex-col items-center justify-center">
                <div className="font-serif-display text-3xl mb-3 italic">Choose a companion.</div>
                <div className="font-accent text-[10px]">THEY ARE WAITING</div>
              </div>
            ) : (
              <div className="glass flex flex-col" style={{ height: "70vh" }} data-testid="companion-chat-window">
                <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between">
                  <div>
                    <div className="font-serif-display text-2xl">{active.name}</div>
                    <div className="font-accent text-[9px] text-[#F4C5D6]">FROM {active.anime.toUpperCase()}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="companion-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-[#E14D45]/20 border border-[#E14D45]/30 text-white"
                          : "bg-[#1A1F2D] border border-white/10 text-zinc-200"
                      }`}>{m.text}</div>
                    </div>
                  ))}
                  {busy && <div className="text-zinc-500 text-xs flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> {active.name} is thinking...</div>}
                  <div ref={endRef} />
                </div>
                <form onSubmit={send} className="border-t border-white/10 p-4 flex gap-3">
                  <input value={input} onChange={(e) => setInput(e.target.value)}
                         data-testid="companion-input"
                         placeholder={`Message ${active.name}...`}
                         className="flex-1 bg-transparent outline-none text-white placeholder:text-zinc-600" />
                  <button disabled={busy} className="btn-primary" data-testid="companion-send-btn">
                    <Send size={14} strokeWidth={1.5} />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
