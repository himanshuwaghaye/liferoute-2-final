import { Router } from "express";
import { db } from "../db/index.js";
import { emergencyDispatchService } from "../services/emergencyService.js";
import { realtimeHub } from "../services/realtimeService.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

// Get nearby ambulances ranked by proximity
router.get("/", (req, res) => {
  const lat = req.query.lat ? Number(req.query.lat) : 19.076;
  const lng = req.query.lng ? Number(req.query.lng) : 72.8777;

  const ambulances = emergencyDispatchService.findNearbyAmbulances(lat, lng);
  const formatted = ambulances.map((a) => ({
    id: a.id,
    code: a.code,
    type: a.type,
    distanceKm: a.distanceKm,
    etaMinutes: a.etaMinutes,
    driverAvailable: a.driverAvailable,
    paramedicAvailable: a.paramedicAvailable,
    position: { lat: a.latitude, lng: a.longitude },
  }));

  res.json(formatted);
});

router.get("/nearby", (req, res) => {
  const lat = req.query.lat ? Number(req.query.lat) : 19.076;
  const lng = req.query.lng ? Number(req.query.lng) : 72.8777;

  const ambulances = emergencyDispatchService.findNearbyAmbulances(lat, lng);
  const formatted = ambulances.map((a) => ({
    id: a.id,
    code: a.code,
    type: a.type,
    distanceKm: a.distanceKm,
    etaMinutes: a.etaMinutes,
    driverAvailable: a.driverAvailable,
    paramedicAvailable: a.paramedicAvailable,
    position: { lat: a.latitude, lng: a.longitude },
  }));

  res.json(formatted);
});

// Request/dispatch specific ambulance
router.post("/request", authenticate, (req, res) => {
  const { ambulanceId, hospitalId, requestId } = req.body;
  const ambulance = db.ambulances.get(ambulanceId) || Array.from(db.ambulances.values())[0];

  const reqId = requestId || `req-demo-${Date.now()}`;
  realtimeHub.broadcast("ambulance:assigned", { requestId: reqId, ambulance });

  res.json({
    requestId: reqId,
    ambulanceId: ambulance.id,
    ambulance,
    status: "assigned",
  });
});

// Get ambulance by ID
router.get("/:id", (req, res) => {
  const ambulance = db.ambulances.get(req.params.id) || Array.from(db.ambulances.values())[0];
  res.json({
    id: ambulance.id,
    code: ambulance.code,
    type: ambulance.type,
    distanceKm: ambulance.distanceKm,
    etaMinutes: ambulance.etaMinutes,
    driverAvailable: ambulance.driverAvailable,
    paramedicAvailable: ambulance.paramedicAvailable,
    position: { lat: ambulance.latitude, lng: ambulance.longitude },
  });
});

// Update ambulance live GPS location (from driver device)
router.post("/:id/location", (req, res) => {
  const { lat, lng } = req.body;
  const ambulance = db.ambulances.get(req.params.id);
  if (ambulance && typeof lat === "number" && typeof lng === "number") {
    ambulance.latitude = lat;
    ambulance.longitude = lng;
    db.ambulances.set(req.params.id, ambulance);

    realtimeHub.broadcast("ambulance:location", {
      ambulanceId: req.params.id,
      position: { lat, lng },
    });
  }
  res.json({ status: "location_updated" });
});

export default router;
