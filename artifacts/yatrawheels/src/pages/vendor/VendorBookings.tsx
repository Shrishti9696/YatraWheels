import { useEffect, useState } from "react";
import { Calendar, AlertCircle, LayoutDashboard, Truck, BookOpen } from "lucide-react";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyBookings, updateBookingStatus } from "@/services/vendorService";

const NAV = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/vehicles", label: "My Vehicles", icon: Truck },
  { href: "/vendor/bookings", label: "Bookings", icon: BookOpen },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-primary bg-primary/10 border-primary/20",
  ongoing: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const STATUS_ACTIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["ongoing", "cancelled"],
  ongoing: ["completed"],
  completed: [],
  cancelled: [],
};

export default function VendorBookings() {
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

  async function changeStatus(id: string, status: string) {
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: updated.status } : b));
    } catch (e: any) {
      setError(e.message);
    }
  }

  const filtered = filter === "all" ? bookings : bookings.filter(b => b.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={NAV} roleLabel="Vendor" roleBadgeClass="text-emerald-400 bg-emerald-400/10 border-emerald-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Bookings</h1>
            <p className="text-muted-foreground text-sm">{bookings.length} total booking{bookings.length !== 1 ? "s" : ""}</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          {/* Filter tabs */}
          <div className="flex gap-2 flex-wrap mb-6">
            {["all", "pending", "confirmed", "ongoing", "completed", "cancelled"].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filter === s ? "bg-primary/15 text-primary border border-primary/25" : "bg-white/5 text-muted-foreground hover:text-foreground border border-white/8"}`}>
                {s}
              </button>
            ))}
          </div>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Traveler", "Vehicle", "Route", "Date", "Amount", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>
                        ))}
                      </tr>
                    ))
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-16 text-muted-foreground text-sm">No bookings found.</td></tr>
                  ) : (
                    filtered.map(b => (
                      <tr key={b._id} className="hover:bg-white/2 transition-colors">
                        <td className="px-5 py-4">
                          <div className="text-sm font-medium">{b.userId?.name || "—"}</div>
                          <div className="text-xs text-muted-foreground">{b.userId?.email}</div>
                        </td>
                        <td className="px-5 py-4 text-sm">{b.vehicleId?.name || "—"}</td>
                        <td className="px-5 py-4">
                          <div className="text-xs text-muted-foreground">{b.pickupLocation}</div>
                          <div className="text-xs text-muted-foreground">→ {b.dropLocation}</div>
                        </td>
                        <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">{new Date(b.date).toLocaleDateString("en-IN")}</td>
                        <td className="px-5 py-4 text-sm font-semibold">₹{b.totalPrice?.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                        </td>
                        <td className="px-5 py-4">
                          {STATUS_ACTIONS[b.status]?.length > 0 ? (
                            <select
                              value=""
                              onChange={e => { if (e.target.value) changeStatus(b._id, e.target.value); }}
                              className="text-xs bg-white/5 border border-white/10 text-muted-foreground rounded-lg px-2 py-1.5 [color-scheme:dark] outline-none cursor-pointer"
                            >
                              <option value="">Update</option>
                              {STATUS_ACTIONS[b.status].map(s => <option key={s} value={s} className="bg-card capitalize">{s}</option>)}
                            </select>
                          ) : <span className="text-xs text-muted-foreground/50">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
