import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Upload, CheckCircle, AlertCircle, Shield, 
  FileText, ArrowLeft, Loader2, Image as ImageIcon
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProfile, uploadLicense } from "@/services/driverService";
import { toast } from "sonner";
import { PanelTopNav } from "@/components/PanelTopNav";

export default function DriverOnboarding() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    getProfile()
      .then((data) => {
        setProfile(data);
        setLicenseNumber(data.licenseNumber || "");
      })
      .catch(toast.error)
      .finally(() => setLoading(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!licenseNumber || !preview) {
      return toast.error("Please provide both license number and image");
    }

    setSubmitting(true);
    try {
      await uploadLicense({
        licenseNumber,
        licenseImageUrl: preview // In production, we'd upload to Cloudinary first
      });
      toast.success("License submitted for review!");
      setLocation("/driver");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const status = profile?.status;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PanelTopNav navItems={[]} roleLabel="Driver" />

      <main className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/driver">
          <Button variant="ghost" className="mb-8 gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-card-border rounded-3xl p-8"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Driver Verification</h1>
              <p className="text-sm text-muted-foreground">Upload your documents to start receiving trips</p>
            </div>
          </div>

          {status === "approved" ? (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
               <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
               <h2 className="text-xl font-bold text-emerald-400">Verified Account</h2>
               <p className="text-sm text-muted-foreground mt-2">Your driver profile is active and verified.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {status === "rejected" && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <div>
                    <div className="text-sm font-bold text-red-400">Application Rejected</div>
                    <p className="text-xs text-muted-foreground">{profile?.rejectionReason || "Please re-upload clear documents."}</p>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">License Number</label>
                  <Input 
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    placeholder="e.g. DL-1420230001234"
                    className="bg-white/5 border-white/10 rounded-xl h-12"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">Driving License Image</label>
                  <div className="relative group">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                    />
                    <div className="border-2 border-dashed border-white/10 rounded-2xl p-12 text-center group-hover:border-primary/40 transition-colors bg-white/2">
                      {preview ? (
                        <div className="relative aspect-video max-w-sm mx-auto rounded-xl overflow-hidden">
                          <img src={preview} alt="License Preview" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <ImageIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                          <p className="text-sm font-medium">Click or drag to upload license</p>
                          <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSubmit}
                disabled={submitting || status === "pending"}
                className="w-full gradient-blue-purple h-14 rounded-2xl text-white font-bold text-lg shadow-xl shadow-primary/20"
              >
                {submitting ? "Submitting..." : status === "pending" ? "Review in Progress" : "Submit for Verification"}
              </Button>
            </div>
          )}
        </motion.div>

        <div className="mt-8 flex items-start gap-3 px-4">
          <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            By submitting these documents, you agree to our Driver Terms of Service. Verification typically takes 24-48 hours. Ensure the license image is clear and all details are legible.
          </p>
        </div>
      </main>
    </div>
  );
}
