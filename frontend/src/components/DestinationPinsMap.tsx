import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin } from "lucide-react";
import { useLocation } from "wouter";

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

const pinIcon = new L.DivIcon({
  className: "",
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;background:linear-gradient(135deg,#6366f1,#8b5cf6);transform:rotate(-45deg);border:2px solid white;box-shadow:0 2px 8px rgba(99,102,241,0.5)"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -30],
});

interface DestinationCoord {
  name: string;
  state: string;
  lat: number;
  lon: number;
  tag: string;
  img: string;
}

const INDIA_DESTINATIONS: DestinationCoord[] = [
  { name: "Goa", state: "Goa", lat: 15.2993, lon: 74.1240, tag: "Beaches", img: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=300&q=80" },
  { name: "Manali", state: "Himachal Pradesh", lat: 32.2432, lon: 77.1892, tag: "Mountains", img: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=300&q=80" },
  { name: "Jaipur", state: "Rajasthan", lat: 26.9124, lon: 75.7873, tag: "Heritage", img: "https://images.unsplash.com/photo-1599661046289-e31897846e41?w=300&q=80" },
  { name: "Udaipur", state: "Rajasthan", lat: 24.5854, lon: 73.7125, tag: "Heritage", img: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=300&q=80" },
  { name: "Rishikesh", state: "Uttarakhand", lat: 30.0869, lon: 78.2676, tag: "Adventure", img: "https://images.unsplash.com/photo-1544213197-40981f2a2049?w=300&q=80" },
  { name: "Coorg", state: "Karnataka", lat: 12.3375, lon: 75.8069, tag: "Nature", img: "https://images.unsplash.com/photo-1600298882525-2ab3ee89d11d?w=300&q=80" },
  { name: "Varanasi", state: "Uttar Pradesh", lat: 25.3176, lon: 82.9739, tag: "Spiritual", img: "https://images.unsplash.com/photo-1561361058-c24cecde1a07?w=300&q=80" },
  { name: "Kerala Backwaters", state: "Kerala", lat: 9.4981, lon: 76.3388, tag: "Nature", img: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=300&q=80" },
  { name: "Darjeeling", state: "West Bengal", lat: 27.0360, lon: 88.2627, tag: "Mountains", img: "https://images.unsplash.com/photo-1544461772-722f6365b983?w=300&q=80" },
  { name: "Andaman Islands", state: "Andaman & Nicobar", lat: 11.7401, lon: 92.6586, tag: "Beaches", img: "https://images.unsplash.com/photo-1586375300773-8384e3e4916f?w=300&q=80" },
  { name: "Leh Ladakh", state: "Ladakh", lat: 34.1526, lon: 77.5771, tag: "Adventure", img: "https://images.unsplash.com/photo-1598091383021-15ddea10925d?w=300&q=80" },
  { name: "Mumbai", state: "Maharashtra", lat: 19.0760, lon: 72.8777, tag: "Heritage", img: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=300&q=80" },
  { name: "Delhi", state: "Delhi", lat: 28.6139, lon: 77.2090, tag: "Heritage", img: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=300&q=80" },
  { name: "Hampi", state: "Karnataka", lat: 15.3350, lon: 76.4600, tag: "Heritage", img: "https://images.unsplash.com/photo-1567507342977-1e8c8e9f4b1c?w=300&q=80" },
  { name: "Spiti Valley", state: "Himachal Pradesh", lat: 32.2461, lon: 78.0339, tag: "Adventure", img: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&q=80" },
];

interface DestinationPinsMapProps {
  activeTag?: string;
}

export function DestinationPinsMap({ activeTag = "All" }: DestinationPinsMapProps) {
  const [, navigate] = useLocation();

  const filtered = activeTag === "All"
    ? INDIA_DESTINATIONS
    : INDIA_DESTINATIONS.filter(d => d.tag === activeTag);

  return (
    <div className="rounded-2xl overflow-hidden border border-border/60 shadow-lg">
      <div className="flex items-center gap-3 px-4 py-3 bg-card border-b border-border/40">
        <div className="w-8 h-8 rounded-lg gradient-blue-purple flex items-center justify-center">
          <MapPin className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="text-sm font-semibold">Explore India on the Map</div>
          <div className="text-xs text-muted-foreground">Click any pin to book a trip to that destination</div>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-xs text-muted-foreground">{filtered.length} destinations</span>
        </div>
      </div>
      <div className="h-[420px]">
        <MapContainer
          center={[22, 82]}
          zoom={5}
          style={{ height: "100%", width: "100%" }}
          scrollWheelZoom={false}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          {filtered.map(dest => (
            <Marker key={dest.name} position={[dest.lat, dest.lon]} icon={pinIcon}>
              <Popup>
                <div style={{ width: 180 }}>
                  <img src={dest.img} alt={dest.name} style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{dest.name}</div>
                  <div style={{ color: "#888", fontSize: 12, marginBottom: 8 }}>{dest.state} · {dest.tag}</div>
                  <button
                    onClick={() => navigate(`/booking?destination=${encodeURIComponent(dest.name)}`)}
                    style={{ width: "100%", padding: "6px", background: "linear-gradient(135deg,#6366f1,#8b5cf6)", color: "white", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Book a trip →
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
