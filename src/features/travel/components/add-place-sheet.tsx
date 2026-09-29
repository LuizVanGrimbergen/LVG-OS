"use client";

import { useState } from "react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { CountryShape, Place } from "../types";

type AddPlaceSheetProps = {
  open: boolean;
  countries: CountryShape[];
  onClose: () => void;
  onAdd: (place: Omit<Place, "id">) => void;
};

const field =
  "h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base text-foreground outline-none focus:border-ring";

export function AddPlaceSheet({ open, countries, onClose, onAdd }: AddPlaceSheetProps) {
  const [name, setName] = useState("");
  const [countryId, setCountryId] = useState("");
  const [error, setError] = useState("");

  const options = countries
    .filter((c) => c.selectable)
    .sort((a, b) => a.name.localeCompare(b.name, "en"));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Which place?");
    if (!countryId) return setError("Pick a country.");

    onAdd({ name: name.trim(), countryId });
    setName("");
    setCountryId("");
    setError("");
    onClose();
  };

  return (
    <BottomSheet open={open} title="New place" onClose={onClose} onSubmit={submit}>
      <input
        autoFocus
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setError("");
        }}
        placeholder="Kandy"
        className={field}
      />

      <select
        value={countryId}
        onChange={(e) => {
          setCountryId(e.target.value);
          setError("");
        }}
        aria-label="Country"
        className={`${field} appearance-none ${countryId ? "" : "text-muted-foreground"}`}
      >
        <option value="">Country</option>
        {options.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="h-12 w-full rounded-xl text-base">
        Add place
      </Button>
    </BottomSheet>
  );
}
