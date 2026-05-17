import { useEffect, useState } from "react";
import { 
  Car, AlertCircle, Check, LayoutDashboard, BookOpen, Truck, 
  UserCog, Shield, Filter, MapPin, Users, Zap, X, AlertTriangle, 
  ThumbsUp, ThumbsDown
} from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAnalytics, getPendingVehicles, approveVehicleAction } from "@/services/adminService";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/drivers", label: "Drivers", icon: Shield },
];

export default function AdminVehicles() {
  const [activeTab, setActiveTab] = useState("all");
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      // For simplicity in this demo, we'll fetch pending vehicles specifically
      const pendingData = await getPendingVehicles();
      setPending(pendingData);
      
      // Also fetch analytics to get basic overview if needed
      // (Normally we'd have a separate endpoint for all vehicles with filters)
      setVehicles([]); // Placeholder for all vehicles
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAction = async (id: string, action: "approve" | "reject") => {
    try {
      await approveVehicleAction(id, action, action === "reject" ? rejectReason : undefined);
      toast.success(`Vehicle ${action === "approve" ? "approved" : "rejected"} successfully`);
      setPending(prev => prev.filter(v => v._id !== id));
      setRejectingId(null);
      setRejectReason("");
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PanelSidebar title="Admin Panel" subtitle="Fleet Management" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-1">Vehicle Control</h1>
              <p className="text-muted-foreground text-sm">Review and manage vehicle listings across the platform</p>
            </div>
            
            <div className="flex gap-2 p-1 bg-muted/40 rounded-2xl border border-white/5">
              {[
                { id: "all", label: "Fleet Overview", count: 0 },
                { id: "pending", label: "Pending Approvals", count: pending.length }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2",
                    activeTab === t.id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t.label}
                  {t.count > 0 && <span className="bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">{t.count}</span>}
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "pending" ? (
              <motion.div 
                key="pending"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {loading ? (
                  Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-96 rounded-3xl" />)
                ) : pending.length === 0 ? (
                  <div className="col-span-full py-20 text-center bg-card border border-dashed border-white/10 rounded-3xl">
                     <ThumbsUp className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                     <h3 className="text-lg font-bold">All Caught Up!</h3>
                     <p className="text-sm text-muted-foreground">No vehicles currently awaiting approval.</p>
                  </div>
                ) : pending.map(v => (
                  <div key={v._id} className="bg-card border border-white/8 rounded-3xl overflow-hidden flex flex-col group hover:border-primary/30 transition-all shadow-xl shadow-black/20">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      <img src={v.imageUrl || "/placeholder.png"} className="w-full h-full object-cover transition-transform group-hover:scale-105" alt={v.name} />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10">
                          {v.type}
                        </span>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60" />
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="mb-4">
                        <h3 className="text-lg font-bold mb-1">{v.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {v.capacity}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.location}</span>
                        </div>
                      </div>

                      <div className="space-y-3 mb-6 p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                         <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground">Daily Rate</span>
                           <span className="font-bold text-white">₹{v.pricePerDay}</span>
                         </div>
                         <div className="flex justify-between text-xs">
                           <span className="text-muted-foreground">Vendor</span>
                           <span className="font-bold text-primary">{v.vendorId?.name || "Unknown"}</span>
                         </div>
                      </div>

                      <div className="mt-auto flex gap-3">
                        <Button 
                          onClick={() => handleAction(v._id, "approve")}
                          className="flex-1 gradient-blue-purple rounded-xl h-11 text-xs font-bold shadow-lg shadow-primary/20"
                        >
                          <ThumbsUp className="w-3.5 h-3.5 mr-2" /> Approve
                        </Button>
                        <Button 
                          onClick={() => setRejectingId(v._id)}
                          variant="outline"
                          className="flex-1 border-white/10 hover:bg-red-500/10 hover:text-red-400 rounded-xl h-11 text-xs font-bold"
                        >
                          <ThumbsDown className="w-3.5 h-3.5 mr-2" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="all"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-card border border-dashed border-white/10 rounded-3xl p-20 text-center"
              >
                 <Activity className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                 <h3 className="text-lg font-bold">Fleet Overview Under Development</h3>
                 <p className="text-sm text-muted-foreground">Detailed fleet search and filters coming soon in the next update.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Reject Reason Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-card border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl"
            >
               <div className="flex items-center gap-3 mb-6 text-red-400">
                 <AlertTriangle className="w-6 h-6" />
                 <h2 className="text-xl font-bold">Reject Listing</h2>
               </div>
               <p className="text-sm text-muted-foreground mb-6">
                 Please provide a reason for rejecting this vehicle. The vendor will be notified immediately via their dashboard.
               </p>
               <Input 
                 value={rejectReason}
                 onChange={e => setRejectReason(e.target.value)}
                 placeholder="e.g. Image is blurry, incorrect pricing..."
                 className="bg-white/5 border-white/10 rounded-xl h-12 mb-8"
               />
               <div className="flex gap-3">
                 <Button 
                   onClick={() => handleAction(rejectingId, "reject")}
                   disabled={!rejectReason}
                   className="flex-1 bg-red-500 hover:bg-red-600 rounded-xl h-12 font-bold"
                 >
                   Confirm Rejection
                 </Button>
                 <Button 
                   onClick={() => { setRejectingId(null); setRejectReason(""); }}
                   variant="ghost"
                   className="flex-1 h-12 rounded-xl"
                 >
                   Cancel
                 </Button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
