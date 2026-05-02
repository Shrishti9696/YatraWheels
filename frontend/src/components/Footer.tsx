import { Link } from "wouter";
import { Instagram, Linkedin, Github, Mail, Heart } from "lucide-react";
import { YatraWheelsLogoMark } from "@/components/YatraWheelsLogo";

const SOCIAL_LINKS = [
  {
    Icon: Instagram,
    href: "https://www.instagram.com/yatrawheels_official",
    label: "Instagram",
  },
  {
    Icon: Linkedin,
    href: "https://www.linkedin.com/in/shrishti-yadav-177179325",
    label: "LinkedIn",
  },
  {
    Icon: Github,
    href: "https://github.com/Shrishti9696",
    label: "GitHub",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <YatraWheelsLogoMark size={32} />
              <span className="text-lg font-bold">
                Yatra<span className="gradient-text">Wheels</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-xs">
              Smart vehicle booking and AI travel planning for trips, weddings, and group transport across India.
            </p>
            <div className="flex items-center gap-2 mb-4">
              {SOCIAL_LINKS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
                  aria-label={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
            <div className="space-y-2">
              <a
                href="mailto:yatrawheels.official@gmail.com"
                className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-3.5 h-3.5 text-primary" />
                yatrawheels.official@gmail.com
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Services</h4>
            <ul className="space-y-2.5">
              {[
                { label: "Vehicle Booking", href: "/booking" },
                { label: "Group Transport", href: "/booking" },
                { label: "Airport Transfers", href: "/booking" },
                { label: "Destination Weddings", href: "/booking" },
                { label: "Corporate Travel", href: "/booking" },
                { label: "AI Trip Planner", href: "/planner" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Destinations</h4>
            <ul className="space-y-2.5">
              {["Udaipur", "Manali", "Goa", "Munnar", "Rishikesh", "Jaipur", "Kerala"].map(item => (
                <li key={item}>
                  <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", href: "#" },
                { label: "Careers", href: "#" },
                { label: "Pricing", href: "/pricing" },
                { label: "Blog", href: "#" },
                { label: "Contact", href: "#" },
                { label: "Privacy Policy", href: "#" },
                { label: "Terms of Service", href: "#" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} YatraWheels. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-red-400 fill-red-400" /> for travelers across India
          </p>
        </div>
      </div>
    </footer>
  );
}
