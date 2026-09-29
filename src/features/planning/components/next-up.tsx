import { Clock } from "lucide-react";
import type { AgendaItem } from "../types";

export function NextUp({ item }: { item: AgendaItem }) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-card px-4 py-4 text-[15px]">
      <span className="flex items-center gap-2">
        <Clock className="size-4 text-muted-foreground" />
        {item.title}
      </span>
      <span className="text-sm text-muted-foreground">{item.time}</span>
    </div>
  );
}
