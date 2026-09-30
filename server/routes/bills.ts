import { Router } from "express";
import { db } from "../db/index.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

// List hospital bills
router.get("/", authenticate, (req: AuthenticatedRequest, res) => {
  const userId = req.user?.id || "usr-patient-1";
  const list = Array.from(db.bills.values()).filter(
    (b) => b.userId === userId || b.userId === "usr-patient-1",
  );
  res.json(list);
});

export default router;
