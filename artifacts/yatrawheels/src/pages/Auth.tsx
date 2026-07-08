import { useState, useRef, useId } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Mail, Lock, User, Eye, EyeOff, ArrowRight, ArrowLeft, Car, Truck, Users, ShieldCheck, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginUser, registerUser, setToken, setStoredUser, verifyOTP, resendOTP } from "@/services/authService";
import type { OTPRequired } from "@/services/authService";
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

function OTPInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !value[i] && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function handleChange(i: number, v: string) {
    const digit = v.replace(/\D/g, "").slice(-1);
    const next = [...value];
    next[i] = digit;
    onChange(next);
    if (digit && i < 5) refs.current[i + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      onChange(pasted.split(""));
      refs.current[5]?.focus();
      e.preventDefault();
    }
  }

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={el => { refs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] || ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          className="w-11 h-12 text-center text-lg font-bold rounded-xl border border-white/15 bg-muted/50 focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/30 transition-all"
        />
      ))}
    </div>
  );
}

export default function Auth() {
  const [showPass, setShowPass] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");
  const [otpState, setOtpState] = useState<OTPRequired | null>(null);
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(6).fill(""));
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const termsId = useId();
  const { setUser } = useBooking();
  const [, navigate] = useLocation();

  const loginForm = useForm<LoginForm>({
    resolver: zodResolver(loginSchema as any),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupForm>({
    resolver: zodResolver(signupSchema as any),
    defaultValues: { name: "", email: "", password: "", role: "user", licenseNumber: "", city: "" },
  });

  const selectedRole = signupForm.watch("role");

  async function onLogin(v: LoginForm) {
    setLoginError("");
    try {
      const res = await loginUser(v);
      if ("requiresOTP" in res && res.requiresOTP) {
        setOtpState(res);
        setOtpDigits(Array(6).fill(""));
        setOtpError("");
      } else {
        const auth = res as import("@/services/authService").AuthResponse;
        setToken(auth.token);
        setStoredUser(auth.user);
        setUser(auth.user);
        navigate(getRoleRedirect(auth.user.role));
      }
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

  async function onVerifyOTP() {
    if (!otpState) return;
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Please enter the complete 6-digit code");
      return;
    }
    setOtpLoading(true);
    setOtpError("");
    try {
      const res = await verifyOTP({ userId: otpState.userId, otp: code });
      setToken(res.token);
      setStoredUser(res.user);
      setUser(res.user);
      navigate(getRoleRedirect(res.user.role));
    } catch (err: any) {
      setOtpError(err.message || "Invalid code. Please try again.");
      setOtpLoading(false);
    }
  }

  async function onResendOTP() {
    if (!otpState || resendCooldown > 0) return;
    try {
      await resendOTP(otpState.userId);
      setOtpDigits(Array(6).fill(""));
      setOtpError("");
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown(c => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch (err: any) {
      setOtpError(err.message || "Failed to resend code");
    }
  }

  if (otpState) {
    const roleLabel = otpState.role === "vendor" ? "Vendor" : "Driver";
    return (
      <main className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4 relative overflow-hidden">
        <button
          onClick={() => { setOtpState(null); loginForm.reset(); }}
          className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group z-10"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back
        </button>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/3 w-96 h-96 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/8 blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
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
            <div className="flex flex-col items-center text-center mb-7">
              <div className="w-14 h-14 rounded-2xl gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">Verify Your Identity</h2>
              <p className="text-sm text-muted-foreground">
                A 6-digit code was sent to your email as part of {roleLabel} two-factor authentication.
              </p>
              <p className="text-sm font-medium mt-2 text-primary">{otpState.email}</p>
            </div>

            <div className="space-y-5">
              <OTPInput value={otpDigits} onChange={setOtpDigits} />

              <AnimatePresence>
                {otpError && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2 text-center"
                  >
                    {otpError}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                onClick={onVerifyOTP}
                disabled={otpLoading || otpDigits.join("").length !== 6}
                className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-5 rounded-xl"
              >
                {otpLoading ? "Verifying..." : <><span>Verify & Sign In</span><ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>

              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-2">Didn't receive the code?</p>
                <button
                  onClick={onResendOTP}
                  disabled={resendCooldown > 0}
                  className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    );
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

                  {/* Terms & Privacy checkbox */}
                  <div className="flex items-start gap-3 pt-1">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        id={termsId}
                        type="checkbox"
                        checked={termsAccepted}
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="sr-only peer"
                      />
                      <label
                        htmlFor={termsId}
                        className={`flex items-center justify-center w-4.5 h-4.5 rounded-md border-2 cursor-pointer transition-all select-none
                          ${termsAccepted
                            ? "bg-primary border-primary"
                            : "bg-muted/40 border-border hover:border-primary/60"
                          }`}
                        style={{ width: 18, height: 18 }}
                      >
                        {termsAccepted && (
                          <svg viewBox="0 0 12 10" fill="none" className="w-2.5 h-2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="1,5 4,8.5 11,1" />
                          </svg>
                        )}
                      </label>
                    </div>
                    <label htmlFor={termsId} className="text-xs text-muted-foreground leading-relaxed cursor-pointer select-none">
                      I have read and agree to the{" "}
                      <Link href="/terms" onClick={e => e.stopPropagation()}>
                        <span className="text-primary hover:underline font-medium">Terms of Service</span>
                      </Link>{" "}
                      and{" "}
                      <Link href="/privacy" onClick={e => e.stopPropagation()}>
                        <span className="text-primary hover:underline font-medium">Privacy Policy</span>
                      </Link>
                    </label>
                  </div>

                  {!termsAccepted && signupForm.formState.isSubmitted && (
                    <p className="text-xs text-red-400">You must accept the terms to create an account.</p>
                  )}

                  <Button
                    type="submit"
                    className={`w-full text-white border-0 shadow-lg py-5 rounded-xl mt-1 transition-all ${
                      termsAccepted
                        ? "gradient-blue-purple shadow-primary/25"
                        : "bg-muted/50 shadow-none cursor-not-allowed opacity-60"
                    }`}
                    disabled={signupForm.formState.isSubmitting || !termsAccepted}
                  >
                    {signupForm.formState.isSubmitting ? "Creating account..." : <><span>Create Account</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </motion.div>
    </main>
  );
}
