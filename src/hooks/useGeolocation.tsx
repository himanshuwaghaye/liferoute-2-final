import { useCallback, useEffect, useState } from "react";
import type { Coordinates } from "@/types";
import { DEMO_CENTER } from "@/data/mock";

export type GeoStatus = "idle" | "prompt" | "granted" | "denied" | "unavailable";

export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [position, setPosition] = useState<Coordinates | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    setStatus("prompt");
  }, []);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setStatus("unavailable");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setAccuracy(Math.round(pos.coords.accuracy));
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  return {
    status,
    position,
    accuracy,
    request,
    /** Fallback used for demo map rendering when GPS is not granted. */
    effectivePosition: position ?? DEMO_CENTER,
  };
}
