import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface LocationData {
  lat: number;
  lng: number;
  city: string;
  state: string;
  enabled: boolean;
}

interface LocationContextValue {
  location: LocationData | null;
  permissionStatus: "unknown" | "granted" | "denied" | "requesting";
  requestLocation: () => Promise<void>;
  clearLocation: () => void;
}

const LocationContext = createContext<LocationContextValue>({
  location: null,
  permissionStatus: "unknown",
  requestLocation: async () => {},
  clearLocation: () => {},
});

const STORAGE_KEY = "yw_location";

async function reverseGeocode(lat: number, lng: number): Promise<{ city: string; state: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=en`,
      { headers: { "User-Agent": "YatraWheels/1.0" } }
    );
    const data = await res.json();
    const addr = data.address || {};
    const city =
      addr.city || addr.town || addr.village || addr.county || addr.state_district || "Unknown";
    const state = addr.state || "";
    return { city, state };
  } catch {
    return { city: "Unknown", state: "" };
  }
}

export function LocationProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useState<LocationData | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [permissionStatus, setPermissionStatus] = useState<"unknown" | "granted" | "denied" | "requesting">("unknown");

  useEffect(() => {
    if (location?.enabled) {
      setPermissionStatus("granted");
    }
    if (navigator.permissions) {
      navigator.permissions.query({ name: "geolocation" }).then(result => {
        if (result.state === "granted") setPermissionStatus("granted");
        else if (result.state === "denied") setPermissionStatus("denied");
        result.onchange = () => {
          if (result.state === "granted") setPermissionStatus("granted");
          else if (result.state === "denied") setPermissionStatus("denied");
          else setPermissionStatus("unknown");
        };
      }).catch(() => {});
    }
  }, []);

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) return;
    setPermissionStatus("requesting");
    navigator.geolocation.getCurrentPosition(
      async pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const { city, state } = await reverseGeocode(lat, lng);
        const data: LocationData = { lat, lng, city, state, enabled: true };
        setLocation(data);
        setPermissionStatus("granted");
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      },
      () => {
        setPermissionStatus("denied");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setLocation(null);
    setPermissionStatus("unknown");
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <LocationContext.Provider value={{ location, permissionStatus, requestLocation, clearLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  return useContext(LocationContext);
}
