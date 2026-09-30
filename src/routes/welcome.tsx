import { createFileRoute, Link } from "@tanstack/react-router";
import { Ambulance, Heart, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to LifeRoute" },
      {
        name: "description",
        content: "LifeRoute coordinates ambulances, hospitals and doctors in an emergency.",
      },
      { property: "og:title", content: "Welcome to LifeRoute" },
      { property: "og:description", content: "Faster Care. Safer Lives." },
    ],
  }),
  component: Welcome,
});

function Welcome() {
  return (
    <div className="grid min-h-screen place-items-center bg-sidebar px-6 py-12 text-sidebar-foreground">
      <div className="animate-rise w-full max-w-lg text-center">
        <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emergency text-emergency-foreground">
          <Heart className="animate-heartbeat h-10 w-10" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-4xl font-extrabold">LifeRoute</h1>
        <p className="mt-2 text-sidebar-foreground/70">Faster Care. Safer Lives.</p>
        <p className="mt-6 text-sm text-sidebar-foreground/70">
          Emergency coordination between patients, ambulances, paramedics, hospitals and doctors.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/dashboard"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-emergency px-6 font-semibold text-emergency-foreground"
          >
            <Ambulance className="h-5 w-5" aria-hidden /> Continue to dashboard
          </Link>
          <Link
            to="/login"
            className="inline-flex h-12 items-center justify-center rounded-xl border border-sidebar-border px-6 font-semibold"
          >
            Sign in
          </Link>
        </div>
        <p className="mt-8 flex items-center justify-center gap-2 text-xs text-sidebar-foreground/60">
          <ShieldCheck className="h-4 w-4" aria-hidden /> Secure, verified emergency platform
        </p>
      </div>
    </div>
  );
}
