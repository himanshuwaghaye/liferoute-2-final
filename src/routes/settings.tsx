import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Settings, Bell, Lock, Globe, Shield, Moon, Eye, Smartphone, Check } from "lucide-react";
import { Button, Card, PageHeader, Pill, SectionTitle } from "@/components/common/Primitives";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Account & Privacy Settings — LifeRoute" },
      {
        name: "description",
        content: "Configure notification preferences, emergency alerts, and data privacy.",
      },
    ],
  }),
  component: SettingsPage,
});

export function SettingsPage() {
  const [gpsPrecision, setGpsPrecision] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [aiAssistantMemory, setAiAssistantMemory] = useState(true);
  const [emergencyDataSharing, setEmergencyDataSharing] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & Privacy Preferences"
        description="Fine-tune your emergency alert channels and health data privacy parameters."
      >
        <Button size="sm" onClick={handleSave}>
          Save Preferences
        </Button>
      </PageHeader>

      {saved && (
        <div className="rounded-xl border border-success/40 bg-success-soft p-3 text-sm font-semibold text-success flex items-center gap-2">
          <Check className="h-4 w-4" /> Preferences saved successfully.
        </div>
      )}

      <div className="space-y-4">
        {/* Emergency & Dispatch Permissions */}
        <Card>
          <SectionTitle
            icon={<Shield className="h-4 w-4" />}
            title="Emergency Dispatch & Privacy"
            subtitle="Control data passed to responding paramedics and hospitals"
          />
          <div className="mt-4 space-y-3 divide-y divide-border">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-semibold">High-Accuracy Continuous GPS</p>
                <p className="text-xs text-muted-foreground">
                  Allows responding drivers to locate you with sub-5m accuracy.
                </p>
              </div>
              <input
                type="checkbox"
                checked={gpsPrecision}
                onChange={(e) => setGpsPrecision(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold">Automatic Allergy & Meds Handoff</p>
                <p className="text-xs text-muted-foreground">
                  Transmit life-saving allergy notes automatically during SOS.
                </p>
              </div>
              <input
                type="checkbox"
                checked={emergencyDataSharing}
                onChange={(e) => setEmergencyDataSharing(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold">AI Triage Context Retention</p>
                <p className="text-xs text-muted-foreground">
                  Allow AI Health Assistant to remember symptom notes within active session.
                </p>
              </div>
              <input
                type="checkbox"
                checked={aiAssistantMemory}
                onChange={(e) => setAiAssistantMemory(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
            </div>
          </div>
        </Card>

        {/* Notification Channels */}
        <Card>
          <SectionTitle
            icon={<Bell className="h-4 w-4" />}
            title="Notification & Broadcast Channels"
            subtitle="Where you and emergency contacts receive live ETA updates"
          />
          <div className="mt-4 space-y-3 divide-y divide-border">
            <div className="flex items-center justify-between pt-2">
              <div>
                <p className="text-sm font-semibold">SMS Dispatch Alerts</p>
                <p className="text-xs text-muted-foreground">
                  Direct SMS to family members with ambulance tracking URL.
                </p>
              </div>
              <input
                type="checkbox"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
            </div>

            <div className="flex items-center justify-between pt-3">
              <div>
                <p className="text-sm font-semibold">WhatsApp Live Tracking Updates</p>
                <p className="text-xs text-muted-foreground">
                  Receive real-time driver arrival notifications on WhatsApp.
                </p>
              </div>
              <input
                type="checkbox"
                checked={whatsappAlerts}
                onChange={(e) => setWhatsappAlerts(e.target.checked)}
                className="h-5 w-5 rounded border-border accent-primary"
              />
            </div>
          </div>
        </Card>

        {/* Security & Account */}
        <Card>
          <SectionTitle
            icon={<Lock className="h-4 w-4" />}
            title="Security & Session Management"
            subtitle="Manage passwords and active trusted devices"
          />
          <div className="mt-4 flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              Change Master Password
            </Button>
            <Button variant="outline" size="sm">
              Enable Two-Factor Auth (2FA)
            </Button>
            <Button variant="outline" size="sm">
              Export My Health Vault (JSON)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
