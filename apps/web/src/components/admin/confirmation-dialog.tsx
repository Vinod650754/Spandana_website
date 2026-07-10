import { cn } from "@/lib/cn";
import { ActionButton, GlassCard } from "@/components/ui/primitives";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "default" | "danger";
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone = "danger",
  onConfirm,
  onCancel,
}: ConfirmationDialogProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md">
        <GlassCard>
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-semibold text-slate-950">{title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-3">
              <ActionButton onClick={onCancel} className="bg-white text-slate-900 hover:bg-slate-100">
                {cancelLabel}
              </ActionButton>
              <ActionButton
                onClick={onConfirm}
                className={cn(confirmTone === "danger" ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-slate-800")}
              >
                {confirmLabel}
              </ActionButton>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
