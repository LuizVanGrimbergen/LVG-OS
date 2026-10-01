/** Grey placeholder rows while a list loads for the first time, so the page doesn't jump. */
export function SkeletonRows({ count = 3, lines = 1 }: { count?: number; lines?: 1 | 2 }) {
  return (
    <div className="divide-y divide-border" aria-hidden>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2 py-4">
          <div className="h-4 animate-pulse rounded-md bg-muted" style={{ width: `${70 - i * 12}%` }} />
          {lines === 2 && <div className="h-3 w-24 animate-pulse rounded-md bg-muted/70" />}
        </div>
      ))}
    </div>
  );
}
