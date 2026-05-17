import { useBooking } from "@/context/BookingContext";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useParams, useLocation } from "wouter";
import { 
  ArrowLeft, CheckCircle, Star, Users, Shield, Calendar, MapPin, 
  CreditCard, AlertCircle, Car, User, Info, Check, Clock, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { createBookingAPI, createPaymentOrder, verifyPaymentAPI, getBookedDates } from "@/services/api";
import { getToken } from "@/services/authService";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function BookingDetails() {
  const { id } = useParams<{ id: string }>();
  const { selectedVehicle: ctxVehicle, tripParams, setTripParams, user } = useBooking();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bookedDates, setBookedDates] = useState<{start: string, end: string}[]>([]);
  const [withDriver, setWithDriver] = useState(false);
  const [, navigate] = useLocation();

  // Redirect if no vehicle selected
  useEffect(() => {
    if (!ctxVehicle && !id) navigate("/booking");
  }, [ctxVehicle, id]);

  const vehicle = ctxVehicle!;

  // Fetch booked dates for the vehicle
  useEffect(() => {
    if (vehicle?.id) {
      getBookedDates(vehicle.id).then(setBookedDates).catch(console.error);
    }
  }, [vehicle?.id]);

  // Price Logic
  const startDate = tripParams.date ? new Date(tripParams.date) : new Date();
  const endDate = tripParams.returnDate ? new Date(tripParams.returnDate) : new Date(startDate.getTime() + 86400000);
  const days = Math.ceil(Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  
  const basePrice = days * vehicle.pricePerDay;
  const driverFee = withDriver ? days * 500 : 0;
  const platformFee = Math.round(basePrice * 0.1);
  const total = basePrice + driverFee + platformFee;

  async function handleBooking() {
    if (!user) {
      toast.error("Please sign in to continue");
      navigate("/auth");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const bookingData = await createBookingAPI({
        vehicleId: vehicle.id,
        pickupLocation: tripParams.from || "Delhi",
        dropLocation: tripParams.to || tripParams.from || "Delhi",
        date: startDate.toISOString(),
        returnDate: endDate.toISOString(),
        passengers: tripParams.passengers,
        withDriver
      });

      const orderData = await createPaymentOrder(bookingData._id);

      if (orderData.fallback) {
        toast.success("Booking created! You can pay at pickup.");
        navigate(`/bookings/${bookingData._id}`);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "YatraWheels",
        description: `Booking for ${vehicle.name}`,
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            await verifyPaymentAPI({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              bookingId: bookingData._id
            });
            toast.success("Payment Successful!");
            navigate(`/bookings/${bookingData._id}`);
          } catch (e: any) {
            setError("Payment verification failed. Please contact support.");
          }
        },
        prefill: { name: user.name, email: user.email },
        theme: { color: "#0D7377" }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setError(err.message || "Failed to create booking. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pt-24 pb-20 min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4">
        <Link href="/booking" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Search
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Vehicle & Options */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
               <div className="relative h-72">
                 <img src={vehicle.imageUrl} alt={vehicle.name} className="w-full h-full object-cover" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                 <div className="absolute bottom-6 left-6">
                   <h1 className="text-3xl font-bold text-white mb-2">{vehicle.name}</h1>
                   <div className="flex gap-2">
                     <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold uppercase tracking-wider">{vehicle.type}</span>
                     <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold">
                       <Star className="w-3 h-3 fill-amber-400" /> {vehicle.rating} ({vehicle.reviewCount} reviews)
                     </span>
                   </div>
                 </div>
               </div>

               <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-white/5">
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary"><Users className="w-6 h-6" /></div>
                   <div><div className="text-xs text-muted-foreground">Capacity</div><div className="font-bold">{vehicle.capacity} Seats</div></div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500"><MapPin className="w-6 h-6" /></div>
                   <div><div className="text-xs text-muted-foreground">Location</div><div className="font-bold">{vehicle.location}</div></div>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Shield className="w-6 h-6" /></div>
                   <div><div className="text-xs text-muted-foreground">Insurance</div><div className="font-bold">Fully Insured</div></div>
                 </div>
               </div>

               <div className="p-8">
                 <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><SlidersHorizontal className="w-5 h-5 text-primary" /> Booking Options</h3>
                 <div 
                   onClick={() => setWithDriver(!withDriver)}
                   className={cn(
                     "p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between group",
                     withDriver ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" : "bg-white/[0.02] border-white/5 hover:border-white/10"
                   )}
                 >
                   <div className="flex items-center gap-4">
                      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center transition-colors", withDriver ? "bg-primary text-white" : "bg-white/5 text-muted-foreground group-hover:text-foreground")}>
                        <User className="w-7 h-7" />
                      </div>
                      <div>
                        <div className="font-bold">Add Professional Driver</div>
                        <div className="text-xs text-muted-foreground">Experienced and verified drivers for a stress-free trip.</div>
                      </div>
                   </div>
                   <div className="text-right">
                      <div className="font-bold text-primary">₹500 / day</div>
                      <div className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center mt-2 ml-auto", withDriver ? "border-primary bg-primary text-white" : "border-white/10")}>
                        {withDriver && <Check className="w-4 h-4" />}
                      </div>
                   </div>
                 </div>
               </div>
            </motion.div>
          </div>

          {/* Right Column: Checkout */}
          <div className="lg:col-span-4">
            <div className="bg-card border border-white/5 rounded-3xl p-8 sticky top-24 shadow-2xl">
              <h3 className="text-xl font-bold mb-6">Fare Summary</h3>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Vehicle Rental ({days} days)</span>
                  <span className="font-medium">₹{basePrice.toLocaleString()}</span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-sm text-primary">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> Driver Fee</span>
                    <span className="font-medium">₹{driverFee.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium">₹{platformFee.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-white/5 flex justify-between">
                  <span className="font-bold text-lg">Grand Total</span>
                  <span className="font-bold text-2xl text-primary">₹{total.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex gap-2 mb-6 animate-shake">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}

              <Button 
                onClick={handleBooking}
                disabled={loading}
                className="w-full h-14 rounded-2xl gradient-blue-purple text-lg font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
              >
                {loading ? "Initializing..." : "Confirm & Pay Now"}
              </Button>

              <p className="text-[10px] text-center text-muted-foreground mt-4 leading-relaxed">
                By confirming, you agree to our <span className="text-primary cursor-pointer hover:underline">Terms of Service</span> and cancellation policy.
              </p>
            </div>

            <div className="mt-6 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex gap-4">
              <Shield className="w-6 h-6 text-emerald-400 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-400">Secure Booking</div>
                <div className="text-[10px] text-muted-foreground mt-1">Free cancellation up to 24 hours before pickup. Instant refund for UPI/Card.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

function SlidersHorizontal(props: any) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-sliders-horizontal"><path d="m21 4-7 0"/><path d="m10 4-7 0"/><path d="m10 2 0 4"/><path d="m21 12-11 0"/><path d="m7 12-4 0"/><path d="m7 10 0 4"/><path d="m21 20-4 0"/><path d="m13 20-10 0"/><path d="m13 18 0 4"/></svg>;
}
