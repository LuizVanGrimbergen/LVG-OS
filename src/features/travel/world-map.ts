import { geoNaturalEarth1, geoPath } from "d3-geo";
import countryCodes from "i18n-iso-countries";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import world from "world-atlas/countries-110m.json";
import type { WorldMap } from "./types";

const ANTARCTICA = "010";
// Fiji straddles the antimeridian and would stretch the map to full width.
const FIJI = "242";
const WIDTH = 1000;

/**
 * Projects the world into SVG paths. Runs on the server at build time,
 * so the map libraries and geo data never ship to the phone.
 */
export function getWorldMap(): WorldMap {
  const topology = world as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const all = feature(topology, topology.objects.countries);
  const land = { ...all, features: all.features.filter((f) => f.id !== ANTARCTICA) };

  const framed = { ...land, features: land.features.filter((f) => f.id !== FIJI) };

  const projection = geoNaturalEarth1().fitWidth(WIDTH, framed);
  const path = geoPath(projection).digits(1);
  const [, [, bottom]] = path.bounds(framed);
  const names = new Intl.DisplayNames("en", { type: "region" });

  const countries = land.features.map((f) => {
    const alpha2 = f.id ? countryCodes.numericToAlpha2(String(f.id)) : undefined;
    return {
      id: f.id ? String(f.id) : f.properties.name,
      name: (alpha2 && names.of(alpha2)) || f.properties.name,
      d: path(f) ?? "",
      selectable: Boolean(alpha2),
    };
  });

  return { width: WIDTH, height: Math.ceil(bottom), countries };
}
