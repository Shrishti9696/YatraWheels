import { useState } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BookingProvider } from "@/context/BookingContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { LocationProvider } from "@/context/LocationContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { YatraBotWidget } from "@/components/YatraBotWidget";
import { ScrollToTop } from "@/components/ScrollToTop";
import { SplashScreen } from "@/components/SplashScreen";
import Home from "@/pages/Home";
import Booking from "@/pages/Booking";
import Planner from "@/pages/Planner";
import Explore from "@/pages/Explore";
import BookingDetails from "@/pages/BookingDetails";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import LeadCapture from "@/pages/LeadCapture";
import Pricing from "@/pages/Pricing";
import NotFound from "@/pages/not-found";
import UserProfilePage from "@/pages/profile/UserProfilePage";
import Settings from "@/pages/Settings";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import ResetPassword from "@/pages/ResetPassword";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import VendorDashboard from "@/pages/vendor/VendorDashboard";
import VendorVehicles from "@/pages/vendor/VendorVehicles";
import VendorBookings from "@/pages/vendor/VendorBookings";
import VendorAccountSettings from "@/pages/vendor/VendorAccountSettings";

import DriverDashboard from "@/pages/driver/DriverDashboard";
import DriverBookings from "@/pages/driver/DriverBookings";
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

  return (
    <>
      <ScrollToTop />
      {!isPanel && <Navbar />}
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/booking" component={Booking} />
        <Route path="/booking/:id" component={BookingDetails} />
        <Route path="/planner" component={Planner} />
        <Route path="/explore" component={Explore} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/auth" component={Auth} />
        <Route path="/get-plan" component={LeadCapture} />
        <Route path="/pricing" component={Pricing} />
        <Route path="/profile" component={UserProfilePage} />
        <Route path="/settings" component={Settings} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/reset-password" component={ResetPassword} />

        <Route path="/vendor">
          {() => <ProtectedRoute component={VendorDashboard} role="vendor" />}
        </Route>
        <Route path="/vendor/vehicles">
          {() => <ProtectedRoute component={VendorVehicles} role="vendor" />}
        </Route>
        <Route path="/vendor/bookings">
          {() => <ProtectedRoute component={VendorBookings} role="vendor" />}
        </Route>
        <Route path="/vendor/profile">
          {() => <ProtectedRoute component={ProfilePage} role="vendor" />}
        </Route>
        <Route path="/vendor/settings">
          {() => <ProtectedRoute component={VendorAccountSettings} role="vendor" />}
        </Route>

        <Route path="/driver">
          {() => <ProtectedRoute component={DriverDashboard} role="driver" />}
        </Route>
        <Route path="/driver/bookings">
          {() => <ProtectedRoute component={DriverBookings} role="driver" />}
        </Route>
        <Route path="/driver/profile">
          {() => <ProtectedRoute component={ProfilePage} role="driver" />}
        </Route>
        <Route path="/driver/settings">
          {() => <ProtectedRoute component={VendorAccountSettings} role="driver" />}
        </Route>

        <Route path="/admin">
          {() => <ProtectedRoute component={AdminDashboard} role="admin" />}
        </Route>
        <Route path="/admin/users">
          {() => <ProtectedRoute component={AdminUsers} role="admin" />}
        </Route>
        <Route path="/admin/vehicles">
          {() => <ProtectedRoute component={AdminVehicles} role="admin" />}
        </Route>
        <Route path="/admin/bookings">
          {() => <ProtectedRoute component={AdminBookings} role="admin" />}
        </Route>
        <Route path="/admin/drivers">
          {() => <ProtectedRoute component={AdminDrivers} role="admin" />}
        </Route>

        <Route component={NotFound} />
      </Switch>
      {!isPanel && <Footer />}
      {!isPanel && location !== "/planner" && <YatraBotWidget />}
    </>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  function handleSplashDone() {
    setSplashDone(true);
  }

  return (
    <ThemeProvider>
      <LocationProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <BookingProvider>
              {!splashDone && <SplashScreen onDone={handleSplashDone} />}
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <AppContent />
                <Toaster />
              </WouterRouter>
            </BookingProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </LocationProvider>
    </ThemeProvider>
  );
}

export default App;
