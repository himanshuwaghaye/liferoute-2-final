import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Ambulance,
  BellRing,
  Bot,
  CreditCard,
  FileText,
  Heart,
  Hospital,
  Image as ImageIcon,
  LayoutDashboard,
  Map,
  MessageCircle,
  Mic,
  Receipt,
  Settings,
  ShieldCheck,
  Siren,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppState } from "@/context/AppStateProvider";
import { useGeolocation } from "@/hooks/useGeolocation";
import { HealthChat } from "@/components/assistants/HealthChat";
import { VoiceAssistant } from "@/components/assistants/VoiceAssistant";
import { DEMO_NOTIFICATIONS, DEMO_USER } from "@/data/mock";

const NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/emergency", label: "Emergency", icon: Siren },
  { to: "/ambulance/tracking", label: "Ambulance", icon: Ambulance },
  { to: "/map", label: "Live Map", icon: Map },
  { to: "/hospitals", label: "Hospitals", icon: Hospital },
  { to: "/ai", label: "AI Health", icon: Bot },
  { to: "/care-guide", label: "Care Guidance", icon: Stethoscope },
  { to: "/records", label: "Records", icon: FileText },
  { to: "/payments", label: "Payments", icon: CreditCard },
  { to: "/payments/bills", label: "Bills", icon: Receipt },
  { to: "/notifications", label: "Notifications", icon: BellRing },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/roles", label: "Role dashboards", icon: Users },
] as const;

const MOBILE_NAV = [
  { to: "/dashboard", label: "Home", icon: LayoutDashboard },
  { to: "/emergency", label: "Emergency", icon: Siren },
  { to: "/map", label: "Map", icon: Map },
  { to: "/ai", label: "Health", icon: Activity },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function LifeRouteLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emergency text-emergency-foreground">
        <Heart className="h-5 w-5" aria-hidden />
      </span>
      {!compact && (
        <span className="min-w-0">
          <span className="block truncate font-display text-base font-extrabold leading-tight">
            LifeRoute
          </span>
          <span className="block truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Faster care. Safer lives.
          </span>
        </span>
      )}
    </span>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { setChatOpen, setVoiceOpen, chatOpen, voiceOpen } = useAppState();
  const { status, request } = useGeolocation();
  const [navOpen, setNavOpen] = useState(false);
  const unread = DEMO_NOTIFICATIONS.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar — desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4">
          <Link to="/dashboard" className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emergency text-emergency-foreground">
                <Heart className="h-5 w-5" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate font-display text-base font-extrabold">
                  LifeRoute
                </span>
                <span className="block truncate text-[10px] uppercase tracking-[0.18em] opacity-70">
                  Faster care. Safer lives.
                </span>
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Main navigation">
          {NAV.map((item) => {
            const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "hover:bg-sidebar-accent/60",
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3 text-xs opacity-80">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden /> Secure · verified session
          </span>
        </div>
      </aside>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur lg:pl-64">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border lg:hidden"
              aria-label="Open navigation"
              onClick={() => setNavOpen((v) => !v)}
            >
              <LayoutDashboard className="h-4 w-4" aria-hidden />
            </button>
            <div className="lg:hidden">
              <LifeRouteLogo compact />
            </div>
            <div className="hidden min-w-0 lg:block">
              <p className="truncate text-sm font-semibold">Hello, how can we help you?</p>
              <p className="truncate text-xs text-muted-foreground">
                📍 {status === "granted" ? "Location active" : "Location unavailable"}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {status !== "granted" ? (
              <button
                onClick={request}
                className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-accent sm:inline-flex"
              >
                Enable Location
              </button>
            ) : (
              <span className="hidden rounded-lg bg-success-soft px-3 py-1.5 text-xs font-semibold text-success sm:inline-flex">
                🟢 GPS Active
              </span>
            )}
            <Link
              to="/notifications"
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-border hover:bg-accent"
            >
              <BellRing className="h-4 w-4" aria-hidden />
              {unread ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-emergency px-1 text-[10px] font-bold text-emergency-foreground">
                  {unread}
                </span>
              ) : null}
            </Link>
            <select
              aria-label="Language"
              className="hidden h-9 rounded-lg border border-border bg-card px-2 text-xs sm:block"
            >
              <option>EN</option>
              <option>हिं</option>
              <option>मर</option>
            </select>
            <Link
              to="/profile"
              aria-label="Profile"
              className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
            >
              {DEMO_USER.name.charAt(0)}
            </Link>
          </div>
        </div>

        {navOpen ? (
          <nav
            className="border-t border-border bg-card p-3 lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setNavOpen(false)}
                  className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-sm"
                >
                  <item.icon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="truncate">{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>
        ) : null}
      </header>

      <main className="px-4 pb-32 pt-5 lg:pl-68 lg:pr-6">
        <div className="mx-auto w-full max-w-6xl space-y-6">{children}</div>
      </main>

      {/* Floating assistants — two separate buttons */}
      <div className="fixed bottom-24 right-4 z-40 flex flex-col gap-3 sm:bottom-6">
        <button
          onClick={() => setVoiceOpen(!voiceOpen)}
          aria-label="Open Voice Assistant"
          className="flex h-13 items-center gap-2 rounded-full bg-ai px-4 py-3 text-sm font-semibold text-ai-foreground shadow-[var(--shadow-float)] transition-transform hover:scale-105"
        >
          <Mic className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Voice Assistant</span>
        </button>
        <button
          onClick={() => setChatOpen(!chatOpen)}
          aria-label="Open Health Chat"
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-float)] transition-transform hover:scale-105"
        >
          <MessageCircle className="h-5 w-5" aria-hidden />
          <span className="hidden sm:inline">Health Chat</span>
        </button>
      </div>

      {/* Bottom navigation — mobile */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur lg:hidden"
        aria-label="Bottom navigation"
      >
        <div className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => {
            const active = pathname === item.to;
            const emergency = item.to === "/emergency";
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold",
                  active ? "text-primary" : "text-muted-foreground",
                  emergency && "text-emergency",
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full",
                    emergency && "bg-emergency text-emergency-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5" aria-hidden />
                </span>
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <HealthChat />
      <VoiceAssistant />
    </div>
  );
}

export function ImageIconRef() {
  return <ImageIcon className="h-4 w-4" aria-hidden />;
}
