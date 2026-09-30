import { createFileRoute, Link } from "@tanstack/react-router";
import { Crosshair, PhoneCall, RefreshCw } from "lucide-react";
import { STAGES, useAppState } from "@/context/AppStateProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapView } from "@/components/map/MapView";
import {
  Button,
  Card,
  DemoBadge,
  EmptyState,
  PageHeader,
  Pill,
  SectionTitle,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/ambulance/tracking")({
  head: () => ({
    meta: [
      { title: "Track your ambulance — LifeRoute" },
      {
        name: "description",
        content: "Live ambulance position, route, ETA and hospital destination.",
      },
      { property: "og:title", content: "Track your ambulance — LifeRoute" },
      {
        property: "og:description",
        content: "Follow every step from dispatch to hospital arrival.",
      },
    ],
  }),
  component: Tracking,
});

function Tracking() {
  const { tracking, advanceStage } = useAppState();
  const { effectivePosition } = useGeolocation();

  if (!tracking) {
    return (
      <div className="space-y-6">
        <PageHeader title="🚑 Track Your Ambulance" />
        <EmptyState message="No active ambulance request." hint="Start one from Emergency SOS." />
        <Link to="/emergency/request">
          <Button variant="emergency">Request ambulance</Button>
        </Link>
      </div>
    );
  }

  const currentIndex = STAGES.findIndex((s) => s.key === tracking.stage);

  return (
    <div className="space-y-6">
      <PageHeader title="🚑 Track Your Ambulance" description={`Request ${tracking.requestId}`}>
        <DemoBadge />
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <MapView
            className="h-72 sm:h-96"
            markers={[
              { id: "u", kind: "user", label: "You", position: effectivePosition },
              {
                id: "a",
                kind: "ambulance",
                label: tracking.ambulance.code,
                position: tracking.ambulance.position,
              },
              {
                id: "h",
                kind: "hospital",
                label: tracking.hospital.name.split(" ")[0]!,
                position: tracking.hospital.position,
              },
            ]}
          />
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" aria-hidden /> Refresh Location
            </Button>
            <Button variant="outline" size="sm">
              <Crosshair className="h-4 w-4" aria-hidden /> Center Map
            </Button>
            <a href="tel:112">
              <Button variant="outline" size="sm">
                <PhoneCall className="h-4 w-4" aria-hidden /> Contact Ambulance
              </Button>
            </a>
          </div>
        </Card>

        <div className="space-y-4">
          <Card>
            <SectionTitle
              title={`Ambulance ${tracking.ambulance.code}`}
              subtitle={tracking.ambulance.type}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Pill tone="emergency">ETA {tracking.etaMinutes} min</Pill>
              <Pill>{tracking.distanceKm} km</Pill>
            </div>
            <p className="mt-3 text-sm">Destination: {tracking.hospital.name}</p>
          </Card>

          <Card>
            <SectionTitle title="Status" />
            <ol className="mt-3 space-y-2.5">
              {STAGES.map((s, i) => (
                <li key={s.key} className="flex items-center gap-2 text-sm">
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold ${i < currentIndex ? "bg-success text-success-foreground" : i === currentIndex ? "bg-emergency text-emergency-foreground" : "bg-muted text-muted-foreground"}`}
                  >
                    {i < currentIndex ? "✓" : i === currentIndex ? "●" : "○"}
                  </span>
                  <button
                    onClick={() => advanceStage(s.key)}
                    className="min-w-0 truncate text-left hover:underline"
                  >
                    {s.label}
                  </button>
                </li>
              ))}
            </ol>
            <p className="mt-3 text-xs text-muted-foreground">
              Live updates arrive over the realtime channel when a backend is connected.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
