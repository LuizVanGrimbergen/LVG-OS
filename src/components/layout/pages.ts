import { ChartNoAxesColumn, House, ListChecks, NotebookPen, Plane, Settings, Sparkles, Target, type LucideIcon } from "lucide-react";

export type AppPage = { href: string; label: string; icon: LucideIcon };

export const pages: AppPage[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/notes", label: "Notes", icon: NotebookPen },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/insights", label: "Insights", icon: ChartNoAxesColumn },
  { href: "/travel", label: "Travel", icon: Plane },
  { href: "/coach", label: "Coach", icon: Sparkles },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function findPage(pathname: string): AppPage | undefined {
  return pages.find((p) => (p.href === "/" ? pathname === "/" : pathname.startsWith(p.href)));
}
