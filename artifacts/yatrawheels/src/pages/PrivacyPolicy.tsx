import { motion } from "framer-motion";
import { Shield } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Privacy Policy</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Last updated: June 27, 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Introduction</h2>
              <p>
                Welcome to YatraWheels ("we", "our", or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform at yatrawheels.in or our mobile applications.
              </p>
              <p className="mt-2">
                By using YatraWheels, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Information We Collect</h2>
              <h3 className="text-base font-medium text-foreground mb-2">Personal Information You Provide</h3>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Name, email address, and phone number when you create an account</li>
                <li>Profile photo and government ID for driver verification</li>
                <li>Driving license number for drivers and vehicle owners</li>
                <li>Payment information (processed securely via Razorpay — we do not store card details)</li>
                <li>Trip preferences, pickup/drop locations, and travel dates</li>
              </ul>
              <h3 className="text-base font-medium text-foreground mb-2 mt-4">Information Collected Automatically</h3>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Device information (browser type, operating system, device identifiers)</li>
                <li>IP address and approximate location data</li>
                <li>Pages visited, features used, and time spent on our platform</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. How We Use Your Information</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>To process bookings, payments, and trip coordination</li>
                <li>To verify your identity and maintain account security</li>
                <li>To send booking confirmations, OTPs, and service updates via email</li>
                <li>To provide our AI Trip Planner (YatraBot) with personalized recommendations</li>
                <li>To match customers with available drivers and vehicles</li>
                <li>To prevent fraud, resolve disputes, and troubleshoot issues</li>
                <li>To improve our platform through anonymized usage analytics</li>
                <li>To send promotional offers (you can opt out at any time)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Information Sharing</h2>
              <p>We do not sell, trade, or rent your personal information to third parties. We may share your data only in the following circumstances:</p>
              <ul className="list-disc list-inside space-y-1.5 mt-3">
                <li><strong className="text-foreground">Drivers &amp; Vendors:</strong> Your name and contact details may be shared with your assigned driver or vehicle vendor to facilitate the trip</li>
                <li><strong className="text-foreground">Payment Processors:</strong> Razorpay processes all payments and is governed by their own privacy policy</li>
                <li><strong className="text-foreground">Legal Compliance:</strong> We may disclose data if required by law, court order, or government authority</li>
                <li><strong className="text-foreground">Business Transfers:</strong> In case of merger, acquisition, or sale of assets, your data may be transferred</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Data Security</h2>
              <p>
                We implement industry-standard security measures including SSL/TLS encryption, bcrypt password hashing, JWT-based session management, and secure HTTPS connections. Payment data is processed exclusively through PCI-DSS compliant Razorpay servers — we never store card details on our systems.
              </p>
              <p className="mt-2">
                While we strive to protect your data, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Cookies</h2>
              <p>
                We use cookies and local storage to maintain your login session, remember your theme preference (dark/light mode), and improve your browsing experience. You can control cookie settings through your browser. Disabling cookies may affect certain features of the platform.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-1.5 mt-3">
                <li>Access the personal data we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of marketing communications at any time</li>
                <li>Data portability — export your trip history and booking data</li>
              </ul>
              <p className="mt-3">To exercise these rights, contact us at <a href="mailto:yatrawheels.official@gmail.com" className="text-primary hover:underline">yatrawheels.official@gmail.com</a></p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Children's Privacy</h2>
              <p>
                YatraWheels is not intended for children under 18 years of age. We do not knowingly collect personal information from children under 18. If you are a parent or guardian and believe your child has provided us with personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. Continued use of YatraWheels after changes constitutes acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us:</p>
              <div className="mt-3 p-4 bg-card border border-card-border rounded-xl space-y-1.5">
                <div><strong className="text-foreground">YatraWheels</strong></div>
                <div>Email: <a href="mailto:yatrawheels.official@gmail.com" className="text-primary hover:underline">yatrawheels.official@gmail.com</a></div>
                <div>Instagram: <a href="https://www.instagram.com/yatrawheels_official" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@yatrawheels_official</a></div>
              </div>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
