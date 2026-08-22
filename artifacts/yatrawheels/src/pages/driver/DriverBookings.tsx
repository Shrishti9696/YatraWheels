import { useEffect, useState } from "react";
import { Car, AlertCircle, LayoutDashboard, BookOpen } from "lucide-react";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyBookings } from "@/services/driverService";

const NAV = [
  { href: "/driver", label: "Dashboard", icon: LayoutDashboard },
  { href: "/driver/bookings", label: "My Trips", icon: BookOpen },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-primary bg-primary/10 border-primary/20",
  ongoing: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function DriverBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getMyBookings()
      .then(setBookings)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={NAV} roleLabel="Driver" roleBadgeClass="text-purple-400 bg-purple-400/10 border-purple-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">My Trips</h1>
            <p className="text-muted-foreground text-sm">{bookings.length} total trip{bookings.length !== 1 ? "s" : ""} assigned</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="flex gap-2 flex-wrap mb-6">
            {["all", "confirmed", "ongoing", "completed", "cancelled"].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary/15 text-primary border border-primary/25" : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/8"}`}>{s}</button>
            ))}
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Car className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No trips found.</p>
              </div>
            ) : (
              filtered.map(b => (
                <div key={b._id} className="bg-card border border-card-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                    {b.vehicleId?.imageUrl
                      ? <img src={b.vehicleId.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                      : <Car className="w-5 h-5 text-purple-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm mb-1">{b.vehicleId?.name || "Vehicle"}</div>
                    <div className="text-xs text-muted-foreground mb-1">{b.pickupLocation} → {b.dropLocation}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(b.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {b.passengers && ` · ${b.passengers} passenger${b.passengers > 1 ? "s" : ""}`}
                    </div>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end gap-3">
                    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                    <div className="text-sm font-bold">₹{b.driverAmount?.toLocaleString() || "—"}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
