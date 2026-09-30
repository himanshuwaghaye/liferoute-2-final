export type Role = "patient" | "driver" | "paramedic" | "hospital" | "doctor" | "admin";

export type EmergencyCategory = "medical" | "accident";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Ambulance {
  id: string;
  code: string;
  type: "Advanced Life Support" | "Basic Life Support" | "Patient Transport";
  distanceKm: number;
  etaMinutes: number;
  driverAvailable: boolean;
  paramedicAvailable: boolean;
  position: Coordinates;
}

export interface Hospital {
  id: string;
  name: string;
  distanceKm: number;
  etaMinutes: number;
  emergencyDepartment: boolean;
  services: string[];
  specialist: string;
  phone: string;
  position: Coordinates;
}

export type TrackingStage =
  "requested" | "assigned" | "en_route" | "arrived" | "picked_up" | "to_hospital" | "at_hospital";

export interface TrackingState {
  requestId: string;
  ambulance: Ambulance;
  hospital: Hospital;
  stage: TrackingStage;
  etaMinutes: number;
  distanceKm: number;
}

export interface MedicalRecord {
  id: string;
  title: string;
  section: string;
  date: string;
  provider: string;
  status: "Final" | "Pending" | "Shared";
}

export interface Payment {
  id: string;
  hospital: string;
  amount: number;
  date: string;
  transactionId: string;
  method: string;
  status: "successful" | "pending" | "failed";
}

export interface Bill {
  id: string;
  hospital: string;
  category: string;
  amount: number;
  date: string;
  paid: boolean;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: "ambulance" | "hospital" | "payment" | "record" | "system";
  read: boolean;
}

export interface ActivityItem {
  id: string;
  label: string;
  time: string;
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  content: string;
}

export interface AiAssessment {
  category: string;
  warningSigns: string[];
  urgency: "Low" | "Moderate" | "High" | "Critical";
  department: string;
  specialist: string;
  confidence: string;
}
