import { createFileRoute } from "@tanstack/react-router";
import { DEMO_AMBULANCES, DEMO_HOSPITALS } from "@/data/mock";
import { useGeolocation } from "@/hooks/useGeolocation";
import { MapView } from "@/components/map/MapView";
import {
  Button,
  Card,
  DemoBadge,
  PageHeader,
  PermissionDeniedState,
  Pill,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Live map — LifeRoute" },
      {
        name: "description",
        content: "Live map with your location, nearby ambulances, hospitals, routes and traffic.",
      },
      { property: "og:title", content: "Live map — LifeRoute" },
      {
        property: "og:description",
        content: "See ambulances and hospitals around you in real time.",
      },
    ],
  }),
  component: MapPage,
});

function MapPage() {
  const { status, request, effectivePosition } = useGeolocation();

  return (
    <div className="space-y-6">
      <PageHeader title="Live Map" description="Your location, nearby ambulances and hospitals.">
        <DemoBadge />
      </PageHeader>

      {status === "denied" ? <PermissionDeniedState onRetry={request} /> : null}

      <Card className="p-3">
        <MapView
          className="h-[60vh]"
          markers={[
            { id: "u", kind: "user", label: "You", position: effectivePosition },
            ...DEMO_AMBULANCES.map((a) => ({
              id: a.id,
              kind: "ambulance" as const,
              label: a.code,
              position: a.position,
            })),
            ...DEMO_HOSPITALS.map((h) => ({
              id: h.id,
              kind: "hospital" as const,
              label: h.name.split(" ")[0]!,
              position: h.position,
            })),
          ]}
        />
      </Card>

      <div className="flex flex-wrap items-center gap-2">
        <Pill tone="primary">You</Pill>
        <Pill tone="emergency">Ambulance</Pill>
        <Pill tone="success">Hospital</Pill>
        {status !== "granted" ? (
          <Button size="sm" variant="outline" onClick={request}>
            Enable Location
          </Button>
        ) : (
          <Pill tone="success">GPS Active</Pill>
        )}
      </div>
    </div>
  );
}
