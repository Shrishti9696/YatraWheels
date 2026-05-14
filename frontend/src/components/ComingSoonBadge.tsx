import { Clock } from "lucide-react";

interface ComingSoonBadgeProps {
  /** Feature label shown to the user, e.g. "AI Planner" */
  label: string;
  /** Optional extra classes */
  className?: string;
}

/**
 * Friendly "Coming soon" badge displayed when a feature is disabled
 * because the required backend service isn't configured.
 */
export function ComingSoonBadge({ label, className = "" }: ComingSoonBadgeProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/15 bg-card/50 p-8 text-center ${className}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10 border border-amber-500/20">
        <Clock className="h-5 w-5 text-amber-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground mb-1">{label}</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-400">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
          Coming soon
        </span>
      </div>
      <p className="text-xs text-muted-foreground max-w-xs">
        This feature is being set up and will be available shortly.
      </p>
    </div>
  );
}

/**
 * Inline badge variant for use inside buttons or cards.
 */
export function ComingSoonInlineBadge() {
  return (
    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
      <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse" />
      Soon
    </span>
  );
}
