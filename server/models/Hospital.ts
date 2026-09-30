export interface IHospital {
  _id: string;
  name: string;
  address: string;
  phone: string;
  location: {
    latitude: number;
    longitude: number;
  };
  distanceKm: number;
  etaMinutes: number;
  emergencyDepartment: boolean;
  services: string[];
  specialist: string;
  beds: {
    icu: number;
    trauma: number;
    general: number;
  };
  isActive: boolean;
}

export const HospitalSchema = {
  name: "Hospital",
  collection: "hospitals",
};
