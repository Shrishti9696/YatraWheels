import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, MapPin, Send, Sparkles, ArrowLeft, RotateCcw,
  Car, Users, Clock, DollarSign, CheckCircle, ChevronDown, ChevronUp,
  Zap, Star, MessageSquare, Bot
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useBooking } from "@/context/BookingContext";
import { useFeatures } from "@/context/FeatureContext";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { authHeaders } from "@/services/authService";
import type { TripPlan } from "@/data/mockData";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  plan?: ParsedPlan;
  timestamp: Date;
}

interface ParsedPlan {
  destination: string;
  days: number;
  people: number;
  budget: string;
  estimatedCost: number;
  highlights: string[];
  vehicleRecommendation: {
    name: string;
    type: string;
    capacity: number;
    pricePerDay: number;
    features: string[];
  };
  itinerary: Array<{
    day: number;
    title: string;
    activities: Array<{ time: string; activity: string; duration: string }>;
    accommodation: string;
    meals: string;
  }>;
}

const QUICK_REPLIES = [
  "I want to go to Goa 🏖️",
  "Plan a Manali trip ❄️",
  "Explore Rajasthan 🏰",
  "Weekend trip near Delhi 🌿",
];

const WELCOME_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  content: "Hey there! 👋 I'm **YatraBot**, your AI travel companion.\n\nTell me where you'd like to go and I'll craft the perfect trip plan — including vehicle recommendations, day-by-day itinerary, and budget breakdown. Just type your destination to get started!",
  timestamp: new Date(),
};

function parsePlan(content: string): { text: string; plan: ParsedPlan | null } {
  const match = content.match(/\[PLAN\]([\s\S]*?)\[\/PLAN\]/);
  if (!match) return { text: content, plan: null };
  try {
    const plan = JSON.parse(match[1].trim()) as ParsedPlan;
    const text = content.replace(/\[PLAN\][\s\S]*?\[\/PLAN\]/, "").trim();
    return { text, plan };
  } catch {
    return { text: content, plan: null };
  }
}

function renderMarkdown(text: string): string {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br/>");
}

function PlanCard({ plan }: { plan: ParsedPlan }) {
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="mt-3 rounded-2xl overflow-hidden border border-primary/20 bg-card shadow-lg"
    >
      {/* Header */}
      <div className="gradient-blue-purple p-5">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-white/80" />
          <span className="text-xs font-semibold text-white/80 uppercase tracking-wider">Your AI Trip Plan</span>
        </div>
        <h3 className="text-xl font-bold text-white">{plan.destination}</h3>
        <p className="text-white/70 text-sm mt-0.5">{plan.days} days · {plan.people} traveler{plan.people > 1 ? "s" : ""} · {plan.budget}</p>
      </div>

      <div className="p-5 space-y-5">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: MapPin, label: "Destination", value: plan.destination },
            { icon: Clock, label: "Duration", value: `${plan.days} days` },
            { icon: Users, label: "Travelers", value: plan.people.toString() },
            { icon: DollarSign, label: "Estimated Cost", value: `₹${plan.estimatedCost.toLocaleString()}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="bg-muted/40 rounded-xl p-3 text-center">
              <Icon className="w-4 h-4 text-primary mx-auto mb-1.5" />
              <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
              <div className="text-sm font-semibold truncate px-1">{value}</div>
            </div>
          ))}
        </div>

        {/* Highlights */}
        <div className="flex flex-wrap gap-2">
          {plan.highlights.map(h => (
            <span key={h} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/8 border border-primary/15 text-xs text-primary font-medium">
              <CheckCircle className="w-3 h-3" /> {h}
            </span>
          ))}
        </div>

        {/* Vehicle */}
        <div className="bg-muted/30 rounded-xl p-4 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl gradient-blue-purple flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
            <Car className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">Recommended Vehicle</div>
            <div className="font-semibold text-sm">{plan.vehicleRecommendation.name}</div>
            <div className="text-xs text-muted-foreground">Up to {plan.vehicleRecommendation.capacity} passengers · ₹{plan.vehicleRecommendation.pricePerDay.toLocaleString()}/day</div>
            <div className="flex flex-wrap gap-1 mt-2">
              {plan.vehicleRecommendation.features.map(f => (
                <span key={f} className="px-2 py-0.5 rounded-md bg-background border border-border text-xs">{f}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Itinerary */}
        <div>
          <div className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Day-by-Day Itinerary
          </div>
          <div className="space-y-2">
            {plan.itinerary.map(day => (
              <div key={day.day} className="bg-muted/20 border border-border/60 rounded-xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between p-3.5 text-left hover:bg-muted/30 transition-colors"
                  onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg gradient-blue-purple flex items-center justify-center text-white text-xs font-bold shrink-0">{day.day}</div>
                    <div>
                      <div className="font-medium text-sm">{day.title}</div>
                      <div className="text-xs text-muted-foreground">{day.activities.length} activities</div>
                    </div>
                  </div>
                  {expandedDay === day.day ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </button>
                <AnimatePresence>
                  {expandedDay === day.day && (
                    <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-4 pb-4 border-t border-border/40">
                        <div className="pt-3 space-y-2">
                          {day.activities.map((act, i) => (
                            <div key={i} className="flex items-start gap-3">
                              <div className="text-xs font-medium text-primary w-20 shrink-0 pt-0.5">{act.time}</div>
                              <div>
                                <div className="text-sm font-medium">{act.activity}</div>
                                <div className="text-xs text-muted-foreground">{act.duration}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                          <div className="bg-background/60 rounded-lg px-3 py-2 text-xs">
                            <span className="font-medium block mb-0.5">Accommodation</span>
                            <span className="text-muted-foreground">{day.accommodation}</span>
                          </div>
                          <div className="bg-background/60 rounded-lg px-3 py-2 text-xs">
                            <span className="font-medium block mb-0.5">Meals</span>
                            <span className="text-muted-foreground">{day.meals}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <Link href="/booking">
          <Button className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 rounded-xl h-11 font-medium">
            <Car className="w-4 h-4 mr-2" /> Book This Trip
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full gradient-blue-purple flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-card border border-card-border shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Planner() {
  const { user } = useBooking();
        {/* Messages */}
        {!features.AI_SEARCH ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <ComingSoonBadge label="AI Travel Planner" className="max-w-md w-full" />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto py-4 space-y-1 min-h-[420px] max-h-[calc(100vh-280px)]">
              <AnimatePresence initial={false}>
                {messages.map(msg => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex items-end gap-2 mb-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    {/* Avatar */}
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full gradient-blue-purple flex items-center justify-center shrink-0 shadow-md shadow-primary/20 mb-1">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                    )}
                    {msg.role === "user" && (
                      <div className="w-8 h-8 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center shrink-0 mb-1 text-xs font-bold text-primary">
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                    )}

                    <div className={`flex-1 ${msg.role === "user" ? "flex flex-col items-end" : ""}`}>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === "user"
                            ? "gradient-blue-purple text-white rounded-br-md shadow-primary/15"
                            : "bg-card border border-card-border rounded-bl-md"
                        }`}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                      />
                      {msg.plan && <PlanCard plan={msg.plan} />}
                      <div className="text-[10px] text-muted-foreground/50 mt-1 px-1">
                        {msg.timestamp.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick replies */}
            <AnimatePresence>
              {showQuickReplies && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-wrap gap-2 pb-3"
                >
                  {QUICK_REPLIES.map(reply => (
                    <button
                      key={reply}
                      onClick={() => sendMessage(reply)}
                      className="px-3 py-1.5 text-xs rounded-full border border-primary/20 bg-primary/5 text-primary hover:bg-primary/12 hover:border-primary/40 transition-all font-medium"
                    >
                      {reply}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="border-t border-border/60 pt-4 pb-6">
              {!user && (
                <div className="mb-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-accent/8 border border-accent/20 text-xs text-accent">
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span><Link href="/auth" className="underline font-medium">Sign in</Link> to save your plan and get personalized recommendations</span>
                </div>
              )}
              <div className="flex items-end gap-3 p-3 rounded-2xl bg-card border border-card-border shadow-sm focus-within:border-primary/30 transition-colors">
                <MessageSquare className="w-4 h-4 text-muted-foreground/50 mb-2.5 shrink-0" />
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me about your dream trip..."
                  rows={1}
                  style={{ resize: "none", minHeight: "36px", maxHeight: "120px" }}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground/50 outline-none py-1.5"
                />
                <Button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  size="sm"
                  className="gradient-blue-purple text-white border-0 shadow-md shadow-primary/20 rounded-xl h-9 w-9 p-0 shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-center text-[10px] text-muted-foreground/40 mt-2">
                YatraBot · Powered by GPT-4o-mini · Plans are AI-generated suggestions
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
