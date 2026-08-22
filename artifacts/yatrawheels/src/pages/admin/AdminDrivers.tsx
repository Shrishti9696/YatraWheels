import { useEffect, useState } from "react";
import { AlertCircle, LayoutDashboard, BookOpen, Truck, UserCog, Shield, CheckCircle, XCircle } from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getDrivers, approveDriver } from "@/services/adminService";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/drivers", label: "Drivers", icon: Shield },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  approved: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  rejected: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    getDrivers()
      .then(setDrivers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleStatus(id: string, status: string) {
    try {
      const updated = await approveDriver(id, status);
      setDrivers(ds => ds.map(d => d._id === id ? { ...d, status: updated.status } : d));
    } catch (e: any) {
      setError(e.message);
    }
  }

  const filtered = filter === "all" ? drivers : drivers.filter(d => d.status === filter);

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar title="Admin Panel" subtitle="Control center" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Drivers</h1>
            <p className="text-muted-foreground text-sm">{drivers.length} registered driver{drivers.length !== 1 ? "s" : ""}</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="flex gap-2 flex-wrap mb-6">
            {["all", "pending", "approved", "rejected"].map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors border ${filter === s ? "bg-primary/15 text-primary border-primary/25" : "bg-white/5 text-muted-foreground hover:text-foreground border-white/8"}`}>{s}</button>
            ))}
          </div>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["Driver", "License", "Availability", "Trips", "Rating", "Status", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-14 text-muted-foreground text-sm">No drivers found.</td></tr>
                  ) : filtered.map(d => (
                    <tr key={d._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium">{d.userId?.name || "—"}</div>
                        <div className="text-xs text-muted-foreground">{d.userId?.email}</div>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground font-mono">{d.licenseNumber}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs font-medium ${d.isAvailable ? "text-emerald-400" : "text-muted-foreground"}`}>{d.isAvailable ? "Online" : "Offline"}</span>
                      </td>
                      <td className="px-5 py-4 text-sm">{d.totalTrips || 0}</td>
                      <td className="px-5 py-4 text-sm">{d.rating?.toFixed(1) || "—"}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[d.status] || ""}`}>{d.status}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          {d.status !== "approved" && (
                            <Button size="sm" onClick={() => handleStatus(d._id, "approved")} className="h-7 px-2.5 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20 rounded-lg text-xs gap-1">
                              <CheckCircle className="w-3 h-3" /> Approve
                            </Button>
                          )}
                          {d.status !== "rejected" && (
                            <Button size="sm" onClick={() => handleStatus(d._id, "rejected")} className="h-7 px-2.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-xs gap-1" variant="ghost">
                              <XCircle className="w-3 h-3" /> Reject
                            </Button>
                          )}
                        </div>
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
