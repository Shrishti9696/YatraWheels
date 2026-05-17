import { authHeaders } from "./authService";

const API = "/api/vendor";

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(opts.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export const getDashboard = () => req<any>(`${API}/dashboard`);
export const getMyVehicles = () => req<any[]>(`${API}/vehicles`);
export const addVehicle = (data: any) => req<any>(`${API}/vehicles`, { method: "POST", body: JSON.stringify(data) });
export const updateVehicle = (id: string, data: any) => req<any>(`${API}/vehicles/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteVehicle = (id: string) => req<any>(`${API}/vehicles/${id}`, { method: "DELETE" });
export const getMyBookings = () => req<any[]>(`${API}/bookings`);
export const getEarnings = () => req<any>(`${API}/earnings`);
export const updateBookingStatus = (id: string, status: string) =>
  req<any>(`${API}/bookings/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
export const updateBookingStatusAction = (id: string, action: "accept" | "reject", reason?: string) =>
  req<any>(`${API}/bookings/${id}/status`, { method: "PATCH", body: JSON.stringify({ action, reason }) });
