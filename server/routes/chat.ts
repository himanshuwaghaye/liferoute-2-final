import { Router } from "express";
import { groqAiService } from "../services/aiService.js";

const router = Router();

router.post("/", async (req, res) => {
  const { message, language } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const reply = await groqAiService.generateChatResponse(message, language || "English");
    res.json({ reply });
  } catch (err) {
    console.error("Chat response error:", err);
    res.status(500).json({ error: "Failed to generate chat response." });
  }
});

export default router;
