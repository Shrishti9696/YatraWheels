import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  SlidersHorizontal, Car, Search, ArrowLeft, Sparkles, 
  X, Send, AlertCircle, Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/VehicleCard";
import { Link } from "wouter";
import { useBooking } from "@/context/BookingContext";
import { getVehicles, aiSearchVehicles } from "@/services/api";
import { Vehicle } from "@/data/mockData";
import { toast } from "sonner";

export default function Booking() {
  const { tripParams } = useBooking();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiQuery, setAiQuery] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiMode, setIsAiMode] = useState(false);

  // Filters
  const [selectedType, setSelectedType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minCapacity, setMinCapacity] = useState(1);

  async function fetchVehicles(filters?: any) {
    setLoading(true);
    try {
      const data = await getVehicles({
        type: filters?.type || (selectedType !== "all" ? selectedType : undefined),
        minCapacity: filters?.capacity || (minCapacity > 1 ? minCapacity : undefined),
        maxPrice: filters?.priceMax || maxPrice
      });
      setVehicles(data);
    } catch (e: any) {
      toast.error("Failed to load vehicles");
    } finally {
      setLoading(false);
    }
  }

  async function handleAiSearch() {
    if (!aiQuery.trim()) return;
    setLoading(true);
    setAiSuggestion(null);
    try {
      const { vehicles, aiSuggestion, fallbackSearch } = await aiSearchVehicles(aiQuery);
      setVehicles(vehicles);
      setAiSuggestion(aiSuggestion);
      if (fallbackSearch) {
        toast.info("Using standard search (AI search is being configured)");
      }
    } catch (e: any) {
      toast.error("AI Search failed. Using standard results.");
      fetchVehicles();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!isAiMode) fetchVehicles();
  }, [selectedType, maxPrice, minCapacity, isAiMode]);

  return (
    <main className="pt-24 pb-20 min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto px-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Home
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black mb-2">Find Your Ride</h1>
            <p className="text-muted-foreground">Select from our premium fleet of {vehicles.length} verified vehicles</p>
          </div>
          
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
             <button 
               onClick={() => setIsAiMode(false)}
               className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", !isAiMode ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
             >
               Standard
             </button>
             <button 
               onClick={() => setIsAiMode(true)}
               className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", isAiMode ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
             >
               <Sparkles className="w-4 h-4" /> AI Search
             </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isAiMode && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="mb-12 overflow-hidden"
            >
               <div className="relative max-w-3xl mx-auto">
                 <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20" />
                 <div className="relative bg-card border border-white/10 p-2 rounded-[2rem] shadow-2xl flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <input 
                      value={aiQuery}
                      onChange={e => setAiQuery(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAiSearch()}
                      placeholder="e.g. I need a 7 seater SUV for a trip to Manali next week..."
                      className="flex-1 bg-transparent border-0 outline-none text-lg font-medium placeholder:text-muted-foreground/50"
                    />
                    <Button 
                      onClick={handleAiSearch}
                      disabled={loading || !aiQuery.trim()}
                      className="rounded-2xl h-12 px-8 gradient-blue-purple font-bold text-white shadow-xl shadow-primary/20"
                    >
                      {loading ? "Thinking..." : "Search ✨"}
                    </Button>
                 </div>
               </div>

               {aiSuggestion && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   className="max-w-3xl mx-auto mt-6 p-6 rounded-3xl bg-primary/10 border border-primary/20 flex gap-4"
                 >
                    <Info className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-sm font-medium leading-relaxed italic text-primary/90">
                       "{aiSuggestion}"
                    </p>
                 </motion.div>
               )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8">
          {/* Filters Sidebar */}
          <aside className="lg:col-span-3">
             <div className="bg-card border border-white/5 rounded-3xl p-6 sticky top-24">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="font-bold flex items-center gap-2"><SlidersHorizontal className="w-4 h-4 text-primary" /> Refine</h3>
                   <button onClick={() => { setSelectedType("all"); setMaxPrice(20000); setMinCapacity(1); }} className="text-[10px] uppercase font-black tracking-widest text-muted-foreground hover:text-primary transition-colors">Reset</button>
                </div>

                <div className="space-y-8">
                   <div>
                      <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">Category</div>
                      <div className="space-y-1">
                         {["all", "sedan", "suv", "van", "luxury"].map(t => (
                           <button 
                             key={t} onClick={() => setSelectedType(t)}
                             className={cn("w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold capitalize transition-all", selectedType === t ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-white/5 hover:text-foreground")}
                           >
                             {t}
                           </button>
                         ))}
                      </div>
                   </div>

                   <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Budget</div>
                        <span className="text-xs font-bold text-primary">₹{maxPrice}/day</span>
                      </div>
                      <input 
                        type="range" min={1000} max={20000} step={500} value={maxPrice}
                        onChange={e => setMaxPrice(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                   </div>

                   <div>
                      <div className="flex justify-between items-center mb-4">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Capacity</div>
                        <span className="text-xs font-bold text-primary">{minCapacity}+ People</span>
                      </div>
                      <input 
                        type="range" min={1} max={20} step={1} value={minCapacity}
                        onChange={e => setMinCapacity(Number(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                      />
                   </div>
                </div>
             </div>
          </aside>

          {/* Results Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-[400px] rounded-[2rem]" />)}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-card border border-dashed border-white/10 rounded-[2rem]">
                 <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                    <Car className="w-10 h-10 text-muted-foreground/30" />
                 </div>
                 <h3 className="text-xl font-bold mb-2">No Matches Found</h3>
                 <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">Try adjusting your filters or search query to see more vehicles.</p>
                 <Button variant="outline" onClick={() => { setIsAiMode(false); setSelectedType("all"); }} className="rounded-xl border-white/10">Clear All Search</Button>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
              >
                {vehicles.map((v, i) => <VehicleCard key={v.id} vehicle={v} index={i} />)}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
