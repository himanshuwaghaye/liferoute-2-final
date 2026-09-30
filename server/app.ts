import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import emergencyRoutes from "./routes/emergency.js";
import ambulanceRoutes from "./routes/ambulances.js";
import hospitalRoutes from "./routes/hospitals.js";
import medicalRecordRoutes from "./routes/medicalRecords.js";
import paymentRoutes from "./routes/payments.js";
import billRoutes from "./routes/bills.js";
import aiRoutes from "./routes/ai.js";
import notificationRoutes from "./routes/notifications.js";
import userRoutes from "./routes/users.js";
import chatRoutes from "./routes/chat.js";
import voiceRoutes from "./routes/voice.js";

export function createApp() {
  const app = express();

  app.use(cors({ origin: true, credentials: true }));
  app.use(express.json({ limit: "15mb" }));
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "LifeRoute Emergency API",
      timestamp: new Date().toISOString(),
      uptimeSeconds: process.uptime(),
    });
  });

  // Mount API modules
  app.use("/api/auth", authRoutes);
  app.use("/api/emergency", emergencyRoutes);
  app.use("/api/ambulances", ambulanceRoutes);
  app.use("/api/hospitals", hospitalRoutes);
  app.use("/api/medical-records", medicalRecordRoutes);
  app.use("/api/payments", paymentRoutes);
  app.use("/api/bills", billRoutes);
  app.use("/api/ai", aiRoutes);
  app.use("/api/notifications", notificationRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/chat", chatRoutes);
  app.use("/api/voice", voiceRoutes);

  return app;
}
