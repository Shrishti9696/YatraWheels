import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, MapPin, Star, Shield, Clock, Users, ChevronRight,
  Car, Truck, Bus, Brain, Zap, Award, HeartHandshake, ChevronUp,
  CheckCircle, Sparkles, Route, Building2, Mountain
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/SearchBar";
import { Skeleton } from "@/components/ui/skeleton";
import { getDestinations, getPopularRoutes } from "@/services/api";
import type { Destination, Route as RouteType } from "@/data/mockData";

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
              <Link href="/get-plan">
                <Button size="lg" className="gradient-blue-purple text-white border-0 shadow-xl shadow-primary/30 hover:shadow-primary/45 transition-all px-8 rounded-xl group w-full sm:w-auto">
                  <Brain className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Plan with AI
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

          {/* Right — floating preview card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="glass-card rounded-3xl border border-primary/20 p-6 shadow-2xl shadow-primary/10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/30">
                    <Brain className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">AI Travel Plan</div>
                    <div className="text-xs text-muted-foreground">Generating for Goa · 5 days</div>
                  </div>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-muted-foreground">Live</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { day: "Day 1", activity: "Arrive Goa · Baga Beach sunset walk", done: true },
                    { day: "Day 2", activity: "Dudhsagar Falls · Forest trek · Spice farm", done: true },
                    { day: "Day 3", activity: "Old Goa churches · Panjim market tour", done: false },
                    { day: "Day 4", activity: "South Goa beaches · Palolem cove", done: false },
                  ].map(({ day, activity, done }) => (
                    <div key={day} className={`flex items-start gap-3 rounded-xl p-3 ${done ? "bg-primary/8 border border-primary/15" : "bg-white/3 border border-white/8"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${done ? "bg-primary/20" : "border border-white/15"}`}>
                        {done && <CheckCircle className="w-3 h-3 text-primary" />}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-primary mb-0.5">{day}</div>
                        <div className="text-xs text-muted-foreground">{activity}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 rounded-xl bg-accent/8 border border-accent/20 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Recommended vehicle</span>
                  <span className="text-xs font-semibold text-accent">Innova Crysta · ₹4,500/day</span>
                </div>
              </div>
              {/* floating badge */}
              <motion.div
                animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-4 -right-4 glass-card rounded-2xl px-4 py-3 border border-white/15 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent fill-accent" />
                  <span className="text-sm font-bold">4.9</span>
                  <span className="text-xs text-muted-foreground">/ 50K+ trips</span>
                </div>
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }} transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-4 -left-4 glass-card rounded-2xl px-4 py-3 border border-white/15 shadow-xl"
              >
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-xs font-medium">Instant confirmation</span>
                </div>
              </motion.div>
            </div>
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

/* ─── Fleet / Vehicle Categories ─────────────────────────────── */
function FleetSection() {
  const fleet = [
    { name: "Sedans & Economy", desc: "Perfect for solo or couple trips", capacity: "1–4 passengers", from: "₹2,500/day", img: "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=600&q=80" },
    { name: "SUVs & Crossovers", desc: "Comfort for small groups", capacity: "4–7 passengers", from: "₹3,200/day", img: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=600&q=80" },
    { name: "Vans & MPVs", desc: "Spacious group transport", capacity: "8–12 passengers", from: "₹5,000/day", img: "https://images.unsplash.com/photo-1609259594217-74ef0aded34e?w=600&q=80" },
    { name: "Mini & Coach Buses", desc: "Ideal for large groups", capacity: "12–50 passengers", from: "₹8,000/day", img: "https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80" },
    { name: "Luxury Fleet", desc: "Premium chauffeur experience", capacity: "1–7 passengers", from: "₹12,000/day", img: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=600&q=80" },
    { name: "Event Packages", desc: "Curated for weddings & events", capacity: "Custom fleet", from: "Custom pricing", img: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=80" },
  ];

  return (
    <section className="py-24 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
          <motion.p variants={fadeInUp} className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Our Fleet</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">Every vehicle for every journey</motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">From intimate getaways to large group travel — we have the right vehicle at the right price.</motion.p>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {fleet.map((cat) => (
            <motion.div
              key={cat.name}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group rounded-2xl overflow-hidden border border-white/8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 bg-card cursor-pointer"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 right-3">
                  <span className="px-2 py-1 rounded-lg bg-black/50 backdrop-blur-sm text-white text-xs font-semibold border border-white/15">
                    {cat.from}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-foreground mb-1">{cat.name}</h3>
                <p className="text-sm text-muted-foreground mb-3">{cat.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {cat.capacity}
                  </span>
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
      </div>
    </section>
  );
}

/* ─── Popular Routes ─────────────────────────────────────────── */
function PopularRoutesSection() {
  const [routes, setRoutes] = useState<RouteType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPopularRoutes().then(r => { setRoutes(r); setLoading(false); });
  }, []);

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-12 gap-4">
          <div>
            <motion.p variants={fadeInUp} className="text-primary text-sm font-medium uppercase tracking-widest mb-2">Popular Routes</motion.p>
            <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold">Top travel routes</motion.h2>
          </div>
          <motion.div variants={fadeInUp}>
            <Link href="/explore">
              <Button variant="ghost" className="text-primary hover:text-primary hover:bg-primary/10">
                View all routes <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <div className="p-4 space-y-2 bg-card border border-card-border rounded-b-2xl">
                  <Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {routes.slice(0, 4).map((route) => (
              <motion.div
                key={route.id}
                variants={fadeInUp}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group rounded-2xl overflow-hidden bg-card border border-card-border hover:border-primary/30 hover:shadow-xl hover:shadow-primary/8 transition-all duration-300 cursor-pointer"
              >
                <div className="relative h-48 overflow-hidden">
                  <img src={route.imageUrl} alt={`${route.from} to ${route.to}`} className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-1.5 text-white text-sm font-medium">
                      <span>{route.from}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{route.to}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground text-xs">{route.distance} · {route.estimatedTime}</span>
                    <span className="font-bold text-foreground">₹{route.basePrice.toLocaleString()}</span>
                  </div>
                  <Link href="/booking">
                    <Button size="sm" className="w-full gradient-blue-purple text-white border-0 rounded-lg shadow-lg shadow-primary/20 text-xs h-8">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

/* ─── Destinations ───────────────────────────────────────────── */
function DestinationsSection() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDestinations().then(d => { setDestinations(d.slice(0, 6)); setLoading(false); });
  }, []);

  return (
    <section className="py-24 bg-card/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-100px" }} className="text-center mb-14">
          <motion.p variants={fadeInUp} className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Explore India</motion.p>
          <motion.h2 variants={fadeInUp} className="text-3xl sm:text-4xl font-bold mb-4">Top destinations</motion.h2>
          <motion.p variants={fadeInUp} className="text-muted-foreground max-w-xl mx-auto">From mountain highways to coastal routes — explore India's most sought-after destinations with premium transport.</motion.p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
          </div>
        ) : (
          <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((dest) => (
              <motion.div
                key={dest.id}
                variants={fadeInUp}
                className="group relative rounded-2xl overflow-hidden h-64 cursor-pointer"
              >
                <img src={dest.imageUrl} alt={dest.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex items-center gap-1 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary">{dest.state}</span>
                  </div>
                  <h3 className="font-bold text-white text-xl mb-2">{dest.name}</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {dest.popularFor.slice(0, 2).map(tag => (
                      <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-white/15 text-white/80 backdrop-blur-sm">{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.3 }} className="text-center mt-10">
          <Link href="/explore">
            <Button variant="outline" className="border-white/12 hover:bg-white/5 rounded-xl">
              Explore all destinations <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </motion.div>
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
      <FleetSection />
      <PopularRoutesSection />
      <DestinationsSection />
      <WhyUsSection />
      <AILeadSection />
      <CTASection />
      <ScrollToTopButton />
    </main>
  );
}
