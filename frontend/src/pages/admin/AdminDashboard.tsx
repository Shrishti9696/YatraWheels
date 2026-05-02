import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Car, Calendar, DollarSign, TrendingUp, AlertCircle, LayoutDashboard, BookOpen, Truck, UserCog, Shield } from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getStats } from "@/services/adminService";

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

const ROLE_COLORS: Record<string, string> = {
  user: "text-muted-foreground bg-muted/50 border-white/10",
  vendor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  driver: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  admin: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getStats()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  const statCards = [
    { icon: Users, label: "Total Users", val: s?.totalUsers ?? 0, sub: "Travelers", color: "text-primary" },
    { icon: TrendingUp, label: "Vendors", val: s?.totalVendors ?? 0, sub: "Fleet owners", color: "text-emerald-400" },
    { icon: Car, label: "Vehicles", val: s?.totalVehicles ?? 0, sub: "Listed", color: "text-blue-400" },
    { icon: Users, label: "Drivers", val: s?.totalDrivers ?? 0, sub: "Registered", color: "text-purple-400" },
    { icon: Calendar, label: "Bookings", val: s?.totalBookings ?? 0, sub: "All time", color: "text-accent" },
    { icon: DollarSign, label: "Revenue", val: `₹${(s?.totalRevenue ?? 0).toLocaleString()}`, sub: `₹${(s?.platformRevenue ?? 0).toLocaleString()} platform`, color: "text-emerald-400" },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar title="Admin Panel" subtitle="Control center" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-3">
              <Shield className="w-3 h-3" /> Admin Access
            </div>
            <h1 className="text-2xl font-bold mb-1">Platform Overview</h1>
            <p className="text-muted-foreground text-sm">Real-time stats across the entire YatraWheels platform</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-6 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {statCards.map(({ icon: Icon, label, val, sub, color }) => (
              <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-5 border border-white/8">
                {loading ? (
                  <div className="space-y-2"><Skeleton className="h-4 w-1/2" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center"><Icon className={`w-4 h-4 ${color}`} /></div>
                    </div>
                    <div className="text-2xl font-bold mb-0.5">{val}</div>
                    <div className="text-xs font-medium text-foreground">{label}</div>
                    <div className="text-xs text-muted-foreground">{sub}</div>
                  </>
                )}
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Bookings */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <h2 className="font-semibold">Recent Bookings</h2>
                <Link href="/admin/bookings"><span className="text-xs text-primary hover:underline cursor-pointer">View all</span></Link>
              </div>
              <div className="divide-y divide-white/5">
                {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="px-6 py-4"><Skeleton className="h-10 w-full" /></div>) :
                  data?.recentBookings?.length ? data.recentBookings.map((b: any) => (
                    <div key={b._id} className="px-6 py-4 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{b.userId?.name || "User"}</div>
                        <div className="text-xs text-muted-foreground truncate">{b.pickupLocation} → {b.dropLocation}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                        <div className="text-xs text-muted-foreground mt-1">₹{b.totalPrice?.toLocaleString()}</div>
                      </div>
                    </div>
                  )) : <div className="px-6 py-8 text-center text-muted-foreground text-sm">No bookings yet.</div>
                }
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
                <h2 className="font-semibold">Recent Users</h2>
                <Link href="/admin/users"><span className="text-xs text-primary hover:underline cursor-pointer">View all</span></Link>
              </div>
              <div className="divide-y divide-white/5">
                {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="px-6 py-4"><Skeleton className="h-10 w-full" /></div>) :
                  data?.recentUsers?.length ? data.recentUsers.map((u: any) => (
                    <div key={u._id} className="px-6 py-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full gradient-blue-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{u.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.email}</div>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${ROLE_COLORS[u.role] || ""}`}>{u.role}</span>
                    </div>
                  )) : <div className="px-6 py-8 text-center text-muted-foreground text-sm">No users yet.</div>
                }
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
