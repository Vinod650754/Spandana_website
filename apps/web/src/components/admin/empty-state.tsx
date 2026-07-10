import { GlassCard } from "@/components/ui/primitives";

type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <GlassCard>
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white/60 p-8 text-center">
        <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">{description}</p>
        {action ? <div className="mt-6 flex justify-center">{action}</div> : null}
      </div>
    </GlassCard>
  );
}
