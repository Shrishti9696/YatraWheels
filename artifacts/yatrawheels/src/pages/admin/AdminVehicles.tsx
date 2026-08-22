import { useEffect, useState } from "react";
import { Car, AlertCircle, Check, LayoutDashboard, BookOpen, Truck, UserCog, Shield } from "lucide-react";
import { PanelSidebar } from "@/components/PanelSidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { getVehicles, approveVehicle } from "@/services/adminService";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/vehicles", label: "Vehicles", icon: Truck },
  { href: "/admin/bookings", label: "Bookings", icon: BookOpen },
  { href: "/admin/drivers", label: "Drivers", icon: Shield },
];

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getVehicles()
      .then(setVehicles)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleApprove(id: string) {
    try {
      const updated = await approveVehicle(id);
      setVehicles(vs => vs.map(v => v._id === id ? { ...v, isApproved: updated.isApproved } : v));
    } catch (e: any) {
      setError(e.message);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <PanelSidebar title="Admin Panel" subtitle="Control center" navItems={NAV} accentColor="text-red-400" />

      <main className="flex-1 p-6 lg:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold mb-1">All Vehicles</h1>
            <p className="text-muted-foreground text-sm">{vehicles.length} vehicles on the platform</p>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />) :
              vehicles.length === 0 ? (
                <div className="col-span-full text-center py-16 text-muted-foreground">
                  <Car className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No vehicles yet.</p>
                </div>
              ) : vehicles.map(v => (
                <div key={v._id} className="bg-card border border-card-border rounded-2xl overflow-hidden">
                  <div className="relative h-40 overflow-hidden bg-muted">
                    {v.imageUrl
                      ? <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><Car className="w-10 h-10 text-muted-foreground/30" /></div>
                    }
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${v.isApproved ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>
                        {v.isApproved ? "Approved" : "Pending"}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{v.name}</h3>
                    <div className="text-xs text-muted-foreground mb-1 capitalize">{v.type} · {v.capacity} passengers</div>
                    <div className="text-xs text-muted-foreground mb-3">₹{v.pricePerDay?.toLocaleString()}/day · {v.location}</div>
                    {v.vendorId && <div className="text-xs text-muted-foreground mb-3">Vendor: {v.vendorId.name || v.vendorId.email}</div>}
                    {!v.isApproved && (
                      <Button size="sm" onClick={() => handleApprove(v._id)} className="w-full gradient-blue-purple text-white border-0 rounded-xl text-xs h-8 gap-1.5">
                        <Check className="w-3.5 h-3.5" /> Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </main>
    </div>
  );
}
