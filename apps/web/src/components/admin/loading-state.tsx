import { GlassCard } from "@/components/ui/primitives";

type LoadingStateProps = {
  label?: string;
};

export function LoadingState({ label = "Loading..." }: LoadingStateProps) {
  return (
    <GlassCard>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center text-sm text-slate-600">
        {label}
      </div>
    </GlassCard>
  );
}
