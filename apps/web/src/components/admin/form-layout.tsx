import type { ReactNode } from "react";
import { GlassCard } from "@/components/ui/primitives";

type FormLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormLayout({ title, description, children, footer }: FormLayoutProps) {
  return (
    <GlassCard>
      <div className="space-y-5">
        <div>
          <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
          {description ? <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p> : null}
        </div>
        <div>{children}</div>
        {footer ? <div>{footer}</div> : null}
      </div>
    </GlassCard>
  );
}
