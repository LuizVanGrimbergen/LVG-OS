import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

type PageHeaderProps = {
  /** Not shown; the menu button at the bottom shows where you are. */
  title: string;
  action?: ReactNode;
  /** Show a back button to Home. Off on Home itself. */
  back?: boolean;
};

export function PageHeader({ title, action, back = true }: PageHeaderProps) {
  return (
    <header className="box-content flex min-h-10 items-center justify-between gap-2 pt-[calc(env(safe-area-inset-top)+1rem)]">
      <h1 className="sr-only">{title}</h1>
      {back ? (
        <Link
          href="/"
          aria-label="Back to Home"
          className="-ml-2 flex size-10 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
        >
          <ChevronLeft className="size-6" />
        </Link>
      ) : (
        <span />
      )}
      {action}
    </header>
  );
}
