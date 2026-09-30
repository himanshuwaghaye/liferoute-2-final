import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, type DBUser } from "../db/index.js";

export const JWT_SECRET =
  process.env["JWT_SECRET"] || "liferoute-super-secure-production-jwt-secret-key-2026";

export interface AuthenticatedRequest extends Request {
  user?: DBUser;
}

export function authenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // If running in development/local demo mode and no token, fall back to demo patient
    const demoUser = db.users.get("usr-patient-1");
    if (demoUser) {
      req.user = demoUser;
      return next();
    }
    return res.status(401).json({ error: "Missing or invalid authorization token." });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = db.users.get(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User session expired or invalid." });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid authorization token signature." });
  }
}

export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      db.logAudit({
        userId: req.user.id,
        action: "RBAC_DENIED",
        resourceType: "API_ENDPOINT",
        resourceId: req.originalUrl,
        details: { userRole: req.user.role, requiredRoles: allowedRoles },
        ipAddress: req.ip,
      });
      return res.status(403).json({
        error: `Forbidden: Role '${req.user.role}' is not authorized to access this resource.`,
      });
    }

    next();
  };
}
