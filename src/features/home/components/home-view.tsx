"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Stagger, StaggerItem } from "@/components/motion/stagger";
import { HabitsCard } from "@/features/habits/components/habits-card";
import { DailyQuote } from "@/features/quotes/components/daily-quote";
import { ReflectionCard } from "@/features/reflection/components/reflection-card";
import { RunsCard } from "@/features/runs/components/runs-card";
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
        <StaggerItem className="grid min-h-[124px]">
          {today ? <SmokeFreeCard today={today} /> : <div className="rounded-2xl bg-card" />}
        </StaggerItem>
        {todayKey && (
          <StaggerItem>
            <HabitsCard today={todayKey} />
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
