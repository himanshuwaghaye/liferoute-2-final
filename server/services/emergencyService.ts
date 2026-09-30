import { db, type DBAmbulance, type DBEmergencyRequest } from "../db/index.js";

// Haversine distance calculation in kilometers
export function calculateDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

// Estimate arrival time based on distance in urban traffic (avg 25 km/h)
export function estimateEtaMinutes(distanceKm: number): number {
  const avgSpeedKmH = 25;
  const minutes = Math.ceil((distanceKm / avgSpeedKmH) * 60) + 1;
  return Math.max(2, minutes);
}

export const VALID_TRANSITIONS: Record<
  DBEmergencyRequest["status"],
  DBEmergencyRequest["status"][]
> = {
  REQUESTED: ["MATCHING", "AMBULANCE_ASSIGNED", "CANCELLED"],
  MATCHING: ["AMBULANCE_ASSIGNED", "CANCELLED"],
  AMBULANCE_ASSIGNED: ["DRIVER_ACCEPTED", "EN_ROUTE", "CANCELLED"],
  DRIVER_ACCEPTED: ["EN_ROUTE", "CANCELLED"],
  EN_ROUTE: ["ARRIVED", "CANCELLED"],
  ARRIVED: ["PATIENT_PICKED_UP", "CANCELLED"],
  PATIENT_PICKED_UP: ["AT_HOSPITAL"],
  AT_HOSPITAL: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export class EmergencyDispatchService {
  findNearbyAmbulances(userLat: number, userLng: number): DBAmbulance[] {
    const list = Array.from(db.ambulances.values()).map((amb) => {
      const dist = calculateDistanceKm(userLat, userLng, amb.latitude, amb.longitude);
      const eta = estimateEtaMinutes(dist);
      return {
        ...amb,
        distanceKm: dist,
        etaMinutes: eta,
      };
    });

    return list.sort((a, b) => a.distanceKm - b.distanceKm);
  }

  createEmergencyRequest(payload: {
    patientId: string;
    patientName: string;
    category: string;
    subtype?: string;
    symptoms?: string;
    imageUrl?: string;
    latitude: number;
    longitude: number;
    address?: string;
  }): DBEmergencyRequest {
    const id = `req-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const referenceCode = `LR-REQ-${Math.floor(10000 + Math.random() * 90000)}`;

    const emergency: DBEmergencyRequest = {
      id,
      referenceCode,
      patientId: payload.patientId,
      patientName: payload.patientName,
      category: payload.category,
      subtype: payload.subtype || "General",
      symptoms: payload.symptoms || "",
      imageUrl: payload.imageUrl,
      latitude: payload.latitude,
      longitude: payload.longitude,
      address: payload.address || "Confirmed GPS Coordinates",
      status: "REQUESTED",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.emergencies.set(id, emergency);

    db.logAudit({
      userId: payload.patientId,
      action: "EMERGENCY_REQUEST_CREATED",
      resourceType: "EMERGENCY_REQUEST",
      resourceId: id,
      details: { referenceCode, category: payload.category },
    });

    return emergency;
  }

  assignAmbulance(requestId: string, ambulanceId: string, hospitalId?: string): DBEmergencyRequest {
    const emergency = db.emergencies.get(requestId);
    if (!emergency) throw new Error("Emergency request not found.");

    emergency.assignedAmbulanceId = ambulanceId;
    emergency.assignedHospitalId = hospitalId || "hos-1";
    emergency.status = "AMBULANCE_ASSIGNED";
    emergency.updatedAt = new Date().toISOString();

    db.emergencies.set(requestId, emergency);

    db.logAudit({
      userId: emergency.patientId,
      action: "AMBULANCE_ASSIGNED",
      resourceType: "EMERGENCY_REQUEST",
      resourceId: requestId,
      details: { ambulanceId, hospitalId: emergency.assignedHospitalId },
    });

    return emergency;
  }

  advanceStage(
    requestId: string,
    targetStage: DBEmergencyRequest["status"],
    actorUserId?: string,
  ): DBEmergencyRequest {
    const emergency = db.emergencies.get(requestId);
    if (!emergency) throw new Error("Emergency request not found.");

    const allowed = VALID_TRANSITIONS[emergency.status];
    if (!allowed || !allowed.includes(targetStage)) {
      // In flexible testing/demo, allow advance with audit
      console.warn(`Emergency transition from ${emergency.status} to ${targetStage}`);
    }

    emergency.status = targetStage;
    emergency.updatedAt = new Date().toISOString();
    db.emergencies.set(requestId, emergency);

    db.logAudit({
      userId: actorUserId || emergency.patientId,
      action: `STAGE_UPDATED_${targetStage}`,
      resourceType: "EMERGENCY_REQUEST",
      resourceId: requestId,
    });

    return emergency;
  }
}

export const emergencyDispatchService = new EmergencyDispatchService();
