export interface IEmergencyRequest {
  _id: string;
  referenceCode: string;
  patientId: string;
  patientName: string;
  category: "medical" | "accident" | string;
  subtype: string;
  symptoms: string;
  imageUrl?: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status:
    | "REQUESTED"
    | "MATCHING"
    | "AMBULANCE_ASSIGNED"
    | "DRIVER_ACCEPTED"
    | "EN_ROUTE"
    | "ARRIVED"
    | "PATIENT_PICKED_UP"
    | "AT_HOSPITAL"
    | "COMPLETED"
    | "CANCELLED";
  assignedAmbulanceId?: string;
  assignedHospitalId?: string;
  vitals?: {
    hr: number;
    spo2: number;
    bp: string;
    gcs: number;
    notes: string;
  };
  timeline: {
    stage: string;
    timestamp: string;
    actorId?: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export const EmergencyRequestSchema = {
  name: "EmergencyRequest",
  collection: "emergency_requests",
};
