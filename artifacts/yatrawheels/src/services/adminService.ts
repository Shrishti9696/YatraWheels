import { authHeaders } from "./authService";

const API = "/api/admin";

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(opts.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export const getStats = () => req<any>(`${API}/stats`);
export const getUsers = (role?: string) => req<any>(`${API}/users${role ? `?role=${role}` : ""}`);
export const updateUserRole = (id: string, role: string) =>
  req<any>(`${API}/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });
export const getVehicles = () => req<any[]>(`${API}/vehicles`);
export const approveVehicle = (id: string) =>
  req<any>(`${API}/vehicles/${id}/approve`, { method: "PUT" });
export const getBookings = (status?: string) =>
  req<any>(`${API}/bookings${status ? `?status=${status}` : ""}`);
export const updateBookingStatus = (id: string, status: string) =>
  req<any>(`${API}/bookings/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
export const getDrivers = () => req<any[]>(`${API}/drivers`);
export const approveDriver = (id: string, status: string) =>
  req<any>(`${API}/drivers/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
