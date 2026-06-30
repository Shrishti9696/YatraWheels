import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Lock, Eye, EyeOff, CheckCircle, AlertCircle, Shield,
  Bell, Sun, Moon, Crown, Zap, CreditCard, LogOut,
  Palette, Settings, Star, ChevronRight, MapPin, Navigation, XCircle, Loader2
} from "lucide-react";
import { useLocationContext } from "@/context/LocationContext";
import { PanelTopNav } from "@/components/PanelTopNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBooking } from "@/context/BookingContext";
import { useTheme } from "@/context/ThemeContext";
import { changePassword } from "@/services/authService";
import { Link, useLocation } from "wouter";
import { LayoutDashboard, Truck, BookOpen } from "lucide-react";

const VENDOR_NAV = [
  { href: "/vendor", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/vehicles", label: "My Vehicles", icon: Truck },
  { href: "/vendor/bookings", label: "Bookings", icon: BookOpen },
];

const DRIVER_NAV = [
  { href: "/driver", label: "Dashboard", icon: LayoutDashboard },
  { href: "/driver/bookings", label: "My Trips", icon: BookOpen },
];

type Tab = "security" | "appearance" | "location" | "billing" | "notifications";

const PLANS = [
  { key: "free", name: "Free", desc: "5 AI requests/month", price: "₹0", icon: Star, color: "text-muted-foreground" },
  { key: "pro", name: "Pro", desc: "50 AI requests/month", price: "₹299", icon: Zap, color: "text-primary" },
  { key: "premium", name: "Premium", desc: "Unlimited AI requests", price: "₹799", icon: Crown, color: "text-amber-400" },
];

export default function VendorAccountSettings() {
  const { user, logout } = useBooking();
  const { theme, setTheme } = useTheme();
  const { location: userLoc, permissionStatus, requestLocation, clearLocation } = useLocationContext();
  const [, navigate] = useLocation();

  const isDriver = user?.role === "driver";
  const navItems = isDriver ? DRIVER_NAV : VENDOR_NAV;
  const roleLabel = isDriver ? "Driver" : "Vendor";
  const roleBadgeClass = isDriver
    ? "text-purple-400 bg-purple-400/10 border-purple-400/25"
    : "text-emerald-400 bg-emerald-400/10 border-emerald-400/25";

  const [tab, setTab] = useState<Tab>("security");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleChangePassword() {
    setPwMsg(null);
    if (newPassword !== confirmPassword) { setPwMsg({ type: "error", text: "Passwords do not match." }); return; }
    if (newPassword.length < 6) { setPwMsg({ type: "error", text: "Password must be at least 6 characters." }); return; }
    setChangingPw(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (e: any) {
      setPwMsg({ type: "error", text: e.message });
    } finally {
      setChangingPw(false);
      setTimeout(() => setPwMsg(null), 4000);
    }
  }

  const pwStrength = newPassword.length >= 12 ? 4 : newPassword.length >= 10 ? 3 : newPassword.length >= 8 ? 2 : newPassword.length >= 6 ? 1 : 0;

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "location", label: "Location", icon: MapPin },
    { id: "billing", label: "Plans & Billing", icon: CreditCard },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="min-h-screen bg-background">
      <PanelTopNav navItems={navItems} roleLabel={roleLabel} roleBadgeClass={roleBadgeClass} />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-card border border-card-border flex items-center justify-center">
              <Settings className="w-4 h-4 text-muted-foreground" />
            </div>
            <h1 className="text-xl font-bold">Account Settings</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-12">Security, appearance, billing, and notification preferences.</p>
        </motion.div>

        {/* Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl text-xs font-medium transition-all border ${tab === id ? "bg-card border-primary/30 text-foreground shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground hover:bg-card/50"}`}
            >
              <Icon className={`w-5 h-5 ${tab === id ? "text-primary" : ""}`} />
              {label}
            </button>
          ))}
        </div>

        {/* Security Tab */}
        {tab === "security" && (
          <motion.div key="security" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {pwMsg && (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${pwMsg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                {pwMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {pwMsg.text}
              </div>
            )}

            <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Change Password</h2>
                  <p className="text-xs text-muted-foreground">Use a strong password to protect your account</p>
                </div>
              </div>

              <div className="space-y-4">
                {([
                  { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrent, toggle: () => setShowCurrent(p => !p) },
                  { label: "New Password", value: newPassword, set: setNewPassword, show: showNew, toggle: () => setShowNew(p => !p) },
                  { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, show: showConfirm, toggle: () => setShowConfirm(p => !p) },
                ] as { label: string; value: string; set: (v: string) => void; show: boolean; toggle: () => void }[]).map(({ label, value, set, show, toggle }) => (
                  <div key={label}>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                      <Input value={value} onChange={e => set(e.target.value)} type={show ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-10 bg-muted/30 border-border/60 rounded-xl" />
                      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
                        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {newPassword && (
                <div className="space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map(l => (
                      <div key={l} className={`h-1.5 flex-1 rounded-full transition-all ${l <= pwStrength ? pwStrength >= 4 ? "bg-emerald-400" : pwStrength >= 3 ? "bg-primary" : pwStrength >= 2 ? "bg-amber-400" : "bg-red-400" : "bg-border"}`} />
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground/60">{pwStrength >= 4 ? "Strong" : pwStrength >= 3 ? "Good" : pwStrength >= 2 ? "Weak" : "Too short"}</div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={handleChangePassword} disabled={changingPw || !currentPassword || !newPassword || !confirmPassword} className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2 h-10 px-6">
                  {changingPw ? "Updating..." : <><Shield className="w-4 h-4" /> Update Password</>}
                </Button>
              </div>
            </div>

            {/* 2FA placeholder */}
            <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Two-Factor Authentication</div>
                  <div className="text-xs text-muted-foreground">Add an extra layer of security</div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl text-xs border-border/60 gap-1.5">
                Enable <ChevronRight className="w-3 h-3" />
              </Button>
            </div>

            {/* Danger zone */}
            <div className="bg-card border border-card-border rounded-2xl p-5 flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-red-400">Sign Out</div>
                <div className="text-xs text-muted-foreground">Sign out from your {roleLabel} account</div>
              </div>
              <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/8 gap-2 rounded-xl" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="w-4 h-4" /> Sign Out
              </Button>
            </div>
          </motion.div>
        )}

        {/* Appearance Tab */}
        {tab === "appearance" && (
          <motion.div key="appearance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-5 border-b border-border/60 mb-5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Theme</h2>
                  <p className="text-xs text-muted-foreground">Choose your preferred color scheme</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setTheme("dark")} className={`rounded-2xl overflow-hidden border-2 transition-all ${theme === "dark" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"}`}>
                  <div className="bg-slate-900 p-4 aspect-video flex flex-col gap-2">
                    <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500/80" /><div className="w-2 h-2 rounded-full bg-yellow-500/80" /><div className="w-2 h-2 rounded-full bg-green-500/80" /></div>
                    <div className="bg-slate-800 rounded h-2 w-full" />
                    <div className="bg-slate-800 rounded h-2 w-2/3" />
                    <div className="bg-blue-600/40 rounded h-2 w-1/2" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Moon className="w-4 h-4 text-slate-400" /><span className="text-sm font-medium">Dark</span></div>
                    {theme === "dark" && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                </button>

                <button onClick={() => setTheme("light")} className={`rounded-2xl overflow-hidden border-2 transition-all ${theme === "light" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"}`}>
                  <div className="bg-gray-50 p-4 aspect-video flex flex-col gap-2">
                    <div className="flex gap-1"><div className="w-2 h-2 rounded-full bg-red-500/80" /><div className="w-2 h-2 rounded-full bg-yellow-500/80" /><div className="w-2 h-2 rounded-full bg-green-500/80" /></div>
                    <div className="bg-gray-200 rounded h-2 w-full" />
                    <div className="bg-gray-200 rounded h-2 w-2/3" />
                    <div className="bg-blue-400/30 rounded h-2 w-1/2" />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <div className="flex items-center gap-2"><Sun className="w-4 h-4 text-amber-500" /><span className="text-sm font-medium">Light</span></div>
                    {theme === "light" && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              </div>
              <p className="text-xs text-muted-foreground text-center mt-4">Your preference is saved automatically.</p>
            </div>
          </motion.div>
        )}

        {/* Location Tab */}
        {tab === "location" && (
          <motion.div key="location" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-5 border-b border-border/60 mb-5">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Location Settings</h2>
                  <p className="text-xs text-muted-foreground">Auto-detect your city for faster operations</p>
                </div>
              </div>

              {userLoc ? (
                <div className="mb-5 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                        <Navigation className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-emerald-400">Location Detected</div>
                        <div className="text-base font-bold">{userLoc.city}{userLoc.state ? `, ${userLoc.state}` : ""}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{userLoc.lat.toFixed(4)}°N, {userLoc.lng.toFixed(4)}°E</div>
                      </div>
                    </div>
                    <button onClick={clearLocation} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-500/8">
                      <XCircle className="w-3.5 h-3.5" /> Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-5 p-4 rounded-2xl bg-muted/30 border border-border/60">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">No location set</div>
                      <div className="text-xs text-muted-foreground">Allow location access to auto-fill city in bookings</div>
                    </div>
                  </div>
                </div>
              )}

              {permissionStatus === "denied" ? (
                <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-400 flex items-center gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  Location denied. Enable it in your browser settings and try again.
                </div>
              ) : (
                <Button onClick={requestLocation} disabled={permissionStatus === "requesting"} className="w-full gradient-blue-purple text-white border-0 rounded-xl h-11 gap-2 shadow-lg shadow-primary/20">
                  {permissionStatus === "requesting" ? <><Loader2 className="w-4 h-4 animate-spin" /> Detecting...</> : userLoc ? <><Navigation className="w-4 h-4" /> Update Location</> : <><Navigation className="w-4 h-4" /> Allow Location Access</>}
                </Button>
              )}
            </div>
          </motion.div>
        )}

        {/* Billing Tab */}
        {tab === "billing" && (
          <motion.div key="billing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-5 border-b border-border/60 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Current Plan</h2>
                  <p className="text-xs text-muted-foreground">Manage your subscription</p>
                </div>
              </div>

              <div className="space-y-3">
                {PLANS.map(({ key, name, desc, price, icon: Icon, color }) => (
                  <div key={key} className={`relative flex items-center gap-4 p-4 rounded-xl border transition-all ${user?.plan === key ? "border-primary/30 bg-primary/5" : "border-border/60 hover:border-border"}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${key === "premium" ? "bg-amber-500/10" : key === "pro" ? "bg-primary/10" : "bg-muted/50"}`}>
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{name}</span>
                        {user?.plan === key && <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-primary/15 text-primary">Current</span>}
                      </div>
                      <div className="text-xs text-muted-foreground">{desc}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{price}<span className="text-xs text-muted-foreground font-normal">/mo</span></div>
                      {user?.plan !== key && (
                        <Link href="/pricing">
                          <Button size="sm" variant="outline" className="mt-1 text-xs h-7 rounded-lg border-border/60 px-3">
                            {key === "free" ? "Downgrade" : "Upgrade"}
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Notifications Tab */}
        {tab === "notifications" && (
          <motion.div key="notifications" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-5 border-b border-border/60 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Notification Preferences</h2>
                  <p className="text-xs text-muted-foreground">Manage what updates you receive</p>
                </div>
              </div>

              {[
                { label: "New Booking Alerts", desc: "Get notified when a customer books your vehicle", enabled: true },
                { label: "Booking Cancellations", desc: "Alerts when a booking is cancelled", enabled: true },
                { label: "Payment Received", desc: "Confirmation when payments are processed", enabled: true },
                { label: "Platform Updates", desc: "New features and platform announcements", enabled: false },
                { label: "Marketing Emails", desc: "Promotional offers and tips", enabled: false },
              ].map(({ label, desc, enabled }, i) => (
                <div key={label} className={`flex items-center justify-between py-3.5 ${i > 0 ? "border-t border-border/40" : ""}`}>
                  <div>
                    <div className="text-sm font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                  <div className={`w-10 h-5 rounded-full relative cursor-pointer transition-colors ${enabled ? "bg-primary" : "bg-border"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? "left-5" : "left-0.5"}`} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
