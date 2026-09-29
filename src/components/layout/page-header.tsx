import type { ReactNode } from "react";
import { AppMenu } from "./app-menu";

type PageHeaderProps = {
  title: string;
  action?: ReactNode;
};

export function PageHeader({ title, action }: PageHeaderProps) {
  return (
    <header className="flex items-end justify-between gap-4 pt-[env(safe-area-inset-top)]">
      <h1 className="pt-6 text-3xl font-semibold tracking-tight">{title}</h1>
      <div className="flex items-center gap-2">
        {action}
        <AppMenu />
      </div>
    </header>
  );
}
