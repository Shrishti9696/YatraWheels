import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MapPin, Star, Shield, Clock, Users, ChevronRight,
  Car, Truck, Bus, Brain, Zap, Award, HeartHandshake, ChevronUp,
  CheckCircle, Sparkles, Route, Building2, Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchBar } from "@/components/SearchBar";
import { YatraBotWidget } from "@/components/YatraBotWidget";
import { getVehicles } from "@/services/api";
import type { Vehicle } from "@/data/mockData";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

/* ─── Hero ───────────────────────────────────────────────────── */
function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-12">
          {/* Left */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-8"
            >
              <Zap className="w-3.5 h-3.5" />
              Smart travel planning — now with AI assistance
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-[1.1]"
            >
              Plan smarter journeys with{" "}
              <span className="gradient-text">AI-powered</span>{" "}
              travel & premium rides
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-lg"
            >
              Premium vehicles for every journey — solo road trips, group travel, destination weddings, and corporate events across India.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 mb-10"
            >
              <Link href="/planner">
                <Button size="lg" className="gradient-blue-purple text-white border-0 shadow-xl shadow-primary/30 hover:shadow-primary/45 transition-all px-8 rounded-xl group w-full sm:w-auto">
                  <Brain className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  AI Planner
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link href="/booking">
                <Button size="lg" variant="outline" className="border-white/15 hover:bg-white/8 hover:border-white/25 rounded-xl px-8 transition-all w-full sm:w-auto">
                  <Car className="w-4 h-4 mr-2" />
                  Book a Ride
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-5"
            >
              {[
                { icon: Shield, label: "Verified Drivers" },
                { icon: Clock, label: "24/7 Support" },
                { icon: Star, label: "4.9 Rating" },
                { icon: Users, label: "50K+ Travelers" },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Icon className="w-4 h-4 text-primary" />
                  {label}
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Live YatraBot Chat */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <YatraBotWidget />
          </motion.div>
        </div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-5xl"
        >
          <SearchBar />
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Trust / Social Proof ───────────────────────────────────── */
function TrustSection() {
  const stats = [
    { icon: Star, value: "4.9", label: "Average Rating", sub: "from 50K+ reviews", color: "text-accent" },
    { icon: Users, value: "50K+", label: "Happy Travelers", sub: "across India", color: "text-primary" },
    { icon: Shield, value: "100%", label: "Verified Drivers", sub: "background checked", color: "text-emerald-400" },
    { icon: Zap, value: "<2 min", label: "Instant Booking", sub: "confirmed immediately", color: "text-purple-400" },
  ];

  return (
    <section className="py-12 border-y border-white/5 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map(({ icon: Icon, value, label, sub, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 sm:p-6 text-center border border-white/8 hover:border-white/15 transition-all"
            >
              <div className={`flex items-center justify-center mb-3`}>
                <Icon className={`w-6 h-6 ${color}`} />
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1">{value}</div>
              <div className="text-sm font-medium text-foreground mb-0.5">{label}</div>
              <div className="text-xs text-muted-foreground">{sub}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Use Cases ───────────────────────────────────────────────── */
function UseCasesSection() {
  const useCases = [
    {
      icon: Mountain,
      emoji: "🏔️",
      title: "Road Trips",
      desc: "Explore hidden highways, mountain passes, and coastal roads in comfort. GPS-fitted, driver-guided vehicles make every road trip effortless.",
      tags: ["Solo", "Couples", "Friends"],
      gradient: "from-blue-500/10 to-primary/5",
      border: "hover:border-primary/30",
    },
    {
      icon: HeartHandshake,
      emoji: "💒",
      title: "Destination Weddings",
      desc: "Coordinate seamless transport for hundreds of guests from airports, hotels, and venues. Custom fleets for every wedding size.",
      tags: ["Guest Shuttles", "Bridal Party", "Custom"],
      gradient: "from-pink-500/10 to-purple-500/5",
      border: "hover:border-purple-400/30",
    },
    {
      icon: Users,
      emoji: "👥",
      title: "Group Travel",
      desc: "From corporate offsites to school trips — our fleet scales to your group. Single booking, multiple vehicles, one point of contact.",
      tags: ["Corporate", "Schools", "Tours"],
      gradient: "from-emerald-500/10 to-teal-500/5",
      border: "hover:border-emerald-400/30",
    },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
          <motion.p variants={fadeInUp} className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Use Cases</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">Built for every journey</motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">Whether it's a road trip, a wedding, or a corporate event — we have the perfect vehicle and plan for you.</motion.p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {useCases.map((uc) => (
            <motion.div
              key={uc.title}
              variants={fadeInUp}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={`glass-card rounded-2xl p-8 group border border-white/8 ${uc.border} hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 bg-gradient-to-br ${uc.gradient} cursor-pointer`}
            >
              <div className="text-5xl mb-5">{uc.emoji}</div>
              <h3 className="font-bold text-xl mb-3">{uc.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">{uc.desc}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {uc.tags.map(t => (
                  <span key={t} className="px-3 py-1 text-xs rounded-full bg-white/8 text-muted-foreground border border-white/10 group-hover:border-white/20 transition-colors">{t}</span>
                ))}
              </div>
              <Link href="/booking">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 px-0 group/btn">
                  Book now
                  <ArrowRight className="w-4 h-4 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Live Vendor Vehicles ────────────────────────────────────── */
function LiveVehiclesSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getVehicles().then(v => { setVehicles(v.slice(0, 6)); setLoading(false); });
  }, []);

  return (
    <section className="py-24 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
          <motion.p variants={fadeInUp} className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Available Fleet</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">Vehicles listed by verified vendors</motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">Every vehicle is owner-verified. Browse what's available right now across India.</motion.p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-card border border-card-border">
                <Skeleton className="h-44 w-full" />
                <div className="p-5 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center py-20 border border-dashed border-white/10 rounded-3xl"
          >
            <Truck className="w-14 h-14 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No vehicles listed yet</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">Vendors haven't added any vehicles yet. Be the first to list your fleet!</p>
            <Link href="/auth">
              <Button className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20">
                List Your Vehicle
              </Button>
            </Link>
          </motion.div>
        ) : (
          <>
            <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map((v) => (
                <motion.div
                  key={v.id}
                  variants={fadeInUp}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
                  className="group rounded-2xl overflow-hidden border border-white/8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 bg-card cursor-pointer"
                >
                  <div className="relative h-44 overflow-hidden bg-muted">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Car className="w-12 h-12 text-muted-foreground/30" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 right-3">
                      <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold border border-white/15">
                        ₹{v.pricePerDay.toLocaleString()}/day
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-foreground mb-1">{v.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" />{v.location}
                      <span>·</span>
                      <Users className="w-3 h-3" />{v.capacity} seats
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{v.rating.toFixed(1)}</span>
                      </div>
                      <Link href="/booking">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 h-7 px-2 text-xs gap-1">
                          Book <ArrowRight className="w-3 h-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mt-10">
              <Link href="/booking">
                <Button variant="outline" className="border-white/12 hover:bg-white/5 rounded-xl">
                  View all vehicles <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          </>
        )}
      </div>
    </section>
  );
}

/* ─── Why Us ─────────────────────────────────────────────────── */
function WhyUsSection() {
  const features = [
    { icon: Shield, title: "Verified & Insured", desc: "Every vehicle is background-checked, sanitized, and fully insured for your peace of mind." },
    { icon: Clock, title: "Real-time Tracking", desc: "Know exactly where your vehicle is at every moment of the journey with live GPS updates." },
    { icon: Award, title: "Premium Standards", desc: "Rated 4.9 stars by 50,000+ travelers. We maintain elite standards across every booking." },
    { icon: Brain, title: "Smart Planning", desc: "AI-powered trip recommendations tailored to your itinerary, budget, and group size." },
    { icon: Users, title: "Dedicated Support", desc: "24/7 concierge support throughout your entire trip — not just at booking time." },
    { icon: Zap, title: "Instant Confirmation", desc: "Book in under 2 minutes. Instant confirmation, digital contract, zero waiting." },
  ];

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
          <motion.p variants={fadeInUp} className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Why YatraWheels</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">Travel with complete confidence</motion.h2>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={fadeInUp}
              className="glass-card rounded-2xl p-6 border border-white/8 hover:border-white/15 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold mb-2">{f.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ─── AI Lead Section ────────────────────────────────────────── */
function AILeadSection() {
  return (
    <section className="py-24 bg-card/20 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
          className="glass-card rounded-3xl border border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-8 sm:p-10 lg:p-14 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6 w-fit">
                <Zap className="w-3.5 h-3.5" /> Powered by OpenAI
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                Get a free AI travel plan — <span className="gradient-text">instantly</span>
              </h2>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Tell us your destination, dates, and budget. Our AI creates a personalised day-by-day itinerary, budget breakdown, and vehicle recommendation in seconds.
              </p>
              <ul className="space-y-3 mb-8">
                {["Personalised day-by-day itinerary", "Smart budget allocation tips", "Top vehicle recommendations", "Instant — no waiting, no calls"].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-3 h-3 text-primary" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/get-plan">
                <Button size="lg" className="gradient-blue-purple text-white border-0 shadow-xl shadow-primary/30 px-8 rounded-xl w-full sm:w-fit">
                  <Brain className="w-4 h-4 mr-2" />
                  Generate My Free Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="hidden lg:flex items-center justify-center p-10 bg-gradient-to-br from-primary/5 to-purple-500/5 border-l border-white/5">
              <div className="w-full max-w-sm space-y-3">
                <div className="text-xs font-medium text-muted-foreground mb-4 uppercase tracking-widest">Sample AI Output</div>
                {[
                  { label: "Travel Plan", text: "Day 1: Arrive in Goa, check in to beachside resort. Evening sunset cruise at Dona Paula..." },
                  { label: "Budget Tip", text: "Allocate ₹18k for transport with YatraWheels Innova Crysta, ₹22k for 4-star stay, ₹10k for dining." },
                  { label: "Recommendation", text: "Visit Dudhsagar Falls on Day 3 — book early morning slot to avoid crowds." },
                ].map(({ label, text }) => (
                  <div key={label} className="bg-card/80 border border-card-border rounded-xl p-4">
                    <div className="text-xs font-semibold text-primary mb-1.5">{label}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{text}</div>
                  </div>
                ))}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs text-muted-foreground">AI generating your plan...</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── CTA ────────────────────────────────────────────────────── */
function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-purple-500/8" />
        <div className="absolute top-0 left-1/3 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-purple-500/8 blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-medium mb-6">
            <Star className="w-3.5 h-3.5" /> Trusted by 50,000+ travelers
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Ready to plan your<br className="hidden sm:block" /> next journey?
          </h2>
          <p className="text-muted-foreground mb-10 max-w-lg mx-auto text-lg">
            Book your vehicle in under 2 minutes. Premium transport, verified drivers, instant confirmation.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/get-plan">
              <Button size="lg" className="gradient-blue-purple text-white border-0 shadow-xl shadow-primary/30 px-10 rounded-xl w-full sm:w-auto group">
                <Sparkles className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                Start Planning
              </Button>
            </Link>
            <Link href="/booking">
              <Button size="lg" variant="outline" className="border-white/15 hover:bg-white/8 rounded-xl px-10 w-full sm:w-auto">
                <Car className="w-4 h-4 mr-2" />
                Explore Fleet
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Scroll-to-top ──────────────────────────────────────────── */
function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-full gradient-blue-purple flex items-center justify-center shadow-xl shadow-primary/30 text-white hover:shadow-primary/50 transition-shadow"
          aria-label="Scroll to top"
        >
          <ChevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <TrustSection />
      <UseCasesSection />
      <LiveVehiclesSection />
      <WhyUsSection />
      <AILeadSection />
      <CTASection />
      <ScrollToTopButton />
    </main>
  );
}
