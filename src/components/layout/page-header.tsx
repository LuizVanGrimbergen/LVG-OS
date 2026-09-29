export function PageHeader({ title }: { title: string }) {
  return (
    <header className="pt-[env(safe-area-inset-top)]">
      <h1 className="pt-6 text-3xl font-semibold tracking-tight">{title}</h1>
    </header>
  );
}
