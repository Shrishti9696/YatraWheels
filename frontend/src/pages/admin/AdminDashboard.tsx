import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, Car, Calendar, DollarSign, TrendingUp, AlertCircle, 
  LayoutDashboard, BookOpen, Truck, UserCog, Shield, Activity,
  ArrowUpRight, Package, PieChart as PieChartIcon, BarChart3
} from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell, PieChart, Pie
} from "recharts";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { getAnalytics } from "@/services/adminService";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/drivers", label: "Drivers", icon: Shield },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics()
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.stats;

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PanelSidebar title="Admin Panel" subtitle="System Control" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium mb-3">
                <Shield className="w-3 h-3" /> Root Admin Access
              </div>
              <h1 className="text-3xl font-bold mb-1">Platform Intelligence</h1>
              <p className="text-muted-foreground text-sm">Aggregated performance metrics across YatraWheels</p>
            </div>
            <div className="flex gap-3">
              <div className="bg-card border border-white/5 rounded-2xl p-4 flex items-center gap-4">
                 <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold">
                   {s?.activeBookings || 0}
                 </div>
                 <div className="text-xs">
                   <div className="font-bold">Active Trips</div>
                   <div className="text-muted-foreground">Currently on road</div>
                 </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4 mb-8 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          {/* Core Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { icon: Users, label: "Total Users", val: s?.totalUsers ?? 0, color: "text-primary", gradient: "from-primary/5" },
              { icon: Calendar, label: "Total Bookings", val: s?.totalBookings ?? 0, color: "text-purple-400", gradient: "from-purple-500/5" },
              { icon: DollarSign, label: "Total Revenue", val: `₹${(s?.totalRevenue ?? 0).toLocaleString()}`, color: "text-emerald-400", gradient: "from-emerald-500/5" },
              { icon: Activity, label: "Completed", val: s?.completedBookings ?? 0, color: "text-amber-400", gradient: "from-amber-500/5" },
            ].map((card, i) => (
              <motion.div 
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`bg-card border border-white/8 rounded-2xl p-6 relative overflow-hidden group`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <card.icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground/30" />
                  </div>
                  <div className="text-2xl font-bold mb-1">{loading ? "---" : card.val}</div>
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> Revenue Growth</h3>
                <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Last 6 Months</span>
              </div>
              <div className="h-72 w-full">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data?.revenueByMonth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#888" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40}>
                         {data?.revenueByMonth?.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <h3 className="font-bold flex items-center gap-2 mb-8"><PieChartIcon className="w-4 h-4 text-purple-400" /> Booking Status</h3>
              <div className="h-56 w-full mb-4">
                {loading ? (
                  <Skeleton className="w-full h-full rounded-full" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data?.bookingsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                        nameKey="status"
                      >
                        {data?.bookingsByStatus?.map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#111", border: "1px solid #333", borderRadius: "12px" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-2">
                 {data?.bookingsByStatus?.map((s: any, i: number) => (
                   <div key={s.status} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="capitalize">{s.status}</span>
                      </div>
                      <span className="font-bold">{s.count}</span>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             {/* Top Vehicles */}
             <div className="bg-card border border-card-border rounded-2xl p-6">
                <h3 className="font-bold flex items-center gap-2 mb-6"><TrendingUp className="w-4 h-4 text-emerald-400" /> Top Performing Fleet</h3>
                <div className="space-y-4">
                   {data?.topVehicles?.map((v: any, i: number) => (
                     <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/2 transition-colors">
                        <div className="flex items-center gap-4">
                           <div className="text-xl font-black text-white/5 italic w-6">{i + 1}</div>
                           <div>
                             <div className="text-sm font-bold">{v.vehicleName}</div>
                             <div className="text-[10px] text-muted-foreground">{v.bookings} Bookings</div>
                           </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-emerald-400">₹{v.revenue?.toLocaleString()}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>

             {/* Activity Feed */}
             <div className="bg-card border border-card-border rounded-2xl p-6">
                <h3 className="font-bold flex items-center gap-2 mb-6"><Activity className="w-4 h-4 text-primary" /> Live Activity</h3>
                <div className="space-y-6">
                   {data?.recentActivity?.map((a: any, i: number) => (
                     <div key={i} className="flex gap-4 relative">
                        {i < data.recentActivity.length - 1 && (
                          <div className="absolute top-8 left-4 w-px h-6 bg-white/5" />
                        )}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                          a.type === "booking" ? "bg-primary/10 text-primary" : 
                          a.type === "user" ? "bg-emerald-500/10 text-emerald-400" : "bg-purple-500/10 text-purple-400"
                        }`}>
                          {a.type === "booking" ? <Calendar className="w-4 h-4" /> : 
                           a.type === "user" ? <Users className="w-4 h-4" /> : <Package className="w-4 h-4" />}
                        </div>
                        <div className="flex-1">
                          <div className="text-xs font-medium text-foreground">{a.message}</div>
                          <div className="text-[10px] text-muted-foreground">{a.time}</div>
                        </div>
                     </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
