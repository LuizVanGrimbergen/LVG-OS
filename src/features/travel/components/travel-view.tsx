"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { mockPlaces, mockVisitedCountryIds } from "../mock-data";
import type { Place, WorldMap } from "../types";
import { AddPlaceSheet } from "./add-place-sheet";
import { MarkVisitedSheet } from "./mark-visited-sheet";
import { PlaceList } from "./place-list";
import { VisitedMap } from "./visited-map";

export function TravelView({ map }: { map: WorldMap }) {
  const [places, setPlaces] = useState(mockPlaces);
  const [markedVisited, setMarkedVisited] = useState(() => new Set(mockVisitedCountryIds));
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);

  // A country counts as visited when ticked off by hand or when a place in it is listed.
  const fromPlaces = new Set(places.map((p) => p.countryId));
  const visited = new Set([...markedVisited, ...fromPlaces]);

  const namesById = new Map(map.countries.map((c) => [c.id, c.name]));
  const countryName = (id: string) => namesById.get(id) ?? "";
  const sortedPlaces = [...places].sort(
    (a, b) =>
      countryName(a.countryId).localeCompare(countryName(b.countryId), "en") || a.name.localeCompare(b.name, "en"),
  );

  const toggleCountry = (id: string) =>
    setMarkedVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const addPlace = (place: Omit<Place, "id">) =>
    setPlaces((prev) => [...prev, { ...place, id: crypto.randomUUID() }]);

  return (
    <div className="space-y-6">
      <PageHeader title="Travel" action={<AddButton label="New place" onClick={() => setAdding(true)} />} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-xs text-muted-foreground">
            Been to · {visited.size} {visited.size === 1 ? "country" : "countries"}
          </h2>
          <button
            type="button"
            onClick={() => setMarking(true)}
            className="-my-2 flex items-center gap-1 py-2 text-xs text-foreground"
          >
            <Pencil className="size-3.5" />
            Edit
          </button>
        </div>
        <div className="mt-3">
          <VisitedMap map={map} visited={visited} onToggle={toggleCountry} />
        </div>
      </section>

      <section>
        <h2 className="text-xs text-muted-foreground">Places</h2>
        <PlaceList places={sortedPlaces} countryName={countryName} />
      </section>

      <MarkVisitedSheet
        open={marking}
        countries={map.countries}
        marked={markedVisited}
        fromPlaces={fromPlaces}
        onToggle={toggleCountry}
        onClose={() => setMarking(false)}
      />
      <AddPlaceSheet open={adding} countries={map.countries} onClose={() => setAdding(false)} onAdd={addPlace} />
    </div>
  );
}
