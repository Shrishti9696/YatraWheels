import { useBooking } from "@/context/BookingContext";
import { motion } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, CheckCircle, Star, Users, Shield, Calendar, MapPin, CreditCard, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import { useFeatures } from "@/context/FeatureContext";
import { mockVehicles } from "@/data/mockData";
import { useState } from "react";
import { createBookingAPI, createPaymentOrder, verifyPaymentAPI } from "@/services/api";
import { getToken } from "@/services/authService";
import { RouteMap } from "@/components/RouteMap";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingDetails() {
  const { features } = useFeatures();
  const { id } = useParams<{ id: string }>();
  const { selectedVehicle: ctxVehicle, tripParams, user } = useBooking();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [, navigate] = useLocation();

  const vehicle = ctxVehicle || mockVehicles.find((v) => v.id === id) || mockVehicles[0];

  const days = 2;
  const subtotal = vehicle.pricePerDay * days;
  const tax = Math.round(subtotal * 0.18);
  const serviceFee = 499;
  const total = subtotal + tax + serviceFee;

  async function handleConfirm() {
    setError("");

    if (!user) {
      navigate("/auth");
      return;
    }

    if (!getToken()) {
      navigate("/auth");
      return;
    }

    if (!window.Razorpay) {
      setError("Payment system is loading. Please try again in a moment.");
      return;
    }

    setLoading(true);

    try {
      const pickupLocation = tripParams.from || "Delhi, India";
      const dropLocation = tripParams.to || "Agra, India";
      const date = tripParams.date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const passengers = tripParams.passengers || 2;

      const { booking, pricing } = await createBookingAPI({
        vehicleId: vehicle.id,
        pickupLocation,
        dropLocation,
        date,
        passengers,
      });

      const orderData = await createPaymentOrder(booking._id);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "YatraWheels",
        description: `${vehicle.name} — ${pickupLocation} to ${dropLocation}`,
        order_id: orderData.orderId,
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#5b67f5" },
        modal: {
          ondismiss() {
            setLoading(false);
            setError("Payment was cancelled.");
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await verifyPaymentAPI({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: booking._id,
            });
            setBookingRef(booking._id.slice(-8).toUpperCase());
            setConfirmed(true);
          } catch (verifyErr: any) {
            setError(verifyErr.message || "Payment verification failed.");
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setLoading(false);
      setError(err.message || "Something went wrong. Please try again.");
    }
  }

  if (confirmed) {
    return (
      <main className="pt-24 pb-20 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
          data-testid="booking-confirmed"
        >
          <div className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Booking Confirmed!</h2>
          <p className="text-muted-foreground mb-2">
            Your {vehicle.name} has been reserved and payment received.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Booking ID: <span className="font-mono text-primary">YW-{bookingRef}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/dashboard">
              <Button className="w-full gradient-blue-purple text-white border-0" data-testid="button-view-dashboard">
                View in Dashboard
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5" data-testid="button-back-home">
                Back to Home
              </Button>
            </Link>
          </div>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link href="/booking" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors" data-testid="link-back-to-booking">
            <ArrowLeft className="w-4 h-4" />
            Back to vehicles
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-8" data-testid="text-booking-details-heading">Booking Details</h1>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-card border border-card-border rounded-2xl overflow-hidden">
                <div className="relative h-48">
                  <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30 capitalize">
                      {vehicle.type}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{vehicle.name}</h2>
                      <div className="flex items-center gap-1 mt-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{vehicle.rating}</span>
                        <span className="text-sm text-muted-foreground">({vehicle.reviewCount} reviews)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold">₹{vehicle.pricePerDay.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground">per day</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 mb-4 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Up to {vehicle.capacity} passengers</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {vehicle.features.map((f) => (
                      <div key={f} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-xs text-muted-foreground">
                        <CheckCircle className="w-3 h-3 text-primary/60" />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-card border border-card-border rounded-2xl p-5 space-y-4">
                <h3 className="font-semibold">Trip Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Pickup</div>
                      <div className="text-sm font-medium">{tripParams.from || "Delhi, India"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Drop-off</div>
                      <div className="text-sm font-medium">{tripParams.to || "Agra, India"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Date</div>
                      <div className="text-sm font-medium">{tripParams.date || "Dec 15, 2025"}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <div className="text-xs text-muted-foreground">Passengers</div>
                      <div className="text-sm font-medium">{tripParams.passengers || 2}</div>
                    </div>
                  </div>
                </div>

                {/* Route map */}
                {features.LIVE_TRACKING ? (
                  <RouteMap
                    from={tripParams.from || "Delhi, India"}
                    to={tripParams.to || "Agra, India"}
                    className="h-52 mt-2"
                  />
                ) : (
                  <div className="h-52 mt-2 bg-muted/30 border border-dashed border-white/10 rounded-xl flex items-center justify-center p-4">
                    <div className="text-center">
                      <MapPin className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                      <div className="text-xs font-medium">Live tracking coming soon</div>
                      <div className="text-[10px] text-muted-foreground">Map services are being configured.</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                {features.PAYMENTS ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                    <CreditCard className="w-5 h-5 text-primary" />
                    <div>
                      <div className="text-sm font-medium">Credit / Debit Card / UPI</div>
                      <div className="text-xs text-muted-foreground">Secure payment via Razorpay</div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-white/10 bg-card/50">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <div className="text-sm font-medium">Online Payments</div>
                      <div className="text-xs text-amber-400">Coming soon</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card border border-card-border rounded-2xl p-5 sticky top-24">
                <h3 className="font-semibold mb-4">Price Breakdown</h3>
                <div className="space-y-3 mb-5" data-testid="price-breakdown">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">₹{vehicle.pricePerDay.toLocaleString()} × {days} days</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">GST (18%)</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>₹{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-lg">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 mb-5">
                  <Shield className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />
                  <span>Free cancellation up to 24 hours before pickup. Fully insured trip.</span>
                </div>

                {!user && (
                  <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2 mb-4">
                    You must be signed in to complete booking.
                  </div>
                )}

                <Button
                  className="w-full gradient-blue-purple text-white border-0 shadow-lg shadow-primary/25 py-6 text-base rounded-xl"
                  onClick={handleConfirm}
                  disabled={loading || !features.PAYMENTS}
                  data-testid="button-confirm-booking"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : !features.PAYMENTS ? (
                    "Payments Coming Soon"
                  ) : user ? (
                    "Pay with Razorpay"
                  ) : (
                    "Sign In to Book"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
