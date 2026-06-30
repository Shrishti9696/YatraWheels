import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Send, Sparkles, MapPin, Calendar, Wallet, Users, Mail, User, CheckCircle, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const leadSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  destination: z.string().min(2, "Enter a destination"),
  budget: z.string().min(1, "Enter your budget"),
  dates: z.string().min(3, "Enter your travel dates"),
});
type LeadForm = z.infer<typeof leadSchema>;

interface LeadResponse {
  success: boolean;
  message: string;
  aiPlan?: string;
}

export default function LeadCapture() {
  const [result, setResult] = useState<LeadResponse | null>(null);
  const [serverError, setServerError] = useState("");

  const form = useForm<LeadForm>({
    resolver: zodResolver(leadSchema as any),
    defaultValues: { name: "", email: "", destination: "", budget: "", dates: "" },
  });

  async function onSubmit(values: LeadForm) {
    setServerError("");
    setResult(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data: LeadResponse = await res.json();
      if (!res.ok && res.status !== 409) {
        setServerError(data.message || "Something went wrong. Please try again.");
        return;
      }
      setResult(data);
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    }
  }

  return (
    <main className="min-h-screen pt-20 pb-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <div className="relative max-w-2xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-8">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>

        <AnimatePresence mode="wait">
          {result?.success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Your AI Travel Plan is Ready!</h2>
              <p className="text-muted-foreground mb-8">We'll also send a copy to your email shortly.</p>

              <div className="bg-card border border-card-border rounded-2xl p-6 text-left mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-7 h-7 rounded-lg gradient-blue-purple flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-semibold text-sm">AI-Generated Travel Plan</span>
                </div>
                <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {result.aiPlan}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/booking">
                  <Button className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 px-6">
                    Book a Vehicle
                  </Button>
                </Link>
                <Button variant="outline" className="border-white/10 hover:bg-white/5" onClick={() => { setResult(null); form.reset(); }}>
                  Plan Another Trip
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-5">
                  <Sparkles className="w-3.5 h-3.5" />
                  AI-Powered Travel Planning
                </div>
                <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                  Get Your Free <span className="gradient-text">AI Travel Plan</span>
                </h1>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Fill in your trip details and our AI will instantly generate a personalised itinerary, budget breakdown, and vehicle recommendations.
                </p>
              </div>

              <div className="bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    {serverError && (
                      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                        {serverError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="Aryan Kapoor" className="pl-9 bg-muted/50" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} type="email" placeholder="you@example.com" className="pl-9 bg-muted/50" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="destination"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} placeholder="e.g. Goa, Manali, Rajasthan, Kerala" className="pl-9 bg-muted/50" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <FormField
                        control={form.control}
                        name="budget"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Budget</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="e.g. ₹50,000 for 5 days" className="pl-9 bg-muted/50" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dates"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Travel Dates</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input {...field} placeholder="e.g. Dec 20 – Dec 27, 2025" className="pl-9 bg-muted/50" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-5 rounded-xl mt-2"
                    >
                      {form.formState.isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating your AI plan...</>
                      ) : (
                        <><Sparkles className="w-4 h-4 mr-2" />Generate My Free Travel Plan</>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      Your data is safe with us. No spam, ever.
                    </p>
                  </form>
                </Form>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-6">
                {[
                  { icon: Sparkles, label: "AI-Powered", desc: "Personalised itinerary" },
                  { icon: Wallet, label: "Budget Smart", desc: "Optimised spending" },
                  { icon: Users, label: "Expert Picks", desc: "Curated recommendations" },
                ].map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="bg-card border border-card-border rounded-xl p-4 text-center">
                    <Icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <div className="text-xs font-semibold mb-0.5">{label}</div>
                    <div className="text-xs text-muted-foreground">{desc}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
