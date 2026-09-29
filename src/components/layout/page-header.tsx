import type { ReactNode } from "react";

type PageHeaderProps = {
  /** Not shown; the menu button at the bottom shows where you are. */
  title: string;
  action?: ReactNode;
};

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="flex min-h-10 items-center justify-end gap-2 pt-[calc(env(safe-area-inset-top)+1rem)] box-content">
      <h1 className="sr-only">{title}</h1>
      {action}
    </header>
  );
}
