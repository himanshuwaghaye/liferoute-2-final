import type { ReactNode } from "react";
import { AlertTriangle, Inbox, MapPinOff, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-warning-foreground",
        className,
      )}
    >
      Demo data
    </span>
  );
}

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "article" | "li";
}) {
  return <Tag className={cn("card-surface p-5", className)}>{children}</Tag>;
}

export function SectionTitle({
  icon,
  title,
  subtitle,
  action,
}: {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        {icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold">{title}</h2>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-lg", className)} />;
}

export function LoadingBlock({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ message, hint }: { message: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border p-8 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" aria-hidden />
      <p className="font-medium">{message}</p>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({
  message = "Something went wrong.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden />
      <p className="font-medium">{message}</p>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="mt-1 rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function OfflineState() {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning-soft p-4 text-sm text-warning-foreground">
      <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
      You are offline. Live tracking may be unavailable.
    </div>
  );
}

export function PermissionDeniedState({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-2 rounded-xl border border-border bg-muted/50 p-4 text-sm">
      <span className="flex items-center gap-2 font-medium">
        <MapPinOff className="h-4 w-4" aria-hidden /> Location permission is required for this
        feature.
      </span>
      {onRetry ? (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Enable Location
        </button>
      ) : null}
    </div>
  );
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "emergency" | "outline" | "ghost" | "success" | "ai";
  size?: "sm" | "md" | "lg";
}) {
  const variants: Record<string, string> = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    emergency:
      "bg-emergency text-emergency-foreground hover:opacity-90 shadow-[var(--shadow-card)]",
    outline: "border border-border bg-card text-foreground hover:bg-accent",
    ghost: "text-foreground hover:bg-accent",
    success: "bg-success text-success-foreground hover:opacity-90",
    ai: "bg-ai text-ai-foreground hover:opacity-90",
  };
  const sizes: Record<string, string> = {
    sm: "h-9 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-14 px-6 text-base",
  };
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Pill({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "success" | "warning" | "emergency" | "ai" | "primary";
  children: ReactNode;
}) {
  const tones: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning-foreground",
    emergency: "bg-emergency-soft text-emergency",
    ai: "bg-ai-soft text-ai",
    primary: "bg-primary-soft text-primary",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:items-center sm:justify-between">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </header>
  );
}
