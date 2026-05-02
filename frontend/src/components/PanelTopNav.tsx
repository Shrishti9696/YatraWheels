import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Menu, X, ChevronDown, User, Settings, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useBooking } from "@/context/BookingContext";
import { useTheme } from "@/context/ThemeContext";
import { YatraWheelsLogoMark } from "@/components/YatraWheelsLogo";

type NavItem = { href: string; label: string; icon: React.ElementType };

type Props = {
  navItems: NavItem[];
  roleLabel: string;
  roleBadgeClass: string;
};

export function PanelTopNav({ navItems, roleLabel, roleBadgeClass }: Props) {
  const [location, navigate] = useLocation();
  const { user, logout } = useBooking();
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const isDriver = user?.role === "driver";
  const profileHref = isDriver ? "/driver/profile" : "/vendor/profile";
  const settingsHref = isDriver ? "/driver/settings" : "/vendor/settings";

  const initials = user
    ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/88 backdrop-blur-xl border-b border-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-14 gap-6">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <YatraWheelsLogoMark size={30} />
              <span className="text-base font-bold hidden sm:block">
                Yatra<span className="gradient-text">Wheels</span>
              </span>
            </Link>

            {/* Role badge */}
            <span className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${roleBadgeClass}`}>
              {roleLabel}
            </span>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {navItems.map(({ href, label, icon: Icon }) => {
                const active = location === href || (href !== "/" && location.startsWith(href + "/") && !location.includes("/profile") && !location.includes("/settings"));
                return (
                  <Link key={href} href={href}>
                    <span className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer whitespace-nowrap
                      ${active
                        ? "bg-foreground/8 text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                      }`}>
                      <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                      {label}
                    </span>
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2 ml-auto">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
                title={theme === "dark" ? "Switch to light" : "Switch to dark"}
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* User menu */}
              {user && (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/8 border border-border/60 transition-all"
                  >
                    <div className="w-6 h-6 rounded-lg gradient-blue-purple flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                      {initials}
                    </div>
                    <span className="text-sm font-medium max-w-[120px] truncate">{user.name.split(" ")[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          className="fixed inset-0 z-40"
                          onClick={() => setUserMenuOpen(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 6, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-60 bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/25 overflow-hidden z-50"
                        >
                          {/* User info header */}
                          <div className="px-4 py-3.5 border-b border-border/60">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl gradient-blue-purple flex items-center justify-center text-white text-sm font-bold shrink-0">
                                {initials}
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold truncate">{user.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                                <span className={`inline-flex items-center px-1.5 py-0.5 mt-0.5 rounded-md text-[10px] font-semibold border capitalize ${roleBadgeClass}`}>
                                  {roleLabel}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="py-1">
                            {/* My Profile */}
                            <Link href={profileHref} onClick={() => setUserMenuOpen(false)}>
                              <span className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer">
                                <User className="w-4 h-4" /> My Profile
                              </span>
                            </Link>

                            {/* Account Settings — SEPARATE from profile */}
                            <Link href={settingsHref} onClick={() => setUserMenuOpen(false)}>
                              <span className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer">
                                <Settings className="w-4 h-4" /> Account Settings
                              </span>
                            </Link>
                          </div>

                          {/* Theme toggle */}
                          <div className="px-4 py-2.5 border-t border-border/60">
                            <button
                              onClick={() => { toggleTheme(); setUserMenuOpen(false); }}
                              className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                              <span className="flex items-center gap-2.5">
                                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                                {theme === "dark" ? "Light Mode" : "Dark Mode"}
                              </span>
                              <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === "light" ? "bg-primary" : "bg-border"}`}>
                                <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${theme === "light" ? "left-4" : "left-0.5"}`} />
                              </div>
                            </button>
                          </div>

                          <div className="border-t border-border/60 py-1">
                            <button
                              onClick={() => { logout(); setUserMenuOpen(false); navigate("/"); }}
                              className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/8 transition-colors"
                            >
                              <LogOut className="w-4 h-4" /> Sign out
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
                onClick={() => setMobileOpen(!mobileOpen)}
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile nav */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/60 bg-background/97 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map(({ href, label, icon: Icon }) => {
                  const active = location === href || location.startsWith(href + "/");
                  return (
                    <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                      <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                        ${active ? "bg-foreground/8 text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                        <Icon className={`w-4 h-4 ${active ? "text-primary" : ""}`} />
                        {label}
                      </span>
                    </Link>
                  );
                })}
                {user && (
                  <div className="pt-2 mt-2 border-t border-border/60 space-y-1">
                    <div className="px-3 py-1 text-xs text-muted-foreground">{user.name} · {roleLabel}</div>
                    <Link href={profileHref} onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer">
                        <User className="w-4 h-4" /> My Profile
                      </span>
                    </Link>
                    <Link href={settingsHref} onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center gap-2.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground rounded-xl transition-colors cursor-pointer">
                        <Settings className="w-4 h-4" /> Account Settings
                      </span>
                    </Link>
                    <button onClick={() => { logout(); navigate("/"); }} className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-500/8 rounded-xl transition-colors">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
