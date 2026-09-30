import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  Stethoscope,
  HeartPulse,
  Flame,
  Bandage,
  Wind,
  AlertCircle,
  PhoneCall,
  ChevronDown,
} from "lucide-react";
import { Card, PageHeader, Pill, SectionTitle, Button } from "@/components/common/Primitives";

export const Route = createFileRoute("/care-guide")({
  head: () => ({
    meta: [
      { title: "Emergency Care Guidance — LifeRoute" },
      { name: "description", content: "Step-by-step first aid and emergency response guides." },
    ],
  }),
  component: CareGuidePage,
});

interface GuideItem {
  id: string;
  title: string;
  category: string;
  icon: typeof HeartPulse;
  urgentNotice: string;
  steps: string[];
  doNots: string[];
}

const GUIDES: GuideItem[] = [
  {
    id: "cpr",
    title: "CPR & Cardiac Arrest Response",
    category: "Critical Life Support",
    icon: HeartPulse,
    urgentNotice: "Call 112 / Request Ambulance before starting chest compressions if alone.",
    steps: [
      "Check responsiveness: Tap shoulders firmly and ask loudly 'Are you okay?'.",
      "Check breathing: Look at chest for movement (no more than 10 seconds).",
      "Position hands: Place heel of one hand in center of chest, interlock other hand.",
      "Compress hard & fast: 100-120 beats/min (to the rhythm of 'Stayin Alive'), 2 inches deep.",
      "Allow full chest recoil between compressions.",
      "Continue until emergency medical services arrive or an AED is ready.",
    ],
    doNots: [
      "Do NOT pause compressions for more than 10 seconds.",
      "Do NOT place hands too low near the xiphoid process.",
    ],
  },
  {
    id: "choking",
    title: "Choking (Adult & Child)",
    category: "Airway Emergency",
    icon: Wind,
    urgentNotice:
      "If the person cannot cough, speak, or breathe, perform immediate abdominal thrusts.",
    steps: [
      "Stand behind the person, wrap arms around their waist.",
      "Make a fist with one hand and place the thumb side just above their navel.",
      "Grasp fist with your other hand and deliver quick, upward abdominal thrusts (Heimlich maneuver).",
      "Repeat until the obstruction is dislodged or person becomes unresponsive.",
      "If unresponsive, lower to ground and begin CPR immediately.",
    ],
    doNots: [
      "Do NOT perform blind finger sweeps in the mouth.",
      "Do NOT slap on the back while the person is upright if abdominal thrusts are indicated.",
    ],
  },
  {
    id: "bleeding",
    title: "Severe Bleeding Control",
    category: "Trauma",
    icon: Bandage,
    urgentNotice: "Direct, continuous pressure is the single most effective way to stop bleeding.",
    steps: [
      "Ensure personal safety (wear gloves if available).",
      "Apply direct, firm pressure on the wound with sterile gauze or clean cloth.",
      "Maintain continuous pressure for at least 10 minutes without lifting the cloth to check.",
      "If blood soaks through, add more layers on top without removing original dressing.",
      "If limb bleeding is catastrophic and unyielding, apply an arterial tourniquet 2-3 inches above the wound.",
    ],
    doNots: [
      "Do NOT remove deeply embedded foreign objects (glass, metal). Stabilize in place.",
      "Do NOT loosen tourniquet once applied until hospital care takes over.",
    ],
  },
  {
    id: "burns",
    title: "Burns & Scalds Management",
    category: "Environmental",
    icon: Flame,
    urgentNotice:
      "Cool water only — never apply ice, butter, toothpaste, or ointments to fresh burns.",
    steps: [
      "Stop the burning process: Remove from heat source safely.",
      "Cool immediately under cool running tap water for 20 minutes.",
      "Gently remove constricting jewelry, belts, or tight clothing before swelling occurs.",
      "Cover loosely with sterile, non-adherent dressing or clean plastic wrap.",
      "Keep the person warm to prevent hypothermia.",
    ],
    doNots: [
      "Do NOT pop blisters or peel burned skin.",
      "Do NOT apply ice directly, which causes further tissue damage.",
    ],
  },
];

export function CareGuidePage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string>("cpr");

  const categories = [
    "All",
    "Critical Life Support",
    "Airway Emergency",
    "Trauma",
    "Environmental",
  ];

  const filteredGuides =
    activeCategory === "All" ? GUIDES : GUIDES.filter((g) => g.category === activeCategory);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Emergency Care & First Aid Guidance"
        description="Standard clinical triage first-aid protocols while emergency responders are en route."
      >
        <Link to="/emergency/request">
          <Button variant="emergency" size="sm">
            Request Ambulance
          </Button>
        </Link>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeCategory === cat
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-card hover:bg-accent text-foreground"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredGuides.map((guide) => {
          const Icon = guide.icon;
          const isExpanded = expandedId === guide.id;

          return (
            <Card key={guide.id} className="transition-all">
              <button
                onClick={() => setExpandedId(isExpanded ? "" : guide.id)}
                className="flex w-full items-center justify-between text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-bold text-base sm:text-lg">{guide.title}</h3>
                    <p className="text-xs text-muted-foreground">{guide.category}</p>
                  </div>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-muted-foreground transition-transform ${
                    isExpanded ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="mt-5 space-y-4 border-t border-border pt-4">
                  <div className="rounded-xl border border-emergency/30 bg-emergency-soft p-3 text-xs font-semibold text-emergency flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>{guide.urgentNotice}</span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold">Action Steps (Priority Sequence):</h4>
                    <ol className="mt-2 space-y-2 text-sm text-foreground/90">
                      {guide.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary text-xs font-bold">
                            {idx + 1}
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-destructive">
                      What NOT To Do:
                    </h4>
                    <ul className="mt-1.5 space-y-1 text-xs text-destructive/90">
                      {guide.doNots.map((dont, i) => (
                        <li key={i}>• {dont}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <a href="tel:112" className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <PhoneCall className="h-4 w-4" /> Call 112
                      </Button>
                    </a>
                    <Link to="/emergency/request" className="flex-1">
                      <Button variant="emergency" size="sm" className="w-full">
                        Dispatch Ambulance
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
