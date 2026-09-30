import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Ambulance,
  Bot,
  CreditCard,
  FileText,
  Hospital,
  Image as ImageIcon,
  MapPin,
  MessageCircle,
  Mic,
  PhoneCall,
  Receipt,
  Share2,
  Siren,
  Stethoscope,
} from "lucide-react";
import { DEMO_USER } from "@/data/mock";
import { notificationService } from "@/services";
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
  Pill,
  SectionTitle,
} from "@/components/common/Primitives";
import { DEMO_AMBULANCES, DEMO_HOSPITALS } from "@/data/mock";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — LifeRoute" },
      {
        name: "description",
        content:
          "Emergency SOS, live ambulance tracking, hospitals, records and payments in one place.",
      },
      { property: "og:title", content: "Dashboard — LifeRoute" },
      { property: "og:description", content: "Your emergency healthcare command centre." },
    ],
  }),
  component: Dashboard,
});

const QUICK_ACTIONS = [
  { to: "/emergency", label: "Emergency", icon: Siren },
  { to: "/ambulance", label: "Ambulance", icon: Ambulance },
  { to: "/map", label: "Live Map", icon: MapPin },
  { to: "/hospitals", label: "Hospitals", icon: Hospital },
  { to: "/ai/assessment", label: "AI Assessment", icon: Bot },
  { to: "/records", label: "Medical Records", icon: FileText },
  { to: "/ai/image-analysis", label: "Image Analysis", icon: ImageIcon },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/payments/bills", label: "Bills", icon: Receipt },
  { to: "/care-guide", label: "Care Guidance", icon: Stethoscope },
] as const;

function Dashboard() {
  const { tracking, setChatOpen, setVoiceOpen } = useAppState();
  const { status, request, accuracy, effectivePosition } = useGeolocation();
  const activity = useQuery({ queryKey: ["activity"], queryFn: notificationService.activity });

  const ambulance = tracking?.ambulance ?? DEMO_AMBULANCES[0]!;
  const hospital = tracking?.hospital ?? DEMO_HOSPITALS[0]!;

  return (
    <div className="space-y-6">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold sm:text-3xl">Welcome, {DEMO_USER.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            {status === "granted"
              ? `Location active${accuracy ? ` · ±${accuracy} m` : ""}`
              : "Location unavailable"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DemoBadge />
          {status !== "granted" ? (
            <Button size="sm" variant="outline" onClick={request}>
              Enable Location
            </Button>
          ) : (
            <Pill tone="success">GPS Active</Pill>
          )}
        </div>
      </header>

      {/* 1. EMERGENCY SOS */}
      <section className="rounded-2xl border border-emergency/30 bg-emergency-soft p-5 sm:p-6">
        <div className="flex items-center gap-2">
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-emergency text-emergency-foreground pulse-ring">
            <Siren className="h-5 w-5" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="text-xl font-extrabold text-emergency">EMERGENCY SOS</h2>
            <p className="text-sm text-foreground/80">Need emergency medical assistance?</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <Link to="/emergency/request" className="sm:col-span-1">
            <Button variant="emergency" size="lg" className="w-full">
              <Ambulance className="h-5 w-5" aria-hidden /> REQUEST AMBULANCE
            </Button>
          </Link>
          <a href="tel:112">
            <Button
              variant="outline"
              size="lg"
              className="w-full border-emergency/40 text-emergency"
            >
              <PhoneCall className="h-5 w-5" aria-hidden /> CALL EMERGENCY
            </Button>
          </a>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => {
              const text = `My location: ${effectivePosition.lat.toFixed(4)}, ${effectivePosition.lng.toFixed(4)}`;
              if (typeof navigator !== "undefined" && navigator.share)
                navigator.share({ text }).catch(() => {});
              else navigator.clipboard?.writeText(text);
            }}
          >
            <Share2 className="h-5 w-5" aria-hidden /> SHARE LOCATION
          </Button>
        </div>
      </section>

      {/* 4 + 3. Live map and ambulance status */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <SectionTitle
            icon={<MapPin className="h-4 w-4" />}
            title="Live Map"
            subtitle="User, ambulance and hospital positions"
            action={
              <Link to="/map" className="text-sm font-semibold text-primary">
                Open map
              </Link>
            }
          />
          <MapView
            className="mt-4 h-64 sm:h-80"
            markers={[
              { id: "u", kind: "user", label: "You", position: effectivePosition },
              { id: "a", kind: "ambulance", label: ambulance.code, position: ambulance.position },
              { id: "h", kind: "hospital", label: "Hospital", position: hospital.position },
            ]}
          />
        </Card>

        <Card>
          <SectionTitle icon={<Ambulance className="h-4 w-4" />} title="Ambulance Status" />
          {tracking ? (
            <div className="mt-4 space-y-3">
              <p className="text-2xl font-extrabold">🚑 {tracking.ambulance.code}</p>
              <Pill tone="emergency">ETA {tracking.etaMinutes} min</Pill>
              <p className="text-sm text-muted-foreground">
                {tracking.distanceKm} km away · {tracking.ambulance.type}
              </p>
              <p className="text-sm">Destination: {tracking.hospital.name}</p>
              <Link to="/ambulance/tracking">
                <Button className="w-full">Track ambulance</Button>
              </Link>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <EmptyState
                message="No active ambulance request."
                hint="Request one from Emergency SOS."
              />
              <Link to="/emergency/request">
                <Button variant="emergency" className="w-full">
                  Request ambulance
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {/* 5. Hospital connection + 6. AI + assistants */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <SectionTitle icon={<Hospital className="h-4 w-4" />} title="Hospital Connection" />
          <p className="mt-3 text-sm text-muted-foreground">{hospital.name}</p>
          <ol className="mt-3 space-y-2 text-sm">
            {[
              "Emergency Alert",
              "Sent",
              "Hospital Received",
              "Emergency Team Preparing",
              "Ready",
            ].map((s, i) => (
              <li key={s} className="flex items-center gap-2">
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${i < 3 ? "bg-success" : "bg-muted-foreground/40"}`}
                />
                {s}
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <SectionTitle icon={<Bot className="h-4 w-4" />} title="AI Emergency Assessment" />
          <p className="mt-3 text-sm text-muted-foreground">
            Share symptoms or a photo for AI-assisted triage information. Not a medical diagnosis.
          </p>
          <Link to="/ai/assessment">
            <Button variant="ai" className="mt-4 w-full">
              Start assessment
            </Button>
          </Link>
        </Card>
        <Card>
          <SectionTitle
            icon={<Stethoscope className="h-4 w-4" />}
            title="Assistants"
            subtitle="Two separate helpers"
          />
          <div className="mt-4 space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setChatOpen(true)}
            >
              <MessageCircle className="h-4 w-4" aria-hidden /> Health Chat
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setVoiceOpen(true)}
            >
              <Mic className="h-4 w-4" aria-hidden /> Voice Assistant
            </Button>
            <Link to="/care-guide" className="block">
              <Button variant="ghost" className="w-full justify-start">
                <Stethoscope className="h-4 w-4" aria-hidden /> Patient Care Guidance
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Quick actions */}
      <Card>
        <SectionTitle title="Quick Actions" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {QUICK_ACTIONS.map((a) => (
            <Link
              key={a.to + a.label}
              to={a.to}
              className="flex flex-col items-start gap-2 rounded-xl border border-border p-3 transition-colors hover:bg-accent"
            >
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-soft text-primary">
                <a.icon className="h-4 w-4" aria-hidden />
              </span>
              <span className="text-sm font-semibold">{a.label}</span>
            </Link>
          ))}
        </div>
      </Card>

      {/* Payments + activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <SectionTitle icon={<CreditCard className="h-4 w-4" />} title="Payments & Bills" />
          <div className="mt-4 grid grid-cols-2 gap-2">
            <Link to="/payments/scan">
              <Button className="w-full" size="sm">
                SCAN & PAY
              </Button>
            </Link>
            <Link to="/payments/bills">
              <Button variant="outline" className="w-full" size="sm">
                PAY BILL
              </Button>
            </Link>
            <Link to="/payments/bills">
              <Button variant="outline" className="w-full" size="sm">
                BILL RECORDS
              </Button>
            </Link>
            <Link to="/payments/history">
              <Button variant="outline" className="w-full" size="sm">
                HISTORY
              </Button>
            </Link>
            <Link to="/payments/receipts" className="col-span-2">
              <Button variant="ghost" className="w-full" size="sm">
                RECEIPTS
              </Button>
            </Link>
          </div>
        </Card>
        <Card>
          <SectionTitle title="Recent Activity" action={<DemoBadge />} />
          <div className="mt-4">
            {activity.isLoading ? (
              <LoadingBlock rows={3} />
            ) : activity.isError ? (
              <ErrorState onRetry={() => activity.refetch()} />
            ) : activity.data?.length ? (
              <ul className="space-y-3">
                {activity.data.map((item) => (
                  <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="min-w-0">{item.label}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{item.time}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState message="No recent activity yet." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
