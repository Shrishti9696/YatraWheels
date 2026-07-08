import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { resetPassword } from "@/services/authService";

export default function ResetPassword() {
  const [search] = useState(() => window.location.search);
  const token = new URLSearchParams(search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!token) setError("Reset link is missing or invalid. Please request a new one.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirm) { setError("Passwords do not match"); return; }
    setLoading(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Failed to reset password. The link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center pt-16 pb-10 px-4 relative overflow-hidden">
      <Link href="/auth" className="absolute top-5 left-5 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group z-10">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back to Sign In
      </Link>

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
          {done ? (
            <div className="flex flex-col items-center text-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold mb-2">Password Reset!</h2>
                <p className="text-sm text-muted-foreground">Your password has been updated. You can now sign in with your new password.</p>
              </div>
              <Button
                onClick={() => navigate("/auth")}
                className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-5 rounded-xl"
              >
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center text-center mb-7">
                <div className="w-14 h-14 rounded-2xl gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold mb-1">Set New Password</h2>
                <p className="text-sm text-muted-foreground">Choose a strong password for your account.</p>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
                  <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">New Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Min. 6 characters"
                      className="pl-9 pr-9 bg-muted/50"
                      required
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowPass(!showPass)}>
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1.5 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Re-enter password"
                      className="pl-9 pr-9 bg-muted/50"
                      required
                    />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-xs text-red-400 mt-1.5">Passwords do not match</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading || !token}
                  className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-5 rounded-xl mt-2"
                >
                  {loading ? "Resetting..." : <><span>Reset Password</span><ArrowRight className="w-4 h-4 ml-2" /></>}
                </Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </main>
  );
}
