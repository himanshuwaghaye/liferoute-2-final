import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, HeartPulse, Mic, Siren, Upload } from "lucide-react";
import { useAppState } from "@/context/AppStateProvider";
import { Button, Card, PageHeader, Pill } from "@/components/common/Primitives";
import type { EmergencyCategory } from "@/types";

export const Route = createFileRoute("/emergency/type")({
  head: () => ({
    meta: [
      { title: "Emergency type — LifeRoute" },
      {
        name: "description",
        content: "Choose the emergency category so the right team and hospital can prepare.",
      },
      { property: "og:title", content: "Emergency type — LifeRoute" },
      { property: "og:description", content: "Medical emergency or accident — pick a category." },
    ],
  }),
  component: EmergencyType,
});

const GROUPS: {
  key: EmergencyCategory;
  title: string;
  icon: typeof HeartPulse;
  items: string[];
}[] = [
  {
    key: "medical",
    title: "❤️ Serious Disease / Medical Emergency",
    icon: HeartPulse,
    items: ["Heart", "Neurological", "Breathing / Lung", "Unconsciousness", "Other"],
  },
  {
    key: "accident",
    title: "🚑 Accident / Injury",
    icon: Siren,
    items: ["Road accident", "Trauma", "Severe bleeding", "Serious injury", "Other"],
  },
];

function EmergencyType() {
  const { draft, setDraft } = useAppState();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Select Emergency Type"
        description="This helps the ambulance crew and hospital prepare before arrival."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {GROUPS.map((g) => (
          <Card key={g.key} className={draft.category === g.key ? "ring-2 ring-primary" : ""}>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <g.icon className="h-5 w-5 text-emergency" aria-hidden /> {g.title}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <button
                  key={item}
                  onClick={() => setDraft({ category: g.key, subtype: item })}
                  className={`rounded-full border px-3 py-1.5 text-sm ${
                    draft.category === g.key && draft.subtype === item
                      ? "border-primary bg-primary-soft font-semibold text-primary"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="text-lg font-semibold">Additional Information</h2>
        <textarea
          value={draft.symptoms}
          onChange={(e) => setDraft({ symptoms: e.target.value })}
          placeholder="Describe the symptoms"
          aria-label="Describe the symptoms"
          className="mt-3 h-28 w-full rounded-xl border border-border bg-card p-3 text-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent">
            <Upload className="h-4 w-4" aria-hidden /> Upload Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setDraft({ imageName: e.target.files?.[0]?.name ?? null })}
            />
          </label>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent">
            <Camera className="h-4 w-4" aria-hidden /> Capture Image
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => setDraft({ imageName: e.target.files?.[0]?.name ?? null })}
            />
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDraft({ symptoms: `${draft.symptoms} (spoken input captured)`.trim() })
            }
          >
            <Mic className="h-4 w-4" aria-hidden /> Speak Symptoms
          </Button>
          {draft.imageName ? <Pill tone="primary">{draft.imageName}</Pill> : null}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Your saved medical history and allergies are attached automatically for the responding
          crew.
        </p>
      </Card>

      <div className="flex gap-3">
        <Button
          variant="emergency"
          size="lg"
          disabled={!draft.category}
          onClick={() => navigate({ to: "/emergency/request" })}
        >
          Find Ambulance
        </Button>
        <Button variant="outline" size="lg" onClick={() => navigate({ to: "/emergency" })}>
          Back
        </Button>
      </div>
    </div>
  );
}
