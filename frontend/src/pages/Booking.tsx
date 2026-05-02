import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Car, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { VehicleCard } from "@/components/VehicleCard";
import { SearchBar } from "@/components/SearchBar";
import { Link } from "wouter";
import { getVehicles } from "@/services/api";
import type { Vehicle, VehicleType } from "@/data/mockData";

const types: { value: string; label: string }[] = [
  { value: "all", label: "All Vehicles" },
  { value: "sedan", label: "Sedan" },
  { value: "suv", label: "SUV" },
  { value: "van", label: "Van" },
  { value: "minibus", label: "Mini Bus" },
  { value: "luxury", label: "Luxury" },
];

export default function Booking() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState("all");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [minCapacity, setMinCapacity] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  async function fetchVehicles() {
    setLoading(true);
    const data = await getVehicles({
      type: selectedType !== "all" ? (selectedType as VehicleType) : undefined,
      minCapacity: minCapacity > 1 ? minCapacity : undefined,
    });
    setVehicles(data.filter(v => v.pricePerDay <= maxPrice));
    setLoading(false);
  }

  useEffect(() => { fetchVehicles(); }, [selectedType, maxPrice, minCapacity]);

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
        <div className="mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-bold mb-2"
            data-testid="text-booking-heading"
          >
            Book your vehicle
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground"
          >
            {vehicles.length} vehicles available for your journey
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <SearchBar onSearch={fetchVehicles} />
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:w-64 shrink-0"
          >
            <div className="bg-card border border-card-border rounded-2xl p-5 sticky top-24">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary" />
                  Filters
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => { setSelectedType("all"); setMaxPrice(20000); setMinCapacity(1); }}
                  data-testid="button-reset-filters"
                >
                  Reset
                </Button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm font-medium mb-3">Vehicle Type</p>
                  <div className="space-y-1.5">
                    {types.map(t => (
                      <button
                        key={t.value}
                        onClick={() => setSelectedType(t.value)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedType === t.value
                            ? "bg-primary/15 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                        }`}
                        data-testid={`filter-type-${t.value}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">
                    Max Price: <span className="text-primary">₹{maxPrice.toLocaleString()}/day</span>
                  </p>
                  <input
                    type="range"
                    min={1000}
                    max={20000}
                    step={500}
                    value={maxPrice}
                    onChange={e => setMaxPrice(Number(e.target.value))}
                    className="w-full accent-primary"
                    data-testid="filter-max-price"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>₹1,000</span>
                    <span>₹20,000</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-3">Min Capacity: <span className="text-primary">{minCapacity}+</span></p>
                  <input
                    type="range"
                    min={1}
                    max={25}
                    step={1}
                    value={minCapacity}
                    onChange={e => setMinCapacity(Number(e.target.value))}
                    className="w-full accent-primary"
                    data-testid="filter-min-capacity"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1</span>
                    <span>25+</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-card border border-card-border">
                    <Skeleton className="h-48 w-full" />
                    <div className="p-5 space-y-3">
                      <Skeleton className="h-5 w-2/3" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-center"
                data-testid="empty-state-vehicles"
              >
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                  <Car className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No vehicles found</h3>
                <p className="text-muted-foreground text-sm mb-6">Try adjusting your filters to find available vehicles.</p>
                <Button
                  variant="outline"
                  onClick={() => { setSelectedType("all"); setMaxPrice(20000); setMinCapacity(1); }}
                  data-testid="button-clear-filters"
                >
                  Clear filters
                </Button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
              >
                {vehicles.map((vehicle, i) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} index={i} />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
