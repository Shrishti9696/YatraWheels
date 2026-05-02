import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, FileText, Save, CheckCircle, AlertCircle,
  Car, LayoutDashboard, Truck, BookOpen, Settings, ChevronRight
} from "lucide-react";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking } from "@/context/BookingContext";
import { fetchMe, updateProfile, setStoredUser } from "@/services/authService";
import { Link } from "wouter";

const VENDOR_NAV = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/vehicles", label: "My Vehicles", icon: Truck },
  { href: "/vendor/bookings", label: "Bookings", icon: BookOpen },
];

const DRIVER_NAV = [
  { href: "/driver", label: "Dashboard", icon: LayoutDashboard },
  { href: "/driver/bookings", label: "My Trips", icon: BookOpen },
];

export default function ProfilePage() {
  const { user, setUser } = useBooking();
  const isDriver = user?.role === "driver";
  const navItems = isDriver ? DRIVER_NAV : VENDOR_NAV;
  const roleLabel = isDriver ? "Driver" : "Vendor";
  const roleBadgeClass = isDriver
    ? "text-purple-400 bg-purple-400/10 border-purple-400/25"
    : "text-emerald-400 bg-emerald-400/10 border-emerald-400/25";

  const settingsHref = isDriver ? "/driver/settings" : "/vendor/settings";

  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchMe()
      .then(u => { setName(u.name); setEmail(u.email); setPhone(u.phone || ""); setBio(u.bio || ""); })
      .catch(() => { setName(user?.name || ""); setEmail(user?.email || ""); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setMsg(null); setSaving(true);
    try {
      const updated = await updateProfile({ name, email, phone, bio });
      const newUser = { ...user!, ...updated };
      setUser(newUser); setStoredUser(newUser);
      setMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (e: any) {
      setMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMsg(null), 4000);
    }
  }

  const initials = (name || user?.name || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={navItems} roleLabel={roleLabel} roleBadgeClass={roleBadgeClass} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-card-border p-6">
            <div className="absolute inset-0 gradient-blue-purple opacity-5 pointer-events-none" />
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-[72px] h-[72px] rounded-2xl gradient-blue-purple flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/30">
                  {loading ? "?" : initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-card flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                {loading
                  ? <Skeleton className="h-6 w-40 mb-2" />
                  : <h1 className="text-xl font-bold truncate">{name || "Your Profile"}</h1>
                }
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${roleBadgeClass}`}>
                    {roleLabel}
                  </span>
                  <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
                </div>
              </div>
              <Link href={settingsHref}>
                <Button size="sm" variant="outline" className="border-border/60 gap-1.5 rounded-xl text-xs h-8 shrink-0">
                  <Settings className="w-3.5 h-3.5" /> Settings
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Personal Info Card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="space-y-5">
          {msg && (
            <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${msg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
              {msg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {msg.text}
            </div>
          )}

          <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Personal Information</h2>
                <p className="text-xs text-muted-foreground">Update your name, contact details, and bio</p>
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 rounded-xl" />)}</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Full Name <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" className="pl-9 bg-muted/30 border-border/60 rounded-xl" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Email Address <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" type="email" className="pl-9 bg-muted/30 border-border/60 rounded-xl" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="pl-9 bg-muted/30 border-border/60 rounded-xl" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">
                    {isDriver ? "About Me" : "Business Description"}
                    <span className="text-muted-foreground/50 ml-1">(optional · max 300 chars)</span>
                  </label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      placeholder={isDriver ? "Tell passengers about yourself — your experience, vehicle, and why you love driving..." : "Describe your fleet, service areas, and what makes your vehicles special..."}
                      maxLength={300}
                      rows={3}
                      className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 resize-none"
                    />
                    <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/40">{bio.length}/300</div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving || loading} className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2 h-10 px-6">
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Profile</>}
              </Button>
            </div>
          </div>

          {/* Account details card */}
          <div className="bg-card border border-card-border rounded-2xl p-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isDriver ? "bg-purple-500/10" : "bg-emerald-500/10"}`}>
                <Car className={`w-4 h-4 ${isDriver ? "text-purple-400" : "text-emerald-400"}`} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">Account Details</h2>
                <p className="text-xs text-muted-foreground">Your role and membership information</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {[
                { label: "Account Role", value: user?.role || "—", color: isDriver ? "text-purple-400" : "text-emerald-400" },
                { label: "Platform", value: "YatraWheels", color: "text-foreground" },
                { label: "Status", value: "Active", color: "text-emerald-400" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-muted/30 rounded-xl p-4">
                  <div className="text-xs text-muted-foreground mb-1">{label}</div>
                  <div className={`text-sm font-semibold capitalize ${color}`}>{value}</div>
                </div>
              ))}
            </div>

            {/* Quick link to Account Settings */}
            <Link href={settingsHref}>
              <div className="flex items-center justify-between p-4 rounded-xl bg-muted/20 hover:bg-muted/40 border border-border/40 hover:border-border transition-all cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-card border border-border/60 flex items-center justify-center">
                    <Settings className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Account Settings</div>
                    <div className="text-xs text-muted-foreground">Security, appearance, billing & notifications</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
