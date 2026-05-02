import { useBooking } from "@/context/BookingContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import {
  ArrowLeft, CheckCircle, Star, Users, Shield, Calendar, MapPin,
  CreditCard, AlertCircle, Car, UserCheck, ChevronDown, Minus, Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createBookingAPI, createPaymentOrder, verifyPaymentAPI, getAvailableDrivers } from "@/services/api";
import { getToken } from "@/services/authService";
import { RouteMap } from "@/components/RouteMap";

declare global {
  interface Window { Razorpay: any; }
}

const DRIVER_FEE_PER_DAY = 1000;
const PLATFORM_FEE_PERCENT = 0.10;

function computePricing(vehicle: any, days: number, withDriver: boolean) {
  const vehicleCost = vehicle.pricePerDay * days;
  const pricePerKm = (vehicle as any).pricePerKm ?? 12;
  const estimatedKm = 200;
  const distanceCost = Math.round(pricePerKm * estimatedKm);
  const driverFee = withDriver ? DRIVER_FEE_PER_DAY * days : 0;
  const basePlatformFee = Math.round((vehicleCost + distanceCost) * PLATFORM_FEE_PERCENT);
  const platformFee = Math.max(basePlatformFee, 499);
  const total = vehicleCost + distanceCost + driverFee + platformFee;
  return { vehicleCost, distanceCost, driverFee, platformFee, total };
}

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const { selectedVehicle: ctxVehicle, tripParams, user } = useBooking();
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookingRef, setBookingRef] = useState("");
  const [, navigate] = useLocation();

  const [days, setDays] = useState(1);
  const [withDriver, setWithDriver] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [availableDrivers, setAvailableDrivers] = useState<any[]>([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);

  const vehicle = ctxVehicle;

  useEffect(() => {
    if (!vehicle) {
      navigate("/booking");
    }
  }, [vehicle]);

  const pricing = vehicle ? computePricing(vehicle, days, withDriver) : null;

  useEffect(() => {
    if (withDriver && availableDrivers.length === 0) {
      setLoadingDrivers(true);
      getAvailableDrivers()
        .then(setAvailableDrivers)
        .finally(() => setLoadingDrivers(false));
    }
    if (!withDriver) {
      setSelectedDriverId(null);
    }
  }, [withDriver]);

  async function handleConfirm() {
    setError("");

    if (!user || !getToken()) {
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

      const returnDate = (() => {
        const d = new Date(date);
        d.setDate(d.getDate() + days - 1);
        return d.toISOString().split("T")[0];
      })();

      const { booking } = await createBookingAPI({
        vehicleId: vehicle.id,
        pickupLocation,
        dropLocation,
        date,
        returnDate,
        passengers,
        withDriver,
        driverId: selectedDriverId || undefined,
      });

      const orderData = await createPaymentOrder(booking._id);

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "YatraWheels",
        description: `${vehicle.name} — ${pickupLocation} to ${dropLocation}`,
        order_id: orderData.orderId,
        prefill: { name: user.name, email: user.email },
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
          {withDriver && (
            <p className="text-sm text-primary mb-2">
              A verified driver has been assigned to your trip.
            </p>
          )}
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

              {/* Vehicle card */}
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

              {/* Trip details */}
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
                      <div className="text-sm font-medium">{tripParams.date || "Select date"}</div>
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

                {/* Number of days selector */}
                <div className="flex items-center justify-between pt-2 border-t border-border/40">
                  <div>
                    <div className="text-sm font-medium">Number of Days</div>
                    <div className="text-xs text-muted-foreground">Affects final pricing</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setDays(d => Math.max(1, d - 1))}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-lg font-bold w-6 text-center">{days}</span>
                    <button
                      onClick={() => setDays(d => Math.min(30, d + 1))}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <RouteMap
                  from={tripParams.from || "Delhi, India"}
                  to={tripParams.to || "Agra, India"}
                  className="h-52 mt-2"
                />
              </div>

              {/* Driver option */}
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Driver Preference</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    onClick={() => setWithDriver(false)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      !withDriver
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border hover:border-white/20 text-muted-foreground"
                    }`}
                  >
                    <Car className="w-5 h-5" />
                    <div className="text-sm font-medium">Self Drive</div>
                    <div className="text-xs opacity-70">You drive the vehicle</div>
                  </button>
                  <button
                    onClick={() => setWithDriver(true)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                      withDriver
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border hover:border-white/20 text-muted-foreground"
                    }`}
                  >
                    <UserCheck className="w-5 h-5" />
                    <div className="text-sm font-medium">With Driver</div>
                    <div className="text-xs opacity-70">+₹{DRIVER_FEE_PER_DAY.toLocaleString()}/day</div>
                  </button>
                </div>

                <AnimatePresence>
                  {withDriver && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border/40 pt-4">
                        <div className="text-sm font-medium mb-3 flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-primary" />
                          Select a Driver
                          <span className="text-xs text-muted-foreground font-normal">(optional)</span>
                        </div>

                        {loadingDrivers ? (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground py-3">
                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                            Loading available drivers...
                          </div>
                        ) : availableDrivers.length === 0 ? (
                          <div className="text-sm text-muted-foreground bg-muted/30 rounded-xl p-4 text-center">
                            No drivers currently available. One will be assigned automatically.
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <button
                              onClick={() => setSelectedDriverId(null)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                selectedDriverId === null
                                  ? "border-primary bg-primary/8"
                                  : "border-border hover:border-white/20"
                              }`}
                            >
                              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                <Users className="w-4 h-4 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="text-sm font-medium">Auto-assign</div>
                                <div className="text-xs text-muted-foreground">Best available driver</div>
                              </div>
                              {selectedDriverId === null && (
                                <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                              )}
                            </button>

                            {availableDrivers.map((driver) => (
                              <button
                                key={driver._id}
                                onClick={() => setSelectedDriverId(driver._id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                  selectedDriverId === driver._id
                                    ? "border-primary bg-primary/8"
                                    : "border-border hover:border-white/20"
                                }`}
                              >
                                <div className="w-9 h-9 rounded-full gradient-blue-purple flex items-center justify-center text-white text-sm font-bold shrink-0">
                                  {(driver.userId?.name || "D")[0].toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium">{driver.userId?.name || "Driver"}</div>
                                  <div className="text-xs text-muted-foreground">
                                    ★ {driver.rating?.toFixed(1) || "4.8"} · {driver.totalTrips || 0} trips
                                  </div>
                                </div>
                                {selectedDriverId === driver._id && (
                                  <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Payment method */}
              <div className="bg-card border border-card-border rounded-2xl p-5">
                <h3 className="font-semibold mb-4">Payment Method</h3>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/30 bg-primary/5">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <div className="text-sm font-medium">Credit / Debit Card / UPI</div>
                    <div className="text-xs text-muted-foreground">Secure payment via Razorpay</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky sidebar */}
            <div className="lg:col-span-2">
              <div className="bg-card border border-card-border rounded-2xl p-5 sticky top-24">
                <h3 className="font-semibold mb-4">Price Breakdown</h3>
                <div className="space-y-2.5 mb-5" data-testid="price-breakdown">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      ₹{vehicle.pricePerDay.toLocaleString()} × {days} day{days > 1 ? "s" : ""}
                    </span>
                    <span>₹{pricing.vehicleCost.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Distance cost (~200 km)</span>
                    <span>₹{pricing.distanceCost.toLocaleString()}</span>
                  </div>
                  {withDriver && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-muted-foreground flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-primary" />
                        Driver fee × {days} day{days > 1 ? "s" : ""}
                      </span>
                      <span className="text-primary">₹{pricing.driverFee.toLocaleString()}</span>
                    </motion.div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Platform fee (10%)</span>
                    <span>₹{pricing.platformFee.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border pt-3 flex justify-between font-bold">
                    <span>Estimated Total</span>
                    <span className="text-lg">₹{pricing.total.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground bg-muted/30 rounded-lg px-3 py-2 mb-4">
                  Distance is estimated. Final amount shown in Razorpay based on actual route.
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
                  disabled={loading}
                  data-testid="button-confirm-booking"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : user ? `Pay ₹${pricing.total.toLocaleString()}` : "Sign In to Book"}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
