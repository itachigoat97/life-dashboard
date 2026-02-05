"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/types";
import { mockHabits, mockHabitLogs, getStreakForHabit } from "@/lib/mock-data";
import { cn, toISODate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, Circle, Calendar, TrendingUp } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function HabitsPage() {
  const today = new Date();
  const todayISO = toISODate(today);

  // Calculate stats
  const getCompletionRateThisWeek = (habitId: string) => {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekLogs = mockHabitLogs.filter(
      (log) =>
        log.habit_id === habitId &&
        new Date(log.date) >= sevenDaysAgo &&
        new Date(log.date) <= today &&
        log.completed
    );

    return weekLogs.length;
  };

  const getCompletionRateLastThirtyDays = (habitId: string) => {
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalLogs = mockHabitLogs.filter(
      (log) =>
        log.habit_id === habitId &&
        new Date(log.date) >= thirtyDaysAgo &&
        new Date(log.date) <= today
    );

    const completedLogs = totalLogs.filter((log) => log.completed);

    return totalLogs.length > 0
      ? Math.round((completedLogs.length / totalLogs.length) * 100)
      : 0;
  };

  const getHabitLogsForLastSixtyDays = (habitId: string) => {
    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const logs: Record<string, boolean> = {};
    const currentDate = new Date(sixtyDaysAgo);

    while (currentDate <= today) {
      const dateISO = toISODate(currentDate);
      const log = mockHabitLogs.find(
        (l) => l.habit_id === habitId && l.date === dateISO
      );
      logs[dateISO] = log ? log.completed : false;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return logs;
  };

  const getTodayCompletion = (habitId: string) => {
    const todayLog = mockHabitLogs.find(
      (log) => log.habit_id === habitId && log.date === todayISO
    );
    return todayLog ? todayLog.completed : false;
  };

  const allStreaks = mockHabits.map((habit) => getStreakForHabit(habit.id));
  const bestStreak = Math.max(...allStreaks, 0);

  const totalHabits = mockHabits.length;
  const averageCompletion = Math.round(
    (mockHabits.reduce((sum, habit) => sum + getCompletionRateLastThirtyDays(habit.id), 0) /
      Math.max(mockHabits.length, 1)) *
      100
  ) / 100;

  // Contribution Calendar Component
  const ContributionCalendar = ({ habitId }: { habitId: string }) => {
    const logs = getHabitLogsForLastSixtyDays(habitId);
    const habit = mockHabits.find((h) => h.id === habitId);

    if (!habit) return null;

    const categoryColor = CATEGORIES[habit.category]?.color || "#d4af37";

    const sixtyDaysAgo = new Date(today);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const dates: Date[] = [];
    const currentDate = new Date(sixtyDaysAgo);

    while (currentDate <= today) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group dates into weeks (7 days per row, with first week potentially incomplete)
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];

    // Start from Monday of the first week
    const firstDate = new Date(dates[0]);
    const dayOfWeek = firstDate.getDay();
    const daysToAdd = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i < daysToAdd; i++) {
      currentWeek.push(new Date(0)); // Placeholder for padding
    }

    for (const date of dates) {
      currentWeek.push(new Date(date));
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    if (currentWeek.length > 0) {
      weeks.push(currentWeek);
    }

    return (
      <div className="space-y-2">
        <p className="text-xs text-white/60 font-medium">Last 60 days</p>
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-1 w-fit">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex gap-1">
                {week.map((date, dayIdx) => {
                  if (date.getTime() === 0) {
                    return (
                      <div
                        key={`${weekIdx}-${dayIdx}-empty`}
                        className="w-3 h-3 rounded-sm"
                      />
                    );
                  }

                  const dateISO = toISODate(date);
                  const isCompleted = logs[dateISO] || false;

                  return (
                    <div
                      key={dateISO}
                      title={dateISO}
                      className={cn(
                        "w-3 h-3 rounded-sm transition-colors cursor-pointer",
                        isCompleted
                          ? "opacity-100"
                          : "opacity-40 bg-white/[0.06]",
                      )}
                      style={
                        isCompleted
                          ? { backgroundColor: categoryColor }
                          : undefined
                      }
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="min-h-screen bg-[#0a0a0a] p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Habits</h1>
          <p className="text-white/60">Traccia le tue abitudini quotidiane</p>
        </div>

        {/* Summary Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm font-medium">Total Habits</p>
                <p className="text-3xl font-bold text-white">{totalHabits}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm font-medium">
                  Avg Completion Rate
                </p>
                <p className="text-3xl font-bold text-white">
                  {averageCompletion}%
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-white/60 text-sm font-medium">Best Streak</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold text-white">{bestStreak}</p>
                  <Flame className="w-6 h-6 text-[#d4af37]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Habits Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {mockHabits.map((habit) => {
            const streak = getStreakForHabit(habit.id);
            const weekCompletion = getCompletionRateThisWeek(habit.id);
            const monthCompletion = getCompletionRateLastThirtyDays(habit.id);
            const categoryInfo = CATEGORIES[habit.category];

            return (
              <motion.div
                key={habit.id}
                variants={itemVariants}
              >
                <Card className="border-white/[0.08] bg-white/[0.03] h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <span className="text-2xl">{habit.emoji || "✨"}</span>
                        <div className="flex-1">
                          <CardTitle className="text-white text-lg">
                            {habit.name}
                          </CardTitle>
                          <Badge
                            className={cn(
                              "mt-2",
                              categoryInfo?.bgColor,
                              categoryInfo?.borderColor,
                              categoryInfo?.textColor
                            )}
                            variant="outline"
                          >
                            {categoryInfo?.emoji} {categoryInfo?.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-5 h-5 text-[#d4af37]" />
                        <span className="font-bold text-white">{streak}</span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Weekly Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-white/60">This Week</p>
                        <p className="text-sm font-medium text-white">
                          {weekCompletion}/{habit.target_per_week} days
                        </p>
                      </div>
                      <Progress
                        value={(weekCompletion / habit.target_per_week) * 100}
                        className="h-2 bg-white/[0.08]"
                      />
                    </div>

                    {/* Contribution Calendar */}
                    <ContributionCalendar habitId={habit.id} />

                    {/* Monthly Completion Rate */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-white/60" />
                          <p className="text-sm text-white/60">
                            Monthly Completion
                          </p>
                        </div>
                        <p className="text-sm font-bold text-white">
                          {monthCompletion}%
                        </p>
                      </div>
                      <Progress
                        value={monthCompletion}
                        className="h-2 bg-white/[0.08]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Today's Habits */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
                <CardTitle className="text-white">Today&apos;s Habits</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {mockHabits.map((habit) => {
                  const isCompletedToday = getTodayCompletion(habit.id);
                  const categoryInfo = CATEGORIES[habit.category];

                  return (
                    <div
                      key={habit.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                    >
                      {isCompletedToday ? (
                        <CheckCircle2
                          className="w-6 h-6 flex-shrink-0"
                          style={{ color: categoryInfo?.color || "#d4af37" }}
                        />
                      ) : (
                        <Circle className="w-6 h-6 flex-shrink-0 text-white/30" />
                      )}
                      <span className="text-xl">{habit.emoji || "✨"}</span>
                      <div className="flex-1">
                        <p
                          className={cn(
                            "font-medium",
                            isCompletedToday
                              ? "text-white"
                              : "text-white/60"
                          )}
                        >
                          {habit.name}
                        </p>
                      </div>
                      {isCompletedToday && (
                        <Badge
                          className="bg-white/[0.1] text-white border-white/[0.2]"
                          variant="outline"
                        >
                          ✓ Done
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
