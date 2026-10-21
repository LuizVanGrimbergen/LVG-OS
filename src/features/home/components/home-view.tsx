"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { GymCard } from "@/features/habits/components/gym-card";
import { DailyQuote } from "@/features/quotes/components/daily-quote";
import { ReflectionCard } from "@/features/reflection/components/reflection-card";
import { RunsCard } from "@/features/runs/components/runs-card";
import { CountdownCard } from "@/features/streaks/components/countdown-card";
import { SmokeFreeCard } from "@/features/streaks/components/smoke-free-card";
import { useTodayKey } from "@/hooks/use-today";
import { fromDateKey } from "@/lib/date";

export function HomeView() {
  const todayKey = useTodayKey();
  const today = todayKey ? fromDateKey(todayKey) : null;

  // Cards appear one after another from the top.
  return (
    <Stagger className="space-y-6">
      <PageHeader title="Home" back={false} />

      {todayKey && (
        <StaggerItem>
          <DailyQuote dateKey={todayKey} />
        </StaggerItem>
      )}

      <div className="space-y-2">
        {/* Grid: the loading placeholder stretches to the card's height, so the page doesn't jump. */}
        <StaggerItem className="grid min-h-[124px] grid-cols-2 gap-2">
          {today ? (
            <>
              <SmokeFreeCard today={today} />
              <CountdownCard today={today} />
            </>
          ) : (
            <div className="col-span-2 rounded-2xl bg-card" />
          )}
        </StaggerItem>
        {todayKey && (
          <StaggerItem>
            <GymCard today={todayKey} />
          </StaggerItem>
        )}
        {todayKey && (
          <StaggerItem>
            <RunsCard today={todayKey} />
          </StaggerItem>
        )}
        <StaggerItem>
          <ReflectionCard />
        </StaggerItem>
      </div>
    </Stagger>
  );
}
