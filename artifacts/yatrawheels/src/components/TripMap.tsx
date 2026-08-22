import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Navigation, MapPin, Route, Clock, Loader2 } from "lucide-react";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const fromIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const toIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

async function geocode(city: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city + ", India")}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json() as Array<{ lat: string; lon: string }>;
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch { return null; }
}

async function fetchRoute(a: [number, number], b: [number, number]): Promise<[number, number][]> {
  try {
    const res = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${a[1]},${a[0]};${b[1]},${b[0]}?overview=full&geometries=geojson`
    );
    const data = await res.json() as { routes?: Array<{ geometry: { coordinates: number[][] }; distance: number; duration: number }> };
    if (data.routes?.[0]?.geometry?.coordinates) {
      return data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
    }
    return [a, b];
  } catch { return [a, b]; }
}

function FitBounds({ positions }: { positions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length >= 2) {
      map.fitBounds(L.latLngBounds(positions), { padding: [48, 48] });
    }
  }, [positions, map]);
  return null;
}

interface TripMapProps {
  from: string;
  to: string;
}

export function TripMap({ from, to }: TripMapProps) {
  const [fromCoord, setFromCoord] = useState<[number, number] | null>(null);
  const [toCoord, setToCoord] = useState<[number, number] | null>(null);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [distKm, setDistKm] = useState<number | null>(null);
  const [durationMin, setDurationMin] = useState<number | null>(null);
  const prevRef = useRef("");

  useEffect(() => {
    const key = `${from}|${to}`;
    if (!from || !to || key === prevRef.current) return;
    prevRef.current = key;

    setLoading(true);
    setRoutePoints([]);
    setFromCoord(null);
    setToCoord(null);
    setDistKm(null);
    setDurationMin(null);

    Promise.all([geocode(from), geocode(to)]).then(async ([fCoord, tCoord]) => {
      if (!fCoord || !tCoord) { setLoading(false); return; }
      setFromCoord(fCoord);
      setToCoord(tCoord);

      try {
        const res = await fetch(
          `https://router.project-osrm.org/route/v1/driving/${fCoord[1]},${fCoord[0]};${tCoord[1]},${tCoord[0]}?overview=full&geometries=geojson`
        );
        const data = await res.json() as { routes?: Array<{ geometry: { coordinates: number[][] }; distance: number; duration: number }> };
        if (data.routes?.[0]) {
          const pts = data.routes[0].geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number]);
          setRoutePoints(pts);
          setDistKm(Math.round(data.routes[0].distance / 1000));
          setDurationMin(Math.round(data.routes[0].duration / 60));
        } else {
          setRoutePoints([fCoord, tCoord]);
        }
      } catch {
        setRoutePoints([fCoord, tCoord]);
      }
      setLoading(false);
    });
  }, [from, to]);

  if (!from || !to) return null;

  const center: [number, number] = [22.5, 80.5];

  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-card border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue-purple flex items-center justify-center">
            <Route className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-primary">{from}</span>
            <span className="text-muted-foreground">→</span>
            <span className="text-red-400">{to}</span>
          </div>
        </div>
        {distKm && durationMin && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-primary" />
              {distKm.toLocaleString()} km
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-primary" />
              ~{Math.floor(durationMin / 60)}h {durationMin % 60}m
            </span>
          </div>
        )}
        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="w-3 h-3 animate-spin" />
            Loading route…
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-72 relative">
        <MapContainer
          center={center}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          zoomControl={true}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {fromCoord && (
            <Marker position={fromCoord} icon={fromIcon}>
              <Popup><strong>{from}</strong><br />Pickup point</Popup>
            </Marker>
          )}
          {toCoord && (
            <Marker position={toCoord} icon={toIcon}>
              <Popup><strong>{to}</strong><br />Destination</Popup>
            </Marker>
          )}
          {routePoints.length >= 2 && (
            <Polyline
              positions={routePoints}
              pathOptions={{ color: "#6366f1", weight: 4, opacity: 0.85, dashArray: undefined }}
            />
          )}
          {routePoints.length >= 2 && <FitBounds positions={routePoints} />}
        </MapContainer>
      </div>
    </div>
  );
}
