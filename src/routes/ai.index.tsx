import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  Image as ImageIcon,
  Sparkles,
  Stethoscope,
  AlertTriangle,
  ShieldCheck,
} from "lucide-react";
import { Button, Card, PageHeader, Pill, SectionTitle } from "@/components/common/Primitives";

export const Route = createFileRoute("/ai/")({
  head: () => ({
    meta: [
      { title: "AI Health Assistant — LifeRoute" },
      {
        name: "description",
        content: "AI-powered emergency symptom triage, assessment and guidance.",
      },
    ],
  }),
  component: AiHub,
});

function AiHub() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Health Hub"
        description="Fast symptom assessment and triage guidance powered by AI."
      >
        <Pill tone="ai">AI Active</Pill>
      </PageHeader>

      <div className="rounded-2xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning-foreground">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-semibold">Important Medical Disclaimer</p>
            <p className="mt-1 opacity-90">
              LifeRoute AI provides emergency triage information and guidance, not an official
              medical diagnosis. In life-threatening situations, call emergency services immediately
              or request an ambulance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex flex-col justify-between">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ai-soft text-ai">
              <Bot className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-bold">Symptom Assessment</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Describe your symptoms in detail or use speech input to receive structured triage
              feedback, recommended urgency level, and specialty recommendations.
            </p>
          </div>
          <div className="mt-6">
            <Link to="/ai/assessment">
              <Button variant="ai" className="w-full">
                <Sparkles className="h-4 w-4" /> Start Assessment
              </Button>
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ai-soft text-ai">
              <ImageIcon className="h-6 w-6" />
            </span>
            <h2 className="mt-4 text-xl font-bold">Image Triage Analysis</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Upload or capture a photo of a visible injury, swelling, or skin condition for visual
              triage analysis and department matching.
            </p>
          </div>
          <div className="mt-6">
            <Link to="/ai/image-analysis">
              <Button variant="ai" className="w-full">
                <ImageIcon className="h-4 w-4" /> Analyze Medical Photo
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Clinical Safety & Confidentiality"
          subtitle="How LifeRoute handles medical intelligence"
        />
        <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ai" />
            <span>Server-side Groq LLM inference with zero data retention for training.</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ai" />
            <span>
              Structured output categorizing Observation, Urgency, and Recommended Actions.
            </span>
          </li>
          <li className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-ai" />
            <span>Automatic linkage of saved allergy & prescription records when permitted.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
