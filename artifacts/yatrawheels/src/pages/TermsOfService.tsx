import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function TermsOfService() {
  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Terms of Service</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Last updated: June 27, 2026</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-8 text-sm leading-relaxed text-muted-foreground">

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing or using YatraWheels ("Platform", "Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our platform. These terms apply to all users including customers, vendors, and drivers.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">2. Eligibility</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>You must be at least 18 years of age to use YatraWheels</li>
                <li>You must have a valid government-issued ID for booking verification</li>
                <li>Drivers must hold a valid commercial driving license issued in India</li>
                <li>Vendors must own or have legal authority over listed vehicles</li>
                <li>Your account information must be accurate and kept up to date</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">3. User Accounts</h2>
              <p>
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at <a href="mailto:yatrawheels.official@gmail.com" className="text-primary hover:underline">yatrawheels.official@gmail.com</a> of any unauthorized use of your account. YatraWheels is not liable for losses resulting from unauthorized account access due to your failure to keep credentials secure.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">4. Booking & Payments</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>All bookings are subject to vehicle availability and vendor approval</li>
                <li>Prices displayed include vehicle cost, distance charges, driver fee (if selected), and 10% platform fee (minimum ₹499)</li>
                <li>Payments are processed securely via Razorpay. YatraWheels does not store payment card details</li>
                <li>Booking is confirmed only upon successful payment processing</li>
                <li>Prices may vary based on demand, season, and distance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">5. Cancellation & Refund Policy</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-border rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left p-3 text-foreground font-semibold">Cancellation Time</th>
                      <th className="text-left p-3 text-foreground font-semibold">Refund</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr><td className="p-3">More than 48 hours before pickup</td><td className="p-3 text-green-400">100% refund</td></tr>
                    <tr><td className="p-3">24–48 hours before pickup</td><td className="p-3 text-yellow-400">75% refund</td></tr>
                    <tr><td className="p-3">12–24 hours before pickup</td><td className="p-3 text-orange-400">50% refund</td></tr>
                    <tr><td className="p-3">Less than 12 hours before pickup</td><td className="p-3 text-red-400">No refund</td></tr>
                    <tr><td className="p-3">No-show</td><td className="p-3 text-red-400">No refund</td></tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3">Refunds are credited to the original payment method within 5–7 business days.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">6. Vendor Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Vendors must list accurate vehicle information including capacity, features, and availability</li>
                <li>All listed vehicles must be roadworthy, insured, and compliant with Motor Vehicles Act, India</li>
                <li>Vendors receive 88% of the vehicle and distance charges after platform fee deduction</li>
                <li>Vendors must respond to booking requests within 2 hours</li>
                <li>False listing or fraudulent activity will result in immediate account suspension</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">7. Driver Responsibilities</h2>
              <ul className="list-disc list-inside space-y-1.5">
                <li>Drivers must hold a valid commercial driving license (badge required for hire vehicles)</li>
                <li>Drivers must maintain a professional demeanor and follow all traffic laws</li>
                <li>Driver fee is ₹1,000 per day, paid directly through the platform</li>
                <li>Drivers must not demand extra payment outside the platform</li>
                <li>Verified driver accounts require approval from YatraWheels admin team</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">8. Prohibited Activities</h2>
              <p>Users must not:</p>
              <ul className="list-disc list-inside space-y-1.5 mt-3">
                <li>Use the platform for any illegal purpose or in violation of Indian law</li>
                <li>Harass, threaten, or discriminate against other users, drivers, or vendors</li>
                <li>Create multiple accounts to abuse promotional offers</li>
                <li>Provide false information during registration or booking</li>
                <li>Reverse engineer, hack, or attempt to breach our security systems</li>
                <li>Circumvent the platform for off-platform transactions to avoid fees</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">9. AI Trip Planner (YatraBot)</h2>
              <p>
                Our AI Trip Planner is powered by OpenAI's GPT-4o-mini model. Trip plans, itineraries, and recommendations generated by YatraBot are for informational purposes only. YatraWheels does not guarantee the accuracy of AI-generated content. Always verify travel information with official sources before your trip.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">10. Limitation of Liability</h2>
              <p>
                YatraWheels is a marketplace platform connecting customers with vehicle vendors and drivers. We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-1.5 mt-3">
                <li>Accidents, injuries, or damages occurring during a trip</li>
                <li>Delays caused by traffic, weather, or other unforeseen circumstances</li>
                <li>Loss or damage to personal belongings during transit</li>
                <li>Actions or omissions of drivers or vendors</li>
              </ul>
              <p className="mt-3">Our total liability in any case shall not exceed the amount paid for the specific booking in question.</p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">11. Governing Law</h2>
              <p>
                These Terms of Service shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in India. Disputes shall first be attempted to be resolved through mutual negotiation.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">12. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be communicated via email or prominent notice on the platform. Continued use after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">13. Contact</h2>
              <div className="p-4 bg-card border border-card-border rounded-xl space-y-1.5">
                <div><strong className="text-foreground">YatraWheels Support</strong></div>
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
