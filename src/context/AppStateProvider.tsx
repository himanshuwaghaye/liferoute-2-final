import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { DEMO_AMBULANCES, DEMO_HOSPITALS } from "@/data/mock";
import type { Ambulance, EmergencyCategory, Hospital, TrackingStage, TrackingState } from "@/types";

interface EmergencyDraft {
  category: EmergencyCategory | null;
  subtype: string | null;
  symptoms: string;
  imageName: string | null;
}

interface AppState {
  draft: EmergencyDraft;
  setDraft: (patch: Partial<EmergencyDraft>) => void;
  tracking: TrackingState | null;
  assignAmbulance: (ambulance: Ambulance, hospital?: Hospital) => void;
  advanceStage: (stage: TrackingStage) => void;
  clearTracking: () => void;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  voiceOpen: boolean;
  setVoiceOpen: (v: boolean) => void;
}

const Ctx = createContext<AppState | null>(null);

export const STAGES: { key: TrackingStage; label: string }[] = [
  { key: "requested", label: "Request Submitted" },
  { key: "assigned", label: "Ambulance Assigned" },
  { key: "en_route", label: "Ambulance En Route" },
  { key: "arrived", label: "Ambulance Arrived" },
  { key: "picked_up", label: "Patient Picked Up" },
  { key: "to_hospital", label: "Going to Hospital" },
  { key: "at_hospital", label: "Hospital Arrived" },
];

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [draft, setDraftState] = useState<EmergencyDraft>({
    category: null,
    subtype: null,
    symptoms: "",
    imageName: null,
  });
  const [tracking, setTracking] = useState<TrackingState | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [voiceOpen, setVoiceOpen] = useState(false);

  const setDraft = useCallback((patch: Partial<EmergencyDraft>) => {
    setDraftState((prev) => ({ ...prev, ...patch }));
  }, []);

  const assignAmbulance = useCallback((ambulance: Ambulance, hospital?: Hospital) => {
    setTracking({
      requestId: "LR-REQ-24817",
      ambulance,
      hospital: hospital ?? (DEMO_HOSPITALS[0] as Hospital),
      stage: "en_route",
      etaMinutes: ambulance.etaMinutes,
      distanceKm: ambulance.distanceKm,
    });
  }, []);

  const advanceStage = useCallback((stage: TrackingStage) => {
    setTracking((prev) => (prev ? { ...prev, stage } : prev));
  }, []);

  const clearTracking = useCallback(() => setTracking(null), []);

  const value = useMemo(
    () => ({
      draft,
      setDraft,
      tracking,
      assignAmbulance,
      advanceStage,
      clearTracking,
      chatOpen,
      setChatOpen,
      voiceOpen,
      setVoiceOpen,
    }),
    [draft, setDraft, tracking, assignAmbulance, advanceStage, clearTracking, chatOpen, voiceOpen],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAppState must be used inside AppStateProvider");
  return ctx;
}

export const DEFAULT_AMBULANCE = DEMO_AMBULANCES[0] as Ambulance;
