import { Clock } from "lucide-react";
import type { AgendaItem } from "../types";

export function NextUp({ item }: { item: AgendaItem }) {
  return (
    <p className="flex items-center gap-2 text-sm text-muted-foreground">
      <Clock className="size-4" />
      Volgende: {item.title} om {item.time}
    </p>
  );
}
