import { describe, it, expect } from "vitest";
import {
  calculateDistanceKm,
  estimateEtaMinutes,
  EmergencyDispatchService,
  VALID_TRANSITIONS,
} from "../server/services/emergencyService";

describe("Emergency Distance and ETA Engine", () => {
  it("calculates accurate Haversine distance between coordinates", () => {
    // Distance between Marine Lines (19.076, 72.8777) and Hospital (19.084, 72.883)
    const dist = calculateDistanceKm(19.076, 72.8777, 19.084, 72.883);
    expect(dist).toBeGreaterThan(0.5);
    expect(dist).toBeLessThan(3.0);
  });

  it("calculates realistic urban ETA in minutes", () => {
    const eta1 = estimateEtaMinutes(2.5);
    expect(eta1).toBeGreaterThanOrEqual(2);
    expect(eta1).toBeLessThan(15);
  });

  it("enforces emergency state transitions", () => {
    expect(VALID_TRANSITIONS["REQUESTED"]).toContain("MATCHING");
    expect(VALID_TRANSITIONS["AMBULANCE_ASSIGNED"]).toContain("EN_ROUTE");
    expect(VALID_TRANSITIONS["EN_ROUTE"]).toContain("ARRIVED");
    expect(VALID_TRANSITIONS["ARRIVED"]).toContain("PATIENT_PICKED_UP");
    expect(VALID_TRANSITIONS["PATIENT_PICKED_UP"]).toContain("AT_HOSPITAL");
  });

  it("creates emergency request and assigns nearest ambulance", () => {
    const service = new EmergencyDispatchService();
    const emergency = service.createEmergencyRequest({
      patientId: "usr-patient-1",
      patientName: "Ishant Arun",
      category: "medical",
      subtype: "Heart",
      symptoms: "Chest pain",
      latitude: 19.076,
      longitude: 72.8777,
    });

    expect(emergency.id).toBeDefined();
    expect(emergency.referenceCode).toMatch(/^LR-REQ-/);
    expect(emergency.status).toBe("REQUESTED");

    const assigned = service.assignAmbulance(emergency.id, "amb-1", "hos-1");
    expect(assigned.status).toBe("AMBULANCE_ASSIGNED");
    expect(assigned.assignedAmbulanceId).toBe("amb-1");
  });
});
