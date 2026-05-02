import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, MapPin, ArrowRight, Filter, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { DestinationPinsMap } from "@/components/DestinationPinsMap";
import { Link, useLocation } from "wouter";
import { getDestinations, getPopularRoutes, searchRoutes } from "@/services/api";
import type { Destination, Route } from "@/data/mockData";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

export default function Explore() {
  const [, navigate] = useLocation();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loadingDest, setLoadingDest] = useState(true);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [destSearch, setDestSearch] = useState("");
  const [routeFrom, setRouteFrom] = useState("");
  const [routeTo, setRouteTo] = useState("");
  const [activeTag, setActiveTag] = useState("All");

  const tags = ["All", "Mountains", "Beaches", "Heritage", "Nature", "Adventure", "Spiritual"];

  useEffect(() => {
    getDestinations().then(d => { setDestinations(d); setLoadingDest(false); });
    getPopularRoutes().then(r => { setRoutes(r); setLoadingRoutes(false); });
  }, []);

  async function handleRouteSearch() {
    setLoadingRoutes(true);
    const r = await searchRoutes(routeFrom, routeTo);
    setRoutes(r);
    setLoadingRoutes(false);
  }

  const filteredDest = destinations.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(destSearch.toLowerCase()) || d.state.toLowerCase().includes(destSearch.toLowerCase());
    const matchTag = activeTag === "All" || d.popularFor.some(f => f.toLowerCase().includes(activeTag.toLowerCase()));
    return matchSearch && matchTag;
  });

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-14"
        >
          <p className="text-primary text-sm font-medium uppercase tracking-widest mb-3">Explore India</p>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" data-testid="text-explore-heading">
            Where do you want to go?
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Discover destinations, browse routes, and find your next adventure.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-10"
        >
          <DestinationPinsMap activeTag={activeTag} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <h2 className="text-xl font-bold mb-6">Popular Destinations</h2>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search destinations..."
                value={destSearch}
                onChange={e => setDestSearch(e.target.value)}
                className="pl-9 bg-card border-card-border"
                data-testid="input-search-destinations"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 flex-wrap">
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    activeTag === tag
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  data-testid={`filter-tag-${tag.toLowerCase()}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {loadingDest ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-60 rounded-2xl" />)}
            </div>
          ) : filteredDest.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground" data-testid="empty-destinations">
              No destinations match your search.
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filteredDest.map(dest => (
                <motion.div
                  key={dest.id}
                  variants={fadeUp}
                  className="group relative rounded-2xl overflow-hidden h-60 cursor-pointer"
                  data-testid={`card-destination-${dest.id}`}
                  onClick={() => navigate(`/booking?destination=${encodeURIComponent(dest.name)}`)}
                >
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="flex items-center gap-1 mb-1">
                      <MapPin className="w-3.5 h-3.5 text-primary" />
                      <span className="text-xs text-primary/90">{dest.state}</span>
                    </div>
                    <h3 className="font-bold text-white text-lg mb-2">{dest.name}</h3>
                    <p className="text-xs text-white/70 mb-3 line-clamp-1">{dest.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {dest.popularFor.map(tag => (
                        <span key={tag} className="px-2 py-0.5 text-xs rounded-full bg-white/15 text-white/80">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-semibold shadow-lg">
                        Book Vehicles →
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-6">Browse Routes</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
            <Input
              placeholder="From..."
              value={routeFrom}
              onChange={e => setRouteFrom(e.target.value)}
              className="bg-card border-card-border"
              data-testid="input-route-from"
            />
            <Input
              placeholder="To..."
              value={routeTo}
              onChange={e => setRouteTo(e.target.value)}
              className="bg-card border-card-border"
              data-testid="input-route-to"
            />
            <Button
              onClick={handleRouteSearch}
              className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 shrink-0"
              data-testid="button-search-routes"
            >
              <Search className="w-4 h-4 mr-2" />
              Search Routes
            </Button>
          </div>

          {loadingRoutes ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
            </div>
          ) : routes.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground" data-testid="empty-routes">
              No routes found. Try a different search.
            </div>
          ) : (
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {routes.map(route => (
                <motion.div
                  key={route.id}
                  variants={fadeUp}
                  className="bg-card border border-card-border rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all cursor-pointer group"
                  data-testid={`card-route-${route.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
                      <img src={route.imageUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 font-semibold text-foreground">
                        <span>{route.from}</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                        <span>{route.to}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{route.distance} · {route.estimatedTime}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-6">
                    {route.popular && (
                      <span className="px-2.5 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20">Popular</span>
                    )}
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">Starting from</div>
                      <div className="font-bold text-foreground">₹{route.basePrice.toLocaleString()}</div>
                    </div>
                    <Button
                      size="sm"
                      className="gradient-blue-purple text-white border-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      data-testid={`button-book-route-${route.id}`}
                      onClick={() => navigate(`/booking?from=${encodeURIComponent(route.from)}&to=${encodeURIComponent(route.to)}`)}
                    >
                      Book
                    </Button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
