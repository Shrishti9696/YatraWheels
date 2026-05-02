import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, MapPin, Clock, CheckCircle, XCircle, Calendar,
  BookOpen, Route, Heart, TrendingUp, Star, ArrowLeft, Car
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getBookings } from "@/services/api";
import { type Booking } from "@/data/mockData";
import { Link } from "wouter";

function statusBadge(status: Booking["status"]) {
  const map: Record<string, { label: string; cls: string }> = {
    upcoming: { label: "Upcoming", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
    confirmed: { label: "Confirmed", cls: "bg-green-500/10 text-green-400 border-green-500/20" },
    completed: { label: "Completed", cls: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status];
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${s.cls}`}>{s.label}</span>
  );
}

export default function Dashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBookings().then(b => { setBookings(b); setLoading(false); });
  }, []);

  const completed = bookings.filter(b => b.status === "completed").length;
  const upcoming = bookings.filter(b => b.status !== "completed").length;
  const totalSpent = bookings.reduce((a, b) => a + b.totalPrice, 0);

  return (
    <main className="pt-24 pb-20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group mb-6">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl gradient-blue-purple flex items-center justify-center shadow-lg shadow-primary/25">
              <User className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold" data-testid="text-dashboard-heading">Welcome back, Traveler</h1>
              <p className="text-muted-foreground text-sm">traveler@example.com</p>
            </div>
          </div>
          <Link href="/booking">
            <Button className="gradient-blue-purple text-white border-0 shadow-lg shadow-primary/20" data-testid="button-new-booking">
              New Booking
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10"
        >
          {[
            { icon: BookOpen, label: "Total Trips", value: bookings.length.toString(), color: "text-blue-400" },
            { icon: TrendingUp, label: "Completed", value: completed.toString(), color: "text-green-400" },
            { icon: Calendar, label: "Upcoming", value: upcoming.toString(), color: "text-yellow-400" },
            { icon: Star, label: "Total Spent", value: `₹${(totalSpent / 1000).toFixed(0)}K`, color: "text-purple-400" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="bg-card border border-card-border rounded-2xl p-5" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>
              <Icon className={`w-5 h-5 ${color} mb-3`} />
              <div className="text-2xl font-bold mb-1">{loading ? "—" : value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="bookings">
            <TabsList className="bg-muted/50 mb-6">
              <TabsTrigger value="bookings" data-testid="tab-bookings">My Bookings</TabsTrigger>
              <TabsTrigger value="saved" data-testid="tab-saved">Saved Routes</TabsTrigger>
              <TabsTrigger value="profile" data-testid="tab-profile">Profile</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              {loading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-16" data-testid="empty-bookings">
                  <BookOpen className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">No bookings yet</h3>
                  <p className="text-muted-foreground text-sm mb-6">Start your first trip!</p>
                  <Link href="/booking">
                    <Button className="gradient-blue-purple text-white border-0">Book a Ride</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bookings.map((booking, i) => {
                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-card border border-card-border rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-primary/25 transition-colors"
                        data-testid={`card-booking-${booking.id}`}
                      >
                        <div className="w-20 h-16 rounded-xl overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                          {booking.vehicleImage ? (
                            <img src={booking.vehicleImage} alt={booking.vehicleName} className="w-full h-full object-cover" loading="lazy" />
                          ) : (
                            <Car className="w-8 h-8 text-muted-foreground/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold">{booking.vehicleName}</span>
                            {statusBadge(booking.status)}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{booking.from} → {booking.to}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(booking.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                            <span className="flex items-center gap-1">
                              <User className="w-3.5 h-3.5" />
                              {booking.passengers} passengers
                            </span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-bold text-lg">₹{booking.totalPrice.toLocaleString()}</div>
                          {booking.status !== "completed" && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 mt-1"
                              data-testid={`button-cancel-${booking.id}`}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="saved">
              <div className="space-y-3">
                {[
                  { from: "Delhi", to: "Manali", freq: "Frequent route" },
                  { from: "Mumbai", to: "Goa", freq: "Saved last week" },
                  { from: "Bangalore", to: "Coorg", freq: "Popular weekend trip" },
                ].map((route, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-card border border-card-border rounded-xl p-4 flex items-center justify-between"
                    data-testid={`saved-route-${i}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Route className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{route.from} → {route.to}</div>
                        <div className="text-xs text-muted-foreground">{route.freq}</div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="gradient-blue-purple text-white border-0 text-xs"
                      data-testid={`button-book-saved-${i}`}
                    >
                      Book Now
                    </Button>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="profile">
              <div className="bg-card border border-card-border rounded-2xl p-6 max-w-lg">
                <h3 className="font-semibold mb-5">Profile Information</h3>
                <div className="space-y-4">
                  {[
                    { label: "Full Name", value: "Aryan Kapoor" },
                    { label: "Email", value: "traveler@example.com" },
                    { label: "Phone", value: "+91 98765 43210" },
                    { label: "Member Since", value: "January 2024" },
                    { label: "Preferred Vehicle", value: "SUV / Van" },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <span className="text-sm text-muted-foreground">{label}</span>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="mt-5 border-white/10 hover:bg-white/5" data-testid="button-edit-profile">
                  Edit Profile
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </main>
  );
}
