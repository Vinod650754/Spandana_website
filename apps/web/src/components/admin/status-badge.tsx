import { cn } from "@/lib/cn";

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function StatusBadge({ active, activeLabel = "Active", inactiveLabel = "Inactive" }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold",
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
      )}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
