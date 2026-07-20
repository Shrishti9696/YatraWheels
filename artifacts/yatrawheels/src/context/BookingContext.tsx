// @refresh reset
import { createContext, useContext, useState, ReactNode } from "react";
import { Vehicle } from "@/data/mockData";
import { AuthUser, getStoredUser, removeToken } from "@/services/authService";

type TripParams = {
  from: string;
  to: string;
  date: string;
  passengers: number;
};

type BookingContextType = {
  selectedVehicle: Vehicle | null;
  tripParams: TripParams;
  setSelectedVehicle: (v: Vehicle | null) => void;
  setTripParams: (p: TripParams) => void;
  user: AuthUser | null;
  setUser: (u: AuthUser | null) => void;
  logout: () => void;
};

const BookingContext = createContext<BookingContextType | null>(null);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [tripParams, setTripParams] = useState<TripParams>({
    from: "",
    to: "",
    date: "",
    passengers: 1,
  });
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);

  function logout() {
    removeToken();
    setUser(null);
  }

  return (
    <BookingContext.Provider
      value={{ selectedVehicle, tripParams, setSelectedVehicle, setTripParams, user, setUser, logout }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used inside BookingProvider");
  return ctx;
}
