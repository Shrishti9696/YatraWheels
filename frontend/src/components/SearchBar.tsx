import { useState } from "react";
import { MapPin, Calendar, Users, ArrowRight, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBooking } from "@/context/BookingContext";
import { useLocation } from "wouter";

type Props = { onSearch?: () => void };

export function SearchBar({ onSearch }: Props) {
  const { tripParams, setTripParams } = useBooking();
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    from: tripParams.from,
    to: tripParams.to,
    date: tripParams.date,
    passengers: tripParams.passengers,
  });

  function handleSearch() {
    setTripParams(form);
    if (onSearch) onSearch();
    else setLocation("/booking");
  }

  return (
    <div className="glass-card rounded-2xl p-2 border border-white/12 shadow-2xl shadow-black/20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1.5 lg:gap-0">
        {/* Pickup */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white/4 hover:bg-white/7 transition-colors sm:rounded-r-none border border-transparent hover:border-white/8 group">
          <Navigation className="w-4 h-4 text-primary shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">From</div>
            <input
              type="text"
              placeholder="Pickup location"
              value={form.from}
              onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none font-medium"
              data-testid="input-pickup-location"
            />
          </div>
        </div>

        {/* Destination */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl sm:rounded-none bg-white/4 hover:bg-white/7 transition-colors border border-transparent hover:border-white/8 sm:border-l sm:border-l-white/8">
          <MapPin className="w-4 h-4 text-accent shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">To</div>
            <input
              type="text"
              placeholder="Destination"
              value={form.to}
              onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
              className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/70 outline-none font-medium"
              data-testid="input-destination"
            />
          </div>
        </div>

        {/* Date */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl sm:rounded-none bg-white/4 hover:bg-white/7 transition-colors border border-transparent hover:border-white/8 sm:border-l sm:border-l-white/8">
          <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground mb-0.5">Date</div>
            <input
              type="date"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className="w-full bg-transparent text-sm text-foreground outline-none [color-scheme:dark] font-medium"
              data-testid="input-date"
            />
          </div>
        </div>

        {/* Passengers + CTA */}
        <div className="flex items-center gap-2 sm:border-l sm:border-l-white/8">
          <div className="flex items-center gap-3 px-4 py-3.5 flex-1 rounded-xl sm:rounded-none bg-white/4 hover:bg-white/7 transition-colors border border-transparent hover:border-white/8">
            <Users className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground mb-0.5">Passengers</div>
              <select
                value={form.passengers}
                onChange={e => setForm(f => ({ ...f, passengers: Number(e.target.value) }))}
                className="w-full bg-transparent text-sm text-foreground outline-none [color-scheme:dark] font-medium cursor-pointer"
                data-testid="select-passengers"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25].map(n => (
                  <option key={n} value={n} className="bg-card">{n} {n === 1 ? "passenger" : "passengers"}</option>
                ))}
              </select>
            </div>
          </div>
          <Button
            onClick={handleSearch}
            className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/30 hover:shadow-primary/50 rounded-xl transition-all px-5 h-12 shrink-0 self-center mr-1"
            data-testid="button-search"
          >
            <span className="hidden sm:inline mr-1.5 text-sm font-medium">Search</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
