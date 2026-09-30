import { Router } from "express";
import { groqAiService } from "../services/aiService.js";

const router = Router();

// AI Emergency Symptom Assessment (POST /api/ai/assessment)
router.post("/assessment", async (req, res) => {
  const { symptoms, age, medicalHistory } = req.body;
  if (!symptoms) {
    return res.status(400).json({ error: "Symptoms description is required." });
  }

  try {
    const assessment = await groqAiService.assessSymptoms({
      symptoms,
      age,
      medicalHistory,
    });
    res.json(assessment);
  } catch (err) {
    console.error("AI assessment failed:", err);
    res.status(500).json({ error: "Failed to process AI assessment." });
  }
});

// AI Visual Image Triage (POST /api/ai/image-analysis)
router.post("/image-analysis", async (req, res) => {
  const { fileName, fileSize, notes, imageBase64, mimeType } = req.body;
  try {
    const assessment = await groqAiService.analyzeImage({
      fileName: fileName || "photo.jpg",
      fileSize,
      notes,
      imageBase64,
      mimeType,
    });
    res.json(assessment);
  } catch (err) {
    console.error("AI image analysis failed:", err);
    res.status(500).json({ error: "Failed to analyze image." });
  }
});

export default router;
