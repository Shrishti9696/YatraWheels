import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { FeatureProvider } from "@/context/FeatureContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import Planner from "@/pages/Planner";
import Explore from "@/pages/Explore";
import BookingDetails from "@/pages/BookingDetails";
import BookingStatus from "@/pages/BookingStatus";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import LeadCapture from "@/pages/LeadCapture";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import UserProfilePage from "@/pages/profile/UserProfilePage";

import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorVehicles from "@/pages/vendor/VendorVehicles";
import VendorBookings from "@/pages/vendor/VendorBookings";
import VendorAccountSettings from "@/pages/vendor/VendorAccountSettings";

import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverBookings from "@/pages/driver/DriverBookings";
import DriverOnboarding from "@/pages/driver/DriverOnboarding";
import ProfilePage from "@/pages/profile/ProfilePage";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminVehicles from "@/pages/admin/AdminVehicles";
import AdminBookings from "@/pages/admin/AdminBookings";
import AdminDrivers from "@/pages/admin/AdminDrivers";

const queryClient = new QueryClient();

const PANEL_PREFIXES = ["/vendor", "/driver", "/admin", "/auth"];

function AppContent() {
  const [location] = useLocation();
  const isPanel = PANEL_PREFIXES.some(p => location === p || location.startsWith(p + "/"));

  useEffect(() => {
    const ping = setInterval(() => {
      fetch("/api/health").catch(() => {});
    }, 25000);
    return () => clearInterval(ping);
  }, []);

  return (
    <>
      {!isPanel && <Navbar />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={Booking} />
        <Route path="/booking/:id" component={BookingDetails} />
        <Route path="/bookings/:id" component={BookingStatus} />
        <Route path="/planner" component={Planner} />
        <Route path="/explore" component={Explore} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/auth" component={Auth} />
        <Route path="/get-plan" component={LeadCapture} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/profile" component={UserProfilePage} />

        <Route path="/vendor" component={VendorDashboard} />
        <Route path="/vendor/vehicles" component={VendorVehicles} />
        <Route path="/vendor/bookings" component={VendorBookings} />
        <Route path="/vendor/profile" component={ProfilePage} />
        <Route path="/vendor/settings" component={VendorAccountSettings} />

        <Route path="/driver" component={DriverDashboard} />
        <Route path="/driver/bookings" component={DriverBookings} />
        <Route path="/driver/onboarding" component={DriverOnboarding} />
        <Route path="/driver/profile" component={ProfilePage} />
        <Route path="/driver/settings" component={VendorAccountSettings} />

        <Route path="/admin" component={AdminDashboard} />
        <Route path="/admin/users" component={AdminUsers} />
        <Route path="/admin/vehicles" component={AdminVehicles} />
        <Route path="/admin/bookings" component={AdminBookings} />
        <Route path="/admin/drivers" component={AdminDrivers} />

        <Route component={NotFound} />
      </Switch>
      {!isPanel && <Footer />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <FeatureProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BookingProvider>
              <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, "") || ""}>
                <AppContent />
                <Toaster richColors position="top-right" />
              </WouterRouter>
            </BookingProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </FeatureProvider>
    </ThemeProvider>
  );
}

export default App;
