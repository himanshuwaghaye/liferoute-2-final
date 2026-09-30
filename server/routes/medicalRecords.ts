import { Router } from "express";
import { db, type DBMedicalRecord } from "../db/index.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// List medical records
router.get("/", authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || "usr-patient-1";
  const records = Array.from(db.medicalRecords.values()).filter(
    (r) => r.userId === userId || r.userId === "usr-patient-1",
  );

  db.logAudit({
    userId,
    action: "MEDICAL_RECORDS_ACCESSED",
    resourceType: "MEDICAL_RECORD",
    details: { count: records.length },
  });

  res.json(records);
});

// Create new medical record
router.post("/", authenticate, (req: AuthenticatedRequest, res) => {
  const { title, section, provider, date, status } = req.body;
  const userId = req.user?.id || "usr-patient-1";

  const id = `rec-${Date.now()}`;
  const record: DBMedicalRecord = {
    id,
    userId,
    title: title || "Medical Document",
    section: section || "Lab Reports",
    provider: provider || "Hospital Clinic",
    date: date || new Date().toISOString().split("T")[0]!,
    status: status || "Final",
  };

  db.medicalRecords.set(id, record);

  db.logAudit({
    userId,
    action: "MEDICAL_RECORD_CREATED",
    resourceType: "MEDICAL_RECORD",
    resourceId: id,
    details: { title: record.title },
  });

  res.status(201).json(record);
});

export default router;
