import { useEffect, useState } from "react";
import { 
  AlertCircle, LayoutDashboard, BookOpen, Truck, UserCog, Shield, 
  Search, Ban, CheckCircle2, MoreVertical, X, Calendar, 
  Mail, Phone, MapPin, Activity, Package, ExternalLink
} from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getUsersList, updateUserStatus, getUserDetails } from "@/services/adminService";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/drivers", label: "Drivers", icon: Shield },
];

const ROLE_COLORS: Record<string, string> = {
  user: "text-muted-foreground bg-muted/50 border-white/10",
  vendor: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
  driver: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  admin: "text-red-400 bg-red-400/10 border-red-400/20",
};

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsersList({ role: roleFilter, search, page });
      setUsers(data.users || []);
      setTotalPages(data.pages || 1);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, roleFilter, page]);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const action = currentStatus === "banned" ? "unban" : "ban";
    if (!confirm(`Are you sure you want to ${action} this user?`)) return;

    try {
      await updateUserStatus(id, action);
      setUsers(us => us.map(u => u._id === id ? { ...u, status: action === "ban" ? "banned" : "active" } : u));
      toast.success(`User ${action === "ban" ? "banned" : "unbanned"} successfully`);
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openUserDetails = async (id: string) => {
    setDetailsLoading(true);
    try {
      const data = await getUserDetails(id);
      setSelectedUser(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDetailsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <PanelSidebar title="Admin Panel" subtitle="User Base" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-1">Users</h1>
            <p className="text-muted-foreground text-sm">Manage account access and system roles</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                value={search} 
                onChange={e => { setSearch(e.target.value); setPage(1); }} 
                placeholder="Search by name or email..." 
                className="pl-11 bg-card border-white/5 rounded-2xl h-12" 
              />
            </div>
            <div className="flex gap-2 p-1 bg-muted/40 rounded-2xl border border-white/5 overflow-x-auto whitespace-nowrap">
              {["all", "user", "vendor", "driver", "admin"].map(r => (
                <button 
                  key={r} 
                  onClick={() => { setRoleFilter(r); setPage(1); }} 
                  className={cn(
                    "px-4 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                    roleFilter === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-3xl overflow-hidden shadow-xl shadow-black/20">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5 bg-white/[0.02]">
                    {["User Identity", "Account Info", "Role", "Status", "Joined", "Actions"].map(h => (
                      <th key={h} className="text-left text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-6 py-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-6 py-6"><Skeleton className="h-4 w-full rounded-full" /></td>)}</tr>
                    ))
                  ) : users.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-20 text-muted-foreground text-sm">No accounts found matching your search.</td></tr>
                  ) : users.map(u => (
                    <tr key={u._id} className="hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => openUserDetails(u._id)}>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold shadow-inner">
                            {u.name[0]}
                          </div>
                          <div>
                            <div className="text-sm font-bold group-hover:text-primary transition-colors">{u.name}</div>
                            <div className="text-[10px] text-muted-foreground font-mono">{u._id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6">
                        <div className="text-xs font-medium">{u.email}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{u.plan || "free"} plan</div>
                      </td>
                      <td className="px-6 py-6">
                        <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-widest", ROLE_COLORS[u.role])}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-2">
                           <div className={cn("w-2 h-2 rounded-full animate-pulse", u.status === "banned" ? "bg-red-500" : "bg-emerald-500")} />
                           <span className={cn("text-xs font-bold capitalize", u.status === "banned" ? "text-red-400" : "text-emerald-400")}>
                             {u.status || "active"}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-xs text-muted-foreground">
                        {new Date(u.createdAt).toLocaleDateString("en-IN", { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-6" onClick={e => e.stopPropagation()}>
                         <div className="flex items-center gap-2">
                           <Button 
                             variant="outline" 
                             size="sm" 
                             onClick={() => handleStatusChange(u._id, u.status)}
                             className={cn(
                               "h-8 w-8 p-0 rounded-lg border-white/5",
                               u.status === "banned" ? "text-emerald-400 hover:bg-emerald-500/10" : "text-red-400 hover:bg-red-500/10"
                             )}
                           >
                             {u.status === "banned" ? <CheckCircle2 className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                           </Button>
                           <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-white/5" onClick={() => openUserDetails(u._id)}>
                             <MoreVertical className="w-4 h-4" />
                           </Button>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-5 border-t border-white/5 flex items-center justify-between bg-white/[0.01]">
                 <div className="text-xs text-muted-foreground">Showing page {page} of {totalPages}</div>
                 <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      disabled={page === 1} 
                      onClick={() => setPage(p => p - 1)}
                      className="h-9 px-4 rounded-xl border-white/5 text-xs font-bold"
                    >
                      Previous
                    </Button>
                    <Button 
                      variant="outline" 
                      disabled={page === totalPages} 
                      onClick={() => setPage(p => p + 1)}
                      className="h-9 px-4 rounded-xl border-white/5 text-xs font-bold"
                    >
                      Next
                    </Button>
                 </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* User Details Drawer */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60]" 
            />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-white/10 z-[70] shadow-2xl overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-xl font-bold">User Profile</h2>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)} className="rounded-xl">
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                <div className="flex flex-col items-center text-center mb-8">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-3xl font-black mb-4 shadow-xl shadow-primary/20">
                    {selectedUser.user.name[0]}
                  </div>
                  <h3 className="text-2xl font-bold">{selectedUser.user.name}</h3>
                  <p className="text-muted-foreground text-sm uppercase tracking-widest font-black mt-1">{selectedUser.user.role}</p>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                      <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <Mail className="w-4 h-4" /> <span className="text-[10px] uppercase font-black tracking-wider">Email Address</span>
                      </div>
                      <div className="text-sm font-medium">{selectedUser.user.email}</div>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/3 border border-white/5">
                      <div className="flex items-center gap-3 text-muted-foreground mb-2">
                        <Calendar className="w-4 h-4" /> <span className="text-[10px] uppercase font-black tracking-wider">Joined System</span>
                      </div>
                      <div className="text-sm font-medium">{new Date(selectedUser.user.createdAt).toLocaleDateString("en-IN", { dateStyle: 'full' })}</div>
                    </div>
                  </div>

                  <div>
                     <h4 className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4 px-2">Booking History</h4>
                     <div className="space-y-3">
                        {selectedUser.bookings?.length > 0 ? selectedUser.bookings.map((b: any) => (
                          <div key={b._id} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between group">
                            <div>
                               <div className="text-xs font-bold group-hover:text-primary transition-colors">{b.vehicleId?.name}</div>
                               <div className="text-[10px] text-muted-foreground">{new Date(b.date).toLocaleDateString()}</div>
                            </div>
                            <div className="text-right">
                               <div className="text-xs font-bold">₹{b.totalPrice}</div>
                               <div className="text-[9px] uppercase font-black text-emerald-400">{b.status}</div>
                            </div>
                          </div>
                        )) : (
                          <div className="p-8 text-center text-xs text-muted-foreground bg-white/1 rounded-2xl border border-dashed border-white/10">
                            No booking history found for this user.
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5 flex gap-3">
                   <Button 
                    className="flex-1 rounded-xl h-12 font-bold" 
                    variant={selectedUser.user.status === "banned" ? "outline" : "destructive"}
                    onClick={() => handleStatusChange(selectedUser.user._id, selectedUser.user.status)}
                   >
                     {selectedUser.user.status === "banned" ? "Unban Account" : "Ban Account"}
                   </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
