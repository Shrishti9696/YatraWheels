import {
  Vehicle,
  Route,
  TripPlan,
  Booking,
  Destination,
} from "../data/mockData";
import { authHeaders } from "./authService";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options?.headers,
    },
  });
  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(json.message || "API error");
  return json as T;
}

interface VehicleFilters {
  type?: string;
  minCapacity?: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
}

export async function getVehicles(filters?: VehicleFilters): Promise<Vehicle[]> {
  const params = new URLSearchParams();
  if (filters?.type && filters.type !== "all") params.set("type", filters.type);
  if (filters?.minCapacity) params.set("capacity", String(filters.minCapacity));
  if (filters?.minPrice) params.set("minPrice", String(filters.minPrice));
  if (filters?.maxPrice) params.set("maxPrice", String(filters.maxPrice));
  if (filters?.location) params.set("location", filters.location);

  const query = params.toString() ? `?${params.toString()}` : "";
  const data = await apiFetch<{ vehicles: any[] }>(`/vehicles${query}`);

  return data.vehicles.map((v) => ({
    id: v._id,
    name: v.name,
    type: v.type,
    capacity: v.capacity,
    pricePerDay: v.pricePerDay,
    pricePerKm: v.pricePerKm ?? 12,
    features: v.features,
    imageUrl: v.imageUrl,
    rating: v.rating,
    reviewCount: v.reviewCount,
    available: v.isAvailable,
    location: v.location,
  }));
}

export async function getVehicleById(id: string): Promise<Vehicle | null> {
  try {
    const v = await apiFetch<any>(`/vehicles/${id}`);
    return {
      id: v._id,
      name: v.name,
      type: v.type,
      capacity: v.capacity,
      pricePerDay: v.pricePerDay,
      pricePerKm: v.pricePerKm ?? 12,
      features: v.features,
      imageUrl: v.imageUrl,
      rating: v.rating,
      reviewCount: v.reviewCount,
      available: v.isAvailable,
      location: v.location,
    };
  } catch {
    return null;
  }
}

export async function searchRoutes(from: string, to: string): Promise<Route[]> {
  const { mockRoutes } = await import("../data/mockData");
  const f = from.trim().toLowerCase();
  const t = to.trim().toLowerCase();
  if (!f && !t) return mockRoutes;
  return mockRoutes.filter(r => {
    const matchFrom = !f || r.from.toLowerCase().includes(f);
    const matchTo = !t || r.to.toLowerCase().includes(t);
    return matchFrom && matchTo;
  });
}

export async function generateTripPlan(params: {
  destination: string;
  days: number;
  people: number;
  budget: string;
}): Promise<TripPlan> {
  try {
    const token = authHeaders()["Authorization"];
    if (!token) throw new Error("Not authenticated");

    const data = await apiFetch<{
      vehicleRecommendation: any;
      estimatedCost: number;
      highlights: string[];
      trip: { itinerary: any[] };
    }>("/trips/generate", {
      method: "POST",
      body: JSON.stringify({
        destination: params.destination,
        days: params.days,
        passengers: params.people,
        budget: params.budget,
      }),
    });

    const v = data.vehicleRecommendation;
    const vehicle: Vehicle = v
      ? {
          id: v._id,
          name: v.name,
          type: v.type,
          capacity: v.capacity,
          pricePerDay: v.pricePerDay,
          pricePerKm: v.pricePerKm ?? 12,
          features: v.features,
          imageUrl: v.imageUrl,
          rating: v.rating,
          reviewCount: v.reviewCount,
          available: v.isAvailable,
          location: v.location,
        }
      : {
          id: "default",
          name: "Toyota Innova Crysta",
          type: "van",
          capacity: 7,
          pricePerDay: 4500,
          pricePerKm: 12,
          features: ["AC", "GPS"],
          imageUrl: "",
          rating: 4.8,
          reviewCount: 300,
          available: true,
          location: "Delhi",
        };

    return {
      destination: params.destination,
      days: params.days,
      vehicleRecommendation: vehicle,
      estimatedCost: data.estimatedCost,
      itinerary: data.trip.itinerary,
      highlights: data.highlights,
    };
  } catch {
    const { mockVehicles } = await import("../data/mockData");
    const vehicle = mockVehicles.find((v) => v.capacity >= params.people) || mockVehicles[0];
    const itinerary = Array.from({ length: params.days }).map((_, i) => ({
      day: i + 1,
      title: i === 0 ? "Arrival & Acclimatization" : i === params.days - 1 ? "Departure" : `Exploring ${params.destination}`,
      activities: [
        { time: "09:00 AM", activity: "Morning Sightseeing", duration: "2h" },
        { time: "01:00 PM", activity: "Local Cuisine Experience", duration: "1.5h" },
        { time: "04:00 PM", activity: "Cultural Walk / Shopping", duration: "3h" },
      ],
      accommodation: "Premium Boutique Resort",
      meals: "Breakfast included at hotel. Lunch & Dinner at local authentic spots.",
    }));
    return {
      destination: params.destination,
      days: params.days,
      vehicleRecommendation: vehicle,
      estimatedCost: vehicle.pricePerDay * params.days + params.people * 5000,
      itinerary,
      highlights: ["Curated local experiences", "Premium transport", "24/7 concierge support", "Flexible itinerary"],
    };
  }
}

export async function getBookings(): Promise<Booking[]> {
  const token = authHeaders()["Authorization"];
  if (!token) return [];

  const data = await apiFetch<any[]>("/bookings/my");
  return data.map((b) => ({
    id: b._id,
    vehicleId: b.vehicleId?._id || b.vehicleId,
    vehicleName: b.vehicleId?.name || "Vehicle",
    vehicleImage: b.vehicleId?.imageUrl || "",
    from: b.pickupLocation,
    to: b.dropLocation,
    date: b.date,
    passengers: b.passengers,
    totalPrice: b.totalPrice,
    status: b.status,
  }));
}

export async function getDestinations(): Promise<Destination[]> {
  const { mockDestinations } = await import("../data/mockData");
  return mockDestinations;
}

export async function getPopularRoutes(): Promise<Route[]> {
  const { mockRoutes } = await import("../data/mockData");
  return mockRoutes;
}

export async function getAvailableDrivers(city?: string): Promise<any[]> {
  try {
    const query = city ? `?city=${encodeURIComponent(city)}` : "";
    return await apiFetch<any[]>(`/drivers/available${query}`);
  } catch {
    return [];
  }
}

export async function createBookingAPI(data: {
  vehicleId: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  returnDate?: string;
  passengers: number;
  withDriver?: boolean;
  driverId?: string;
}): Promise<{ booking: any; pricing: any }> {
  return apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createPaymentOrder(bookingId: string): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
  keyId: string;
}> {
  return apiFetch("/payments/create-order", {
    method: "POST",
    body: JSON.stringify({ bookingId }),
  });
}

export async function verifyPaymentAPI(data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  bookingId: string;
}): Promise<{ message: string }> {
  return apiFetch("/payments/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
