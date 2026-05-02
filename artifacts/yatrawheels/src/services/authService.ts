const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  role: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export interface OTPRequired {
  requiresOTP: true;
  userId: string;
  email: string;
  role: string;
}

export function getToken(): string | null {
  return localStorage.getItem("yw_token");
}

export function setToken(token: string): void {
  localStorage.setItem("yw_token", token);
}

export function removeToken(): void {
  localStorage.removeItem("yw_token");
  localStorage.removeItem("yw_user");
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("yw_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem("yw_user", JSON.stringify(user));
}

export function authHeaders(): Record<string, string> {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: string;
  licenseNumber?: string;
  city?: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Registration failed");
  return json;
}

export async function loginUser(data: {
  email: string;
  password: string;
}): Promise<AuthResponse | OTPRequired> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Login failed");
  return json;
}

export async function verifyOTP(data: {
  userId: string;
  otp: string;
}): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Verification failed");
  return json;
}

export async function resendOTP(userId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/resend-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to resend code");
}

export async function fetchMe(): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/me`, { headers: authHeaders() });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to fetch profile");
  return { id: json._id, name: json.name, email: json.email, phone: json.phone, bio: json.bio, role: json.role };
}

export async function updateProfile(data: { name: string; email: string; phone?: string; bio?: string }): Promise<AuthUser> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to update profile");
  return json.user;
}

export async function changePassword(data: { currentPassword: string; newPassword: string }): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/password`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(data),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Failed to change password");
}
