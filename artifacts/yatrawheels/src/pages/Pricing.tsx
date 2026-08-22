import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Zap, Check, Crown, Star, ArrowRight, Sparkles, Shield, RotateCcw, Brain,
  ChevronLeft, Loader2, BadgeCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { authHeaders, getToken } from "@/services/authService";
import { useBooking } from "@/context/BookingContext";

const API_BASE = "/api";

interface PlanStatus {
  plan: "free" | "pro" | "premium";
  usageCount: number;
  usageLimit: number | null;
  unlimited: boolean;
  nextReset: string;
  pricing: {
    pro: { price: number; currency: string; limit: number };
    premium: { price: number; currency: string; limit: string };
  };
}

const PLANS = [
  {
    key: "free" as const,
    name: "Free",
    price: 0,
    priceLabel: "₹0",
    period: "forever",
    limit: "5 AI requests / month",
    limitNum: 5,
    badge: null,
    icon: Star,
    iconColor: "text-muted-foreground",
    borderClass: "border-white/10",
    bgClass: "",
    features: [
      "5 AI travel plans per month",
      "Day-by-day itineraries",
      "Budget breakdown",
      "Vehicle recommendations",
      "Zapier email delivery",
    ],
    cta: "Your current plan",
    ctaDisabled: true,
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: 499,
    priceLabel: "₹499",
    period: "/ month",
    limit: "100 AI requests / month",
    limitNum: 100,
    badge: "Most Popular",
    icon: Zap,
    iconColor: "text-primary",
    borderClass: "border-primary/40",
    bgClass: "bg-primary/5",
    features: [
      "100 AI travel plans per month",
      "Day-by-day itineraries",
      "Budget breakdown",
      "Vehicle recommendations",
      "Zapier email delivery",
      "Priority AI generation",
    ],
    cta: "Upgrade to Pro",
    ctaDisabled: false,
  },
  {
    key: "premium" as const,
    name: "Premium",
    price: 999,
    priceLabel: "₹999",
    period: "/ month",
    limit: "Unlimited AI requests",
    limitNum: -1,
    badge: "Best Value",
    icon: Crown,
    iconColor: "text-amber-400",
    borderClass: "border-amber-400/30",
    bgClass: "bg-amber-400/5",
    features: [
      "Unlimited AI travel plans",
      "Day-by-day itineraries",
      "Budget breakdown",
      "Vehicle recommendations",
      "Zapier email delivery",
      "Priority AI generation",
      "Early access to new features",
    ],
    cta: "Upgrade to Premium",
    ctaDisabled: false,
  },
];

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Pricing() {
  const [, navigate] = useLocation();
  const { user } = useBooking();
  const { toast } = useToast();
  const [status, setStatus] = useState<PlanStatus | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [upgradingPlan, setUpgradingPlan] = useState<"pro" | "premium" | null>(null);
  const [upgraded, setUpgraded] = useState<string | null>(null);

  useEffect(() => {
    if (user && getToken()) {
      fetchStatus();
    }
  }, [user]);

  async function fetchStatus() {
    setLoadingStatus(true);
    try {
      const res = await fetch(`${API_BASE}/upgrade/status`, {
        headers: { ...authHeaders() },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch {
      // ignore
    } finally {
      setLoadingStatus(false);
    }
  }

  async function handleUpgrade(plan: "pro" | "premium") {
    if (!user || !getToken()) {
      navigate("/auth");
      return;
    }

    setUpgradingPlan(plan);
    try {
      const orderRes = await fetch(`${API_BASE}/upgrade/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders() },
        body: JSON.stringify({ plan }),
      });
      const order = await orderRes.json();

      if (!orderRes.ok) {
        toast({ title: "Error", description: order.message || "Could not create order", variant: "destructive" });
        return;
      }

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast({ title: "Error", description: "Could not load payment gateway. Check your connection.", variant: "destructive" });
        return;
      }

      const planLabel = plan === "pro" ? "Pro — ₹499/month" : "Premium — ₹999/month";

      const rzp = new (window as any).Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "YatraWheels",
        description: `Upgrade to ${planLabel}`,
        order_id: order.orderId,
        theme: { color: "#6366f1" },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch(`${API_BASE}/upgrade/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...authHeaders() },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                plan,
              }),
            });
            const result = await verifyRes.json();

            if (verifyRes.ok && result.success) {
              setUpgraded(plan);
              setStatus((prev) =>
                prev
                  ? {
                      ...prev,
                      plan,
                      unlimited: plan === "premium",
                      usageLimit: plan === "premium" ? null : (plan === "pro" ? 100 : 5),
                    }
                  : prev
              );
              toast({ title: "Upgrade successful!", description: result.message });
            } else {
              toast({ title: "Verification failed", description: result.message, variant: "destructive" });
            }
          } catch {
            toast({ title: "Error", description: "Payment verification failed. Contact support.", variant: "destructive" });
          }
        },
        modal: {
          ondismiss: () => setUpgradingPlan(null),
        },
      });

      rzp.open();
    } catch {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" });
    } finally {
      setUpgradingPlan(null);
    }
  }

  const currentPlan = status?.plan ?? "free";

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors group">
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </button>
        </Link>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Travel Planning
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get personalised AI travel plans, vehicle recommendations and instant itineraries — choose the plan that fits you.
          </p>
        </motion.div>

        {/* Current usage bar (logged in users) */}
        {user && status && !loadingStatus && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 glass-card rounded-2xl p-5 border border-white/10 max-w-xl mx-auto"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">
                  Your plan: <span className="text-primary capitalize">{status.plan}</span>
                </span>
              </div>
              <span className="text-xs text-muted-foreground">
                Resets {new Date(status.nextReset).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
            {status.unlimited ? (
              <div className="text-sm text-emerald-400 font-medium">Unlimited AI requests — enjoy!</div>
            ) : (
              <>
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>{status.usageCount} used</span>
                  <span>{status.usageLimit} limit</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-primary to-purple-500 transition-all"
                    style={{ width: `${Math.min(100, ((status.usageCount) / (status.usageLimit ?? 1)) * 100)}%` }}
                  />
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* Plan cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {PLANS.map((plan, i) => {
            const Icon = plan.icon;
            const isCurrent = currentPlan === plan.key;
            const isUpgrading = upgradingPlan === plan.key;
            const isUpgraded = upgraded === plan.key;
            const isLowerThanCurrent =
              (currentPlan === "pro" && plan.key === "free") ||
              (currentPlan === "premium" && (plan.key === "free" || plan.key === "pro"));

            return (
              <motion.div
                key={plan.key}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className={`relative glass-card rounded-2xl border p-7 flex flex-col ${plan.borderClass} ${plan.bgClass}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary text-white shadow-lg shadow-primary/30">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.bgClass || "bg-white/5"} border border-white/10`}>
                    <Icon className={`w-5 h-5 ${plan.iconColor}`} />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{plan.name}</div>
                    <div className="text-xs text-muted-foreground">{plan.limit}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.priceLabel}</span>
                  {plan.price > 0 && (
                    <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                  )}
                </div>

                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {feat}
                    </li>
                  ))}
                </ul>

                {isCurrent || isUpgraded ? (
                  <Button disabled className="w-full rounded-xl gap-2 bg-white/5 text-muted-foreground border border-white/10">
                    <BadgeCheck className="w-4 h-4" />
                    {isUpgraded ? "Upgraded!" : "Current Plan"}
                  </Button>
                ) : isLowerThanCurrent ? (
                  <Button disabled className="w-full rounded-xl gap-2 opacity-40 bg-white/5 text-muted-foreground border border-white/10">
                    Not Available
                  </Button>
                ) : plan.key === "free" ? (
                  <Button disabled className="w-full rounded-xl gap-2 bg-white/5 text-muted-foreground border border-white/10">
                    Free Forever
                  </Button>
                ) : !user ? (
                  <Link href="/auth">
                    <Button className="w-full rounded-xl gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 gap-2">
                      Sign In to Upgrade
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                ) : (
                  <Button
                    className="w-full rounded-xl gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 gap-2"
                    onClick={() => handleUpgrade(plan.key as "pro" | "premium")}
                    disabled={isUpgrading}
                  >
                    {isUpgrading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Opening payment…
                      </>
                    ) : (
                      <>
                        {plan.cta}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
          {[
            { icon: Shield, label: "Secure payments via Razorpay" },
            { icon: RotateCcw, label: "Usage resets every 30 days" },
            { icon: Brain, label: "Powered by OpenAI GPT-4o mini" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-2">
              <Icon className="w-4 h-4 text-primary" />
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
