import { Router } from "express";
import { db } from "../db/index.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// List notifications
router.get("/", authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || "usr-patient-1";
  const list = Array.from(db.notifications.values()).filter(
    (n) => n.userId === userId || n.userId === "usr-patient-1",
  );
  res.json(list);
});

// Recent activity timeline
router.get("/activity", (_req, res) => {
  const activities = [
    { id: "a-1", label: "Ambulance LR-102 assigned (En Route)", time: "2 min ago" },
    {
      id: "a-2",
      label: "Hospital alert acknowledged by Sunrise Multispeciality",
      time: "3 min ago",
    },
    { id: "a-3", label: "AI symptom triage evaluation completed", time: "Yesterday" },
    { id: "a-4", label: "Medical record uploaded (CBC Report)", time: "2 days ago" },
    { id: "a-5", label: "Payment successful — ₹2,450 to Sunrise ER", time: "2 days ago" },
  ];
  res.json(activities);
});

export default router;
