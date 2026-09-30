import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeRoute — Faster Care. Safer Lives." },
      {
        name: "description",
        content: "Emergency healthcare coordination for patients, ambulances and hospitals.",
      },
      { property: "og:title", content: "LifeRoute — Faster Care. Safer Lives." },
      {
        property: "og:description",
        content: "Request an ambulance, track it live, and reach the right hospital faster.",
      },
    ],
  }),
  component: Splash,
});

function Splash() {
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const fade = setTimeout(() => setLeaving(true), 1700);
    const go = setTimeout(() => navigate({ to: "/dashboard" }), 2000);
    return () => {
      clearTimeout(fade);
      clearTimeout(go);
    };
  }, [navigate]);

  return (
    <div
      className={`grid min-h-screen place-items-center bg-sidebar px-6 transition-all duration-300 ${leaving ? "scale-105 opacity-0" : "opacity-100"}`}
    >
      <div className="animate-rise flex flex-col items-center text-center">
        <span className="relative grid h-24 w-24 place-items-center rounded-full bg-emergency text-emergency-foreground pulse-ring">
          <Heart className="animate-heartbeat h-12 w-12" aria-hidden />
        </span>
        <h1 className="mt-8 font-display text-5xl font-extrabold text-sidebar-foreground">
          LifeRoute
        </h1>
        <p className="mt-3 text-lg text-sidebar-foreground/70">Faster Care. Safer Lives.</p>
        <div className="mt-10 h-1 w-40 overflow-hidden rounded-full bg-sidebar-accent">
          <div className="skeleton-shimmer h-full w-full" />
        </div>
      </div>
    </div>
  );
}
