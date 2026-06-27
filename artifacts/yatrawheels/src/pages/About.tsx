import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, Target, Heart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "Cities Covered", value: "50+" },
  { label: "Vehicles Available", value: "500+" },
  { label: "Happy Travelers", value: "10K+" },
  { label: "Verified Drivers", value: "200+" },
];

const VALUES = [
  {
    icon: Shield,
    title: "Safety First",
    desc: "Every driver is background-verified. Every vehicle is insured and roadworthy. Your safety is non-negotiable.",
  },
  {
    icon: Zap,
    title: "AI-Powered Planning",
    desc: "YatraBot, our intelligent travel assistant, crafts personalized itineraries in seconds based on your budget and preferences.",
  },
  {
    icon: Heart,
    title: "Made for India",
    desc: "We understand the diversity of India's terrain, cities, and travel culture — from Himalayan road trips to coastal escapes.",
  },
  {
    icon: Target,
    title: "Transparent Pricing",
    desc: "No hidden charges. What you see is what you pay — vehicle cost, distance, driver fee, and platform fee all shown upfront.",
  },
];

export default function About() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
            About <span className="gradient-text">YatraWheels</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            India's first AI-powered vehicle booking and travel planning marketplace — connecting travelers with the perfect vehicle for every journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16"
        >
          {STATS.map(({ label, value }) => (
            <div key={label} className="bg-card border border-card-border rounded-2xl p-6 text-center">
              <div className="text-3xl font-bold gradient-text mb-1">{value}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card border border-card-border rounded-2xl p-8 mb-12"
        >
          <h2 className="text-2xl font-bold mb-4">Our Story</h2>
          <div className="text-muted-foreground space-y-4 leading-relaxed">
            <p>
              YatraWheels was born from a simple frustration — planning a road trip in India was unnecessarily complicated. Unreliable drivers, opaque pricing, and no way to plan the actual trip itinerary all in one place.
            </p>
            <p>
              We set out to build the platform we wished existed: a marketplace that brings together verified vehicle vendors, professional drivers, and an AI travel assistant — all under one roof. Whether you're heading to the mountains of Manali, the beaches of Goa, or the heritage sites of Rajasthan, YatraWheels has you covered.
            </p>
            <p>
              Today, we serve travelers across 50+ Indian cities with a fleet ranging from budget hatchbacks to luxury limousines and 32-seater Volvo buses. Our AI planner, YatraBot, has helped thousands of travelers discover hidden gems and craft perfect itineraries.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">Our Values</h2>
          <div className="grid sm:grid-cols-2 gap-5">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-card-border rounded-2xl p-6 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-8 text-center"
        >
          <h2 className="text-2xl font-bold mb-3">Ready to Start Your Journey?</h2>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Browse our fleet of 500+ vehicles or let YatraBot plan your perfect trip with AI.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/booking">
              <Button className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25">
                Browse Vehicles
              </Button>
            </Link>
            <Link href="/planner">
              <Button variant="outline" className="border-white/10 hover:bg-white/5">
                Plan with AI
              </Button>
            </Link>
          </div>
        </motion.div>

      </div>
    </main>
  );
}
