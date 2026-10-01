"use client";

import { useState } from "react";
import { MOOD_ICONS, MOOD_LABELS, averageMood, type MoodDay } from "@/features/reflection/mood";
import { addDays, fromDateKey, toDateKey } from "@/lib/date";

const DAYS = 30;
const W = 320;
const H = 140;
const PAD = { top: 8, right: 8, bottom: 20, left: 28 };
const dayLabel = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });
const tickLabel = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });

/** Your mood over the last 30 days: a dot per day you rated, joined when days follow each other. */
export function MoodChart({ moods, today }: { moods: MoodDay[]; today: string }) {
  const [picked, setPicked] = useState<string | null>(null);
  const days = Array.from({ length: DAYS }, (_, i) => toDateKey(addDays(fromDateKey(today), i - DAYS + 1)));
  const byDay = new Map(moods.map((m) => [m.day, m.mood]));
  const rated = days.filter((d) => byDay.has(d)).map((d) => ({ day: d, mood: byDay.get(d)! }));
  const average = averageMood(rated);

  const x = (i: number) => PAD.left + (i / (DAYS - 1)) * (W - PAD.left - PAD.right);
  const y = (mood: number) => PAD.top + ((5 - mood) / 4) * (H - PAD.top - PAD.bottom);

  // Line segments only between consecutive rated days, so gaps stay visible.
  const segments: string[] = [];
  days.forEach((d, i) => {
    const next = days[i + 1];
    if (next && byDay.has(d) && byDay.has(next)) {
      segments.push(`M${x(i)},${y(byDay.get(d)!)}L${x(i + 1)},${y(byDay.get(next)!)}`);
    }
  });

  const pickedMood = picked ? byDay.get(picked) : undefined;

  return (
    <section className="rounded-2xl bg-card px-4 py-4">
      <div className="flex items-baseline justify-between">
        <p className="text-[15px]">Mood · last 30 days</p>
        {average !== null && (
          <p className="text-xs text-muted-foreground tabular-nums">avg {average.toFixed(1)}</p>
        )}
      </div>

      {rated.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">Rate your day in the evening check-in on Home to see it here.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            className="mt-3 w-full touch-none select-none"
            role="img"
            aria-label={`Mood over the last 30 days, ${rated.length} days rated`}
            onPointerLeave={() => setPicked(null)}
            onPointerMove={(e) => {
              const box = e.currentTarget.getBoundingClientRect();
              const px = ((e.clientX - box.left) / box.width) * W;
              const i = Math.round(((px - PAD.left) / (W - PAD.left - PAD.right)) * (DAYS - 1));
              setPicked(days[Math.max(0, Math.min(DAYS - 1, i))]);
            }}
          >
            {[1, 2, 3, 4, 5].map((m) => {
              const Icon = MOOD_ICONS[m - 1];
              return (
                <g key={m}>
                  <line x1={PAD.left} x2={W - PAD.right} y1={y(m)} y2={y(m)} className="stroke-border" strokeWidth={1} />
                  <Icon x={4} y={y(m) - 7} width={14} height={14} className="text-muted-foreground" />
                </g>
              );
            })}
            {[0, 14, DAYS - 1].map((i) => (
              <text
                key={i}
                x={x(i)}
                y={H - 4}
                textAnchor={i === 0 ? "start" : i === DAYS - 1 ? "end" : "middle"}
                className="fill-muted-foreground text-[10px]"
              >
                {tickLabel.format(fromDateKey(days[i]))}
              </text>
            ))}
            {picked && (
              <line
                x1={x(days.indexOf(picked))}
                x2={x(days.indexOf(picked))}
                y1={PAD.top}
                y2={H - PAD.bottom}
                className="stroke-muted-foreground"
                strokeWidth={1}
                strokeDasharray="2 2"
              />
            )}
            {segments.map((d) => (
              <path key={d} d={d} className="stroke-amber-300" strokeWidth={2} fill="none" strokeLinecap="round" />
            ))}
            {rated.map(({ day, mood }) => (
              <circle
                key={day}
                cx={x(days.indexOf(day))}
                cy={y(mood)}
                r={picked === day ? 5 : 4}
                className="fill-amber-300 stroke-card"
                strokeWidth={2}
              />
            ))}
          </svg>
          <p className="h-4 text-xs text-muted-foreground tabular-nums" aria-live="polite">
            {picked
              ? `${dayLabel.format(fromDateKey(picked))} · ${pickedMood ? `${MOOD_LABELS[pickedMood - 1]} (${pickedMood})` : "not rated"}`
              : `${rated.length} of ${DAYS} days rated`}
          </p>
          <table className="sr-only">
            <caption>Mood per day</caption>
            <tbody>
              {rated.map(({ day, mood }) => (
                <tr key={day}>
                  <th scope="row">{dayLabel.format(fromDateKey(day))}</th>
                  <td>
                    {MOOD_LABELS[mood - 1]} ({mood})
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </section>
  );
}
