import { useEffect, useRef, useState } from "react";
import api, { API } from "../lib/api";
import Navbar from "../components/Navbar";
import { Send, Loader2, Volume2, Mic, MicOff } from "lucide-react";

export default function Companion() {
  const [chars, setChars] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [speaking, setSpeaking] = useState(-1);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const sessionRef = useRef(null);
  const endRef = useRef(null);

  const toggleRecord = async () => {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream, { mimeType: "audio/webm" });
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        setTranscribing(true);
        try {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const form = new FormData();
          form.append("file", blob, "voice.webm");
          const res = await fetch(`${API}/companion/transcribe`, { method: "POST", body: form });
          const j = await res.json();
          if (j.text) setInput((v) => (v ? v + " " : "") + j.text);
        } catch {}
        setTranscribing(false);
      };
      recorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch { alert("Microphone permission denied"); }
  };

  const speak = async (text, idx) => {
    if (!active) return;
    setSpeaking(idx);
    try {
      const res = await fetch(`${API}/companion/speak`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 3800), character_id: active.id })
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.onended = () => { setSpeaking(-1); URL.revokeObjectURL(url); };
      await audio.play();
    } catch { setSpeaking(-1); }
  };

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
    <div className="min-h-screen bg-sky-texture">
      <Navbar />
      <div className="pt-32 pb-16 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="font-accent text-[11px] text-rose-500 mb-4">AI CHARACTER COMPANION</div>
        <h1 className="font-display text-5xl md:text-6xl font-light mb-4">Walk Japan with a voice you love</h1>
        <p className="text-slate-500 max-w-2xl text-lg mb-12">Choose your companion. They will guide you through temples, alleys and stations — in-character, powered by Claude.</p>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Character picker */}
          <div className="lg:col-span-4 space-y-3" data-testid="companion-character-list">
            {chars.map((c) => (
              <button key={c.id} onClick={() => startChat(c)}
                      data-testid={`companion-select-${c.id}`}
                      className={`w-full text-left p-5 border transition-all ${active?.id === c.id ? "border-rose-300 bg-rose-50" : "border-sky-100 hover:border-sky-300 sticker-card rounded-3xl"}`}>
                <div className="font-display text-2xl">{c.name}</div>
                <div className="font-accent text-[10px] text-slate-400 mt-1">FROM {c.anime.toUpperCase()}</div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{c.persona}</p>
              </button>
            ))}
          </div>

          {/* Chat */}
          <div className="lg:col-span-8">
            {!active ? (
              <div className="sticker-card rounded-3xl p-16 text-center text-slate-400 h-full flex flex-col items-center justify-center">
                <div className="font-display text-3xl mb-3 italic">Choose a companion.</div>
                <div className="font-accent text-[10px]">THEY ARE WAITING</div>
              </div>
            ) : (
              <div className="sticker-card rounded-3xl flex flex-col" style={{ height: "70vh" }} data-testid="companion-chat-window">
                <div className="px-6 py-4 border-b border-sky-100 flex items-center justify-between">
                  <div>
                    <div className="font-display text-2xl">{active.name}</div>
                    <div className="font-accent text-[9px] text-rose-500">FROM {active.anime.toUpperCase()}</div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="companion-messages">
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed rounded-2xl ${
                        m.role === "user"
                          ? "bg-rose-100 border border-rose-500/30 text-slate-900"
                          : "bg-sky-50 border border-sky-100 text-slate-800"
                      }`}>
                        <div>{m.text}</div>
                        {m.role === "assistant" && (
                          <button onClick={() => speak(m.text, i)} disabled={speaking !== -1} data-testid={`speak-btn-${i}`}
                                  className="mt-2 inline-flex items-center gap-1 text-xs text-sky-600 hover:text-sky-800">
                            {speaking === i ? <Loader2 className="animate-spin" size={12} /> : <Volume2 size={12} />}
                            {speaking === i ? "Speaking..." : "Hear voice"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {busy && <div className="text-slate-400 text-xs flex items-center gap-2"><Loader2 className="animate-spin" size={12} /> {active.name} is thinking...</div>}
                  <div ref={endRef} />
                </div>
                <form onSubmit={send} className="border-t border-sky-100 p-4 flex gap-2 items-center">
                  <button type="button" onClick={toggleRecord} disabled={transcribing}
                          data-testid="companion-mic-btn"
                          className={`w-10 h-10 rounded-full flex items-center justify-center transition ${recording ? "bg-rose-500 text-white animate-pulse" : "bg-sky-100 text-sky-700 hover:bg-sky-200"}`}>
                    {transcribing ? <Loader2 className="animate-spin" size={16} /> : recording ? <MicOff size={16} /> : <Mic size={16} />}
                  </button>
                  <input value={input} onChange={(e) => setInput(e.target.value)}
                         data-testid="companion-input"
                         placeholder={transcribing ? "Transcribing..." : recording ? "Recording..." : `Message ${active.name}...`}
                         className="flex-1 bg-transparent outline-none text-slate-900 placeholder:text-slate-300" />
                  <button disabled={busy} className="btn-coral" data-testid="companion-send-btn">
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
