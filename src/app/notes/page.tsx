import { NotesView } from "@/features/notes/components/notes-view";

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value)?.trim() || "";

/** Text shared from another app arrives as ?title=…&text=…&url=… (see the manifest's share_target). */
export default async function NotesPage({ searchParams }: PageProps<"/notes">) {
  const params = await searchParams;
  const shared = [first(params.title), first(params.text), first(params.url)]
    .filter((part, i, parts) => part && parts.indexOf(part) === i)
    .join("\n");
  return <NotesView shared={shared || undefined} focus={params.new === "1"} />;
}
