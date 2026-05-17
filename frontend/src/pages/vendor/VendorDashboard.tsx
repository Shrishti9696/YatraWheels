import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car, Calendar, DollarSign, TrendingUp, Plus, AlertCircle,
  ArrowUpRight, Truck, BookOpen, LayoutDashboard, CheckCircle,
  Clock, XCircle, Activity, Package, CreditCard,
  Check, X
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from "recharts";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getDashboard, getEarnings, updateBookingStatusAction } from "@/services/vendorService";
import { useBooking } from "@/context/BookingContext";
import { toast } from "sonner";

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
  const [earnings, setEarnings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [error, setError] = useState("");
  const { user } = useBooking();

  const fetchAllData = async () => {
    try {
      const [dashData, earnData] = await Promise.all([getDashboard(), getEarnings()]);
      setData(dashData);
      setEarnings(earnData);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleBookingAction = async (id: string, action: "accept" | "reject") => {
    try {
      await updateBookingStatusAction(id, action);
      toast.success(`Booking ${action === "accept" ? "confirmed" : "rejected"} successfully`);
      fetchAllData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const s = data?.stats;
  const greeting = new Date().getHours() < 12 ? "Good morning" : new Date().getHours() < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelTopNav navItems={NAV} roleLabel="Vendor" roleBadgeClass="text-emerald-400 bg-emerald-400/10 border-emerald-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Hero welcome section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-emerald-950/60 via-card to-card border border-emerald-500/15 p-8"
        >
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-emerald-400 font-medium mb-1">{greeting},</p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">{user?.name || "Vendor"} 👋</h1>
              <p className="text-muted-foreground text-sm max-w-md">
                Manage your fleet, track earnings, and respond to booking requests in real-time.
              </p>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link href="/vendor/vehicles">
                <Button className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2 h-10">
                  <Plus className="w-4 h-4" /> Add Vehicle
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

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-2xl w-fit mb-8 border border-white/5">
          {[
            { id: "overview", label: "Overview", icon: LayoutDashboard },
            { id: "earnings", label: "Earnings", icon: DollarSign },
            { id: "requests", label: "Booking Requests", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                activeTab === tab.id 
                  ? "bg-card text-foreground shadow-sm border border-white/10" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "requests" && data?.stats?.pendingBookings > 0 && (
                <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)
                  ) : (
                    <>
                      <StatCard icon={Car} label="Total Vehicles" value={s?.totalVehicles ?? 0} sub={`${s?.availableVehicles ?? 0} available`} color="text-primary" gradient="bg-gradient-to-br from-primary/5 to-transparent" />
                      <StatCard icon={Calendar} label="Total Bookings" value={s?.totalBookings ?? 0} sub={`${s?.pendingBookings ?? 0} pending`} color="text-purple-400" gradient="bg-gradient-to-br from-purple-500/5 to-transparent" delay={0.05} />
                      <StatCard icon={CheckCircle} label="Confirmed" value={s?.confirmedBookings ?? 0} sub="Ready for trip" color="text-emerald-400" gradient="bg-gradient-to-br from-emerald-500/5 to-transparent" delay={0.1} />
                      <StatCard icon={DollarSign} label="Total Earnings" value={`₹${(s?.totalEarnings ?? 0).toLocaleString()}`} sub="Lifetime" color="text-amber-400" gradient="bg-gradient-to-br from-amber-500/5 to-transparent" delay={0.15} />
                    </>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <FleetHealth loading={loading} s={s} />
                  <RecentActivity loading={loading} bookings={data?.recentBookings || []} />
                </div>
              </>
            )}

            {activeTab === "earnings" && (
              <EarningsView earnings={earnings} loading={loading} />
            )}

            {activeTab === "requests" && (
              <BookingRequests 
                bookings={data?.recentBookings?.filter((b: any) => b.status === "pending") || []} 
                loading={loading}
                onAction={handleBookingAction}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function FleetHealth({ loading, s }: any) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 rounded-xl bg-emerald-500/12 flex items-center justify-center">
          <Package className="w-4 h-4 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Fleet Health</h2>
          <p className="text-xs text-muted-foreground">Live availability</p>
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
    </div>
  );
}

function RecentActivity({ loading, bookings }: any) {
  return (
    <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl overflow-hidden">
      <div className="px-6 py-4 border-b border-white/8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Recent Activity</h2>
            <p className="text-xs text-muted-foreground">Latest status updates</p>
          </div>
        </div>
        <Link href="/vendor/bookings">
          <span className="text-xs text-primary hover:underline cursor-pointer flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></span>
        </Link>
      </div>
      <div className="divide-y divide-white/5">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 mx-6 my-4 rounded-xl" />)
        ) : bookings.length > 0 ? (
          bookings.slice(0, 5).map((b: any) => {
             const Icon = STATUS_ICONS[b.status] || Calendar;
             return (
              <div key={b._id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition-colors">
                 <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center shrink-0">
                   <Icon className={cn("w-4 h-4", STATUS_COLORS[b.status]?.split(" ")[0])} />
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{b.userId?.name || "Traveler"}</div>
                    <div className="text-xs text-muted-foreground truncate">{b.vehicleId?.name}</div>
                 </div>
                 <div className="text-right shrink-0">
                    <span className={cn("inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize", STATUS_COLORS[b.status])}>{b.status}</span>
                    <div className="text-xs font-bold mt-1">₹{b.totalPrice?.toLocaleString()}</div>
                 </div>
              </div>
             );
          })
        ) : (
          <div className="px-6 py-12 text-center text-muted-foreground text-xs">No recent activity.</div>
        )}
      </div>
    </div>
  );
}

function EarningsView({ earnings, loading }: any) {
  if (loading) return <Skeleton className="h-96 rounded-2xl" />;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard icon={TrendingUp} label="Total Earnings" value={`₹${earnings?.totalEarnings?.toLocaleString()}`} sub="Revenue to date" color="text-emerald-400" gradient="bg-gradient-to-br from-emerald-500/5 to-transparent" />
        <StatCard icon={Calendar} label="This Month" value={`₹${earnings?.thisMonthEarnings?.toLocaleString()}`} sub="Current month" color="text-primary" gradient="bg-gradient-to-br from-primary/5 to-transparent" />
        <StatCard icon={CreditCard} label="Pending Payout" value={`₹${earnings?.pendingPayouts?.toLocaleString()}`} sub="Upcoming transfers" color="text-amber-400" gradient="bg-gradient-to-br from-amber-500/5 to-transparent" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6">
          <h3 className="text-sm font-semibold mb-6">Revenue Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={earnings?.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888" }} />
                <Tooltip 
                  cursor={{ fill: '#ffffff05' }}
                  contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40}>
                   {earnings?.monthlyData?.map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={index === 5 ? "#3b82f6" : "#3b82f640"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card border border-card-border rounded-2xl p-6 overflow-hidden">
          <h3 className="text-sm font-semibold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {earnings?.recentTransactions?.length > 0 ? (
              earnings.recentTransactions.map((t: any, i: number) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-medium">{t.user}</div>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{t.vehicle}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-emerald-400">+₹{t.amount}</div>
                    <div className="text-[9px] text-muted-foreground">{new Date(t.date).toLocaleDateString()}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-xs">No transactions found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BookingRequests({ bookings, loading, onAction }: any) {
  if (loading) return <Skeleton className="h-64 rounded-2xl" />;
  if (bookings.length === 0) return (
    <div className="bg-card border border-card-border rounded-2xl p-12 text-center">
      <Clock className="w-10 h-10 text-muted-foreground/20 mx-auto mb-4" />
      <h3 className="text-sm font-medium">No Pending Requests</h3>
      <p className="text-xs text-muted-foreground mt-1">New requests will appear here as they come in.</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookings.map((b: any) => (
        <motion.div 
          key={b._id}
          layout
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card border border-card-border rounded-2xl p-5"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                 {b.userId?.name?.charAt(0)}
               </div>
               <div>
                 <div className="text-sm font-semibold">{b.userId?.name}</div>
                 <div className="text-xs text-muted-foreground">{b.vehicleId?.name}</div>
               </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-primary">₹{b.totalPrice?.toLocaleString()}</div>
              <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">{b.pickupLocation}</div>
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              className="flex-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl h-10 gap-2 text-xs"
              onClick={() => onAction(b._id, "accept")}
            >
              <Check className="w-4 h-4" /> Accept
            </Button>
            <Button 
              variant="outline"
              className="flex-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl h-10 gap-2 text-xs"
              onClick={() => onAction(b._id, "reject")}
            >
              <X className="w-4 h-4" /> Reject
            </Button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
