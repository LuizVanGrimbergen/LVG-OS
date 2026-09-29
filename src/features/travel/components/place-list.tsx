"use client";

import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import { useLongPress } from "@/hooks/use-long-press";
import type { Place } from "../types";

type PlaceListProps = {
  places: Place[];
  countryName: (countryId: string) => string;
  /** Hold a place to open its options. */
  onOptions: (place: Place) => void;
};

export function PlaceList({ places, countryName, onOptions }: PlaceListProps) {
  if (places.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Add places with the +.</p>;
  }

  return (
    <AnimatedList className="divide-y divide-border">
      {places.map((place) => (
        <AnimatedListItem key={place.id}>
          <PlaceRow place={place} country={countryName(place.countryId)} onOptions={onOptions} />
        </AnimatedListItem>
      ))}
    </AnimatedList>
  );
}

function PlaceRow({ place, country, onOptions }: { place: Place; country: string; onOptions: (place: Place) => void }) {
  const press = useLongPress(
    () => onOptions(place),
    () => {},
  );

  return (
    <button
      type="button"
      {...press}
      aria-label={`${place.name}, ${country}. Hold for options`}
      className="flex w-full touch-manipulation items-baseline justify-between gap-3 py-4 text-left text-[15px] select-none [-webkit-touch-callout:none]"
    >
      <span>{place.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground">{country}</span>
    </button>
  );
}
