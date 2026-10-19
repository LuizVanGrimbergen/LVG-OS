export type BucketSection = "sydney" | "australia";

export type BucketItem = {
  id: string;
  title: string;
  section: BucketSection;
  /** When we plan to do it, free text. */
  planned: string | null;
  done: boolean;
};
