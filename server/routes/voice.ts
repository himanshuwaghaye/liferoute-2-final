import { Router } from "express";

const router = Router();

router.post("/transcribe", (req, res) => {
  const { audioData } = req.body;
  res.json({ text: "Patient reports sudden chest tightness and shortness of breath." });
});

router.post("/speak", (req, res) => {
  const { text } = req.body;
  res.json({ ok: true, synthesizedText: text });
});

export default router;
