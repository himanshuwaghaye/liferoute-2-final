import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Heart } from "lucide-react";
import { authService } from "@/services";
import { Button, DemoBadge } from "@/components/common/Primitives";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — LifeRoute" },
      {
        name: "description",
        content: "Create a LifeRoute account to request emergency help faster.",
      },
      { property: "og:title", content: "Create account — LifeRoute" },
      {
        property: "og:description",
        content: "Register for faster emergency response and medical record access.",
      },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  return (
    <div className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <div className="card-surface w-full max-w-md p-6">
        <span className="grid h-12 w-12 place-items-center rounded-xl bg-emergency text-emergency-foreground">
          <Heart className="h-6 w-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-2xl font-bold">Create your LifeRoute account</h1>
        <div className="mt-3">
          <DemoBadge />
        </div>
        <form
          className="mt-6 space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            await authService.register(form);
            navigate({ to: "/dashboard" });
          }}
        >
          {(["name", "email", "phone", "password"] as const).map((field) => (
            <div key={field}>
              <label htmlFor={field} className="text-sm font-medium capitalize">
                {field}
              </label>
              <input
                id={field}
                type={field === "password" ? "password" : field === "email" ? "email" : "text"}
                required
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
              />
            </div>
          ))}
          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>
        <p className="mt-4 text-sm text-muted-foreground">
          Already registered?{" "}
          <Link to="/login" className="font-semibold text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
