import { useMemo, useState, useEffect } from "react";
import {
  Ambulance,
  Crosshair,
  Hospital,
  Layers,
  Minus,
  Navigation,
  Plus,
  User,
  MapPin,
} from "lucide-react";
import type { Coordinates } from "@/types";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id: string;
  kind: "user" | "ambulance" | "hospital";
  label: string;
  position: Coordinates;
}

export function MapView({
  markers,
  route = true,
  className,
  traffic = true,
}: {
  markers: MapMarker[];
  route?: boolean;
  traffic?: boolean;
  className?: string;
}) {
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");
  const [provider, setProvider] = useState<"google" | "osm">("google");
  const [zoom, setZoom] = useState(14);
  const [activeMarker, setActiveMarker] = useState<MapMarker | null>(null);

  // Compute center position based on markers or active marker
  const center = useMemo(() => {
    if (activeMarker) return activeMarker.position;
    if (!markers.length) return { lat: 19.076, lng: 72.8777 };
    const avgLat = markers.reduce((sum, m) => sum + m.position.lat, 0) / markers.length;
    const avgLng = markers.reduce((sum, m) => sum + m.position.lng, 0) / markers.length;
    return { lat: avgLat, lng: avgLng };
  }, [markers, activeMarker]);

  const points = useMemo(() => {
    const lats = markers.map((m) => m.position.lat);
    const lngs = markers.map((m) => m.position.lng);
    const minLat = Math.min(...lats) - 0.008;
    const maxLat = Math.max(...lats) + 0.008;
    const minLng = Math.min(...lngs) - 0.008;
    const maxLng = Math.max(...lngs) + 0.008;
    return markers.map((m) => ({
      ...m,
      x: ((m.position.lng - minLng) / (maxLng - minLng || 1)) * 100,
      y: (1 - (m.position.lat - minLat) / (maxLat - minLat || 1)) * 100,
    }));
  }, [markers]);

  const icons = { user: User, ambulance: Ambulance, hospital: Hospital } as const;
  const tones = {
    user: "bg-primary text-primary-foreground",
    ambulance: "bg-emergency text-emergency-foreground",
    hospital: "bg-success text-success-foreground",
  } as const;

  // Build high-compatibility embed URL
  const mapSrc = useMemo(() => {
    if (provider === "google") {
      const mode = mapType === "satellite" ? "k" : "m";
      return `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&t=${mode}&output=embed`;
    }
    return `https://www.openstreetmap.org/export/embed.html?bbox=${center.lng - 0.03}%2C${center.lat - 0.03}%2C${center.lng + 0.03}%2C${center.lat + 0.03}&layer=mapnik&marker=${center.lat}%2C${center.lng}`;
  }, [center, zoom, mapType, provider]);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-slate-900 shadow-inner min-h-[350px]",
        className,
      )}
      role="region"
      aria-label="Interactive map view"
    >
      {/* Real Map Tile Background */}
      <iframe
        key={`${provider}-${mapType}-${center.lat}-${center.lng}-${zoom}`}
        title="Live Emergency Map"
        width="100%"
        height="100%"
        className="absolute inset-0 h-full w-full border-0 pointer-events-auto"
        loading="lazy"
        src={mapSrc}
      />

      {/* Interactive Overlaid Route & Pulsing Markers */}
      <div className="pointer-events-none absolute inset-0 z-10">
        {route && points.length > 1 ? (
          <svg
            className="absolute inset-0 h-full w-full opacity-80"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden
          >
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#2563eb"
              strokeWidth="1.2"
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
          </svg>
        ) : null}

        {points.map((p) => {
          const Icon = icons[p.kind];
          const isSelected = activeMarker?.id === p.id;
          return (
            <div
              key={p.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-500 pointer-events-auto cursor-pointer"
              style={{ left: `${p.x}%`, top: `${p.y}%` }}
              onClick={() => setActiveMarker(isSelected ? null : p)}
            >
              <div className="flex flex-col items-center gap-1 group">
                <span
                  className={cn(
                    "relative grid h-10 w-10 place-items-center rounded-full shadow-[var(--shadow-float)] border-2 border-white transition-transform group-hover:scale-110",
                    tones[p.kind],
                    p.kind === "ambulance" && "pulse-ring",
                    isSelected && "ring-4 ring-primary ring-offset-2 scale-110",
                  )}
                >
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <span className="whitespace-nowrap rounded-md bg-card/95 px-2 py-0.5 text-[11px] font-bold text-foreground shadow-[var(--shadow-card)] border border-border">
                  {p.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Map Control Buttons */}
      <div className="absolute right-3 top-3 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          aria-label="Zoom in"
          title="Zoom in"
          onClick={() => setZoom((z) => Math.min(19, z + 1))}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/95 text-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-accent"
        >
          <Plus className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Zoom out"
          title="Zoom out"
          onClick={() => setZoom((z) => Math.max(10, z - 1))}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/95 text-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-accent"
        >
          <Minus className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Toggle Satellite"
          title={mapType === "satellite" ? "Switch to Roadmap" : "Switch to Satellite"}
          onClick={() => setMapType(mapType === "standard" ? "satellite" : "standard")}
          className={cn(
            "grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/95 text-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-accent",
            mapType === "satellite" && "border-primary bg-primary text-primary-foreground",
          )}
        >
          <Layers className="h-4 w-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label="Reset Center"
          title="Center on user position"
          onClick={() => setActiveMarker(null)}
          className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card/95 text-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-accent"
        >
          <Crosshair className="h-4 w-4" aria-hidden />
        </button>
      </div>

      {/* Map Attribution & Status Footer */}
      <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-2 rounded-lg bg-card/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[var(--shadow-card)] border border-border pointer-events-auto">
        <span className="flex items-center gap-1.5 text-success">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
          <span>Google Maps {mapType === "satellite" ? "Satellite" : "Live"}</span>
        </span>
        {traffic && <span className="text-muted-foreground">· Live Traffic Sync</span>}
        <button
          type="button"
          className="ml-2 text-[10px] text-muted-foreground underline hover:text-foreground"
          onClick={() => setProvider((p) => (p === "google" ? "osm" : "google"))}
        >
          {provider === "google" ? "Switch Tile Engine" : "Switch to Google"}
        </button>
      </div>
    </div>
  );
}
