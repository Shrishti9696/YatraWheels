import { motion } from "framer-motion";
import { useState } from "react";
import { Mail, Instagram, MessageCircle, Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CONTACT_CHANNELS = [
  {
    icon: Mail,
    label: "Email Us",
    value: "yatrawheels.official@gmail.com",
    desc: "We reply within 24 hours",
    href: "mailto:yatrawheels.official@gmail.com",
  },
  {
    icon: Instagram,
    label: "Instagram",
    value: "@yatrawheels_official",
    desc: "DM us for quick queries",
    href: "https://www.instagram.com/yatrawheels_official",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "9 AM – 9 PM IST",
    desc: "Monday to Saturday",
    href: null,
  },
];

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 900));
    setSubmitting(false);
    setSubmitted(true);
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Get in Touch</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Have a question, feedback, or need help with a booking? We're here to help.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8">

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            {CONTACT_CHANNELS.map(({ icon: Icon, label, value, desc, href }) => (
              <div key={label} className="bg-card border border-card-border rounded-2xl p-5 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground mb-0.5">{label}</div>
                  {href ? (
                    <a
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline block"
                    >
                      {value}
                    </a>
                  ) : (
                    <div className="text-sm text-foreground">{value}</div>
                  )}
                  <div className="text-xs text-muted-foreground mt-0.5">{desc}</div>
                </div>
              </div>
            ))}

            <div className="bg-card border border-card-border rounded-2xl p-5">
              <div className="text-sm font-semibold text-foreground mb-3">For Business / Partnerships</div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Want to list your vehicles on YatraWheels or partner with us for corporate travel? Email us with subject line <span className="text-primary">"Partnership Inquiry"</span> and we'll get back within 48 hours.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="lg:col-span-3"
          >
            <div className="bg-card border border-card-border rounded-2xl p-6">
              {submitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-lg font-bold mb-2">Message Sent!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    Thanks for reaching out. We'll reply to <span className="text-foreground">{form.email}</span> within 24 hours.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 border-white/10 hover:bg-white/5"
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h2 className="text-lg font-semibold mb-5">Send us a Message</h2>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Your Name *</label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Priya Sharma"
                        className="bg-background border-white/10"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1.5 block">Email Address *</label>
                      <Input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="priya@example.com"
                        className="bg-background border-white/10"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Subject</label>
                    <select
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full h-10 rounded-lg border border-white/10 bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <option value="">Select a subject</option>
                      <option value="Booking Support">Booking Support</option>
                      <option value="Payment Issue">Payment Issue</option>
                      <option value="Vehicle Listing">Vehicle Listing / Vendor Signup</option>
                      <option value="Driver Registration">Driver Registration</option>
                      <option value="Partnership">Partnership Inquiry</option>
                      <option value="Feedback">Feedback / Suggestions</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1.5 block">Message *</label>
                    <textarea
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Describe your query in detail..."
                      rows={5}
                      className="w-full rounded-lg border border-white/10 bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                      required
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <MessageCircle className="w-4 h-4" />
                        Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
