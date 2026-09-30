import { Router } from "express";
import { db } from "../db/index.js";
import { authenticate, type AuthenticatedRequest } from "../middleware/auth.js";

const router = Router();

router.get("/me", authenticate, (req: AuthenticatedRequest, res) => {
  const user = req.user || db.users.get("usr-patient-1");
  if (!user) return res.status(404).json({ error: "User not found." });
  res.json({
    id: user.id,
    name: user.fullName.split(" ")[0],
    fullName: user.fullName,
    email: user.email,
    bloodGroup: user.bloodGroup,
    age: user.age,
    language: user.language,
    allergies: user.allergies,
    medications: user.medications,
    conditions: user.conditions,
    emergencyContacts: user.emergencyContacts,
    role: user.role,
  });
});

export default router;
