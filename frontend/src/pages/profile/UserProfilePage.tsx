import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, FileText, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Save, Shield, Sun, Moon,
  Crown, Zap, Bell, Palette, LogOut, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useBooking } from "@/context/BookingContext";
import { useTheme } from "@/context/ThemeContext";
import { fetchMe, updateProfile, changePassword, setStoredUser } from "@/services/authService";
import { Link, useLocation } from "wouter";
import { Navbar } from "@/components/Navbar";

type Tab = "info" | "security" | "appearance";

export default function UserProfilePage() {
  const { user, setUser, logout } = useBooking();
  const { theme, setTheme } = useTheme();
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<Tab>("info");
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchMe()
      .then(u => {
        setName(u.name); setEmail(u.email);
        setPhone(u.phone || ""); setBio(u.bio || "");
      })
      .catch(() => {
        setName(user?.name || ""); setEmail(user?.email || "");
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    setProfileMsg(null); setSaving(true);
    try {
      const updated = await updateProfile({ name, email, phone, bio });
      const newUser = { ...user!, ...updated };
      setUser(newUser); setStoredUser(newUser);
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (e: any) {
      setProfileMsg({ type: "error", text: e.message });
    } finally {
      setSaving(false);
      setTimeout(() => setProfileMsg(null), 4000);
    }
  }

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

  const initials = (name || user?.name || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);
  const pwStrength = newPassword.length >= 12 ? 4 : newPassword.length >= 10 ? 3 : newPassword.length >= 8 ? 2 : newPassword.length >= 6 ? 1 : 0;

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "info", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* Hero header */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-card-border p-6">
            <div className="absolute inset-0 gradient-blue-purple opacity-5 pointer-events-none" />
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl gradient-blue-purple flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/30">
                  {loading ? "?" : initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-card flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-bold truncate">{loading ? <Skeleton className="h-6 w-40" /> : name || "Your Profile"}</h1>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-sm text-muted-foreground truncate">{user?.email}</span>
                  {user?.plan && (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border capitalize ${user.plan === "premium" ? "text-amber-400 bg-amber-400/10 border-amber-400/25" : user.plan === "pro" ? "text-primary bg-primary/10 border-primary/25" : "text-muted-foreground bg-muted/30 border-border"}`}>
                      {user.plan === "premium" ? <Crown className="w-3 h-3" /> : user.plan === "pro" ? <Zap className="w-3 h-3" /> : null}
                      {user.plan}
                    </span>
                  )}
                </div>
              </div>
              <Link href="/pricing">
                <Button size="sm" className="gradient-blue-purple text-white border-0 shadow-md shadow-primary/20 rounded-xl text-xs h-8 gap-1.5 shrink-0">
                  <Crown className="w-3 h-3" /> Upgrade
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 p-1 rounded-xl mb-6 w-fit">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === id ? "bg-card text-foreground shadow-sm border border-border/60" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {tab === "info" && (
          <motion.div key="info" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            {profileMsg && (
              <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${profileMsg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                {profileMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                {profileMsg.text}
              </div>
            )}

            <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Personal Information</h2>
                  <p className="text-xs text-muted-foreground">Your public profile details</p>
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
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">Bio <span className="text-muted-foreground/50">(optional · max 300 chars)</span></label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                      <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself..." maxLength={300} rows={3} className="w-full pl-9 pr-4 py-2.5 bg-muted/30 border border-border/60 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:border-primary/40 resize-none" />
                      <div className="absolute bottom-2 right-3 text-xs text-muted-foreground/40">{bio.length}/300</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={saving || loading} className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2 h-10 px-6">
                  {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Changes</>}
                </Button>
              </div>
            </div>

            {/* Account info */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-4">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Account Overview</h2>
                  <p className="text-xs text-muted-foreground">Your membership and activity</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: "Role", value: user?.role || "Traveler", color: "text-blue-400" },
                  { label: "Plan", value: user?.plan || "Free", color: "text-emerald-400" },
                  { label: "Status", value: "Active", color: "text-emerald-400" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="bg-muted/30 rounded-xl p-4">
                    <div className="text-xs text-muted-foreground mb-1">{label}</div>
                    <div className={`text-sm font-semibold capitalize ${color}`}>{value}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

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
                  <p className="text-xs text-muted-foreground">Keep your account secure with a strong password</p>
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
                    {[1, 2, 3, 4].map(level => (
                      <div key={level} className={`h-1.5 flex-1 rounded-full transition-all ${level <= pwStrength ? pwStrength >= 4 ? "bg-emerald-400" : pwStrength >= 3 ? "bg-primary" : pwStrength >= 2 ? "bg-amber-400" : "bg-red-400" : "bg-border"}`} />
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

            {/* Sign out */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-red-400">Sign Out</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Sign out of your account on this device</p>
                </div>
                <Button variant="outline" size="sm" className="border-red-500/20 text-red-400 hover:bg-red-500/8 hover:border-red-500/30 gap-2 rounded-xl" onClick={() => { logout(); navigate("/"); }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Appearance Tab */}
        {tab === "appearance" && (
          <motion.div key="appearance" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-5">
                <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
                  <Palette className="w-4 h-4 text-violet-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Theme Preference</h2>
                  <p className="text-xs text-muted-foreground">Choose how YatraWheels looks for you</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Dark mode card */}
                <button
                  onClick={() => setTheme("dark")}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${theme === "dark" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"}`}
                >
                  <div className="bg-slate-900 p-4 aspect-video flex flex-col gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-green-500/80" />
                    </div>
                    <div className="bg-slate-800 rounded-lg h-3 w-full" />
                    <div className="bg-slate-800 rounded-lg h-2 w-3/4" />
                    <div className="bg-blue-600/40 rounded-lg h-2 w-1/2" />
                  </div>
                  <div className="p-3 flex items-center justify-between bg-background/50">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">Dark</span>
                    </div>
                    {theme === "dark" && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                </button>

                {/* Light mode card */}
                <button
                  onClick={() => setTheme("light")}
                  className={`relative rounded-2xl overflow-hidden border-2 transition-all duration-200 ${theme === "light" ? "border-primary shadow-lg shadow-primary/20" : "border-border/60 hover:border-border"}`}
                >
                  <div className="bg-gray-50 p-4 aspect-video flex flex-col gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500/80" />
                      <div className="w-2 h-2 rounded-full bg-yellow-500/80" />
                      <div className="w-2 h-2 rounded-full bg-green-500/80" />
                    </div>
                    <div className="bg-gray-200 rounded-lg h-3 w-full" />
                    <div className="bg-gray-200 rounded-lg h-2 w-3/4" />
                    <div className="bg-blue-500/30 rounded-lg h-2 w-1/2" />
                  </div>
                  <div className="p-3 flex items-center justify-between bg-white/50">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium">Light</span>
                    </div>
                    {theme === "light" && <CheckCircle className="w-4 h-4 text-primary" />}
                  </div>
                </button>
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                Your preference is saved automatically and applied across all sessions.
              </p>
            </div>

            {/* Notifications placeholder */}
            <div className="bg-card border border-card-border rounded-2xl p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold">Notifications</h2>
                  <p className="text-xs text-muted-foreground">Manage how you receive updates</p>
                </div>
              </div>
              {[
                { label: "Booking Confirmations", desc: "Get notified when your booking is confirmed", enabled: true },
                { label: "Trip Reminders", desc: "Reminders 24 hours before your trip", enabled: true },
                { label: "Promotional Offers", desc: "Special deals and discount alerts", enabled: false },
              ].map(({ label, desc, enabled }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-border/40 last:border-0">
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
