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
export const toggleAvailability = () => req<any>(`${API}/availability`, { method: "PATCH" });
export const updateLocation = (lat: number, lng: number) => 
  req<any>(`${API}/location`, { method: "PATCH", body: JSON.stringify({ lat, lng }) });
export const getEarnings = () => req<any>(`${API}/earnings`);
export const updateTripStatus = (bookingId: string, status: string) => 
  req<any>(`${API}/trips/${bookingId}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
export const uploadLicense = (data: { licenseNumber: string, licenseImageUrl: string }) => 
  req<any>(`${API}/license`, { method: "POST", body: JSON.stringify(data) });
export const getAvailableDrivers = () =>
  fetch("/api/drivers/available", { headers: authHeaders() }).then(r => r.json());
