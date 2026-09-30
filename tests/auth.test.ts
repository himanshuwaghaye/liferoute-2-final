import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../server/db";
import { JWT_SECRET } from "../server/middleware/auth";

describe("Authentication & RBAC Security Suite", () => {
  it("hashes passwords securely", () => {
    const raw = "SecurePass@2026";
    const hashed = bcrypt.hashSync(raw, 10);
    expect(hashed).not.toBe(raw);
    expect(bcrypt.compareSync(raw, hashed)).toBe(true);
    expect(bcrypt.compareSync("WrongPass", hashed)).toBe(false);
  });

  it("generates and verifies JWT tokens with role payload", () => {
    const payload = { userId: "usr-patient-1", role: "PATIENT" };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
    const verified = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    expect(verified.userId).toBe("usr-patient-1");
    expect(verified.role).toBe("PATIENT");
  });

  it("seeds all required roles in database", () => {
    const users = Array.from(db.users.values());
    const roles = users.map((u) => u.role);

    expect(roles).toContain("PATIENT");
    expect(roles).toContain("AMBULANCE_DRIVER");
    expect(roles).toContain("PARAMEDIC");
    expect(roles).toContain("DOCTOR");
    expect(roles).toContain("ADMIN");
  });
});
