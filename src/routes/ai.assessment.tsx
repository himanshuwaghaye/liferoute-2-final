import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Sparkles, AlertTriangle, ArrowLeft, Mic, Siren } from "lucide-react";
import { aiService } from "@/services";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  LoadingBlock,
} from "@/components/common/Primitives";
import type { AiAssessment } from "@/types";

export const Route = createFileRoute("/ai/assessment")({
  head: () => ({
    meta: [
      { title: "AI Symptom Assessment — LifeRoute" },
      { name: "description", content: "Instant structured emergency triage and symptom analysis." },
    ],
  }),
  component: AiAssessmentPage,
});

export function AiAssessmentPage() {
  const [symptoms, setSymptoms] = useState("");
  const [age, setAge] = useState("24");
  const [medicalHistory, setMedicalHistory] = useState("Mild asthma");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AiAssessment | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) return;
    setLoading(true);
    try {
      const res = await aiService.assessment({ symptoms, age, medicalHistory });
      setResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyTone = (urgency: string) => {
    switch (urgency) {
      case "Critical":
      case "High":
        return "emergency";
      case "Moderate":
        return "warning";
      default:
        return "success";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link
          to="/ai"
          className="text-sm font-semibold text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="inline h-4 w-4 mr-1" /> Back to AI Hub
        </Link>
      </div>

      <PageHeader
        title="AI Symptom Assessment"
        description="Provide details regarding your symptoms for instant clinical triage guidance."
      >
        <Pill tone="ai">AI Powered</Pill>
      </PageHeader>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card as="section">
          <SectionTitle
            icon={<Bot className="h-4 w-4" />}
            title="Symptom Intake"
            subtitle="Describe what you or the patient are experiencing"
          />

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <label htmlFor="symptoms" className="text-sm font-semibold">
                Symptoms & Onset Duration *
              </label>
              <textarea
                id="symptoms"
                required
                rows={4}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. Sudden severe chest tightness and shortness of breath starting 20 minutes ago..."
                className="mt-1 w-full rounded-xl border border-border bg-card p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="age" className="text-sm font-semibold">
                  Patient Age
                </label>
                <input
                  id="age"
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label htmlFor="history" className="text-sm font-semibold">
                  Known Conditions
                </label>
                <input
                  id="history"
                  type="text"
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="e.g. Asthma, Diabetes"
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSymptoms((prev) =>
                    `${prev} [Voice Input: Shortness of breath when speaking]`.trim(),
                  )
                }
              >
                <Mic className="h-4 w-4" /> Add Voice Note
              </Button>
            </div>

            <Button
              type="submit"
              variant="ai"
              className="w-full"
              disabled={loading || !symptoms.trim()}
            >
              {loading ? (
                "Analyzing with Groq AI..."
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Run Emergency Triage
                </>
              )}
            </Button>
          </form>
        </Card>

        <div className="space-y-4">
          {loading ? (
            <Card>
              <h3 className="font-semibold text-sm text-muted-foreground">
                Evaluating clinical symptoms...
              </h3>
              <div className="mt-4">
                <LoadingBlock rows={4} />
              </div>
            </Card>
          ) : result ? (
            <Card className="border-ai/30">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">{result.category}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Confidence: {result.confidence}
                  </p>
                </div>
                <Pill tone={getUrgencyTone(result.urgency)}>{result.urgency} Urgency</Pill>
              </div>

              <div className="mt-5 space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Observed Warning Signs
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-sm">
                    {result.warningSigns.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-3 rounded-xl bg-muted/60 p-3 text-xs">
                  <div>
                    <span className="font-medium text-muted-foreground">Recommended Dept:</span>
                    <p className="mt-0.5 font-bold text-foreground text-sm">{result.department}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Specialist Field:</span>
                    <p className="mt-0.5 font-bold text-foreground text-sm">{result.specialist}</p>
                  </div>
                </div>

                {result.urgency === "High" || result.urgency === "Critical" ? (
                  <div className="rounded-xl border border-emergency/30 bg-emergency-soft p-4">
                    <div className="flex items-center gap-2 text-emergency font-bold text-sm">
                      <Siren className="h-4 w-4" /> Immediate Medical Attention Recommended
                    </div>
                    <p className="mt-1 text-xs text-foreground/80">
                      Based on the reported symptoms, do not delay care. Request an ambulance
                      immediately.
                    </p>
                    <div className="mt-3">
                      <Link to="/emergency/request">
                        <Button variant="emergency" size="sm" className="w-full">
                          Request Ambulance Now
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>
            </Card>
          ) : (
            <Card className="flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ai-soft text-ai">
                <Bot className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold">Awaiting Symptom Details</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Fill out the form on the left to generate an AI clinical evaluation with recommended
                care priorities.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
