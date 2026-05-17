import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, MapPin, Calendar, Clock, Car, User, 
  CheckCircle, Shield, AlertCircle, MessageCircle, Star, Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusStepper } from "@/components/StatusStepper";
import { getBookingById, cancelBookingAPI } from "@/services/api";
import { toast } from "sonner";
import { io } from "socket.io-client";

export default function BookingStatus() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const fetchBooking = async () => {
    try {
      const data = await getBookingById(id);
      setBooking(data);
    } catch (e: any) {
      toast.error("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooking();

    // Socket integration for real-time updates
    const socket = io(window.location.origin);
    socket.on(`booking:updated:${id}`, (updatedBooking) => {
      setBooking(updatedBooking);
      toast.info(`Booking status updated to ${updatedBooking.status}`);
    });

    return () => { socket.disconnect(); };
  }, [id]);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(true);
    try {
      await cancelBookingAPI(id);
      toast.success("Booking cancelled successfully");
      fetchBooking();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="pt-32 pb-20 flex flex-col items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
      <p className="text-muted-foreground animate-pulse">Tracking your journey...</p>
    </div>
  );

  if (!booking) return (
    <div className="pt-32 pb-20 text-center">
      <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h2 className="text-xl font-bold">Booking not found</h2>
      <Link href="/dashboard"><Button className="mt-4">Back to Dashboard</Button></Link>
    </div>
  );

  const steps = [
    { label: "Booking Received", status: "pending", time: booking.createdAt },
    { label: "Payment Confirmed", status: "confirmed", time: booking.updatedAt },
    { label: "Driver Assigned", status: "driver_assigned" },
    { label: "En Route", status: "en_route" },
    { label: "Trip Active", status: "ongoing" },
    { label: "Completed", status: "completed" },
  ];

  return (
    <main className="pt-24 pb-20 min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
           <div>
             <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3">
               <ArrowLeft className="w-4 h-4" /> Back to Dashboard
             </Link>
             <h1 className="text-3xl font-bold flex items-center gap-3">
               Trip Status <span className="text-xs font-mono bg-white/5 px-2 py-1 rounded text-muted-foreground">YW-{id.slice(-8).toUpperCase()}</span>
             </h1>
           </div>
           {["pending", "confirmed"].includes(booking.status) && (
             <Button 
               variant="outline" 
               className="border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-xl"
               onClick={handleCancel}
               disabled={cancelling}
             >
               Cancel Booking
             </Button>
           )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Status Timeline */}
          <div className="lg:col-span-1 bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
             <h3 className="text-lg font-bold mb-8">Journey Progress</h3>
             <StatusStepper currentStatus={booking.status} steps={steps} />
          </div>

          {/* Trip & Driver Details */}
          <div className="lg:col-span-2 space-y-6">
             {/* Vehicle Card */}
             <div className="bg-card border border-white/5 rounded-3xl overflow-hidden shadow-xl">
                <div className="flex flex-col md:flex-row">
                   <div className="md:w-2/5 h-48 md:h-auto overflow-hidden">
                      <img src={booking.vehicleId?.imageUrl} className="w-full h-full object-cover" alt={booking.vehicleId?.name} />
                   </div>
                   <div className="p-6 md:w-3/5">
                      <div className="flex justify-between items-start mb-4">
                         <div>
                            <h3 className="text-xl font-bold">{booking.vehicleId?.name}</h3>
                            <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{booking.vehicleId?.type}</p>
                         </div>
                         <div className="text-right">
                            <div className="text-lg font-bold text-primary">₹{booking.totalPrice.toLocaleString()}</div>
                            <div className="text-[10px] text-muted-foreground uppercase font-black">{booking.paymentStatus}</div>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary" /> {new Date(booking.date).toLocaleDateString()}
                         </div>
                         <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5 text-primary" /> {new Date(booking.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                   </div>
                </div>
             </div>

             {/* Driver Info */}
             <AnimatePresence>
                {booking.driverId ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/5 border border-primary/20 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6"
                  >
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-primary/20">
                           {booking.driverId?.userId?.name[0]}
                        </div>
                        <div>
                           <div className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-1">Driver Assigned</div>
                           <div className="text-lg font-bold">{booking.driverId?.userId?.name}</div>
                           <div className="flex items-center gap-2 mt-1">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold">{booking.driverId?.rating || "4.8"} Rating</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex gap-2">
                        <Button className="rounded-xl h-12 px-6 bg-primary text-white border-0 shadow-lg shadow-primary/20">
                           <Phone className="w-4 h-4 mr-2" /> Call Driver
                        </Button>
                        <Button variant="outline" className="rounded-xl h-12 w-12 p-0 border-white/10 hover:bg-white/5">
                           <MessageCircle className="w-5 h-5" />
                        </Button>
                     </div>
                  </motion.div>
                ) : booking.status !== "cancelled" && booking.status !== "completed" ? (
                  <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-3xl p-8 text-center">
                     <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-6 h-6 text-muted-foreground animate-pulse" />
                     </div>
                     <h4 className="font-bold mb-1">Matching Driver...</h4>
                     <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">We are assigning the best driver near your pickup location.</p>
                  </div>
                ) : null}
             </AnimatePresence>

             {/* Location Summary */}
             <div className="bg-card border border-white/5 rounded-3xl p-8 shadow-xl">
                <h3 className="font-bold mb-6">Trip Routing</h3>
                <div className="space-y-6 relative">
                   <div className="absolute left-[7px] top-6 bottom-6 w-0.5 bg-dashed border-l-2 border-white/5" />
                   <div className="flex gap-4 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-primary border-4 border-background mt-1" />
                      <div>
                         <div className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Pickup Point</div>
                         <div className="text-sm font-bold mt-0.5">{booking.pickupLocation}</div>
                      </div>
                   </div>
                   <div className="flex gap-4 relative z-10">
                      <div className="w-4 h-4 rounded-full bg-accent border-4 border-background mt-1" />
                      <div>
                         <div className="text-[10px] text-muted-foreground uppercase font-black tracking-wider">Destination</div>
                         <div className="text-sm font-bold mt-0.5">{booking.dropLocation}</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
