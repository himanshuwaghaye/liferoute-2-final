import { createFileRoute, Link } from "@tanstack/react-router";
import { Ambulance, HeartPulse, PhoneCall, Share2, Siren } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle } from "@/components/common/Primitives";

export const Route = createFileRoute("/emergency/")({
  head: () => ({
    meta: [
      { title: "Emergency SOS — LifeRoute" },
      {
        name: "description",
        content: "Request an ambulance, call emergency services or share your live location.",
      },
      { property: "og:title", content: "Emergency SOS — LifeRoute" },
      { property: "og:description", content: "Immediate emergency actions in one tap." },
    ],
  }),
  component: EmergencyHome,
});

function EmergencyHome() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="🚨 Emergency SOS"
        description="Need emergency medical assistance? Choose an action below."
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <Link to="/emergency/request">
          <Button variant="emergency" size="lg" className="h-24 w-full flex-col">
            <Ambulance className="h-6 w-6" aria-hidden /> REQUEST AMBULANCE
          </Button>
        </Link>
        <a href="tel:112">
          <Button
            variant="outline"
            size="lg"
            className="h-24 w-full flex-col border-emergency/40 text-emergency"
          >
            <PhoneCall className="h-6 w-6" aria-hidden /> CALL EMERGENCY
          </Button>
        </a>
        <Button
          variant="outline"
          size="lg"
          className="h-24 w-full flex-col"
          onClick={() =>
            navigator.clipboard?.writeText("Emergency: my live LifeRoute location link")
          }
        >
          <Share2 className="h-6 w-6" aria-hidden /> SHARE LOCATION
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <SectionTitle
            icon={<HeartPulse className="h-4 w-4" />}
            title="Serious Medical Emergency"
            subtitle="Heart, neurological, breathing, unconsciousness"
          />
          <Link to="/emergency/type">
            <Button className="mt-4 w-full">Choose this emergency</Button>
          </Link>
        </Card>
        <Card>
          <SectionTitle
            icon={<Siren className="h-4 w-4" />}
            title="Accident / Injury"
            subtitle="Road accident, trauma, severe bleeding"
          />
          <Link to="/emergency/type">
            <Button className="mt-4 w-full">Choose this emergency</Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
