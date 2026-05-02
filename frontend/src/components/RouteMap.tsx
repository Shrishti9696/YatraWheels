import { useEffect, useRef } from "react";
import { MapPin } from "lucide-react";

const CITY_COORDS: Record<string, [number, number]> = {
  "delhi": [28.6139, 77.2090],
  "new delhi": [28.6139, 77.2090],
  "mumbai": [19.0760, 72.8777],
  "bangalore": [12.9716, 77.5946],
  "bengaluru": [12.9716, 77.5946],
  "hyderabad": [17.3850, 78.4867],
  "chennai": [13.0827, 80.2707],
  "kolkata": [22.5726, 88.3639],
  "pune": [18.5204, 73.8567],
  "jaipur": [26.9124, 75.7873],
  "agra": [27.1767, 78.0081],
  "goa": [15.2993, 74.1240],
  "panaji": [15.4909, 73.8278],
  "manali": [32.2432, 77.1892],
  "shimla": [31.1048, 77.1734],
  "udaipur": [24.5854, 73.7125],
  "jaisalmer": [26.9157, 70.9083],
  "jodhpur": [26.2389, 73.0243],
  "rishikesh": [30.0869, 78.2676],
  "haridwar": [29.9457, 78.1642],
  "varanasi": [25.3176, 82.9739],
  "amritsar": [31.6340, 74.8723],
  "chandigarh": [30.7333, 76.7794],
  "lucknow": [26.8467, 80.9462],
  "srinagar": [34.0837, 74.7973],
  "leh": [34.1526, 77.5771],
  "ladakh": [34.1526, 77.5771],
  "kochi": [9.9312, 76.2673],
  "munnar": [10.0889, 77.0595],
  "ooty": [11.4102, 76.6950],
  "coorg": [12.3375, 75.8069],
  "mysore": [12.2958, 76.6394],
  "mysuru": [12.2958, 76.6394],
  "darjeeling": [27.0410, 88.2663],
  "gangtok": [27.3389, 88.6065],
  "andaman": [11.7401, 92.6586],
  "port blair": [11.6234, 92.7265],
  "pondicherry": [11.9416, 79.8083],
  "tirupati": [13.6288, 79.4192],
  "indore": [22.7196, 75.8577],
  "bhopal": [23.2599, 77.4126],
  "ahmedabad": [23.0225, 72.5714],
  "surat": [21.1702, 72.8311],
  "vadodara": [22.3072, 73.1812],
  "nagpur": [21.1458, 79.0882],
  "visakhapatnam": [17.6868, 83.2185],
  "vijayawada": [16.5062, 80.6480],
  "bhubaneswar": [20.2961, 85.8245],
  "patna": [25.5941, 85.1376],
  "ranchi": [23.3441, 85.3096],
  "dehradun": [30.3165, 78.0322],
  "nainital": [29.3919, 79.4542],
  "mussoorie": [30.4598, 78.0664],
};

function getCityCoords(cityInput: string): [number, number] | null {
  if (!cityInput) return null;
  const normalized = cityInput.toLowerCase().trim();
  for (const [key, coords] of Object.entries(CITY_COORDS)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return coords;
    }
  }
  return null;
}

interface RouteMapProps {
  from: string;
  to: string;
  className?: string;
}

export function RouteMap({ from, to, className = "" }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const fromCoords = getCityCoords(from);
    const toCoords = getCityCoords(to);

    if (!fromCoords && !toCoords) return;

    const center: [number, number] = fromCoords && toCoords
      ? [(fromCoords[0] + toCoords[0]) / 2, (fromCoords[1] + toCoords[1]) / 2]
      : (fromCoords || toCoords)!;

    let zoom = 6;
    if (fromCoords && toCoords) {
      const dist = Math.sqrt(
        Math.pow(fromCoords[0] - toCoords[0], 2) +
        Math.pow(fromCoords[1] - toCoords[1], 2)
      );
      zoom = dist > 10 ? 5 : dist > 5 ? 6 : 7;
    }

    import("leaflet").then(L => {
      if (!mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: false,
      });

      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 18,
      }).addTo(map);

      const createIcon = (color: string, label: string) => L.divIcon({
        html: `<div style="
          width:32px;height:32px;border-radius:50% 50% 50% 0;
          background:${color};transform:rotate(-45deg);
          border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.3);
          display:flex;align-items:center;justify-content:center;
        ">
          <div style="transform:rotate(45deg);color:white;font-size:10px;font-weight:700;text-align:center;line-height:1;">${label}</div>
        </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -36],
      });

      if (fromCoords) {
        L.marker(fromCoords, { icon: createIcon("#3b82f6", "A") })
          .addTo(map)
          .bindPopup(`<strong>Pickup:</strong> ${from}`, { className: "custom-popup" });
      }

      if (toCoords) {
        L.marker(toCoords, { icon: createIcon("#8b5cf6", "B") })
          .addTo(map)
          .bindPopup(`<strong>Drop-off:</strong> ${to}`, { className: "custom-popup" });
      }

      if (fromCoords && toCoords) {
        L.polyline([fromCoords, toCoords], {
          color: "#3b82f6",
          weight: 3,
          opacity: 0.7,
          dashArray: "8 6",
        }).addTo(map);

        const bounds = L.latLngBounds([fromCoords, toCoords]);
        map.fitBounds(bounds, { padding: [40, 40] });
      }
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [from, to]);

  const fromCoords = getCityCoords(from);
  const toCoords = getCityCoords(to);

  if (!fromCoords && !toCoords) {
    return (
      <div className={`rounded-2xl border border-border/60 bg-muted/20 flex flex-col items-center justify-center gap-2 ${className}`} style={{ minHeight: 200 }}>
        <MapPin className="w-8 h-8 text-muted-foreground/30" />
        <p className="text-xs text-muted-foreground/50">Map not available for this route</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border/60 shadow-sm ${className}`}>
      <style>{`
        .leaflet-container { background: hsl(var(--muted)); }
        .leaflet-control-zoom { border: none !important; }
        .leaflet-control-zoom a {
          background: hsl(var(--card)) !important;
          color: hsl(var(--foreground)) !important;
          border-color: hsl(var(--border)) !important;
          border-radius: 8px !important;
          font-size: 16px !important;
        }
        .leaflet-tile { filter: saturate(0.85) brightness(0.95); }
        .light .leaflet-tile { filter: none; }
        .leaflet-popup-content-wrapper {
          background: hsl(var(--card));
          color: hsl(var(--foreground));
          border: 1px solid hsl(var(--border));
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
          font-size: 13px;
        }
        .leaflet-popup-tip { background: hsl(var(--card)); }
      `}</style>
      <div ref={mapRef} style={{ height: "100%", width: "100%", minHeight: 240 }} />
      <div className="absolute bottom-2 right-2 flex gap-3 bg-card/90 backdrop-blur-sm rounded-xl px-3 py-1.5 border border-border/60 shadow-sm z-[400]">
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
          <span className="text-muted-foreground truncate max-w-[80px]">{from}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-violet-500" />
          <span className="text-muted-foreground truncate max-w-[80px]">{to}</span>
        </div>
      </div>
    </div>
  );
}
