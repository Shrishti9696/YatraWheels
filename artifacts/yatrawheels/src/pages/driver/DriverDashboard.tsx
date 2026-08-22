import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Star, TrendingUp, Calendar, ToggleLeft, ToggleRight, AlertCircle,
  LayoutDashboard, BookOpen, Car, ArrowUpRight, Activity,
  CheckCircle, Clock, XCircle, Zap, MapPin, Shield
} from "lucide-react";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getDashboard, toggleAvailability } from "@/services/driverService";
import { useBooking } from "@/context/BookingContext";

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

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Clock, confirmed: CheckCircle, ongoing: Activity, completed: CheckCircle, cancelled: XCircle,
};

function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }: any) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="relative overflow-hidden rounded-2xl border border-white/8 bg-card p-6 group hover:border-white/15 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color.replace("text-", "bg-").replace("400", "500/12").replace("primary", "primary/12")}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
      </div>
      <div className="text-3xl font-bold tracking-tight mb-1">{value}</div>
      <div className="text-sm font-medium text-foreground/80 mb-0.5">{label}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </motion.div>
  );
}

export default function DriverDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState("");
  const { user } = useBooking();

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle() {
    setToggling(true);
    try {
      const res = await toggleAvailability();
      setData((d: any) => d ? {
        ...d,
        driver: { ...d.driver, isAvailable: res.isAvailable },
        stats: { ...d.stats, isAvailable: res.isAvailable }
      } : d);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setToggling(false);
    }
  }

  const s = data?.stats;
  const isAvailable = s?.isAvailable;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";
  const isPending = data?.driver?.status === "pending";
  const isApproved = data?.driver?.status === "approved";

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={NAV} roleLabel="Driver" roleBadgeClass="text-purple-400 bg-purple-400/10 border-purple-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-purple-950/50 via-card to-card border border-purple-500/15 p-8"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-48 h-48 bg-primary/4 rounded-full blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-purple-400 font-medium mb-1">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.name || "Driver"} 👋</h1>
              <p className="text-muted-foreground text-sm max-w-md">
                {isApproved
                  ? "Your profile is verified. Toggle your availability to start receiving trip assignments."
                  : "Complete your profile setup to start accepting trips on YatraWheels."}
              </p>
            </div>

            {/* Big availability toggle */}
            <div className="shrink-0">
              <button
                onClick={handleToggle}
                disabled={toggling || isPending}
                className={`relative flex flex-col items-center gap-2 px-8 py-5 rounded-2xl border-2 transition-all duration-300 disabled:opacity-60
                  ${isAvailable
                    ? "bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/15"
                    : "bg-white/5 border-white/15 hover:bg-white/8"
                  }`}
              >
                <div className={`w-14 h-8 rounded-full relative transition-colors duration-300 ${isAvailable ? "bg-emerald-500" : "bg-muted"}`}>
                  <motion.div
                    animate={{ x: isAvailable ? 24 : 2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                  />
                </div>
                <span className={`text-sm font-bold ${isAvailable ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {toggling ? "Updating..." : isAvailable ? "Online" : "Offline"}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Pending review banner */}
        {isPending && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl px-5 py-4 mb-6"
          >
            <div className="w-9 h-9 rounded-xl bg-yellow-500/15 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-yellow-400">Profile Under Review</div>
              <div className="text-xs text-muted-foreground">Your driver application is being reviewed by the admin team. You'll be notified once approved.</div>
            </div>
          </motion.div>
        )}

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
              <StatCard icon={Car} label="Total Trips" value={s?.totalTrips ?? 0} sub="All assigned trips" color="text-primary" delay={0} />
              <StatCard icon={Calendar} label="Upcoming" value={s?.upcomingTrips ?? 0} sub="Confirmed & ongoing" color="text-purple-400" delay={0.05} />
              <StatCard icon={TrendingUp} label="Total Earned" value={`₹${(s?.totalEarnings ?? 0).toLocaleString()}`} sub="From completed trips" color="text-emerald-400" delay={0.1} />
              <StatCard icon={Star} label="Rating" value={s?.rating?.toFixed(1) ?? "—"} sub={`${s?.reviewCount ?? 0} reviews`} color="text-amber-400" delay={0.15} />
            </>
          )}
        </div>

        {/* Performance summary + Recent trips */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Performance card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-card-border rounded-2xl p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-9 h-9 rounded-xl bg-purple-500/12 flex items-center justify-center">
                <Zap className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Performance</h2>
                <p className="text-xs text-muted-foreground">Your trip stats</p>
              </div>
            </div>

            <div className="space-y-5">
              {[
                { label: "Completion Rate", value: s?.totalTrips ? Math.round((s.completedTrips / s.totalTrips) * 100) : 0, color: "bg-emerald-400" },
                { label: "Acceptance Rate", value: 92, color: "bg-primary" },
                { label: "On-time Rate", value: 87, color: "bg-purple-400" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{loading ? "—" : `${value}%`}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    {!loading && <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${value}%` }} />}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-white/8">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold">{loading ? "—" : s?.completedTrips ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Completed</div>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <div className="text-xl font-bold">{loading ? "—" : s?.upcomingTrips ?? 0}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Upcoming</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent trips */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="lg:col-span-2 bg-card border border-card-border rounded-2xl overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Recent Trips</h2>
                  <p className="text-xs text-muted-foreground">Your latest assigned trips</p>
                </div>
              </div>
              <Link href="/driver/bookings">
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
                        <div className="text-sm font-medium truncate">{b.vehicleId?.name || "Vehicle"}</div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{b.pickupLocation} → {b.dropLocation}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${STATUS_COLORS[b.status] || ""}`}>{b.status}</span>
                        <div className="text-xs font-semibold mt-1">₹{b.driverAmount?.toLocaleString() || "—"}</div>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="px-6 py-16 text-center">
                  <Car className="w-10 h-10 mx-auto mb-3 text-muted-foreground/25" />
                  <p className="text-sm text-muted-foreground">No trips assigned yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Stay online to receive trip assignments</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
