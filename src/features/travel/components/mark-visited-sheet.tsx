"use client";

import { useState } from "react";
import { Check, Search } from "lucide-react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CountryShape } from "../types";

type MarkVisitedSheetProps = {
  open: boolean;
  countries: CountryShape[];
  /** Countries ticked off by hand. */
  marked: Set<string>;
  /** Countries with a listed place; can't be unticked here. */
  fromPlaces: Set<string>;
  onToggle: (countryId: string) => void;
  onClose: () => void;
};

// "Côte d’Ivoire" should match "cote", and "Curaçao" should match "curacao".
const normalize = (s: string) =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

export function MarkVisitedSheet({ open, countries, marked, fromPlaces, onToggle, onClose }: MarkVisitedSheetProps) {
  const [query, setQuery] = useState("");

  const q = normalize(query.trim());
  const options = countries
    .filter((c) => c.selectable && normalize(c.name).includes(q))
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const close = () => {
    setQuery("");
    onClose();
  };

  return (
    <BottomSheet
      open={open}
      title="Where have you been?"
      onClose={close}
      onSubmit={(e) => {
        e.preventDefault();
        close();
      }}
    >
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
          placeholder="Search a country"
          aria-label="Search a country"
          className="h-12 w-full rounded-xl border border-input bg-transparent pr-4 pl-10 text-base outline-none focus:border-ring"
        />
      </div>

      <ul className="-mx-4 max-h-[45vh] divide-y divide-border overflow-y-auto overscroll-contain px-4">
        {options.map((country) => {
          const viaPlace = fromPlaces.has(country.id);
          const checked = viaPlace || marked.has(country.id);
          return (
            <li key={country.id}>
              <button
                type="button"
                onClick={() => onToggle(country.id)}
                disabled={viaPlace}
                aria-pressed={checked}
                className="flex w-full items-center justify-between gap-3 py-3 text-left text-[15px]"
              >
                <span className={cn(viaPlace && "text-muted-foreground")}>{country.name}</span>
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  {viaPlace && "via place"}
                  <span
                    className={cn(
                      "flex size-5 items-center justify-center rounded-full border transition-colors",
                      checked ? "border-foreground bg-foreground text-background" : "border-foreground/40",
                    )}
                  >
                    {checked && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {options.length === 0 && (
          <li className="py-6 text-center text-sm text-muted-foreground">No country found.</li>
        )}
      </ul>

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Done
      </Button>
    </BottomSheet>
  );
}
