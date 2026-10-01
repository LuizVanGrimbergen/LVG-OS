"use client";

import { useEffect, useState } from "react";
import { resizeImage } from "@/lib/resize-image";
import { createClient } from "@/lib/supabase/client";

export const PHOTO_BUCKET = "place-photos";
const URL_TTL_SECONDS = 60 * 60;

export type PlacePhoto = { id: string; path: string; url: string };

/** Photos of one place: signed URLs from the private bucket, plus upload and delete. */
export function usePlacePhotos(placeId: string | null, onCountChange: (placeId: string, delta: number) => void) {
  const [photos, setPhotos] = useState<PlacePhoto[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!placeId) return;
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("place_photos")
        .select("id, path")
        .eq("place_id", placeId)
        .order("created_at");
      if (cancelled) return;
      if (error) console.error("Loading photos failed", error);
      const rows = data ?? [];
      const signed = rows.length
        ? await supabase.storage.from(PHOTO_BUCKET).createSignedUrls(rows.map((r) => r.path), URL_TTL_SECONDS)
        : { data: [] };
      if (cancelled) return;
      const urls = new Map((signed.data ?? []).map((s) => [s.path, s.signedUrl]));
      setPhotos(rows.flatMap((r) => (urls.get(r.path) ? [{ ...r, url: urls.get(r.path)! }] : [])));
      setLoadedFor(placeId);
      setError("");
    })();
    return () => {
      cancelled = true;
    };
  }, [placeId]);

  const upload = async (files: FileList) => {
    if (!placeId) return;
    const supabase = createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return setError("You're signed out.");
    setError("");

    for (const file of Array.from(files)) {
      setUploading((n) => n + 1);
      try {
        const blob = await resizeImage(file);
        const id = crypto.randomUUID();
        const path = `${auth.user.id}/${placeId}/${id}.jpg`;
        const up = await supabase.storage.from(PHOTO_BUCKET).upload(path, blob, { contentType: "image/jpeg" });
        if (up.error) throw up.error;
        const { error } = await supabase.from("place_photos").insert({ id, place_id: placeId, path });
        if (error) {
          await supabase.storage.from(PHOTO_BUCKET).remove([path]);
          throw error;
        }
        setPhotos((prev) => [...prev, { id, path, url: URL.createObjectURL(blob) }]);
        onCountChange(placeId, 1);
      } catch (e) {
        console.error("Uploading photo failed", e);
        setError("A photo couldn't be uploaded. Check your connection and try again.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

  const remove = async (photo: PlacePhoto) => {
    if (!placeId) return;
    const before = photos;
    setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
    const supabase = createClient();
    const { error } = await supabase.from("place_photos").delete().eq("id", photo.id);
    if (error) {
      console.error("Deleting photo failed", error);
      setPhotos(before);
      return;
    }
    onCountChange(placeId, -1);
    const { error: storageError } = await supabase.storage.from(PHOTO_BUCKET).remove([photo.path]);
    if (storageError) console.error("Deleting photo file failed", storageError);
  };

  return { photos: loadedFor === placeId ? photos : [], loaded: loadedFor === placeId, uploading, error, upload, remove };
}

/** Removes every photo file of a place (the rows go with the place). */
export async function removePlacePhotoFiles(placeId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("place_photos").select("path").eq("place_id", placeId);
  if (!data?.length) return;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).remove(data.map((r) => r.path));
  if (error) console.error("Deleting place photo files failed", error);
}
