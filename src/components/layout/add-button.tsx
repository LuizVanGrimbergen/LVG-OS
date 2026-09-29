import { Plus } from "lucide-react";

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="flex size-10 items-center justify-center rounded-full border border-border text-foreground transition-colors active:bg-muted"
    >
      <Plus className="size-5" />
    </button>
  );
}
