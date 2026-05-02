import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import {
  Menu, X, Car, Brain, Compass, LayoutDashboard,
  LogOut, ChevronRight, ChevronDown,
  Crown, Sun, Moon, User, Settings, Wallet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useBooking } from "@/context/BookingContext";
import { useTheme } from "@/context/ThemeContext";
import { YatraWheelsLogoMark } from "@/components/YatraWheelsLogo";

const navLinks = [
  { href: "/booking", label: "Fleet", icon: Car },
  { href: "/planner", label: "AI Planner", icon: Brain },
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const [location, navigate] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useBooking();
  const { theme, toggleTheme } = useTheme();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setUserMenuOpen(false); }, [location]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const initials = user ? user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "";

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "border-b border-border/60 bg-background/92 backdrop-blur-xl shadow-sm" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0" data-testid="link-logo">
            <div className="group-hover:scale-105 transition-transform duration-200">
              <YatraWheelsLogoMark size={34} />
            </div>
            <span className="text-lg font-bold tracking-tight">
              Yatra<span className="gradient-text">Wheels</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replace(/\s/g, "-")}`}>
                <span className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer block whitespace-nowrap
                  ${location === href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}
                  ${href === "/planner" && location !== "/planner" ? "text-primary/80 hover:text-primary" : ""}
                `}>
                  {label}
                </span>
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Upgrade button */}
            <Link href="/pricing" data-testid="link-pricing">
              <Button size="sm" className="text-xs gap-1.5 h-8 rounded-lg px-3 gradient-blue-purple text-white border-0 shadow-md shadow-primary/20">
                <Crown className="w-3 h-3" />
                Upgrade
              </Button>
            </Link>

            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-foreground/5 hover:bg-foreground/8 border border-border/60 transition-all"
                  data-testid="button-user-menu"
                >
                  <div className="w-6 h-6 rounded-lg gradient-blue-purple flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {initials}
                  </div>
                  <span className="text-sm font-medium max-w-[90px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.97 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-full mt-2 w-60 bg-card border border-card-border rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="px-4 py-3.5 border-b border-border/60">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl gradient-blue-purple flex items-center justify-center text-white text-sm font-bold shadow-md shadow-primary/20 shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-semibold truncate">{user.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                            {user.plan && (
                              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 mt-0.5 rounded-md text-[10px] font-semibold capitalize ${user.plan === "premium" ? "text-amber-400 bg-amber-400/10" : user.plan === "pro" ? "text-primary bg-primary/10" : "text-muted-foreground bg-muted/30"}`}>
                                {user.plan === "premium" && <Crown className="w-2.5 h-2.5" />}
                                {user.plan}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link href="/profile" onClick={() => setUserMenuOpen(false)}>
                          <span className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer">
                            <User className="w-4 h-4" /> My Profile
                          </span>
                        </Link>
                        <Link href="/dashboard" onClick={() => setUserMenuOpen(false)}>
                          <span className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer">
                            <LayoutDashboard className="w-4 h-4" /> My Bookings
                          </span>
                        </Link>
                        <Link href="/profile?tab=appearance" onClick={() => setUserMenuOpen(false)}>
                          <span className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer">
                            <Settings className="w-4 h-4" /> Appearance
                          </span>
                        </Link>
                        <Link href="/pricing" onClick={() => setUserMenuOpen(false)}>
                          <span className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors cursor-pointer">
                            <Wallet className="w-4 h-4" /> Plans & Billing
                          </span>
                        </Link>
                      </div>

                      {/* Theme toggle inline */}
                      <div className="px-4 py-2.5 border-t border-border/60">
                        <button
                          onClick={() => { toggleTheme(); setUserMenuOpen(false); }}
                          className="flex items-center justify-between w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <span className="flex items-center gap-2.5">
                            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {theme === "dark" ? "Switch to Light" : "Switch to Dark"}
                          </span>
                          <div className={`w-8 h-4 rounded-full relative transition-colors ${theme === "light" ? "bg-primary" : "bg-border"}`}>
                            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all ${theme === "light" ? "left-4" : "left-0.5"}`} />
                          </div>
                        </button>
                      </div>

                      {/* Sign out */}
                      <div className="border-t border-border/60 py-1">
                        <button
                          onClick={() => { logout(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/8 transition-colors"
                          data-testid="button-logout"
                        >
                          <LogOut className="w-4 h-4" /> Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link href="/auth" data-testid="link-login">
                  <Button variant="ghost" size="sm" className="text-sm text-muted-foreground hover:text-foreground h-8">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth" data-testid="link-signup">
                  <Button size="sm" className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 h-8 rounded-lg text-sm">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-all"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              data-testid="button-mobile-menu"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden border-t border-border/60 bg-background/98 backdrop-blur-xl overflow-hidden"
          >
            <div className="px-4 py-5 space-y-1 max-w-7xl mx-auto">
              {navLinks.map(({ href, label, icon: Icon }) => (
                <Link key={href} href={href} onClick={() => setMobileOpen(false)} data-testid={`link-mobile-${label.toLowerCase().replace(/\s/g, "-")}`}>
                  <span className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer
                    ${location === href ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"}`}>
                    <span className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      {label}
                    </span>
                    <ChevronRight className="w-4 h-4 opacity-40" />
                  </span>
                </Link>
              ))}

              <div className="pt-3 border-t border-border/60 space-y-2">
                <Link href="/pricing" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full justify-center gap-2 gradient-blue-purple text-white border-0 rounded-xl">
                    <Crown className="w-4 h-4" /> Upgrade Plan
                  </Button>
                </Link>
                {user ? (
                  <div className="space-y-1">
                    <div className="px-3 py-2 text-xs text-muted-foreground">Signed in as {user.name}</div>
                    <Link href="/profile" onClick={() => setMobileOpen(false)}>
                      <span className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-foreground/5 cursor-pointer transition-colors">
                        <User className="w-4 h-4" /> My Profile
                      </span>
                    </Link>
                    <button
                      className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-red-400 hover:bg-red-500/8 transition-colors"
                      onClick={() => { logout(); setMobileOpen(false); }}
                      data-testid="button-mobile-logout"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/auth" onClick={() => setMobileOpen(false)}>
                      <Button variant="ghost" className="w-full justify-center border border-border/60 rounded-xl" data-testid="button-mobile-signin">Sign In</Button>
                    </Link>
                    <Link href="/auth" onClick={() => setMobileOpen(false)}>
                      <Button className="w-full gradient-blue-purple text-white border-0 rounded-xl" data-testid="button-mobile-signup">Get Started</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
