export type Place = {
  id: string;
  name: string;
  /** ISO 3166 numeric country code, as used by the world map. */
  countryId: string;
};

export type CountryShape = {
  id: string;
  name: string;
  /** SVG path data. */
  d: string;
  /** False for regions without an ISO code (e.g. Kosovo). */
  selectable: boolean;
};

export type WorldMap = {
  width: number;
  height: number;
  countries: CountryShape[];
};
