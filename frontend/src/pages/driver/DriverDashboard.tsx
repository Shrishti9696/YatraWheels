import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, TrendingUp, Calendar, ToggleLeft, ToggleRight, AlertCircle,
  LayoutDashboard, BookOpen, Car, ArrowUpRight, Activity,
  CheckCircle, Clock, XCircle, Zap, MapPin, Shield, CreditCard,
  ChevronRight, Navigation, Check, X
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer 
} from "recharts";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getProfile, toggleAvailability, updateLocation, getEarnings, updateTripStatus } from "@/services/driverService";
import { useBooking } from "@/context/BookingContext";
import { toast } from "sonner";
import { io } from "socket.io-client";

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

const TRIP_STEPS = [
  { id: "assigned", label: "Assigned", icon: Clock },
  { id: "en_route", label: "En Route", icon: Navigation },
  { id: "picked_up", label: "Picked Up", icon: Activity },
  { id: "completed", label: "Completed", icon: CheckCircle },
];

export default function DriverDashboard() {
  const [profile, setProfile] = useState<any>(null);
  const [earnings, setEarnings] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [incomingTrip, setIncomingTrip] = useState<any>(null);
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [toggling, setToggling] = useState(false);
  const { user } = useBooking();

  const fetchInitialData = async () => {
    try {
      const [prof, earn] = await Promise.all([getProfile(), getEarnings()]);
      setProfile(prof);
      setEarnings(earn);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();

    // Socket listeners for real-time assignments
    const socket = io();
    if (user?.id) {
      socket.emit("join", user.id);
      socket.on("trip:assigned", (data) => {
        setIncomingTrip(data);
        toast.info("New Trip Assigned!");
      });
    }

    // Location update interval
    const locInterval = setInterval(() => {
      if (activeTrip) {
        navigator.geolocation.getCurrentPosition((pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        });
      }
    }, 30000);

    return () => {
      socket.disconnect();
      clearInterval(locInterval);
    };
  }, [user?.id, !!activeTrip]);

  const handleStatusUpdate = async (status: string) => {
    if (!activeTrip) return;
    try {
      const updated = await updateTripStatus(activeTrip.bookingId, status);
      setActiveTrip(status === "completed" ? null : { ...activeTrip, status });
      toast.success(`Trip status updated to ${status.replace("_", " ")}`);
      if (status === "completed") fetchInitialData();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleToggle = async () => {
    setToggling(true);
    try {
      const res = await toggleAvailability();
      setProfile({ ...profile, isAvailable: res.isAvailable });
      toast.success(res.isAvailable ? "You are now Online" : "You are now Offline");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setToggling(false);
    }
  };

  const isApproved = profile?.status === "approved";
  const isAvailable = profile?.isAvailable;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelTopNav navItems={NAV} roleLabel="Driver" roleBadgeClass="text-purple-400 bg-purple-400/10 border-purple-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Availability Toggle Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl mb-8 bg-gradient-to-br from-purple-950/50 via-card to-card border border-purple-500/15 p-8"
        >
           <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome, {user?.name} 🚕</h1>
              <p className="text-muted-foreground text-sm max-w-md">
                {isApproved ? "Ready to hit the road? Toggle your availability to receive trips." : "Upload your license to start earning."}
              </p>
            </div>
            <div className="shrink-0">
               <button
                onClick={handleToggle}
                disabled={toggling || !isApproved}
                className={cn(
                  "relative flex flex-col items-center gap-2 px-8 py-4 rounded-2xl border-2 transition-all duration-300",
                  isAvailable ? "bg-emerald-500/10 border-emerald-500/40" : "bg-white/5 border-white/15"
                )}
               >
                 <div className={cn("w-14 h-7 rounded-full relative transition-colors", isAvailable ? "bg-emerald-500" : "bg-muted")}>
                   <motion.div 
                     animate={{ x: isAvailable ? 28 : 2 }}
                     className="absolute top-1 w-5 h-5 bg-white rounded-full shadow-lg"
                   />
                 </div>
                 <span className={cn("text-xs font-bold", isAvailable ? "text-emerald-400" : "text-muted-foreground")}>
                   {isAvailable ? "ONLINE" : "OFFLINE"}
                 </span>
               </button>
            </div>
           </div>
        </motion.div>

        {/* Incoming Trip Request Modal */}
        <AnimatePresence>
          {incomingTrip && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <div className="bg-card border border-primary/30 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-primary/20">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">New Trip Request!</h2>
                    <p className="text-sm text-muted-foreground">Nearby pickup available</p>
                  </div>
                </div>
                
                <div className="space-y-4 mb-8">
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <div className="w-0.5 h-10 bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <div className="flex-1 space-y-4">
                       <div>
                         <div className="text-[10px] text-muted-foreground uppercase font-bold">Pickup</div>
                         <div className="text-sm font-medium">{incomingTrip.pickup}</div>
                       </div>
                       <div>
                         <div className="text-[10px] text-muted-foreground uppercase font-bold">Dropoff</div>
                         <div className="text-sm font-medium">{incomingTrip.drop}</div>
                       </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                     <span className="text-muted-foreground text-sm">Estimated Fare</span>
                     <span className="text-2xl font-bold text-emerald-400">₹{incomingTrip.fare}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    className="flex-1 gradient-blue-purple h-12 rounded-xl text-white font-bold"
                    onClick={() => {
                      setActiveTrip(incomingTrip);
                      setIncomingTrip(null);
                      toast.success("Trip accepted!");
                    }}
                  >
                    Accept Trip
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1 h-12 rounded-xl border-white/10 hover:bg-white/5"
                    onClick={() => setIncomingTrip(null)}
                  >
                    Decline
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-muted/40 rounded-2xl w-fit mb-8 border border-white/5">
          {["overview", "earnings"].map((t) => (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={cn(
                "px-6 py-2 rounded-xl text-sm font-medium transition-all capitalize",
                activeTab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {t}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Active Trip Tracking */}
                <div className="lg:col-span-2 space-y-6">
                  {activeTrip ? (
                    <div className="bg-card border border-primary/20 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="font-bold flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" /> Active Trip
                        </h2>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider">
                          En Route
                        </span>
                      </div>

                      {/* Stepper */}
                      <div className="relative flex justify-between mb-12 px-4">
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2" />
                        {TRIP_STEPS.map((step, i) => {
                          const isActive = activeTrip.status === step.id;
                          const isDone = TRIP_STEPS.findIndex(s => s.id === activeTrip.status) > i;
                          return (
                            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                              <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500",
                                isActive ? "bg-primary text-white scale-110 shadow-lg shadow-primary/20" : 
                                isDone ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                              )}>
                                {isDone ? <Check className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                              </div>
                              <span className={cn("text-[10px] font-bold uppercase", isActive ? "text-primary" : "text-muted-foreground")}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex gap-3">
                        {activeTrip.status === "assigned" && (
                          <Button onClick={() => handleStatusUpdate("en_route")} className="flex-1 gradient-blue-purple rounded-xl h-12 font-bold">Start Heading to Pickup</Button>
                        )}
                        {activeTrip.status === "en_route" && (
                          <Button onClick={() => handleStatusUpdate("picked_up")} className="flex-1 gradient-blue-purple rounded-xl h-12 font-bold">I have Picked Up User</Button>
                        )}
                        {activeTrip.status === "picked_up" && (
                          <Button onClick={() => handleStatusUpdate("completed")} className="flex-1 bg-emerald-500 hover:bg-emerald-600 rounded-xl h-12 font-bold text-white">Complete Trip</Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-card border border-dashed border-white/10 rounded-2xl p-12 text-center">
                       <Navigation className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                       <h3 className="text-lg font-medium">No Active Trips</h3>
                       <p className="text-sm text-muted-foreground mt-1">Stay online to receive requests.</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <StatCard icon={Car} label="Total Trips" value={profile?.totalTrips || 0} color="text-primary" />
                    <StatCard icon={Star} label="Rating" value={profile?.rating || "4.5"} color="text-amber-400" />
                  </div>
                </div>

                {/* Profile Card */}
                <div className="bg-card border border-card-border rounded-2xl p-6">
                   <div className="flex flex-col items-center text-center mb-8">
                     <div className="w-20 h-20 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-3xl font-bold mb-4">
                       {user?.name?.charAt(0)}
                     </div>
                     <h3 className="font-bold text-lg">{user?.name}</h3>
                     <p className="text-xs text-muted-foreground">{user?.email}</p>
                     
                     <div className={cn(
                       "mt-4 px-3 py-1 rounded-full text-[10px] font-bold uppercase border",
                       isApproved ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                     )}>
                       {isApproved ? "Verified Driver" : "Verification Pending"}
                     </div>
                   </div>

                   <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 rounded-xl bg-muted/30">
                        <span className="text-xs text-muted-foreground">License No</span>
                        <span className="text-xs font-mono">{profile?.licenseNumber || "---"}</span>
                      </div>
                      {!isApproved && (
                        <Link href="/driver/onboarding">
                          <Button variant="outline" className="w-full rounded-xl border-primary/20 text-primary hover:bg-primary/5">Upload Documents</Button>
                        </Link>
                      )}
                   </div>
                </div>

              </div>
            )}

            {activeTab === "earnings" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <StatCard icon={TrendingUp} label="Total Earnings" value={`₹${earnings?.totalEarnings?.toLocaleString()}`} sub="Lifetime" color="text-emerald-400" />
                  <StatCard icon={Calendar} label="This Week" value={`₹${earnings?.thisWeekEarnings?.toLocaleString()}`} sub="Current cycle" color="text-primary" />
                  <StatCard icon={CreditCard} label="Pending Payout" value={`₹${earnings?.pendingPayout?.toLocaleString()}`} sub="Next transfer" color="text-amber-400" />
                </div>

                <div className="bg-card border border-card-border rounded-2xl p-6">
                  <h3 className="text-sm font-semibold mb-6">Earnings History (7 Days)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={earnings?.weeklyData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} />
                        <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }} />
                        <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                   <div className="px-6 py-4 border-b border-white/8">
                     <h3 className="text-sm font-semibold">Recent Trips</h3>
                   </div>
                   <div className="divide-y divide-white/5">
                      {earnings?.recentTrips?.map((t: any, i: number) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className="text-xs font-medium">{new Date(t.date).toLocaleDateString()}</div>
                              <div className="text-[10px] text-muted-foreground truncate max-w-[150px]">{t.from} → {t.to}</div>
                           </div>
                           <div className="text-sm font-bold text-emerald-400">₹{t.fare}</div>
                        </div>
                      ))}
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-card border border-card-border rounded-2xl p-6">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mb-4", color.replace("text-", "bg-").replace("400", "500/10"))}>
        <Icon className={cn("w-5 h-5", color)} />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60">{sub}</div>}
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
