import { Router } from "express";
import { db } from "../db/index.js";
import { realtimeHub } from "../services/realtimeService.js";

const router = Router();

// List hospitals
router.get("/", (_req, res) => {
  const list = Array.from(db.hospitals.values()).map((h) => ({
    id: h.id,
    name: h.name,
    distanceKm: h.distanceKm,
    etaMinutes: h.etaMinutes,
    emergencyDepartment: h.emergencyDepartment,
    services: h.services,
    specialist: h.specialist,
    phone: h.phone,
    position: { lat: h.latitude, lng: h.longitude },
  }));
  res.json(list);
});

router.get("/nearby", (_req, res) => {
  const list = Array.from(db.hospitals.values()).map((h) => ({
    id: h.id,
    name: h.name,
    distanceKm: h.distanceKm,
    etaMinutes: h.etaMinutes,
    emergencyDepartment: h.emergencyDepartment,
    services: h.services,
    specialist: h.specialist,
    phone: h.phone,
    position: { lat: h.latitude, lng: h.longitude },
  }));
  res.json(list);
});

// Get hospital by ID
router.get("/:id", (req, res) => {
  const h = db.hospitals.get(req.params.id) || Array.from(db.hospitals.values())[0];
  res.json({
    id: h.id,
    name: h.name,
    distanceKm: h.distanceKm,
    etaMinutes: h.etaMinutes,
    emergencyDepartment: h.emergencyDepartment,
    services: h.services,
    specialist: h.specialist,
    phone: h.phone,
    position: { lat: h.latitude, lng: h.longitude },
  });
});

// Dispatch Emergency Amber Alert to hospital
router.post("/:id/emergency-alert", (req, res) => {
  const hospital = db.hospitals.get(req.params.id);
  const name = hospital ? hospital.name : "Sunrise Multispeciality";

  realtimeHub.broadcast("hospital:alert", {
    hospitalId: req.params.id,
    hospitalName: name,
    timestamp: new Date().toISOString(),
  });

  res.json({ status: "sent", hospital: name });
});

export default router;
