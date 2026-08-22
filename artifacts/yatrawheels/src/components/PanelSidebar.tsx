import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useBooking } from "@/context/BookingContext";

type NavItem = { href: string; label: string; icon: React.ElementType };

type Props = {
  title: string;
  subtitle: string;
  navItems: NavItem[];
  accentColor?: string;
};

export function PanelSidebar({ title, subtitle, navItems, accentColor = "text-primary" }: Props) {
  const [location] = useLocation();
  const { user, logout } = useBooking();
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-5 py-6 border-b border-white/8">
        <Link href="/" className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/30">
            <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-base font-bold">
            Yatra<span className="gradient-text">Wheels</span>
          </span>
        </Link>
        <div className={`text-xs font-semibold uppercase tracking-widest ${accentColor} mb-0.5`}>{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = location === href || (href !== "/" && location.startsWith(href));
          return (
            <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
              <span className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer
                ${active ? "bg-primary/12 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
                <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary" : ""}`} />
                {label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-white/8 space-y-3">
        <Link href="/">
          <span className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <MapPin className="w-3.5 h-3.5" /> Back to main site
          </span>
        </Link>
        {user && (
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-foreground truncate">{user.name}</div>
              <div className="text-xs text-muted-foreground truncate">{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-card border-r border-white/8 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card/95 backdrop-blur-xl border-b border-white/8 sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg gradient-blue-purple flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold">Yatra<span className="gradient-text">Wheels</span></span>
        </Link>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${accentColor}`}>{title}</span>
          <button
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 h-full w-64 bg-card border-r border-white/8 z-50 flex flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
