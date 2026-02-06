"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES } from "@/types";
import { useData } from "@/lib/data-context";
import { cn, toISODate } from "@/lib/utils";
import { motion } from "framer-motion";
import { Flame, CheckCircle2, Circle, Calendar, TrendingUp } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

export default function HabitsPage() {
  const { loading, habits, habitLogs, toggleHabitLog, streakFor } = useData();

  const today = new Date();
  const todayISO = toISODate(today);

  // Calculate stats
  const getCompletionRateThisWeek = (habitId: string) => {
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weekLogs = habitLogs.filter(
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

    const totalLogs = habitLogs.filter(
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
      const log = habitLogs.find(
        (l) => l.habit_id === habitId && l.date === dateISO
      );
      logs[dateISO] = log ? log.completed : false;
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return logs;
  };

  const getTodayCompletion = (habitId: string) => {
    const todayLog = habitLogs.find(
      (log) => log.habit_id === habitId && log.date === todayISO
    );
    return todayLog ? todayLog.completed : false;
  };

  const allStreaks = habits.map((habit) => streakFor(habit.id));
  const bestStreak = Math.max(...allStreaks, 0);

  const totalHabits = habits.length;
  const averageCompletion = Math.round(
    (habits.reduce((sum, habit) => sum + getCompletionRateLastThirtyDays(habit.id), 0) /
      Math.max(habits.length, 1)) *
      100
  ) / 100;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-10 w-48 rounded bg-white/[0.05]" />
          <div className="h-5 w-72 rounded bg-white/[0.05]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/[0.05]" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  // Contribution Calendar Component - GITHUB STYLE (COLUMNS)
  const ContributionCalendar = ({ habitId }: { habitId: string }) => {
    const logs = getHabitLogsForLastSixtyDays(habitId);
    const habit = habits.find((h) => h.id === habitId);

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

    // Group dates into columns (each column = 1 week, 7 rows for days of week)
    const columns: Date[][] = [];
    let currentColumn: Date[] = [];

    // Start from Monday of the first week
    const firstDate = new Date(dates[0]);
    const dayOfWeek = firstDate.getDay();
    const daysToAdd = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    for (let i = 0; i < daysToAdd; i++) {
      currentColumn.push(new Date(0)); // Placeholder for padding
    }

    for (const date of dates) {
      currentColumn.push(new Date(date));
      if (currentColumn.length === 7) {
        columns.push(currentColumn);
        currentColumn = [];
      }
    }

    if (currentColumn.length > 0) {
      columns.push(currentColumn);
    }

    return (
      <div className="space-y-2">
        <p className="text-xs text-white/60 font-medium">Ultimi 60 giorni</p>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-1 w-fit">
            {columns.map((column, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1">
                {column.map((date, dayIdx) => {
                  if (date.getTime() === 0) {
                    return (
                      <div
                        key={`${colIdx}-${dayIdx}-empty`}
                        className="w-3 h-3 rounded-sm"
                      />
                    );
                  }

                  const dateISO = toISODate(date);
                  const isCompleted = logs[dateISO] || false;

                  return (
                    <motion.div
                      key={dateISO}
                      title={dateISO}
                      className={cn(
                        "w-3 h-3 rounded-sm transition-all cursor-pointer hover:scale-125",
                        isCompleted
                          ? "shadow-lg"
                          : "opacity-40 bg-white/[0.06]"
                      )}
                      style={
                        isCompleted
                          ? {
                              backgroundColor: categoryColor,
                              boxShadow: `0 0 8px ${categoryColor}`,
                            }
                          : undefined
                      }
                      whileHover={{ scale: 1.25 }}
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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-white">Abitudini</h1>
          <p className="text-white/60">Traccia le tue abitudini quotidiane</p>
        </div>

        {/* Summary Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-white/60 text-sm font-medium">Totale abitudini</p>
                  <p className="text-3xl font-bold text-white">{totalHabits}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-white/60 text-sm font-medium">
                    Tasso completamento
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {averageCompletion}%
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="pt-6 relative">
                <div className="space-y-2">
                  <p className="text-white/60 text-sm font-medium">Miglior streak</p>
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{
                        textShadow: [
                          "0 0 10px #d4af37",
                          "0 0 20px #d4af37",
                          "0 0 10px #d4af37",
                        ],
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <p className="text-3xl font-bold text-white">{bestStreak}</p>
                    </motion.div>
                    <motion.div
                      animate={{
                        y: [0, -4, 0],
                        rotate: [0, 12, 0],
                      }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    >
                      <Flame className="w-6 h-6 text-[#d4af37]" />
                    </motion.div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Habits Grid */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {habits.map((habit, idx) => {
            const streak = streakFor(habit.id);
            const weekCompletion = getCompletionRateThisWeek(habit.id);
            const monthCompletion = getCompletionRateLastThirtyDays(habit.id);
            const categoryInfo = CATEGORIES[habit.category];

            return (
              <motion.div
                key={habit.id}
                variants={itemVariants}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full">
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
                            variant="default"
                          >
                            {categoryInfo?.emoji} {categoryInfo?.name}
                          </Badge>
                        </div>
                      </div>
                      <motion.div
                        className="flex items-center gap-1"
                        animate={{
                          y: [0, -2, 0],
                        }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        <Flame className="w-5 h-5 text-[#d4af37]" />
                        <span className="font-bold text-white">{streak}</span>
                      </motion.div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    {/* Weekly Progress */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-white/60">Questa settimana</p>
                        <p className="text-sm font-medium text-white">
                          {weekCompletion}/{habit.target_per_week} giorni
                        </p>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, ease: "easeOut" as const }}
                      >
                        <Progress
                          value={(weekCompletion / habit.target_per_week) * 100}
                          className="h-2 bg-white/[0.08]"
                          style={{
                            "--progress-background": categoryInfo?.color || "#d4af37",
                          } as React.CSSProperties}
                        />
                      </motion.div>
                    </div>

                    {/* Contribution Calendar */}
                    <ContributionCalendar habitId={habit.id} />

                    {/* Monthly Completion Rate */}
                    <div className="space-y-2 pt-2 border-t border-white/[0.08]">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-white/60" />
                          <p className="text-sm text-white/60">
                            Completamento mensile
                          </p>
                        </div>
                        <p className="text-sm font-bold text-white">
                          {monthCompletion}%
                        </p>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, ease: "easeOut" as const }}
                      >
                        <Progress
                          value={monthCompletion}
                          className="h-2 bg-white/[0.08]"
                          style={{
                            "--progress-background": categoryInfo?.color || "#d4af37",
                          } as React.CSSProperties}
                        />
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Today's Habits */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#d4af37]" />
                <CardTitle className="text-white">Abitudini di Oggi</CardTitle>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {habits.map((habit, idx) => {
                  const isCompletedToday = getTodayCompletion(habit.id);
                  const categoryInfo = CATEGORIES[habit.category];

                  return (
                    <motion.div
                      key={habit.id}
                      onClick={() => toggleHabitLog(habit.id, todayISO)}
                      variants={itemVariants}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors cursor-pointer"
                    >
                      <motion.div
                        animate={{
                          scale: isCompletedToday ? [1, 1.2, 1] : 1,
                        }}
                        transition={{ duration: 0.4, ease: "easeOut" as const }}
                      >
                        {isCompletedToday ? (
                          <motion.div
                            animate={{
                              boxShadow: [
                                `0 0 0px ${categoryInfo?.color || "#d4af37"}`,
                                `0 0 8px ${categoryInfo?.color || "#d4af37"}`,
                                `0 0 0px ${categoryInfo?.color || "#d4af37"}`,
                              ],
                            }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                          >
                            <CheckCircle2
                              className="w-6 h-6 flex-shrink-0"
                              style={{ color: categoryInfo?.color || "#d4af37" }}
                            />
                          </motion.div>
                        ) : (
                          <Circle className="w-6 h-6 flex-shrink-0 text-white/30" />
                        )}
                      </motion.div>
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
                        <motion.div
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ ease: "easeOut" as const }}
                        >
                          <Badge
                            className={cn(
                              "border-white/[0.2]",
                              categoryInfo?.bgColor
                            )}
                            variant="outline"
                          >
                            ✓ Completato
                          </Badge>
                        </motion.div>
                      )}
                    </motion.div>
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
