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

export const getAnalytics = () => req<any>(`${API}/analytics`);
export const getUsersList = (params: any) => {
  const query = new URLSearchParams(params).toString();
  return req<any>(`${API}/users?${query}`);
};
export const getUserDetails = (id: string) => req<any>(`${API}/users/${id}`);
export const updateUserStatus = (id: string, action: string) => 
  req<any>(`${API}/users/${id}/status`, { method: "PATCH", body: JSON.stringify({ action }) });
export const updateUserRole = (id: string, role: string) =>
  req<any>(`${API}/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) });

export const getPendingVehicles = () => req<any[]>(`${API}/vehicles/pending`);
export const approveVehicleAction = (id: string, action: string, reason?: string) =>
  req<any>(`${API}/vehicles/${id}/approve`, { method: "PATCH", body: JSON.stringify({ action, reason }) });

export const getBookings = (status?: string) =>
  req<any>(`${API}/bookings${status ? `?status=${status}` : ""}`);
export const updateBookingStatus = (id: string, status: string) =>
  req<any>(`${API}/bookings/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });

export const getDrivers = () => req<any[]>(`${API}/drivers`);
export const approveDriver = (id: string, status: string) =>
  req<any>(`${API}/drivers/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) });
export const verifyDriverLicense = (id: string, action: string, reason?: string) =>
  req<any>(`${API}/drivers/${id}/license`, { method: "PATCH", body: JSON.stringify({ action, reason }) });
