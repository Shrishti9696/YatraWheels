import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, Send, Sparkles, RotateCcw, MessageSquare, Bot,
  Car, MapPin, Clock, Users, DollarSign, CheckCircle,
  ChevronDown, ChevronUp, Zap, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useBooking } from "@/context/BookingContext";
import { authHeaders } from "@/services/authService";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  plan?: ParsedPlan;
}

interface ParsedPlan {
  destination: string;
  days: number;
  people: number;
  budget: string;
  estimatedCost: number;
  highlights: string[];
  vehicleRecommendation: { name: string; capacity: number; pricePerDay: number; features: string[] };
  itinerary: Array<{ day: number; title: string; activities: Array<{ time: string; activity: string; duration: string }>; accommodation: string; meals: string }>;
}

const QUICK_REPLIES = ["Goa trip 🏖️", "Manali ❄️", "Rajasthan 🏰", "Weekend near Delhi 🌿"];

const WELCOME: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hey! 👋 I'm **YatraBot**. Tell me where you'd like to go and I'll build your perfect trip — itinerary, vehicle, budget & all!",
};

function parsePlan(content: string): { text: string; plan: ParsedPlan | null } {
  const match = content.match(/\[PLAN\]([\s\S]*?)\[\/PLAN\]/);
  if (!match) return { text: content, plan: null };
  try {
    return { text: content.replace(/\[PLAN\][\s\S]*?\[\/PLAN\]/, "").trim(), plan: JSON.parse(match[1].trim()) };
  } catch { return { text: content, plan: null }; }
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function MiniPlanCard({ plan }: { plan: ParsedPlan }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-2 rounded-xl overflow-hidden border border-primary/20 bg-card text-xs">
      <div className="gradient-blue-purple px-3 py-2">
        <div className="font-bold text-white text-sm">{plan.destination}</div>
        <div className="text-white/70">{plan.days} days · {plan.people} traveler{plan.people > 1 ? "s" : ""} · ₹{plan.estimatedCost.toLocaleString()}</div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex flex-wrap gap-1">
          {plan.highlights.slice(0, 3).map(h => (
            <span key={h} className="px-2 py-0.5 rounded-full bg-primary/8 border border-primary/15 text-primary">{h}</span>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-muted/30 rounded-lg px-2 py-1.5">
          <Car className="w-3 h-3 text-primary shrink-0" />
          <span className="text-muted-foreground">{plan.vehicleRecommendation.name} · ₹{plan.vehicleRecommendation.pricePerDay.toLocaleString()}/day</span>
        </div>
        <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors py-0.5">
          <span className="font-medium text-foreground">View itinerary</span>
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <AnimatePresence>
          {open && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden space-y-1">
              {plan.itinerary.slice(0, 3).map(d => (
                <div key={d.day} className="bg-muted/20 rounded-lg px-2 py-1.5">
                  <div className="font-semibold text-primary">Day {d.day}: {d.title}</div>
                  <div className="text-muted-foreground">{d.activities[0]?.activity}</div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        <Link href="/booking">
          <Button size="sm" className="w-full gradient-blue-purple text-white border-0 rounded-lg h-7 text-xs mt-1">
            <Car className="w-3 h-3 mr-1" /> Book This Trip
          </Button>
        </Link>
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-end gap-2 mb-2">
      <div className="w-6 h-6 rounded-full gradient-blue-purple flex items-center justify-center shrink-0">
        <Bot className="w-3 h-3 text-white" />
      </div>
      <div className="px-3 py-2 rounded-2xl rounded-bl-md bg-card border border-card-border">
        <div className="flex gap-1 items-center h-3">
          {[0, 1, 2].map(i => (
            <motion.div key={i} className="w-1 h-1 rounded-full bg-primary/60"
              animate={{ y: [0, -3, 0] }} transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function YatraBotWidget() {
  const { user } = useBooking();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  async function sendMessage(text: string) {
    if (!text.trim() || isTyping) return;
    const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    const history = [...messages.filter(m => m.id !== "welcome"), userMsg].map(m => ({ role: m.role, content: m.content }));
    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ messages: history }),
      });
      const data = await res.json() as { content: string };
      const { text: parsed, plan } = parsePlan(data.content);
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: parsed, plan: plan ?? undefined }]);
    } catch {
      setMessages(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", content: "Having trouble connecting. Try again! 🙏" }]);
    } finally {
      setIsTyping(false);
    }
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  }

  const showQuickReplies = messages.length === 1;

  return (
    <div className="glass-card rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 flex flex-col h-[520px] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/30">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm">YatraBot</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-muted-foreground">AI Travel Planner · Live</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { setMessages([WELCOME]); setInput(""); }}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="New chat">
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <Link href="/planner">
            <button className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-primary/8 transition-colors font-medium">
              Full view <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1 min-h-0">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div key={msg.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
              className={`flex items-end gap-2 mb-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-6 h-6 rounded-full gradient-blue-purple flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-3 h-3 text-white" />
                </div>
              )}
              {msg.role === "user" && (
                <div className="w-6 h-6 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 text-[10px] font-bold text-primary">
                  {user?.name?.[0]?.toUpperCase() ?? "U"}
                </div>
              )}
              <div className={`flex-1 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                <div className={`max-w-[88%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "gradient-blue-purple text-white rounded-br-sm"
                    : "bg-card border border-card-border rounded-bl-sm"
                }`} dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                {msg.plan && <MiniPlanCard plan={msg.plan} />}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && <TypingDots />}
        <div ref={bottomRef} />
      </div>

      {/* Quick replies */}
      <AnimatePresence>
        {showQuickReplies && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {QUICK_REPLIES.map(r => (
              <button key={r} onClick={() => sendMessage(r)}
                className="px-2.5 py-1 text-[11px] rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/12 transition-all font-medium">
                {r}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border/40 shrink-0">
        {!user && (
          <div className="mb-2 flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-accent/8 border border-accent/20 text-[11px] text-accent">
            <Sparkles className="w-3 h-3 shrink-0" />
            <Link href="/auth" className="underline font-medium">Sign in</Link>
            <span>to save your plan</span>
          </div>
        )}
        <div className="flex items-end gap-2 p-2.5 rounded-xl bg-card border border-card-border focus-within:border-primary/30 transition-colors">
          <MessageSquare className="w-3.5 h-3.5 text-muted-foreground/50 mb-1.5 shrink-0" />
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
            placeholder="Ask me about your dream trip..." rows={1}
            style={{ resize: "none", minHeight: "28px", maxHeight: "80px" }}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground/50 outline-none py-1" />
          <Button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping} size="sm"
            className="gradient-blue-purple text-white border-0 rounded-lg h-7 w-7 p-0 shrink-0">
            <Send className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
