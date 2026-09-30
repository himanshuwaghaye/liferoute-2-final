import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Ambulance } from "lucide-react";
import { ambulanceService } from "@/services";
import { useAppState } from "@/context/AppStateProvider";
import { DEMO_HOSPITALS } from "@/data/mock";
import {
  Button,
  Card,
  DemoBadge,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/ambulance/")({
  head: () => ({
    meta: [
      { title: "Nearby ambulances — LifeRoute" },
      {
        name: "description",
        content: "See nearby ambulances with distance, ETA and crew availability.",
      },
      { property: "og:title", content: "Nearby ambulances — LifeRoute" },
      { property: "og:description", content: "Dispatch the closest available unit." },
    ],
  }),
  component: AmbulanceList,
});

function AmbulanceList() {
  const { assignAmbulance, tracking } = useAppState();
  const navigate = useNavigate();
  const q = useQuery({ queryKey: ["ambulances", "nearby"], queryFn: ambulanceService.nearby });

  return (
    <div className="space-y-6">
      <PageHeader
        title="🚑 Nearby Ambulances"
        description="Availability shown for your current area."
      >
        <DemoBadge />
      </PageHeader>

      {tracking ? (
        <Card className="border-emergency/30 bg-emergency-soft">
          <p className="font-semibold">
            Active request · {tracking.ambulance.code} · ETA {tracking.etaMinutes} min
          </p>
          <Link to="/ambulance/tracking">
            <Button className="mt-3" size="sm">
              Open live tracking
            </Button>
          </Link>
        </Card>
      ) : null}

      {q.isLoading ? (
        <LoadingBlock rows={3} />
      ) : q.isError ? (
        <ErrorState message="Could not load ambulances." onRetry={() => q.refetch()} />
      ) : q.data?.length ? (
        <ul className="space-y-3">
          {q.data.map((a) => (
            <Card
              as="li"
              key={a.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
            >
              <div className="min-w-0">
                <p className="flex items-center gap-2 font-bold">
                  <Ambulance className="h-4 w-4 shrink-0 text-emergency" aria-hidden /> Ambulance{" "}
                  {a.code}
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
                onClick={() => {
                  assignAmbulance(a, DEMO_HOSPITALS[0]);
                  navigate({ to: "/ambulance/tracking" });
                }}
              >
                Track Ambulance
              </Button>
            </Card>
          ))}
        </ul>
      ) : (
        <EmptyState message="No nearby ambulances found." />
      )}
    </div>
  );
}
