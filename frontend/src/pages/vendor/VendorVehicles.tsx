import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, Car, Users, DollarSign, MapPin, X, Check, AlertCircle, LayoutDashboard, Truck, BookOpen } from "lucide-react";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getMyVehicles, addVehicle, updateVehicle, deleteVehicle } from "@/services/vendorService";
import { toast } from "sonner";

const NAV = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/vehicles", label: "My Vehicles", icon: Truck },
  { href: "/vendor/bookings", label: "Bookings", icon: BookOpen },
];

const EMPTY_FORM = { name: "", type: "car", capacity: "", pricePerDay: "", pricePerKm: "", location: "", imageUrl: "", features: "" };

export default function VendorVehicles() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function fetchVehicles() {
    try {
      const data = await getMyVehicles();
      setVehicles(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchVehicles(); }, []);

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditId(null);
    setShowForm(true);
  }

  function openEdit(v: any) {
    setForm({ name: v.name, type: v.type, capacity: String(v.capacity), pricePerDay: String(v.pricePerDay), pricePerKm: String(v.pricePerKm), location: v.location, imageUrl: v.imageUrl || "", features: (v.features || []).join(", ") });
    setEditId(v._id);
    setShowForm(true);
  }

  async function handleSave() {
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, capacity: Number(form.capacity), pricePerDay: Number(form.pricePerDay), pricePerKm: Number(form.pricePerKm), features: form.features.split(",").map((s: string) => s.trim()).filter(Boolean) };
      if (editId) {
        const updated = await updateVehicle(editId, payload);
        setVehicles(vs => vs.map(v => v._id === editId ? updated : v));
      } else {
        const created = await addVehicle(payload);
        setVehicles(vs => [created, ...vs]);
      }
      setShowForm(false);
      toast.success(editId ? "Vehicle updated successfully!" : "Vehicle added successfully!");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this vehicle? It will be removed from your active fleet.")) return;
    try {
      await deleteVehicle(id);
      setVehicles(vs => vs.filter(v => v._id !== id));
      toast.success("Vehicle removed from fleet");
    } catch (e: any) {
      toast.error(e.message);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={NAV} roleLabel="Vendor" roleBadgeClass="text-emerald-400 bg-emerald-400/10 border-emerald-400/25" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div>
          <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">My Vehicles</h1>
              <p className="text-muted-foreground text-sm">{vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} in your fleet</p>
            </div>
            <Button onClick={openAdd} className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2">
              <Plus className="w-4 h-4" /> Add Vehicle
            </Button>
          </div>

          {error && <div className="flex items-center gap-2 text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
          {success && <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3 mb-5 text-sm"><Check className="w-4 h-4 shrink-0" />{success}</div>}

          {/* Add/Edit Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-card border border-card-border rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold">{editId ? "Edit Vehicle" : "Add New Vehicle"}</h2>
                  <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { key: "name", label: "Vehicle Name", placeholder: "e.g. Toyota Innova Crysta" },
                    { key: "location", label: "Location", placeholder: "e.g. Mumbai" },
                    { key: "capacity", label: "Capacity (passengers)", placeholder: "e.g. 7", type: "number" },
                    { key: "pricePerDay", label: "Price per Day (₹)", placeholder: "e.g. 4500", type: "number" },
                    { key: "pricePerKm", label: "Price per Km (₹)", placeholder: "e.g. 15", type: "number" },
                    { key: "imageUrl", label: "Image URL", placeholder: "https://..." },
                  ].map(({ key, label, placeholder, type }) => (
                    <div key={key}>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
                      <Input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} placeholder={placeholder} type={type || "text"} className="bg-white/3 border-white/10 rounded-xl" />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="w-full bg-white/3 border border-white/10 text-foreground text-sm rounded-xl px-3 py-2.5 [color-scheme:dark] outline-none focus:border-primary/40">
                      {["car", "van", "bus", "luxury"].map(t => <option key={t} value={t} className="bg-card capitalize">{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Features (comma-separated)</label>
                    <Input value={form.features} onChange={e => setForm(f => ({ ...f, features: e.target.value }))} placeholder="AC, GPS, USB Charging" className="bg-white/3 border-white/10 rounded-xl" />
                  </div>
                </div>
                <div className="flex gap-3 mt-5">
                  <Button onClick={handleSave} disabled={saving} className="gradient-blue-purple text-white border-0 rounded-xl gap-2">
                    {saving ? "Saving..." : <><Check className="w-4 h-4" />{editId ? "Update" : "Add Vehicle"}</>}
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)} className="border-white/12 hover:bg-white/5 rounded-xl">Cancel</Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Vehicle grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-2xl" />)}
            </div>
          ) : vehicles.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Car className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium mb-2">No vehicles yet</p>
              <p className="text-sm mb-6">Add your first vehicle to start receiving bookings.</p>
              <Button onClick={openAdd} className="gradient-blue-purple text-white border-0 rounded-xl gap-2"><Plus className="w-4 h-4" />Add Vehicle</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {vehicles.map(v => (
                <motion.div key={v._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-card-border rounded-2xl overflow-hidden group">
                  <div className="relative h-44 overflow-hidden bg-muted">
                    {v.imageUrl ? (
                      <img src={v.imageUrl} alt={v.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Car className="w-12 h-12 text-muted-foreground/30" /></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute top-3 right-3 flex gap-1.5">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${v.isAvailable ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                        {v.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2 py-0.5 rounded-full text-xs bg-black/50 text-white capitalize">{v.type}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 truncate">{v.name}</h3>
                    <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                      {[
                        { icon: Users, val: `${v.capacity}` },
                        { icon: DollarSign, val: `₹${v.pricePerDay?.toLocaleString()}` },
                        { icon: MapPin, val: v.location },
                      ].map(({ icon: Icon, val }, i) => (
                        <div key={i} className="bg-muted/40 rounded-lg px-2 py-1.5">
                          <Icon className="w-3 h-3 text-muted-foreground mx-auto mb-0.5" />
                          <div className="text-xs font-medium truncate">{val}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(v)} className="flex-1 border-white/12 hover:bg-white/5 rounded-lg gap-1.5 text-xs h-8">
                        <Edit2 className="w-3 h-3" /> Edit
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(v._id)} className="border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-lg h-8 px-3">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
