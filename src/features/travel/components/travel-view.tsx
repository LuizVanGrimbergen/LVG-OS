"use client";

import { useEffect, useState } from "react";
import { Globe, Map as MapIcon, MapPin, Pencil } from "lucide-react";
import { AddButton } from "@/components/layout/add-button";
import { PageHeader } from "@/components/layout/page-header";
import { SkeletonRows } from "@/components/layout/skeleton-rows";
import { useCachedState } from "@/lib/screen-cache";
import { createClient } from "@/lib/supabase/client";
import type { Place, WorldMap } from "../types";
import { useMapView } from "../use-map-view";
import { removePlacePhotoFiles } from "../use-place-photos";
import { AddPlaceSheet } from "./add-place-sheet";
import { MarkVisitedSheet } from "./mark-visited-sheet";
import { PlaceList } from "./place-list";
import { PlaceSheet } from "./place-sheet";
import { VisitedGlobe } from "./visited-globe";
import { VisitedMap } from "./visited-map";

export function TravelView({ map }: { map: WorldMap }) {
  const [places, setPlaces, cached] = useCachedState<Place[]>("places", []);
  const [markedVisited, setMarkedVisited] = useCachedState<Set<string>>("visited-countries", new Set());
  const [loaded, setLoaded] = useState(cached);
  const [adding, setAdding] = useState(false);
  const [marking, setMarking] = useState(false);
  const [selected, setSelected] = useState<Place | null>(null);
  const [photoCounts, setPhotoCounts] = useCachedState<Map<string, number>>("place-photo-counts", new Map());
  const [view, setView] = useMapView();

  // A country counts as visited when ticked off by hand or when a place in it is listed.
  const fromPlaces = new Set(places.map((p) => p.countryId));
  const visited = new Set([...markedVisited, ...fromPlaces]);

  const namesById = new Map(map.countries.map((c) => [c.id, c.name]));
  const selectableIds = new Set(map.countries.filter((c) => c.selectable).map((c) => c.id));
  const countryName = (id: string) => namesById.get(id) ?? "";
  const sortedPlaces = [...places].sort(
    (a, b) =>
      countryName(a.countryId).localeCompare(countryName(b.countryId), "en") || a.name.localeCompare(b.name, "en"),
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const [placesRes, countriesRes, photosRes] = await Promise.all([
        supabase.from("places").select("id, name, country_id").order("created_at"),
        supabase.from("visited_countries").select("country_id"),
        supabase.from("place_photos").select("place_id"),
      ]);
      if (cancelled) return;
      if (placesRes.error) console.error("Loading places failed", placesRes.error);
      if (countriesRes.error) console.error("Loading countries failed", countriesRes.error);
      setPlaces((placesRes.data ?? []).map((p) => ({ id: p.id, name: p.name, countryId: p.country_id })));
      setMarkedVisited(new Set((countriesRes.data ?? []).map((c) => c.country_id)));
      const counts = new Map<string, number>();
      for (const { place_id } of photosRes.data ?? []) counts.set(place_id, (counts.get(place_id) ?? 0) + 1);
      setPhotoCounts(counts);
      setLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [setPlaces, setMarkedVisited, setPhotoCounts]);

  const toggleCountry = async (id: string) => {
    if (fromPlaces.has(id)) return;
    const wasMarked = markedVisited.has(id);
    const flip = (on: boolean) =>
      setMarkedVisited((prev) => {
        const next = new Set(prev);
        if (on) next.add(id);
        else next.delete(id);
        return next;
      });
    flip(!wasMarked);

    const table = createClient().from("visited_countries");
    const { error } = wasMarked ? await table.delete().eq("country_id", id) : await table.insert({ country_id: id });
    if (error) {
      console.error("Updating country failed", error);
      flip(wasMarked);
    }
  };

  const changePhotoCount = (placeId: string, delta: number) =>
    setPhotoCounts((prev) => new Map(prev).set(placeId, Math.max(0, (prev.get(placeId) ?? 0) + delta)));

  const removePlace = async (id: string) => {
    // The photo rows go with the place; the files in storage have to be removed first.
    await removePlacePhotoFiles(id);
    const before = places;
    setPlaces((prev) => prev.filter((p) => p.id !== id));

    const { error } = await createClient().from("places").delete().eq("id", id);
    if (error) {
      console.error("Deleting place failed", error);
      setPlaces(before);
    }
  };

  const addPlace = async (fields: Omit<Place, "id">) => {
    const place: Place = { ...fields, id: crypto.randomUUID() };
    setPlaces((prev) => [...prev, place]);

    const { error } = await createClient()
      .from("places")
      .insert({ id: place.id, name: place.name, country_id: place.countryId });
    if (error) {
      console.error("Adding place failed", error);
      setPlaces((prev) => prev.filter((p) => p.id !== place.id));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Travel" action={<AddButton label="New place" onClick={() => setAdding(true)} />} />

      <section>
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Globe className="size-3.5" />
            Been to · {visited.size} {visited.size === 1 ? "country" : "countries"}
          </h2>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setView(view === "globe" ? "map" : "globe")}
              aria-label={view === "globe" ? "Show flat map" : "Show globe"}
              className="-my-2 flex items-center gap-1 py-2 text-xs text-foreground"
            >
              {view === "globe" ? <MapIcon className="size-3.5" /> : <Globe className="size-3.5" />}
              {view === "globe" ? "Map" : "Globe"}
            </button>
            <button
              type="button"
              onClick={() => setMarking(true)}
              className="-my-2 flex items-center gap-1 py-2 text-xs text-foreground"
            >
              <Pencil className="size-3.5" />
              Edit
            </button>
          </div>
        </div>
        <div className="mt-3">
          {view === "globe" ? (
            <VisitedGlobe visited={visited} selectable={selectableIds} onToggle={toggleCountry} />
          ) : (
            <VisitedMap map={map} visited={visited} onToggle={toggleCountry} />
          )}
        </div>
      </section>

      <section>
        <h2 className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5" />
          Places
        </h2>
        {!loaded && <SkeletonRows />}
        {loaded && (
          <PlaceList
            places={sortedPlaces}
            countryName={countryName}
            photoCount={(id) => photoCounts.get(id) ?? 0}
            onOpen={setSelected}
          />
        )}
      </section>

      <MarkVisitedSheet
        open={marking}
        countries={map.countries}
        marked={markedVisited}
        fromPlaces={fromPlaces}
        onToggle={toggleCountry}
        onClose={() => setMarking(false)}
      />
      <PlaceSheet
        place={selected}
        country={selected ? countryName(selected.countryId) : ""}
        onPhotoCountChange={changePhotoCount}
        onDelete={removePlace}
        onClose={() => setSelected(null)}
      />
      <AddPlaceSheet open={adding} countries={map.countries} onClose={() => setAdding(false)} onAdd={addPlace} />
    </div>
  );
}
