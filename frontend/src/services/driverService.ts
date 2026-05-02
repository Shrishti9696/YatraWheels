import { authHeaders } from "./authService";

const API = "/api/driver";

async function req<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: { "Content-Type": "application/json", ...authHeaders(), ...(opts.headers || {}) },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Request failed");
  return json;
}

export const getProfile = () => req<any>(`${API}/profile`);
export const getDashboard = () => req<any>(`${API}/dashboard`);
export const toggleAvailability = () => req<any>(`${API}/availability`, { method: "PUT" });
export const getMyBookings = () => req<any[]>(`${API}/bookings`);
export const updateProfile = (data: any) => req<any>(`${API}/profile`, { method: "PUT", body: JSON.stringify(data) });
export const getAvailableDrivers = () =>
  fetch("/api/drivers/available", { headers: authHeaders() }).then(r => r.json());
