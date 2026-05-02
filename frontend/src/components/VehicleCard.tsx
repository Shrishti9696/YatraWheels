import { Star, Users, CheckCircle } from "lucide-react";
import { Vehicle } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import { useLocation } from "wouter";

const typeColors: Record<string, string> = {
  sedan: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  suv: "bg-green-500/10 text-green-400 border-green-500/20",
  van: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  minibus: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  luxury: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const typeLabels: Record<string, string> = {
  sedan: "Sedan",
  suv: "SUV",
  van: "Van",
  minibus: "Mini Bus",
  luxury: "Luxury",
};

type Props = {
  vehicle: Vehicle;
  index?: number;
};

export function VehicleCard({ vehicle, index = 0 }: Props) {
  const { setSelectedVehicle } = useBooking();
  const [, setLocation] = useLocation();

  function handleSelect() {
    setSelectedVehicle(vehicle);
    setLocation(`/booking/${vehicle.id}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      className="group bg-card border border-card-border rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
      data-testid={`card-vehicle-${vehicle.id}`}
    >
      <div className="relative overflow-hidden h-48">
        <img
          src={vehicle.imageUrl}
          alt={vehicle.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${typeColors[vehicle.type]}`}>
            {typeLabels[vehicle.type]}
          </span>
          {!vehicle.available && (
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
              Unavailable
            </span>
          )}
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-semibold text-white">{vehicle.rating}</span>
          <span className="text-xs text-white/60">({vehicle.reviewCount})</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-base">{vehicle.name}</h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground">
              <Users className="w-3.5 h-3.5" />
              <span className="text-xs">Up to {vehicle.capacity} passengers</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-foreground">
              &#8377;{vehicle.pricePerDay.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">per day</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {vehicle.features.slice(0, 3).map(f => (
            <div key={f} className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="w-3 h-3 text-primary/60" />
              {f}
            </div>
          ))}
          {vehicle.features.length > 3 && (
            <span className="text-xs text-muted-foreground">+{vehicle.features.length - 3} more</span>
          )}
        </div>

        <Button
          className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 hover:shadow-primary/35 transition-shadow"
          disabled={!vehicle.available}
          onClick={handleSelect}
          data-testid={`button-select-vehicle-${vehicle.id}`}
        >
          {vehicle.available ? "Select Vehicle" : "Unavailable"}
        </Button>
      </div>
    </motion.div>
  );
}
