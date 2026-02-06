"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, Category } from "@/types";
import { useData } from "@/lib/data-context";
import { cn, toISODate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Flame,
  CheckCircle2,
  Circle,
  TrendingUp,
  Target,
} from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function HabitsPage() {
  const { loading, habits, habitLogs, toggleHabitLog, streakFor } = useData();

  const today = new Date();
  const todayISO = toISODate(today);

  const todayLogs = habitLogs.filter((l) => l.date === todayISO);
  const completedToday = todayLogs.filter((l) => l.completed).length;
  const totalHabits = habits.length;
  const todayPercent =
    totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0;

  const getTodayCompletion = (habitId: string) =>
    todayLogs.some((l) => l.habit_id === habitId && l.completed);

  const getWeekCompletion = (habitId: string) => {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    return habitLogs.filter(
      (l) =>
        l.habit_id === habitId &&
        new Date(l.date) >= sevenDaysAgo &&
        new Date(l.date) <= today &&
        l.completed
    ).length;
  };

  const getMonthRate = (habitId: string) => {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const total = habitLogs.filter(
      (l) =>
        l.habit_id === habitId &&
        new Date(l.date) >= thirtyDaysAgo &&
        new Date(l.date) <= today
    );
    const done = total.filter((l) => l.completed);
    return total.length > 0 ? Math.round((done.length / total.length) * 100) : 0;
  };

  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, streakFor(h.id)),
    0
  );
  const avgRate = totalHabits > 0
    ? Math.round(
        habits.reduce((sum, h) => sum + getMonthRate(h.id), 0) / totalHabits
      )
    : 0;

  // Mini heatmap: last 28 days
  const MiniHeatmap = ({ habitId }: { habitId: string }) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return null;
    const color = CATEGORIES[habit.category as Category]?.color || "#d4af37";

    const days: { date: string; done: boolean }[] = [];
    for (let i = 27; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      const log = habitLogs.find((l) => l.habit_id === habitId && l.date === iso);
      days.push({ date: iso, done: log?.completed ?? false });
    }

    return (
      <div className="flex gap-[3px] flex-wrap">
        {days.map((d) => (
          <div
            key={d.date}
            title={d.date}
            className="w-2.5 h-2.5 rounded-sm"
            style={{
              backgroundColor: d.done ? color : "rgba(255,255,255,0.06)",
              boxShadow: d.done ? `0 0 4px ${color}` : undefined,
            }}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-16 rounded-xl bg-white/[0.05]" />
        <div className="h-80 rounded-xl bg-white/[0.05]" />
        <div className="h-60 rounded-xl bg-white/[0.05]" />
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* === Header compatto con stats inline === */}
      <motion.div
        variants={itemVariants}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Abitudini</h1>
          <p className="text-sm text-zinc-400">
            {totalHabits} abitudini tracciate
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-medium text-zinc-300">
              {avgRate}% mese
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span className="text-xs font-medium text-zinc-300">
              {bestStreak} best streak
            </span>
          </div>
        </div>
      </motion.div>

      {/* === Card unificata: Toggle + Stats + Heatmap === */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-amber-400" />
                Abitudini Oggi
              </CardTitle>
              <span className="text-sm text-zinc-400 font-medium">
                {completedToday}/{totalHabits}
              </span>
            </div>
            <Progress
              value={todayPercent}
              color="#d4af37"
              className="h-1.5 mt-2"
            />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-white/[0.06]">
              {habits.map((habit) => {
                const done = getTodayCompletion(habit.id);
                const cat = CATEGORIES[habit.category as Category];
                const streak = streakFor(habit.id);
                const weekDone = getWeekCompletion(habit.id);
                const monthRate = getMonthRate(habit.id);
                const weekPercent =
                  habit.target_per_week > 0
                    ? (weekDone / habit.target_per_week) * 100
                    : 0;

                return (
                  <div key={habit.id} className="py-3 space-y-2.5">
                    {/* Riga principale: toggle + info */}
                    <button
                      onClick={() => toggleHabitLog(habit.id, todayISO)}
                      className="flex items-center gap-3 w-full text-left hover:bg-white/[0.03] rounded-lg px-1 py-1 transition-colors group"
                    >
                      {done ? (
                        <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0 group-hover:text-zinc-400 transition-colors" />
                      )}
                      <span className="text-lg flex-shrink-0">
                        {habit.emoji || "✨"}
                      </span>
                      <span
                        className={cn(
                          "flex-1 text-sm font-medium",
                          done ? "text-zinc-500 line-through" : "text-white"
                        )}
                      >
                        {habit.name}
                      </span>
                      {streak > 0 && (
                        <span className="text-xs text-orange-400 flex items-center gap-1">
                          <Flame className="w-3 h-3" />
                          {streak}
                        </span>
                      )}
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: cat?.color }}
                      />
                    </button>

                    {/* Sotto-riga: barre progresso + heatmap */}
                    <div className="pl-11 space-y-2">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Settimana</span>
                            <span className="text-zinc-300">
                              {weekDone}/{habit.target_per_week}
                            </span>
                          </div>
                          <Progress
                            value={weekPercent}
                            color={cat?.color}
                            className="h-1"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">Mese</span>
                            <span className="text-zinc-300">{monthRate}%</span>
                          </div>
                          <Progress
                            value={monthRate}
                            color={cat?.color}
                            className="h-1"
                          />
                        </div>
                      </div>
                      <MiniHeatmap habitId={habit.id} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
