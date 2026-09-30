import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Hospital, Phone } from "lucide-react";
import { hospitalService } from "@/services";
import {
  Button,
  Card,
  DemoBadge,
  EmptyState,
  ErrorState,
  LoadingBlock,
  PageHeader,
  Pill,
} from "@/components/common/Primitives";

export const Route = createFileRoute("/hospitals")({
  head: () => ({
    meta: [
      { title: "Nearby hospitals — LifeRoute" },
      {
        name: "description",
        content: "Nearby hospitals with emergency departments, services, distance and routes.",
      },
      { property: "og:title", content: "Nearby hospitals — LifeRoute" },
      { property: "og:description", content: "Find the right emergency department fast." },
    ],
  }),
  component: Hospitals,
});

function Hospitals() {
  const q = useQuery({ queryKey: ["hospitals", "nearby"], queryFn: hospitalService.nearby });
  const [alerted, setAlerted] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="🏥 Nearby Hospitals"
        description="Emergency-ready facilities around your location."
      >
        <DemoBadge />
      </PageHeader>

      {q.isLoading ? (
        <LoadingBlock rows={3} />
      ) : q.isError ? (
        <ErrorState message="Could not load hospitals." onRetry={() => q.refetch()} />
      ) : q.data?.length ? (
        <ul className="grid gap-4 md:grid-cols-2">
          {q.data.map((h) => (
            <Card as="li" key={h.id}>
              <h2 className="flex items-start gap-2 text-lg font-semibold">
                <Hospital className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
                <span className="min-w-0">{h.name}</span>
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                <Pill>{h.distanceKm} km</Pill>
                <Pill tone="primary">ETA {h.etaMinutes} min</Pill>
                {h.emergencyDepartment ? <Pill tone="success">Emergency dept.</Pill> : null}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Services: {h.services.join(", ")}
              </p>
              <p className="mt-1 text-sm">Specialist: {h.specialist}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm">
                <Phone className="h-3.5 w-3.5" aria-hidden /> {h.phone}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm">VIEW HOSPITAL</Button>
                <Button size="sm" variant="outline">
                  GET ROUTE
                </Button>
                <Button
                  size="sm"
                  variant="emergency"
                  onClick={async () => {
                    await hospitalService.sendEmergencyAlert(h.id);
                    setAlerted(h.id);
                  }}
                >
                  SEND EMERGENCY ALERT
                </Button>
              </div>
              {alerted === h.id ? (
                <p className="mt-3 text-sm font-semibold text-success">
                  Alert sent — emergency team preparing.
                </p>
              ) : null}
            </Card>
          ))}
        </ul>
      ) : (
        <EmptyState message="No hospitals found nearby." />
      )}
    </div>
  );
}
