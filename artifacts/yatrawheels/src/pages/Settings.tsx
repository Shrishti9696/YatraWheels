import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Phone, FileText, Lock, Eye, EyeOff,
  CheckCircle, AlertCircle, Save, Shield, Sun, Moon,
  MapPin, Navigation, Loader2, XCircle, Palette, Settings as SettingsIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Navbar } from "@/components/Navbar";
import { useBooking } from "@/context/BookingContext";
import { useTheme } from "@/context/ThemeContext";
import { useLocationContext } from "@/context/LocationContext";
import { fetchMe, updateProfile, changePassword, setStoredUser } from "@/services/authService";
import { useLocation } from "wouter";

type Tab = "profile" | "appearance" | "location" | "security";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "location", label: "Location", icon: MapPin },
  { id: "security", label: "Security", icon: Shield },
];

export default function Settings() {
  const { user, setUser } = useBooking();
  const { theme, setTheme } = useTheme();
  const { location: userLoc, permissionStatus, requestLocation, clearLocation } = useLocationContext();
  const [, navigate] = useLocation();

  const [tab, setTab] = useState<Tab>(() => {
    const hash = window.location.search;
    if (hash.includes("tab=appearance")) return "appearance";
    if (hash.includes("tab=location")) return "location";
    if (hash.includes("tab=security")) return "security";
    return "profile";
  });

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
      .then(u => { setName(u.name); setEmail(u.email); setPhone(u.phone || ""); setBio(u.bio || ""); })
      .catch(() => { setName(user?.name || ""); setEmail(user?.email || ""); })
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

  const pwStrength = newPassword.length >= 12 ? 4 : newPassword.length >= 10 ? 3 : newPassword.length >= 8 ? 2 : newPassword.length >= 6 ? 1 : 0;
  const initials = (name || user?.name || "U").split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="relative rounded-2xl overflow-hidden bg-card border border-card-border p-6">
            <div className="absolute inset-0 gradient-blue-purple opacity-5 pointer-events-none" />
            <div className="flex items-center gap-5">
              <div className="w-[72px] h-[72px] rounded-2xl gradient-blue-purple flex items-center justify-center text-white text-2xl font-bold shadow-xl shadow-primary/30">
                {loading ? "?" : initials}
              </div>
              <div className="flex-1 min-w-0">
                {loading ? <Skeleton className="h-6 w-40 mb-2" /> : <h1 className="text-xl font-bold">{name || "Settings"}</h1>}
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {userLoc && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs text-primary font-medium">{userLoc.city}{userLoc.state ? `, ${userLoc.state}` : ""}</span>
                  </div>
                )}
              </div>
              <div className="shrink-0">
                <SettingsIcon className="w-5 h-5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/30 p-1 rounded-2xl border border-border/60 mb-6 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                tab === id ? "bg-card border border-border/60 text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.15 }}>

            {/* PROFILE TAB */}
            {tab === "profile" && (
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

                {profileMsg && (
                  <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${profileMsg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                    {profileMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {profileMsg.text}
                  </div>
                )}

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
                        About Me <span className="text-muted-foreground/50 ml-1">(optional · max 300 chars)</span>
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground/50" />
                        <textarea
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
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
                  <Button onClick={handleSaveProfile} disabled={saving || loading} className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20 rounded-xl gap-2 h-10 px-6">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Profile</>}
                  </Button>
                </div>
              </div>
            )}

            {/* APPEARANCE TAB */}
            {tab === "appearance" && (
              <div className="space-y-4">
                <div className="bg-card border border-card-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Palette className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">Theme & Appearance</h2>
                      <p className="text-xs text-muted-foreground">Choose your preferred visual style</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Dark mode card */}
                    <button
                      onClick={() => setTheme("dark")}
                      className={`relative p-4 rounded-2xl border-2 transition-all text-left ${theme === "dark" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
                    >
                      <div className="h-24 bg-[#0f172a] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                        <div className="w-full px-3 space-y-1.5">
                          <div className="h-2 bg-[#1e293b] rounded-full w-3/4" />
                          <div className="h-1.5 bg-[#1e293b] rounded-full w-1/2" />
                          <div className="h-1.5 bg-[#6d28d9]/60 rounded-full w-2/3" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2"><Moon className="w-3.5 h-3.5" /> Dark Mode</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Easy on eyes at night</div>
                        </div>
                        {theme === "dark" && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                    </button>

                    {/* Light mode card */}
                    <button
                      onClick={() => setTheme("light")}
                      className={`relative p-4 rounded-2xl border-2 transition-all text-left ${theme === "light" ? "border-primary bg-primary/5" : "border-border/60 hover:border-border"}`}
                    >
                      <div className="h-24 bg-[#f8fafc] rounded-xl mb-3 flex items-center justify-center overflow-hidden">
                        <div className="w-full px-3 space-y-1.5">
                          <div className="h-2 bg-[#e2e8f0] rounded-full w-3/4" />
                          <div className="h-1.5 bg-[#e2e8f0] rounded-full w-1/2" />
                          <div className="h-1.5 bg-[#6d28d9]/40 rounded-full w-2/3" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-sm flex items-center gap-2"><Sun className="w-3.5 h-3.5" /> Light Mode</div>
                          <div className="text-xs text-muted-foreground mt-0.5">Clean and bright look</div>
                        </div>
                        {theme === "light" && <CheckCircle className="w-5 h-5 text-primary shrink-0" />}
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 p-3 rounded-xl bg-muted/30 border border-border/40 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Current theme</span>
                    <span className="flex items-center gap-1.5 text-sm font-medium">
                      {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-primary" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                      {theme === "dark" ? "Dark" : "Light"}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* LOCATION TAB */}
            {tab === "location" && (
              <div className="space-y-4">
                <div className="bg-card border border-card-border rounded-2xl p-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border/60 mb-6">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold">Location Settings</h2>
                      <p className="text-xs text-muted-foreground">Auto-detect your city for faster booking</p>
                    </div>
                  </div>

                  {/* Current location display */}
                  {userLoc ? (
                    <div className="mb-6 p-4 rounded-2xl bg-emerald-500/8 border border-emerald-500/20">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                            <Navigation className="w-5 h-5 text-emerald-400" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-emerald-400">Location Detected</div>
                            <div className="text-base font-bold">{userLoc.city}{userLoc.state ? `, ${userLoc.state}` : ""}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {userLoc.lat.toFixed(4)}°N, {userLoc.lng.toFixed(4)}°E
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={clearLocation}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-red-500/8"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Clear
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mb-6 p-4 rounded-2xl bg-muted/30 border border-border/60">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">No location set</div>
                          <div className="text-xs text-muted-foreground">Allow location access to auto-fill your city in bookings</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Permission status & action */}
                  {permissionStatus === "denied" ? (
                    <div className="p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-400 flex items-center gap-2.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      Location access was denied. Please enable it in your browser settings and try again.
                    </div>
                  ) : (
                    <Button
                      onClick={requestLocation}
                      disabled={permissionStatus === "requesting"}
                      className="w-full gradient-blue-purple text-white border-0 rounded-xl h-11 gap-2 shadow-lg shadow-primary/20"
                    >
                      {permissionStatus === "requesting" ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Detecting location...</>
                      ) : userLoc ? (
                        <><Navigation className="w-4 h-4" /> Update My Location</>
                      ) : (
                        <><Navigation className="w-4 h-4" /> Allow Location Access</>
                      )}
                    </Button>
                  )}

                  <div className="mt-4 space-y-2.5">
                    {[
                      "Your location is used only to auto-fill pickup city in bookings",
                      "Location data is stored only on your device",
                      "You can clear your location data anytime",
                    ].map(text => (
                      <div key={text} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {tab === "security" && (
              <div className="bg-card border border-card-border rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 pb-4 border-b border-border/60">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Change Password</h2>
                    <p className="text-xs text-muted-foreground">Keep your account secure with a strong password</p>
                  </div>
                </div>

                {pwMsg && (
                  <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm border ${pwMsg.type === "success" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"}`}>
                    {pwMsg.type === "success" ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                    {pwMsg.text}
                  </div>
                )}

                <div className="space-y-4">
                  {[
                    { label: "Current Password", value: currentPassword, set: setCurrentPassword, show: showCurrent, setShow: setShowCurrent },
                    { label: "New Password", value: newPassword, set: setNewPassword, show: showNew, setShow: setShowNew },
                    { label: "Confirm New Password", value: confirmPassword, set: setConfirmPassword, show: showConfirm, setShow: setShowConfirm },
                  ].map(({ label, value, set, show, setShow }) => (
                    <div key={label}>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-1.5">{label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                        <Input
                          type={show ? "text" : "password"}
                          value={value}
                          onChange={e => set(e.target.value)}
                          className="pl-9 pr-10 bg-muted/30 border-border/60 rounded-xl"
                          placeholder="••••••••"
                        />
                        <button onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground">
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {newPassword && (
                    <div>
                      <div className="flex gap-1.5 mb-1">
                        {Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i < pwStrength ? (pwStrength >= 4 ? "bg-emerald-400" : pwStrength >= 3 ? "bg-blue-400" : pwStrength >= 2 ? "bg-amber-400" : "bg-red-400") : "bg-muted/60"}`} />
                        ))}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Strength: {["", "Weak", "Fair", "Good", "Strong"][pwStrength]}
                      </div>
                    </div>
                  )}

                  <Button onClick={handleChangePassword} disabled={changingPw || !currentPassword || !newPassword || !confirmPassword} className="w-full gradient-blue-purple text-white border-0 rounded-xl h-11 gap-2 shadow-lg shadow-primary/20">
                    {changingPw ? <><Loader2 className="w-4 h-4 animate-spin" /> Changing...</> : <><Shield className="w-4 h-4" /> Change Password</>}
                  </Button>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
