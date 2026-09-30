import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Users,
  User,
  HeartHandshake,
  Ambulance,
  Stethoscope,
  Hospital,
  ShieldAlert,
  CheckCircle2,
  Clock,
  MapPin,
  Activity,
  Bed,
  FileCheck,
  AlertTriangle,
  Radio,
} from "lucide-react";
import {
  Button,
  Card,
  PageHeader,
  Pill,
  SectionTitle,
  DemoBadge,
} from "@/components/common/Primitives";
import { DEMO_AMBULANCES, DEMO_HOSPITALS, DEMO_USER } from "@/data/mock";

export const Route = createFileRoute("/roles")({
  head: () => ({
    meta: [
      { title: "Role Command Centers — LifeRoute" },
      {
        name: "description",
        content:
          "Dedicated interfaces for Patients, Drivers, Paramedics, Hospitals, Doctors, and Admins.",
      },
    ],
  }),
  component: RolesDashboardPage,
});

type AppRole = "patient" | "family" | "driver" | "paramedic" | "hospital" | "doctor" | "admin";

export function RolesDashboardPage() {
  const [currentRole, setCurrentRole] = useState<AppRole>("driver");
  const [driverAvailable, setDriverAvailable] = useState(true);
  const [tripStage, setTripStage] = useState<string>("en_route");
  const [bedCount, setBedCount] = useState({ icu: 4, trauma: 2, general: 18 });

  const ROLES: { key: AppRole; label: string; icon: typeof User; desc: string }[] = [
    { key: "patient", label: "Patient", icon: User, desc: "Personal SOS & Medical Records" },
    {
      key: "family",
      label: "Family / Caregiver",
      icon: HeartHandshake,
      desc: "Live ICE Tracking & Updates",
    },
    {
      key: "driver",
      label: "Ambulance Driver",
      icon: Ambulance,
      desc: "Trip Dispatch, Navigation & GPS",
    },
    {
      key: "paramedic",
      label: "Paramedic",
      icon: Stethoscope,
      desc: "Vitals Logging & Triage Handoff",
    },
    {
      key: "hospital",
      label: "Hospital ER Staff",
      icon: Hospital,
      desc: "Incoming Amber Alerts & Bed Allocation",
    },
    {
      key: "doctor",
      label: "ER Physician / Doctor",
      icon: Activity,
      desc: "Case Summaries & Direct Consultation",
    },
    {
      key: "admin",
      label: "System Administrator",
      icon: ShieldAlert,
      desc: "Fleet Health, Fleet Logs & Audits",
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role-Based Command Centers"
        description="Switch viewports to test role-specific workflows and server-side RBAC authorizations."
      >
        <DemoBadge />
      </PageHeader>

      {/* Role Picker */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
        {ROLES.map((r) => {
          const Icon = r.icon;
          const isActive = currentRole === r.key;
          return (
            <button
              key={r.key}
              onClick={() => setCurrentRole(r.key)}
              className={`flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                  : "border-border bg-card hover:bg-accent text-foreground"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-bold leading-tight">{r.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Role Dashboard Viewport */}

      {/* 1. AMBULANCE DRIVER VIEWPORT */}
      {currentRole === "driver" && (
        <div className="space-y-4">
          <Card className="border-emergency/40 bg-card">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-emergency text-emergency-foreground font-black">
                    🚑
                  </span>
                  <div>
                    <h3 className="font-extrabold text-lg">Ambulance LR-102 (ALS Unit)</h3>
                    <p className="text-xs text-muted-foreground">
                      Driver: Rajesh Verma · GPS Broadcasting Active
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold">Duty Status:</span>
                <Button
                  size="sm"
                  variant={driverAvailable ? "success" : "outline"}
                  onClick={() => setDriverAvailable(!driverAvailable)}
                >
                  <Radio className="h-4 w-4" />
                  {driverAvailable ? "ONLINE & AVAILABLE" : "OFF-DUTY / BUSY"}
                </Button>
              </div>
            </div>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <SectionTitle
                icon={<MapPin className="h-4 w-4" />}
                title="Active Trip Dispatch: LR-REQ-24817"
                subtitle="Patient Location: Marine Lines, Mumbai (1.2 km away)"
              />
              <div className="mt-4 rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target Destination Hospital:</span>
                  <span className="font-bold">Sunrise Multispeciality Hospital</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Reported Chief Complaint:</span>
                  <span className="font-bold text-emergency">Severe Chest Tightness / Asthma</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estimated Arrival (ETA):</span>
                  <span className="font-bold text-primary">3 Minutes</span>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-xs font-bold uppercase text-muted-foreground">
                  Update Trip Progress (Live Sync):
                </h4>
                <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { key: "en_route", label: "En Route to Patient" },
                    { key: "arrived", label: "Arrived at Scene" },
                    { key: "picked_up", label: "Patient Onboard" },
                    { key: "at_hospital", label: "Arrived at Hospital" },
                  ].map((st) => (
                    <button
                      key={st.key}
                      onClick={() => setTripStage(st.key)}
                      className={`rounded-xl border p-2 text-xs font-bold transition-colors ${
                        tripStage === st.key
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card hover:bg-accent"
                      }`}
                    >
                      {st.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card>
              <SectionTitle title="Emergency Patient Summary" />
              <div className="mt-4 space-y-2 text-sm">
                <p>
                  <span className="text-muted-foreground">Name:</span>{" "}
                  <strong>{DEMO_USER.fullName}</strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Age / Blood:</span>{" "}
                  <strong>
                    {DEMO_USER.age} Yrs · {DEMO_USER.bloodGroup}
                  </strong>
                </p>
                <p>
                  <span className="text-muted-foreground">Allergies:</span>{" "}
                  <span className="text-destructive font-semibold">Penicillin, Dust mite</span>
                </p>
                <p>
                  <span className="text-muted-foreground">Medications:</span>{" "}
                  <span>Salbutamol inhaler</span>
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <a href="tel:+919000000001" className="block">
                  <Button variant="outline" size="sm" className="w-full">
                    Call Patient / Attendant
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* 2. PARAMEDIC VIEWPORT */}
      {currentRole === "paramedic" && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <SectionTitle
              icon={<Stethoscope className="h-4 w-4" />}
              title="En-Route Vitals & Clinical Logger"
              subtitle="Live stream to receiving ER triage team"
            />
            <form className="mt-4 space-y-3" onSubmit={(e) => e.preventDefault()}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground">
                    Heart Rate (BPM)
                  </label>
                  <input
                    type="number"
                    defaultValue={88}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">
                    SpO2 Blood Oxygen (%)
                  </label>
                  <input
                    type="number"
                    defaultValue={94}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold text-primary"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">
                    Blood Pressure (mmHg)
                  </label>
                  <input
                    type="text"
                    defaultValue="130/85"
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground">
                    GCS Consciousness Score
                  </label>
                  <input
                    type="number"
                    defaultValue={15}
                    max={15}
                    min={3}
                    className="mt-1 h-10 w-full rounded-xl border border-border bg-card px-3 text-sm font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground">
                  Administered Treatments & Drugs
                </label>
                <textarea
                  rows={2}
                  defaultValue="Oxygen administered at 4L/min via nasal cannula. Nebulized with Salbutamol 2.5mg."
                  className="mt-1 w-full rounded-xl border border-border bg-card p-2 text-sm"
                />
              </div>

              <Button size="sm" variant="success" className="w-full">
                Broadcast Vitals to Hospital ER
              </Button>
            </form>
          </Card>

          <Card>
            <SectionTitle
              title="Hospital Triage Handoff"
              subtitle="Sunrise Multispeciality Hospital"
            />
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-xl bg-success-soft p-3 text-success font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" /> Hospital ER team has acknowledged patient
                transfer.
              </div>
              <p className="text-xs text-muted-foreground">
                Receiving Physician: Dr. Neha Sharma (Emergency Medicine)
              </p>
              <div className="rounded-xl border border-border p-3 space-y-1 bg-muted/20 text-xs">
                <p className="font-bold">Allocated Trauma Bay: Bay #03 (Cardiac Resuscitation)</p>
                <p className="text-muted-foreground">Crash cart prepped · ECG machine calibrated</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 3. HOSPITAL ER VIEWPORT */}
      {currentRole === "hospital" && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-emergency-soft text-emergency">
                <Bed className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-black">{bedCount.icu} Available</p>
                <p className="text-xs text-muted-foreground">ICU Beds</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Activity className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-black">{bedCount.trauma} Available</p>
                <p className="text-xs text-muted-foreground">Trauma Emergency Bays</p>
              </div>
            </Card>
            <Card className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-success-soft text-success">
                <Bed className="h-5 w-5" />
              </span>
              <div>
                <p className="text-2xl font-black">{bedCount.general} Available</p>
                <p className="text-xs text-muted-foreground">General Wards</p>
              </div>
            </Card>
          </div>

          <Card>
            <SectionTitle
              icon={<Hospital className="h-4 w-4" />}
              title="Incoming Emergency Influx (Live Radar)"
              subtitle="Sunrise Multispeciality Hospital ER Command"
            />
            <div className="mt-4 space-y-3">
              <div className="flex flex-col justify-between gap-3 rounded-xl border border-emergency/40 bg-emergency-soft/20 p-4 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emergency animate-ping" />
                    <h4 className="font-bold text-base text-emergency">
                      INBOUND: Ambulance LR-102
                    </h4>
                    <Pill tone="emergency">ETA 3 MIN</Pill>
                  </div>
                  <p className="mt-1 text-xs text-foreground/80">
                    Patient: {DEMO_USER.fullName} (24M) · Chief Complaint: Respiratory Distress /
                    Asthma
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Vitals: SpO2 94% · HR 88 · BP 130/85
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="emergency">
                    Assign Trauma Bay 3
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 4. DOCTOR VIEWPORT */}
      {currentRole === "doctor" && (
        <div className="space-y-4">
          <Card>
            <SectionTitle
              icon={<Activity className="h-4 w-4" />}
              title="Emergency Attending Physician Portal"
              subtitle="Dr. Neha Sharma · Head of Emergency Medicine"
            />
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-border p-4 space-y-2">
                <h4 className="font-bold text-sm">Active Case: {DEMO_USER.fullName}</h4>
                <p className="text-xs text-muted-foreground">
                  Dispatched ALS Unit LR-102 · ETA 3 mins
                </p>
                <div className="rounded-lg bg-muted p-2 text-xs space-y-1">
                  <p>
                    <strong>Known Allergies:</strong> Penicillin, Dust mite
                  </p>
                  <p>
                    <strong>Past Emergencies:</strong> Emergency visit for asthma (Feb 2026)
                  </p>
                  <p>
                    <strong>Doctor Order:</strong> Prepare IV Aminophylline & Nebulizer station.
                  </p>
                </div>
                <div className="pt-2 flex gap-2">
                  <Button size="sm" variant="primary">
                    Accept Transfer
                  </Button>
                  <Button size="sm" variant="outline">
                    Request Tele-Consult
                  </Button>
                </div>
              </div>

              <div className="rounded-xl border border-border p-4 space-y-2">
                <h4 className="font-bold text-sm">Doctor Availability Switch</h4>
                <p className="text-xs text-muted-foreground">
                  Toggle availability for on-call emergency cases.
                </p>
                <div className="flex items-center gap-2 pt-2">
                  <Pill tone="success">ON-DUTY: Trauma Bay 1-4</Pill>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* 5. ADMIN VIEWPORT */}
      {currentRole === "admin" && (
        <div className="space-y-4">
          <Card>
            <SectionTitle
              icon={<ShieldAlert className="h-4 w-4" />}
              title="LifeRoute Regional Network Operations"
              subtitle="System-wide telemetry, ambulance fleet and audit logs"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground">Active Ambulances</p>
                <p className="text-2xl font-black">{DEMO_AMBULANCES.length} Online</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground">Connected Hospitals</p>
                <p className="text-2xl font-black">{DEMO_HOSPITALS.length} Centers</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-black text-success">5.2 Mins</p>
              </div>
              <div className="rounded-xl bg-card border border-border p-3">
                <p className="text-xs text-muted-foreground">Active WebSockets</p>
                <p className="text-2xl font-black text-primary">148 Nodes</p>
              </div>
            </div>

            <div className="mt-5 border-t border-border pt-4">
              <h4 className="text-xs font-bold uppercase text-muted-foreground">
                System Security Audit Trail:
              </h4>
              <ul className="mt-2 space-y-1.5 text-xs font-mono text-muted-foreground">
                <li>
                  [21:49:12] DISPATCH: LR-102 assigned to session #LR-REQ-24817 (Lat: 19.076, Lng:
                  72.877)
                </li>
                <li>
                  [21:48:55] AUTH: Doctor Dr. Neha Sharma verified role token (HOSPITAL_STAFF)
                </li>
                <li>
                  [21:45:02] AI_TRIAGE: Groq API query processed for symptom cluster (Resp: High)
                </li>
                <li>
                  [21:40:19] VAULT: Medical record #rec-1 accessed with authorized emergency consent
                </li>
              </ul>
            </div>
          </Card>
        </div>
      )}

      {/* 6. PATIENT / FAMILY VIEWPORT */}
      {(currentRole === "patient" || currentRole === "family") && (
        <Card>
          <SectionTitle
            title={
              currentRole === "patient"
                ? "Patient Emergency Command Center"
                : "Family Member / Caregiver Tracking Link"
            }
            subtitle="Follow active dispatches and view full medical profile"
          />
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setCurrentRole("driver")}>Switch to Driver Role</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
