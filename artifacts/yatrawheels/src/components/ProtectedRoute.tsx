import { useEffect } from "react";
import { useLocation } from "wouter";
import { useBooking } from "@/context/BookingContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  component: React.ComponentType;
  role?: "vendor" | "driver" | "admin";
}

export function ProtectedRoute({ component: Component, role }: ProtectedRouteProps) {
  const { user } = useBooking();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (role && user.role !== role && user.role !== "admin") {
      navigate("/");
    }
  }, [user, role, navigate]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (role && user.role !== role && user.role !== "admin") {
    return null;
  }

  return <Component />;
}
