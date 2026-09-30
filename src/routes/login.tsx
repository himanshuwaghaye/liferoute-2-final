import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { authService } from "@/services";
import { Button, DemoBadge } from "@/components/common/Primitives";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — LifeRoute" },
      {
        name: "description",
        content: "Sign in to LifeRoute to request ambulances and access your medical records.",
      },
      { property: "og:title", content: "Sign in — LifeRoute" },
      { property: "og:description", content: "Access emergency services, records and payments." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="card-surface w-full max-w-md p-6">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emergency text-emergency-foreground">
          <Heart className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Sign in to LifeRoute</h1>
        <p className="mt-1 text-sm text-muted-foreground">Faster Care. Safer Lives.</p>
        <div className="mt-3">
          <DemoBadge />
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await authService.login(email, password);
            navigate({ to: "/dashboard" });
          }}
        >
          <div>
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
            />
          </div>
          <Button type="submit" className="w-full" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          New to LifeRoute?{" "}
          <Link to="/register" className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
