"use client";

import { cn } from "@/lib/utils";
import type { WorldMap } from "../types";

type VisitedMapProps = {
  map: WorldMap;
  visited: Set<string>;
  onToggle: (countryId: string) => void;
};

export function VisitedMap({ map, visited, onToggle }: VisitedMapProps) {
  return (
    <svg
      viewBox={`0 0 ${map.width} ${map.height}`}
      className="h-auto w-full"
      role="img"
      aria-label={`World map, ${visited.size} countries visited`}
    >
      {map.countries.map((country) => (
        <path
          key={country.id}
          d={country.d}
          onClick={country.selectable ? () => onToggle(country.id) : undefined}
          className={cn(
            "stroke-background transition-colors duration-300 [stroke-width:0.8]",
            visited.has(country.id) ? "fill-foreground" : "fill-foreground/15",
          )}
        >
          <title>{country.name}</title>
        </path>
      ))}
    </svg>
  );
}
