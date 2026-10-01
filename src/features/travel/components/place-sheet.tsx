"use client";

import { useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";
import { BottomSheet } from "@/components/layout/bottom-sheet";
import { Button } from "@/components/ui/button";
import type { Place } from "../types";
import { usePlacePhotos, type PlacePhoto } from "../use-place-photos";

type PlaceSheetProps = {
  place: Place | null;
  country: string;
  onPhotoCountChange: (placeId: string, delta: number) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

const big = "h-12 w-full rounded-xl text-base";

/** Opened by tapping a place: its photos (add, view, delete), or delete the place. */
export function PlaceSheet({ place, country, onPhotoCountChange, onDelete, onClose }: PlaceSheetProps) {
  const { photos, loaded, uploading, error, upload, remove } = usePlacePhotos(place?.id ?? null, onPhotoCountChange);
  const [viewing, setViewing] = useState<PlacePhoto | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const close = () => {
    setViewing(null);
    setConfirmDelete(false);
    onClose();
  };

  return (
    <BottomSheet
      open={place !== null}
      title={place?.name ?? ""}
      onClose={close}
      onSubmit={(e) => {
        e.preventDefault();
        if (!place) return;
        if (!confirmDelete) return setConfirmDelete(true);
        onDelete(place.id);
        close();
      }}
    >
      <p className="-mt-4 text-sm text-muted-foreground">{country}</p>

      {viewing ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs from private storage */}
          <img src={viewing.url} alt={`Photo of ${place?.name}`} className="max-h-[55dvh] w-full rounded-xl object-contain" />
          <div className="grid grid-cols-2 gap-2">
            <Button type="button" variant="ghost" size="lg" onClick={() => setViewing(null)} className={big}>
              Back
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="lg"
              onClick={() => {
                void remove(viewing);
                setViewing(null);
              }}
              className={big}
            >
              Delete photo
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-1.5">
            {photos.map((photo) => (
              <button
                key={photo.id}
                type="button"
                onClick={() => setViewing(photo)}
                aria-label="View photo"
                className="aspect-square overflow-hidden rounded-lg bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- signed URLs from private storage */}
                <img src={photo.url} alt="" className="size-full object-cover" loading="lazy" />
              </button>
            ))}
            {Array.from({ length: uploading }, (_, i) => (
              <div key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-lg bg-muted">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ))}
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-input text-xs text-muted-foreground">
              <ImagePlus className="size-5" />
              Add
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => {
                  if (e.target.files?.length) void upload(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
          </div>
          {loaded && photos.length === 0 && uploading === 0 && (
            <p className="text-sm text-muted-foreground">No photos yet. Add a few to remember it by.</p>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="space-y-2">
            <Button type="submit" variant={confirmDelete ? "destructive" : "ghost"} size="lg" className={big}>
              {confirmDelete ? "Yes, delete place and photos" : "Delete place"}
            </Button>
            <Button type="button" variant="ghost" size="lg" onClick={close} className={big}>
              Close
            </Button>
          </div>
        </>
      )}
    </BottomSheet>
  );
}
