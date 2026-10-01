"use client";

import { Camera } from "lucide-react";
import { AnimatedList, AnimatedListItem } from "@/components/motion/animated-list";
import type { Place } from "../types";

type PlaceListProps = {
  places: Place[];
  countryName: (countryId: string) => string;
  photoCount: (placeId: string) => number;
  /** Tap a place to see its photos and options. */
  onOpen: (place: Place) => void;
};

export function PlaceList({ places, countryName, photoCount, onOpen }: PlaceListProps) {
  if (places.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Add places with the +.</p>;
  }

  return (
    <AnimatedList className="divide-y divide-border">
      {places.map((place) => {
        const country = countryName(place.countryId);
        const photos = photoCount(place.id);
        return (
          <AnimatedListItem key={place.id}>
            <button
              type="button"
              onClick={() => onOpen(place)}
              aria-label={`${place.name}, ${country}${photos ? `, ${photos} photos` : ""}`}
              className="flex w-full items-baseline justify-between gap-3 py-4 text-left text-[15px]"
            >
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate">{place.name}</span>
                {photos > 0 && (
                  <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground tabular-nums">
                    <Camera className="size-3" />
                    {photos}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">{country}</span>
            </button>
          </AnimatedListItem>
        );
      })}
    </AnimatedList>
  );
}
