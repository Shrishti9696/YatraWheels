import { useEffect, useState } from "react";
import { AlertCircle, LayoutDashboard, BookOpen, Truck, UserCog, Shield, Search } from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { getUsers, updateUserRole } from "@/services/adminService";

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
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    getUsers()
      .then(d => setUsers(d.users || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleRoleChange(id: string, role: string) {
    setUpdatingId(id);
    try {
      const updated = await updateUserRole(id, role);
      setUsers(us => us.map(u => u._id === id ? { ...u, role: updated.role } : u));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdatingId(null);
    }
  }

  const filtered = users.filter(u => {
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar title="Admin Panel" subtitle="Control center" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">Users</h1>
            <p className="text-muted-foreground text-sm">{users.length} registered users</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." className="pl-9 bg-white/3 border-white/10 rounded-xl" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {["all", "user", "vendor", "driver", "admin"].map(r => (
                <button key={r} onClick={() => setRoleFilter(r)} className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-colors border ${roleFilter === r ? "bg-primary/15 text-primary border-primary/25" : "bg-white/5 text-muted-foreground hover:text-foreground border-white/8"}`}>{r}</button>
              ))}
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/8">
                    {["User", "Email", "Role", "Plan", "Joined", "Actions"].map(h => (
                      <th key={h} className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wide px-5 py-3.5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? Array.from({ length: 6 }).map((_, i) => (
                    <tr key={i}>{Array.from({ length: 6 }).map((_, j) => <td key={j} className="px-5 py-4"><Skeleton className="h-4 w-full" /></td>)}</tr>
                  )) : filtered.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-14 text-muted-foreground text-sm">No users found.</td></tr>
                  ) : filtered.map(u => (
                    <tr key={u._id} className="hover:bg-white/2 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full gradient-blue-purple flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {u.name[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium">{u.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground">{u.email}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${ROLE_COLORS[u.role] || ""}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs text-muted-foreground capitalize">{u.plan || "free"}</span>
                      </td>
                      <td className="px-5 py-4 text-xs text-muted-foreground whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={u.role}
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={updatingId === u._id}
                          className="text-xs bg-white/5 border border-white/10 text-muted-foreground rounded-lg px-2 py-1.5 [color-scheme:dark] outline-none cursor-pointer disabled:opacity-50"
                        >
                          {["user", "vendor", "driver", "admin"].map(r => <option key={r} value={r} className="bg-card capitalize">{r}</option>)}
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
