import { Quote as QuoteIcon } from "lucide-react";
import { quoteForDay } from "../quotes";

/** Today's quote on Home. */
export function DailyQuote({ dateKey }: { dateKey: string }) {
  const quote = quoteForDay(dateKey);

  return (
    <figure className="rounded-2xl bg-card px-4 py-4">
      <QuoteIcon className="size-4 text-muted-foreground" aria-hidden />
      <blockquote className="mt-2 text-[15px] leading-relaxed text-pretty">{quote.text}</blockquote>
      <figcaption className="mt-2 text-xs text-muted-foreground">— {quote.author}</figcaption>
    </figure>
  );
}
