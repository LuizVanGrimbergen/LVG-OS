import {
  Apple,
  BookOpen,
  Brain,
  CircleCheck,
  Droplet,
  Dumbbell,
  Footprints,
  Moon,
  PenLine,
  PersonStanding,
  type LucideIcon,
} from "lucide-react";

/** Icons you can pick for a habit, stored by key. */
export const HABIT_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  check: { icon: CircleCheck, label: "General" },
  water: { icon: Droplet, label: "Water" },
  gym: { icon: Dumbbell, label: "Gym" },
  walk: { icon: Footprints, label: "Walk or run" },
  read: { icon: BookOpen, label: "Read" },
  stretch: { icon: PersonStanding, label: "Stretch" },
  sleep: { icon: Moon, label: "Sleep on time" },
  meditate: { icon: Brain, label: "Meditate" },
  food: { icon: Apple, label: "Eat well" },
  write: { icon: PenLine, label: "Journal" },
};
