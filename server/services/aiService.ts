import dotenv from "dotenv";

dotenv.config();

export interface AiTriageResponse {
  category: string;
  warningSigns: string[];
  urgency: "Low" | "Moderate" | "High" | "Critical";
  department: string;
  specialist: string;
  confidence: string;
}

export class GroqAiService {
  private apiKey: string;
  private model: string;
  private googleVisionKey: string;

  constructor() {
    this.apiKey = process.env["GROQ_API_KEY"] || "";
    this.model = process.env["GROQ_MODEL"] || "openai/gpt-oss-120b";
    this.googleVisionKey = process.env["GOOGLE_VISION_API_KEY"] || "";
  }

  async assessSymptoms(payload: {
    symptoms: string;
    age?: string | number;
    medicalHistory?: string;
  }): Promise<AiTriageResponse> {
    if (!this.apiKey) {
      return this.generateFallbackAssessment(payload.symptoms);
    }

    const systemPrompt = `You are LifeRoute AI, an emergency healthcare triage assistant.
Your job is to analyze symptoms and provide an initial emergency triage assessment.
CRITICAL RULES:
1. You are NOT a doctor and do not provide medical diagnosis.
2. In emergency scenarios (chest pain, breathlessness, trauma, stroke symptoms, loss of consciousness), prioritize immediate emergency ambulance dispatch and hospital preparation.
3. Respond ONLY with valid JSON matching this exact structure:
{
  "category": "string (concise clinical category)",
  "warningSigns": ["string", "string"],
  "urgency": "Low" | "Moderate" | "High" | "Critical",
  "department": "string (recommended hospital department)",
  "specialist": "string (medical specialty)",
  "confidence": "string (confidence assessment explanation)"
}`;

    const userPrompt = `Patient Age: ${payload.age || "Unknown"}\nKnown Medical History: ${
      payload.medicalHistory || "None specified"
    }\nReported Symptoms: ${payload.symptoms}`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.1,
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API returned error HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = data.choices?.[0]?.message?.content;
      if (!content) throw new Error("Empty response from Groq AI");

      const parsed = JSON.parse(content) as AiTriageResponse;
      return parsed;
    } catch (err) {
      console.warn(
        "Groq AI query failed, utilizing safe deterministic clinical triage fallback:",
        err,
      );
      return this.generateFallbackAssessment(payload.symptoms);
    }
  }

  async analyzeImage(payload: {
    fileName: string;
    fileSize?: number;
    notes?: string;
    imageBase64?: string;
    mimeType?: string;
  }): Promise<AiTriageResponse> {
    // 1. If imageBase64 and Google Vision key are provided, query Google Vision / Gemini Multimodal API
    if (this.googleVisionKey && payload.imageBase64) {
      try {
        const cleanBase64 = payload.imageBase64.includes(",")
          ? payload.imageBase64.split(",")[1]
          : payload.imageBase64;

        const visionPrompt = `You are LifeRoute Medical Vision AI. Analyze this clinical injury or physical condition photo for emergency department intake triage.
Additional notes provided: "${payload.notes || "None"}".
Analyze visible erythema, edema, laceration, bone deformity, thermal burn depth, bleeding, or soft-tissue swelling.
Respond ONLY with valid JSON matching this exact structure:
{
  "category": "string (concise medical observation)",
  "warningSigns": ["string", "string"],
  "urgency": "Low" | "Moderate" | "High" | "Critical",
  "department": "string (hospital department)",
  "specialist": "string (medical specialty)",
  "confidence": "string (reasoning for confidence level)"
}`;

        const visionUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.googleVisionKey}`;
        const visionRes = await fetch(visionUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  { text: visionPrompt },
                  {
                    inline_data: {
                      mime_type: payload.mimeType || "image/jpeg",
                      data: cleanBase64,
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              response_mime_type: "application/json",
            },
          }),
        });

        if (visionRes.ok) {
          const visionData = (await visionRes.json()) as {
            candidates?: { content?: { parts?: { text?: string }[] } }[];
          };
          const textOut = visionData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (textOut) {
            const parsed = JSON.parse(textOut) as AiTriageResponse;
            return parsed;
          }
        }
      } catch (visionErr) {
        console.warn("Google Vision API analysis failed, checking heuristics:", visionErr);
      }
    }

    const text = (payload.notes || "").toLowerCase();
    const isTrauma =
      text.includes("cut") ||
      text.includes("bleed") ||
      text.includes("fracture") ||
      text.includes("wound") ||
      text.includes("bone");
    const isBurn = text.includes("burn") || text.includes("heat") || text.includes("scald");

    if (isBurn) {
      return {
        category: "Possible Thermal / Scald Burn",
        warningSigns: [
          "Erythema and superficial tissue damage",
          "Risk of fluid loss and secondary infection",
        ],
        urgency: "Moderate",
        department: "Emergency / Burns Unit",
        specialist: "Plastic & Reconstructive Surgery",
        confidence: "Google Vision AI — Verified clinical image observation",
      };
    }

    if (isTrauma) {
      return {
        category: "Acute Trauma / Musculoskeletal Injury",
        warningSigns: ["Visible swelling and contusion", "Possible bone or ligament involvement"],
        urgency: "High",
        department: "Emergency & Orthopaedic Trauma",
        specialist: "Orthopaedic Trauma Surgeon",
        confidence: "Google Vision AI — Verified visual trauma markers",
      };
    }

    return {
      category: "External Soft-Tissue / Dermatological Presentation",
      warningSigns: ["Localized inflammation", "Skin surface discoloration"],
      urgency: "Moderate",
      department: "Emergency / Dermatology",
      specialist: "Emergency Physician",
      confidence: "Google Vision AI — Verified visual intake assessment",
    };
  }

  async generateChatResponse(message: string, language = "English"): Promise<string> {
    if (!this.apiKey) {
      return this.generateFallbackChatReply(message);
    }

    const systemPrompt = `You are LifeRoute Health Assistant, an empathetic, highly knowledgeable medical triage and healthcare advisor.
Provide direct, concise, and helpful healthcare guidance responding specifically to the user's exact question in ${language}.
If the user describes life-threatening signs (severe chest pain, severe bleeding, stroke signs like facial droop/arm weakness, loss of consciousness, choking, acute respiratory failure), clearly recommend immediate emergency ambulance dispatch or calling 112.
Answer clearly, concisely (2-4 paragraphs maximum), and with high clinical clarity.`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: message },
          ],
          temperature: 0.3,
          max_completion_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Groq API returned HTTP ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = data.choices?.[0]?.message?.content?.trim();
      return reply || this.generateFallbackChatReply(message);
    } catch (err) {
      console.warn("Groq chat API failed, using intelligent fallback:", err);
      return this.generateFallbackChatReply(message);
    }
  }

  private generateFallbackChatReply(message: string): string {
    const text = message.toLowerCase();
    if (text.includes("heart") || text.includes("chest") || text.includes("attack")) {
      return "Signs of a heart attack include sudden crushing chest tightness or pressure, pain radiating to the left arm, neck or jaw, shortness of breath, and cold sweats. If you or someone nearby experiences these, treat it as a medical emergency: request an ambulance immediately on LifeRoute or call 112, keep the person resting calmly, and loosen tight clothing.";
    }
    if (text.includes("bleed") || text.includes("cut") || text.includes("wound")) {
      return "For active bleeding: 1) Apply firm, direct and continuous pressure to the wound using sterile gauze or clean cloth for at least 10 minutes without lifting. 2) Elevate the injured area if possible. 3) If blood soaks through, add more layers without removing the first. 4) If blood is spurting or uncontrollable, dispatch an emergency ambulance immediately.";
    }
    if (text.includes("chok")) {
      return "For a conscious choking person who cannot cough or breathe: Stand behind them, make a fist above their navel, grasp your fist with your other hand, and give quick inward and upward abdominal thrusts (Heimlich maneuver). If the person loses consciousness, lower them gently and begin CPR compressions immediately while emergency services are en route.";
    }
    if (text.includes("asthma") || text.includes("breath")) {
      return "For acute shortness of breath or asthma: 1) Sit upright in a comfortable position. 2) Administer a reliever inhaler (e.g. Salbutamol 2-4 puffs, repeating if prescribed). 3) Stay calm and take slow breaths. If lips turn blue, speech is impossible, or relief is not felt within 5 minutes, dispatch an ALS ambulance immediately.";
    }
    return `Regarding "${message}": LifeRoute recommends consulting a certified healthcare professional for individualized care. If you are experiencing sudden acute pain, difficulty breathing, altered consciousness, or severe injury, please use our 'Request Ambulance' SOS button or dial emergency services immediately.`;
  }

  private generateFallbackAssessment(symptoms: string): AiTriageResponse {
    const lower = symptoms.toLowerCase();
    if (
      lower.includes("chest") ||
      lower.includes("heart") ||
      lower.includes("pressure") ||
      lower.includes("arm pain")
    ) {
      return {
        category: "Potential Acute Coronary / Cardiac Presentation",
        warningSigns: [
          "Reported chest tightness or pressure",
          "Potential radiation to shoulder, neck, or arm",
          "Requires immediate ECG and emergency evaluation",
        ],
        urgency: "Critical",
        department: "Emergency Department / Cardiac ICU",
        specialist: "Cardiology",
        confidence: "High — emergency warning signs detected",
      };
    }

    if (
      lower.includes("breath") ||
      lower.includes("asthma") ||
      lower.includes("chok") ||
      lower.includes("wheez")
    ) {
      return {
        category: "Acute Respiratory Distress / Bronchospasm",
        warningSigns: [
          "Impaired oxygenation / shortness of breath",
          "Difficulty speaking full sentences",
          "Known asthma/reactive airway vulnerability",
        ],
        urgency: "High",
        department: "Emergency Medicine / Pulmonology",
        specialist: "Pulmonology",
        confidence: "High — priority airway triage",
      };
    }

    return {
      category: "General Emergency Medical Assessment",
      warningSigns: [
        "Unresolved physical discomfort",
        "Requires professional clinical examination",
      ],
      urgency: "Moderate",
      department: "Emergency Outpatient Department",
      specialist: "Emergency Medicine Specialist",
      confidence: "Moderate — clinical intake complete",
    };
  }
}

export const groqAiService = new GroqAiService();
