import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Ambulance, Camera, Check, HeartPulse, MapPin, Mic, Siren, Upload } from "lucide-react";
import { ambulanceService, emergencyService } from "@/services";
import { useAppState } from "@/context/AppStateProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapView } from "@/components/map/MapView";
import {
  Button,
  Card,
  DemoBadge,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  PermissionDeniedState,
  Pill,
} from "@/components/common/Primitives";
import { DEMO_HOSPITALS } from "@/data/mock";
import type { EmergencyCategory } from "@/types";

export const Route = createFileRoute("/emergency/request")({
  head: () => ({
    meta: [
      { title: "Request an ambulance — LifeRoute" },
      {
        name: "description",
        content:
          "Confirm your location, choose the emergency type and dispatch the nearest ambulance.",
      },
      { property: "og:title", content: "Request an ambulance — LifeRoute" },
      { property: "og:description", content: "A guided four-step emergency request flow." },
    ],
  }),
  component: RequestFlow,
});

const STEPS = [
  "Confirm Your Location",
  "Select Emergency Type",
  "Additional Information",
  "Find Ambulance",
];

function RequestFlow() {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();
  const { draft, setDraft, assignAmbulance } = useAppState();
  const { status, request, accuracy, effectivePosition } = useGeolocation();
  const ambulances = useQuery({
    queryKey: ["ambulances", "nearby"],
    queryFn: ambulanceService.nearby,
    enabled: step === 3,
  });

  return (
    <div className="space-y-6">
      <PageHeader title="Request Ambulance" description="Emergency request — four quick steps.">
        <DemoBadge />
      </PageHeader>

      <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {STEPS.map((label, i) => (
          <li
            key={label}
            className={`rounded-xl border p-3 text-xs font-semibold ${i === step ? "border-primary bg-primary-soft text-primary" : i < step ? "border-success/40 bg-success-soft text-success" : "border-border text-muted-foreground"}`}
          >
            <span className="block text-[10px] uppercase tracking-wide">Step {i + 1}</span>
            {label}
          </li>
        ))}
      </ol>

      {step === 0 ? (
        <Card>
          <h2 className="text-lg font-semibold">Confirm Your Location</h2>
          {status === "denied" ? (
            <div className="mt-4">
              <PermissionDeniedState onRetry={request} />
            </div>
          ) : null}
          <MapView
            className="mt-4 h-60"
            route={false}
            markers={[{ id: "u", kind: "user", label: "You", position: effectivePosition }]}
          />
          <div className="mt-4 space-y-1 text-sm">
            <p className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />{" "}
              {effectivePosition.lat.toFixed(4)}, {effectivePosition.lng.toFixed(4)}
            </p>
            <p className="text-muted-foreground">
              Near Marine Lines, Mumbai · accuracy {accuracy ? `±${accuracy} m` : "approximate"}
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            {status !== "granted" ? (
              <Button variant="outline" onClick={request}>
                Enable Location
              </Button>
            ) : null}
            <Button onClick={() => setStep(1)}>Confirm Location</Button>
          </div>
        </Card>
      ) : null}

      {step === 1 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              key: "medical" as EmergencyCategory,
              title: "❤️ Serious Medical Emergency",
              icon: HeartPulse,
              items: [
                "Heart / chest emergency",
                "Neurological emergency",
                "Breathing difficulty",
                "Loss of consciousness",
              ],
            },
            {
              key: "accident" as EmergencyCategory,
              title: "🚑 Accident / Injury",
              icon: Siren,
              items: ["Road accident", "Trauma", "Serious injury", "Severe bleeding"],
            },
          ].map((g) => (
            <button
              key={g.key}
              onClick={() => {
                setDraft({ category: g.key });
                setStep(2);
              }}
              className={`card-surface p-5 text-left transition-shadow hover:shadow-[var(--shadow-float)] ${draft.category === g.key ? "ring-2 ring-primary" : ""}`}
            >
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <g.icon className="h-5 w-5 text-emergency" aria-hidden /> {g.title}
              </h2>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {g.items.map((i) => (
                  <li key={i}>• {i}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>
      ) : null}

      {step === 2 ? (
        <Card>
          <h2 className="text-lg font-semibold">Additional Information</h2>
          <textarea
            value={draft.symptoms}
            onChange={(e) => setDraft({ symptoms: e.target.value })}
            aria-label="Symptoms"
            placeholder="Describe symptoms (optional)"
            className="mt-3 h-28 w-full rounded-xl border border-border bg-card p-3 text-sm"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent">
              <Upload className="h-4 w-4" aria-hidden /> Upload image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => setDraft({ imageName: e.target.files?.[0]?.name ?? null })}
              />
            </label>
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm hover:bg-accent">
              <Camera className="h-4 w-4" aria-hidden /> Capture image
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
                setDraft({ symptoms: `${draft.symptoms} (voice note attached)`.trim() })
              }
            >
              <Mic className="h-4 w-4" aria-hidden /> Voice input
            </Button>
          </div>
          {draft.imageName ? <Pill tone="primary">{draft.imageName}</Pill> : null}
          <div className="mt-4 rounded-xl bg-muted p-3 text-sm">
            <p className="font-semibold">Attached from your profile</p>
            <p className="text-muted-foreground">
              Allergies: Penicillin, Dust mite · Medications: Salbutamol inhaler
            </p>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              variant="emergency"
              onClick={async () => {
                await emergencyService.create({ ...draft });
                setStep(3);
              }}
            >
              Find Ambulance
            </Button>
          </div>
        </Card>
      ) : null}

      {step === 3 ? (
        <Card>
          <h2 className="text-lg font-semibold">Nearby ambulances</h2>
          <div className="mt-4">
            {ambulances.isLoading ? (
              <LoadingBlock rows={3} />
            ) : ambulances.isError ? (
              <ErrorState
                message="Could not load nearby ambulances."
                onRetry={() => ambulances.refetch()}
              />
            ) : ambulances.data?.length ? (
              <ul className="space-y-3">
                {ambulances.data.map((a) => (
                  <li
                    key={a.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-border p-4"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 font-bold">
                        <Ambulance className="h-4 w-4 shrink-0 text-emergency" aria-hidden />{" "}
                        Ambulance {a.code}
                      </p>
                      <p className="text-sm text-muted-foreground">{a.type}</p>
                      <p className="mt-1 text-sm">
                        {a.distanceKm} km away · ETA {a.etaMinutes} minutes
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Driver: {a.driverAvailable ? "Available" : "Busy"} · Paramedic:{" "}
                        {a.paramedicAvailable ? "Available" : "Unavailable"}
                      </p>
                    </div>
                    <Button
                      className="shrink-0"
                      onClick={async () => {
                        await ambulanceService.request(a.id);
                        assignAmbulance(a, DEMO_HOSPITALS[0]);
                        navigate({ to: "/ambulance/tracking" });
                      }}
                    >
                      <Check className="h-4 w-4" aria-hidden /> Track Ambulance
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                message="No nearby ambulances found."
                hint="Try again in a moment or call emergency services."
              />
            )}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
