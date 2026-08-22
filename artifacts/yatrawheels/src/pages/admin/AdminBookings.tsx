import { useEffect, useState } from "react";
import { AlertCircle, LayoutDashboard, BookOpen, Truck, UserCog, Shield } from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getBookings, updateBookingStatus } from "@/services/adminService";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/drivers", label: "Drivers", icon: Shield },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  confirmed: "text-primary bg-primary/10 border-primary/20",
  ongoing: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  completed: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  cancelled: "text-red-400 bg-red-400/10 border-red-400/20",
};

const PAYMENT_COLORS: Record<string, string> = {
  unpaid: "text-yellow-400",
  paid: "text-emerald-400",
  refunded: "text-red-400",
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  async function fetchBookings() {
    setLoading(true);
    try {
      const data = await getBookings(filter === "all" ? undefined : filter);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchBookings(); }, [filter]);

  async function handleStatus(id: string, status: string) {
    try {
      const updated = await updateBookingStatus(id, status);
      setBookings(bs => bs.map(b => b._id === id ? { ...b, status: updated.status } : b));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar title="Admin Panel" subtitle="Control center" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">All Bookings</h1>
            <p className="text-muted-foreground text-sm">{total} total booking{total !== 1 ? "s" : ""} on the platform</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="flex gap-2 flex-wrap mb-6">
            {["all", "pending", "confirmed", "ongoing", "completed", "cancelled"].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${filter === s ? "bg-primary/15 text-primary border-primary/25" : "bg-white/5 text-muted-foreground hover:text-foreground border-white/8"}`}>{s}</button>
            ))}
          </div>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Traveler", "Vehicle", "Route", "Date", "Amount", "Payment", "Status", "Action"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-4 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  )) : bookings.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-14 text-muted-foreground text-sm">No bookings found.</td></tr>
                  ) : bookings.map(b => (
                    <tr key={b._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="text-sm font-medium">{b.userId?.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{b.userId?.email}</div>
                      </td>
                      <td className="px-4 py-3.5 text-sm">{b.vehicleId?.name || "—"}</td>
                      <td className="px-4 py-3.5">
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{b.pickupLocation}</div>
                        <div className="text-xs text-muted-foreground whitespace-nowrap">→ {b.dropLocation}</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(b.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap">₹{b.totalPrice?.toLocaleString()}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-xs font-medium capitalize ${PAYMENT_COLORS[b.paymentStatus] || ""}`}>{b.paymentStatus || "—"}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <select value={b.status} onChange={e => handleStatus(b._id, e.target.value)} className="text-xs bg-white/5 border border-white/10 text-muted-foreground rounded-lg px-2 py-1.5 [color-scheme:dark] outline-none cursor-pointer">
                          {["pending", "confirmed", "ongoing", "completed", "cancelled"].map(s => <option key={s} value={s} className="bg-card capitalize">{s}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
