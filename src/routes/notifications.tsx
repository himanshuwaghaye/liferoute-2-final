import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  BellRing,
  CheckCheck,
  Ambulance,
  Hospital,
  CreditCard,
  FileText,
  Info,
} from "lucide-react";
import { notificationService } from "@/services";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  LoadingBlock,
  EmptyState,
  DemoBadge,
} from "@/components/common/Primitives";
import type { AppNotification } from "@/types";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications & Alerts — LifeRoute" },
      {
        name: "description",
        content: "Emergency dispatch alerts, hospital prep updates, and payment notices.",
      },
    ],
  }),
  component: NotificationsPage,
});

export function NotificationsPage() {
  const notifsQuery = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.list,
  });

  const [localNotifs, setLocalNotifs] = useState<AppNotification[] | null>(null);

  const notifications = localNotifs ?? notifsQuery.data ?? [];

  const handleMarkAllRead = () => {
    setLocalNotifs(notifications.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: AppNotification["type"]) => {
    switch (type) {
      case "ambulance":
        return <Ambulance className="h-5 w-5 text-emergency" />;
      case "hospital":
        return <Hospital className="h-5 w-5 text-primary" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-success" />;
      case "record":
        return <FileText className="h-5 w-5 text-ai" />;
      default:
        return <Info className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications & Live Alerts"
        description="Real-time timeline of emergency dispatches, hospital readiness, and health records."
      >
        <div className="flex items-center gap-2">
          <DemoBadge />
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        </div>
      </PageHeader>

      {notifsQuery.isLoading ? (
        <LoadingBlock rows={4} />
      ) : notifications.length === 0 ? (
        <EmptyState message="No notifications right now." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start gap-4 p-4 transition-colors ${
                !n.read ? "border-primary/40 bg-card ring-1 ring-primary/20" : "opacity-80"
              }`}
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted">
                {getIcon(n.type)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-bold text-sm text-foreground truncate">{n.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{n.time}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{n.body}</p>
              </div>
              {!n.read && (
                <span className="h-2 w-2 rounded-full bg-emergency shrink-0 self-center" />
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
