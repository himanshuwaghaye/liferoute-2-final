import { Router } from "express";
import { db } from "../db/index.js";
import { emergencyDispatchService } from "../services/emergencyService.js";
import { realtimeHub } from "../services/realtimeService.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// Create emergency request
router.post("/", authenticate, (req: AuthenticatedRequest, res) => {
  const { category, subtype, symptoms, imageUrl, latitude, longitude, address } = req.body;
  const patientId = req.user?.id || "usr-patient-1";
  const patientName = req.user?.fullName || "Patient";

  const lat = typeof latitude === "number" ? latitude : 19.076;
  const lng = typeof longitude === "number" ? longitude : 72.8777;

  const emergency = emergencyDispatchService.createEmergencyRequest({
    patientId,
    patientName,
    category: category || "Medical",
    subtype,
    symptoms,
    imageUrl,
    latitude: lat,
    longitude: lng,
    address,
  });

  realtimeHub.broadcast("emergency:created", emergency);

  res.status(201).json(emergency);
});

// Get emergency by ID
router.get("/:id", (req, res) => {
  const emergency = db.emergencies.get(req.params.id);
  if (!emergency) {
    // Return sample active emergency
    return res.json({
      id: req.params.id,
      referenceCode: "LR-REQ-24817",
      status: "EN_ROUTE",
      category: "medical",
      latitude: 19.076,
      longitude: 72.8777,
      assignedAmbulanceId: "amb-1",
      assignedHospitalId: "hos-1",
    });
  }
  res.json(emergency);
});

// Advance stage
router.post("/:id/stage", authenticate, (req: AuthenticatedRequest, res) => {
  const { stage } = req.body;
  try {
    const updated = emergencyDispatchService.advanceStage(req.params.id, stage, req.user?.id);
    realtimeHub.broadcast("emergency:stage_updated", { requestId: req.params.id, stage });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
});

export default router;
