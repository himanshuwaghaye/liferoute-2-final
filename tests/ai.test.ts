import { describe, it, expect } from "vitest";
import { groqAiService } from "../server/services/aiService";

describe("Groq AI Triage & Safety Suite", () => {
  it("generates critical cardiac warning for chest pain symptoms", async () => {
    const result = await groqAiService.assessSymptoms({
      symptoms: "Sudden crushing chest pain radiating to left arm and shortness of breath",
      age: 55,
      medicalHistory: "Hypertension",
    });

    expect(result).toBeDefined();
    expect(["Critical", "High"]).toContain(result.urgency);
    expect(result.warningSigns.length).toBeGreaterThan(0);
    expect(result.department.length).toBeGreaterThan(0);
  });

  it("classifies respiratory distress with high priority", async () => {
    const result = await groqAiService.assessSymptoms({
      symptoms: "Severe asthma attack, unable to breathe or speak",
      age: 24,
      medicalHistory: "Asthma",
    });

    expect(["Critical", "High"]).toContain(result.urgency);
    expect(result.specialist.length).toBeGreaterThan(0);
  });

  it("analyzes medical trauma images correctly", async () => {
    const result = await groqAiService.analyzeImage({
      fileName: "fracture_swelling.jpg",
      notes: "Severe bleeding and visible fracture after bike accident",
    });

    expect(result.category).toContain("Trauma");
    expect(result.department).toContain("Orthopaedic");
  });
});
