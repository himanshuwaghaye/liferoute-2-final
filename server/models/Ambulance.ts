export interface IAmbulance {
  _id: string;
  code: string;
  type: "Advanced Life Support" | "Basic Life Support" | "Patient Transport";
  registrationNumber: string;
  location: {
    latitude: number;
    longitude: number;
    lastUpdatedAt: string;
  };
  distanceKm: number;
  etaMinutes: number;
  driverAvailable: boolean;
  paramedicAvailable: boolean;
  driverName: string;
  driverPhone: string;
  isActive: boolean;
  createdAt: string;
}

export const AmbulanceSchema = {
  name: "Ambulance",
  collection: "ambulances",
};
