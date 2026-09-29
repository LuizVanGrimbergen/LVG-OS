import { House, ListChecks, Plane, Target, User, type LucideIcon } from "lucide-react";

export type AppPage = { href: string; label: string; icon: LucideIcon };

export const pages: AppPage[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/travel", label: "Travel", icon: Plane },
  { href: "/about", label: "About me", icon: User },
];

export function findPage(pathname: string): AppPage | undefined {
  return pages.find((p) => (p.href === "/" ? pathname === "/" : pathname.startsWith(p.href)));
}
