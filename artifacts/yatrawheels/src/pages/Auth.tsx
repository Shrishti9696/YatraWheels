import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Car, Truck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginUser, registerUser, setToken, setStoredUser } from "@/services/authService";
import { useBooking } from "@/context/BookingContext";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
const signupSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["user", "vendor", "driver"]),
  licenseNumber: z.string().optional(),
  city: z.string().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;
type SignupForm = z.infer<typeof signupSchema>;

const ROLES = [
  { value: "user", label: "Traveler", desc: "Book vehicles & plan trips", icon: Users },
  { value: "vendor", label: "Vehicle Owner", desc: "List & manage your fleet", icon: Truck },
  { value: "driver", label: "Driver", desc: "Provide driving services", icon: Car },
] as const;

function getRoleRedirect(role: string): string {
  if (role === "vendor") return "/vendor";
  if (role === "driver") return "/driver";
  return "/dashboard";
}

export default function Auth() {
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const { setUser } = useBooking();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "", role: "user", licenseNumber: "", city: "" },
  });

  const selectedRole = signupForm.watch("role");

  async function onLogin(v: LoginForm) {
    setLoginError("");
    try {
      const res = await loginUser(v);
      setToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      navigate(getRoleRedirect(res.user.role));
    } catch (err: any) {
      setLoginError(err.message || "Login failed. Please try again.");
    }
  }

  async function onSignup(v: SignupForm) {
    setSignupError("");
    try {
      const res = await registerUser(v);
      setToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      navigate(getRoleRedirect(res.user.role));
    } catch (err: any) {
      setSignupError(err.message || "Signup failed. Please try again.");
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4 relative overflow-hidden">
      <Link href="/" className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group z-10">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </Link>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/30">
            <MapPin className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold">
            Yatra<span className="gradient-text">Wheels</span>
          </span>
        </Link>

        <div className="bg-card border border-card-border rounded-3xl p-8 shadow-2xl">
          <Tabs defaultValue="login">
            <TabsList className="w-full bg-muted/50 mb-6">
              <TabsTrigger value="login" className="flex-1">Sign In</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Create Account</TabsTrigger>
            </TabsList>

            {/* ── LOGIN ── */}
            <TabsContent value="login">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-1">Welcome back</h2>
                <p className="text-sm text-muted-foreground">Sign in to your YatraWheels account</p>
              </div>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  {loginError && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{loginError}</div>
                  )}
                  <FormField control={loginForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="you@example.com" className="pl-9 bg-muted/50" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={loginForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} type={showPass ? "text" : "password"} placeholder="••••••••" className="pl-9 pr-9 bg-muted/50" />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPass(!showPass)}>
                            {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex justify-end">
                    <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                  </div>
                  <Button type="submit" className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-5 rounded-xl" disabled={loginForm.formState.isSubmitting}>
                    {loginForm.formState.isSubmitting ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                </form>
              </Form>
            </TabsContent>

            {/* ── SIGNUP ── */}
            <TabsContent value="signup">
              <div className="mb-5">
                <h2 className="text-xl font-bold mb-1">Create your account</h2>
                <p className="text-sm text-muted-foreground">Join YatraWheels as a traveler, vendor, or driver</p>
              </div>
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  {signupError && (
                    <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2">{signupError}</div>
                  )}

                  {/* Role selection */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">I want to join as</div>
                    <div className="grid grid-cols-3 gap-2">
                      {ROLES.map(({ value, label, desc, icon: Icon }) => {
                        const active = selectedRole === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => signupForm.setValue("role", value)}
                            className={`rounded-xl p-3 text-left border transition-all ${active ? "bg-primary/10 border-primary/30 text-primary" : "bg-muted/30 border-white/8 text-muted-foreground hover:border-white/15"}`}
                          >
                            <Icon className={`w-4 h-4 mb-1.5 ${active ? "text-primary" : ""}`} />
                            <div className="text-xs font-semibold">{label}</div>
                            <div className="text-xs opacity-70 leading-tight mt-0.5">{desc}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <FormField control={signupForm.control} name="name" render={({ field }) => (
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
                  )} />

                  <FormField control={signupForm.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="you@example.com" className="pl-9 bg-muted/50" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={signupForm.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="Min. 6 characters" className="pl-9 bg-muted/50" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  {selectedRole === "driver" && (
                    <>
                      <FormField control={signupForm.control} name="licenseNumber" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Driving License Number</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="e.g. MH0120210012345" className="bg-muted/50" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={signupForm.control} name="city" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your City (Base Location)</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input {...field} placeholder="e.g. Delhi, Mumbai, Bangalore" className="pl-9 bg-muted/50" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </>
                  )}

                  <Button type="submit" className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-5 rounded-xl mt-2" disabled={signupForm.formState.isSubmitting}>
                    {signupForm.formState.isSubmitting ? "Creating account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                </form>
              </Form>
              <p className="text-xs text-muted-foreground text-center mt-4">
                By signing up, you agree to our{" "}
                <a href="#" className="text-primary hover:underline">Terms</a> and{" "}
                <a href="#" className="text-primary hover:underline">Privacy Policy</a>.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </main>
  );
}
