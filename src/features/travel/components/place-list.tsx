import type { Place } from "../types";

type PlaceListProps = {
  places: Place[];
  countryName: (countryId: string) => string;
};

export function PlaceList({ places, countryName }: PlaceListProps) {
  if (places.length === 0) {
    return <p className="py-4 text-sm text-muted-foreground">Add places with the +.</p>;
  }

  return (
    <ul className="divide-y divide-border">
      {places.map((place) => (
        <li key={place.id} className="flex items-baseline justify-between gap-3 py-4 text-[15px]">
          <span>{place.name}</span>
          <span className="shrink-0 text-xs text-muted-foreground">{countryName(place.countryId)}</span>
        </li>
      ))}
    </ul>
  );
}
