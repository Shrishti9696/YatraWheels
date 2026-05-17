import {
  Vehicle,
  Route,
  TripPlan,
  Booking,
  Destination,
  mockRoutes,
  mockBookings,
  mockDestinations,
} from "../data/mockData";
import { authHeaders } from "./authService";

const API_BASE = "/api";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...options?.headers,
    },
  });
  const json = await res.json();
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
    features: v.features,
    imageUrl: v.imageUrl,
    rating: v.rating,
    reviewCount: v.reviewCount,
    available: v.isAvailable,
    location: v.location,
  }));
}

export async function aiSearchVehicles(query: string): Promise<{ vehicles: Vehicle[], aiSuggestion: string | null, fallbackSearch?: boolean }> {
  const data = await apiFetch<{ vehicles: any[], aiSuggestion: string | null, fallbackSearch?: boolean }>("/vehicles/ai-search", {
    method: "POST",
    body: JSON.stringify({ query })
  });

  const vehicles = data.vehicles.map((v) => ({
    id: v._id,
    name: v.name,
    type: v.type,
    capacity: v.capacity,
    pricePerDay: v.pricePerDay,
    features: v.features,
    imageUrl: v.imageUrl,
    rating: v.rating,
    reviewCount: v.reviewCount,
    available: v.isAvailable,
    location: v.location,
  }));

  return { vehicles, aiSuggestion: data.aiSuggestion, fallbackSearch: data.fallbackSearch };
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

export async function getBookedDates(vehicleId: string): Promise<{ start: string, end: string }[]> {
  return apiFetch(`/bookings/vehicle/${vehicleId}/booked-dates`);
}

export async function createBookingAPI(data: {
  vehicleId: string;
  pickupLocation: string;
  dropLocation: string;
  date: string;
  returnDate?: string;
  passengers: number;
  withDriver?: boolean;
}): Promise<any> {
  return apiFetch("/bookings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getBookingById(id: string): Promise<any> {
  return apiFetch(`/bookings/${id}`);
}

export async function cancelBookingAPI(id: string): Promise<any> {
  return apiFetch(`/bookings/${id}/cancel`, { method: "PATCH" });
}

export async function createPaymentOrder(bookingId: string): Promise<{
  orderId: string;
  amount: number;
  currency: string;
  paymentId: string;
  keyId: string;
  fallback?: boolean;
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

// ... (keep other functions like getBookings, getDestinations etc)
export async function getBookingsList(): Promise<Booking[]> {
  try {
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
  } catch {
    return mockBookings;
  }
}
export async function getDestinations(): Promise<Destination[]> { return mockDestinations; }
export async function getPopularRoutes(): Promise<Route[]> { return mockRoutes.filter((r) => r.popular); }
export async function searchRoutes(from: string, to: string): Promise<Route[]> {
  if (!from && !to) return mockRoutes;
  const fromLower = from?.toLowerCase() || "";
  const toLower = to?.toLowerCase() || "";
  return mockRoutes.filter((r) => (fromLower ? r.from.toLowerCase().includes(fromLower) : true) && (toLower ? r.to.toLowerCase().includes(toLower) : true));
}
