import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Car, Calendar, DollarSign, TrendingUp, Plus, AlertCircle,
  ArrowUpRight, Truck, BookOpen, LayoutDashboard, CheckCircle,
  Clock, XCircle, Activity, Package
} from "lucide-react";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getDashboard } from "@/services/vendorService";
import { useBooking } from "@/context/BookingContext";

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

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock,
  confirmed: CheckCircle,
  ongoing: Activity,
  completed: CheckCircle,
  cancelled: XCircle,
};

function StatCard({ icon: Icon, label, value, sub, color, gradient, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/8 bg-card p-6 group hover:border-white/15 transition-all"
    >
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`} />
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color.replace("text-", "bg-").replace("400", "500/12").replace("primary", "primary/12")}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <ArrowUpRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
        </div>
        <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
        <div className="text-sm font-medium text-foreground/80 mb-0.5">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </motion.div>
  );
}

export default function VendorDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useBooking();

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={NAV} roleLabel="Vendor" roleBadgeClass="text-emerald-400 bg-emerald-400/10 border-emerald-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-emerald-950/60 via-card to-card border border-emerald-500/15 p-8"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-emerald-400 font-medium mb-1">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.name || "Vendor"} 👋</h1>
              <p className="text-muted-foreground text-sm max-w-md">
                Here's an overview of your fleet performance. Manage your vehicles, track bookings, and grow your earnings.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/vendor/vehicles">
                <Button className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2 h-10">
                  <Plus className="w-4 h-4" /> Add Vehicle
                </Button>
              </Link>
              <Link href="/vendor/bookings">
                <Button variant="outline" className="border-white/12 hover:bg-white/5 rounded-xl gap-2 h-10">
                  <BookOpen className="w-4 h-4" /> Bookings
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 mb-6 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" /> {error}
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
          ) : (
            <>
              <StatCard icon={Car} label="Total Vehicles" value={s?.totalVehicles ?? 0} sub={`${s?.availableVehicles ?? 0} currently available`} color="text-primary" gradient="bg-gradient-to-br from-primary/5 to-transparent" delay={0} />
              <StatCard icon={Calendar} label="Total Bookings" value={s?.totalBookings ?? 0} sub={`${s?.pendingBookings ?? 0} awaiting confirmation`} color="text-purple-400" gradient="bg-gradient-to-br from-purple-500/5 to-transparent" delay={0.05} />
              <StatCard icon={CheckCircle} label="Confirmed" value={s?.confirmedBookings ?? 0} sub="Successfully confirmed" color="text-emerald-400" gradient="bg-gradient-to-br from-emerald-500/5 to-transparent" delay={0.1} />
              <StatCard icon={DollarSign} label="Total Earnings" value={`₹${(s?.totalEarnings ?? 0).toLocaleString()}`} sub="From completed trips" color="text-amber-400" gradient="bg-gradient-to-br from-amber-500/5 to-transparent" delay={0.15} />
            </>
          )}
        </div>

        {/* Fleet health + Recent bookings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Fleet health card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-card-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/12 flex items-center justify-center">
                <Package className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Fleet Health</h2>
                <p className="text-xs text-muted-foreground">Vehicle availability</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { label: "Available", value: s?.availableVehicles ?? 0, total: s?.totalVehicles ?? 1, color: "bg-emerald-400" },
                { label: "Booked", value: (s?.totalVehicles ?? 0) - (s?.availableVehicles ?? 0), total: s?.totalVehicles ?? 1, color: "bg-primary" },
              ].map(({ label, value, total, color }) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{loading ? "—" : `${value} (${pct}%)`}</span>
                    </div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      {!loading && <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-5 border-t border-white/8">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold">{loading ? "—" : s?.pendingBookings ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Pending</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold">{loading ? "—" : s?.confirmedBookings ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Confirmed</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent bookings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-card border border-card-border rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Recent Bookings</h2>
                  <p className="text-xs text-muted-foreground">Latest activity on your fleet</p>
                </div>
              </div>
              <Link href="/vendor/bookings">
                <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></span>
              </Link>
            </div>

            <div className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-6 py-4 flex items-center gap-4">
                    <Skeleton className="w-10 h-10 rounded-2xl shrink-0" />
                    <div className="flex-1 space-y-2"><Skeleton className="h-4 w-2/5" /><Skeleton className="h-3 w-1/3" /></div>
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </div>
                ))
              ) : data?.recentBookings?.length ? (
                data.recentBookings.map((b: any, i: number) => {
                  const StatusIcon = STATUS_ICONS[b.status] || Calendar;
                  return (
                    <motion.div
                      key={b._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                        <StatusIcon className={`w-4 h-4 ${STATUS_COLORS[b.status]?.split(" ")[0]}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{b.userId?.name || "Traveler"}</div>
                        <div className="text-xs text-muted-foreground truncate">{b.pickupLocation} → {b.dropLocation}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                        <div className="text-xs font-semibold mt-1">₹{b.totalPrice?.toLocaleString()}</div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="px-6 py-16 text-center">
                  <Car className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
                  <p className="text-sm text-muted-foreground">No bookings yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Add vehicles to start receiving bookings</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
