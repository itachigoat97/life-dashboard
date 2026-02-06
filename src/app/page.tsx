"use client";

import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useData } from "@/lib/data-context";
import { CATEGORIES, Category } from "@/types";
import { formatDate, toISODate } from "@/lib/utils";
import { containerVariants, itemVariants } from "@/lib/animations";
import Link from "next/link";
import {
  Zap,
  Flame,
  Target,
  ArrowRight,
  CheckCircle2,
  Circle,
  Plus,
  Eye,
  Activity as ActivityIcon,
} from "lucide-react";

export default function Dashboard() {
  const { loading, days, habits, habitLogs, wheelData, streakFor, goals } =
    useData();

  const today = new Date();
  const todayDate = toISODate(today);
  const todayDay = days.find((d) => d.date === todayDate);
  const todayActivities = todayDay?.activities || [];
  const energyLevel = todayDay?.energy_level ?? 0;

  const todayHabitLogs = habitLogs.filter((l) => l.date === todayDate);
  const completedHabits = todayHabitLogs.filter((l) => l.completed).length;
  const totalHabits = habits.length;
  const habitPercent = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

  const completedActivities = todayActivities.filter((a) => a.completed).length;
  const totalActivities = todayActivities.length;

  const bestStreak = habits.reduce(
    (max, h) => Math.max(max, streakFor(h.id)),
    0
  );

  const goalsOnTrack = goals.filter((g) => {
    if (!g.target_value) return false;
    return g.current_value >= g.target_value * 0.5;
  }).length;

  const chartData = wheelData.map((item) => ({
    ...item,
    category: CATEGORIES[item.category as Category]?.emoji ?? item.category,
  }));

  const habitsWithStreaks = habits.map((habit) => ({
    ...habit,
    streak: streakFor(habit.id),
    completed: todayHabitLogs.some(
      (log) => log.habit_id === habit.id && log.completed
    ),
  }));

  const { toggleHabitLog } = useData();

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* === BANDA 1: Header Compatto === */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Ciao Paolo</h1>
          <p className="text-sm text-zinc-400">{formatDate(today)}</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Pillola energia */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08]">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-white">
              {energyLevel}/10
            </span>
          </div>
          {/* CTA */}
          {todayDay ? (
            <Link
              href={`/days`}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Vedi oggi</span>
            </Link>
          ) : (
            <Link
              href="/days"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-sm font-medium hover:bg-amber-500/30 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Registra giorno</span>
            </Link>
          )}
        </div>
      </motion.div>

      {/* === BANDA 2: Checklist Abitudini === */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-orange-400" />
                Abitudini Oggi
              </CardTitle>
              <span className="text-sm text-zinc-400 font-medium">
                {completedHabits}/{totalHabits}
              </span>
            </div>
            <Progress
              value={habitPercent}
              color="#d4af37"
              className="h-1.5 mt-2"
            />
          </CardHeader>
          <CardContent className="pt-0">
            <div className="divide-y divide-white/[0.04]">
              {habitsWithStreaks.map((habit) => {
                const cat = CATEGORIES[habit.category as Category];
                return (
                  <button
                    key={habit.id}
                    onClick={() => toggleHabitLog(habit.id, todayDate)}
                    className="flex items-center gap-3 w-full py-3 px-1 text-left hover:bg-white/[0.03] rounded-lg transition-colors group"
                  >
                    {/* Checkbox */}
                    {habit.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-zinc-600 flex-shrink-0 group-hover:text-zinc-400 transition-colors" />
                    )}
                    {/* Emoji */}
                    <span className="text-lg flex-shrink-0">{habit.emoji}</span>
                    {/* Name */}
                    <span
                      className={`flex-1 text-sm font-medium ${
                        habit.completed
                          ? "text-zinc-500 line-through"
                          : "text-white"
                      }`}
                    >
                      {habit.name}
                    </span>
                    {/* Streak */}
                    {habit.streak > 0 && (
                      <span className="text-xs text-orange-400 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        {habit.streak}
                      </span>
                    )}
                    {/* Pallino categoria */}
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: cat?.color }}
                    />
                  </button>
                );
              })}
            </div>
            {/* Link vedi tutte */}
            <Link
              href="/habits"
              className="flex items-center gap-1 text-sm text-zinc-400 hover:text-amber-400 transition-colors mt-3 pt-3 border-t border-white/[0.04]"
            >
              Vedi tutte
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* === BANDA 3: Stats + Mini Wheel === */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Mini Ruota della Vita */}
        <Link href="/goals">
          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                Ruota della Vita
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={180}>
                <RadarChart data={chartData}>
                  <PolarGrid
                    strokeOpacity={0.15}
                    stroke="rgba(255,255,255,0.1)"
                  />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "#a1a1a1", fontSize: 11 }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={false}
                  />
                  <Radar
                    name="Livello"
                    dataKey="value"
                    stroke="#d4af37"
                    fill="#d4af37"
                    fillOpacity={0.3}
                    dot={{ fill: "#d4af37", r: 3 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Link>

        {/* Stats compatte */}
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-sm">Riepilogo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {/* Attività oggi */}
            <Link
              href="/days"
              className="flex items-center justify-between py-3 border-b border-white/[0.04] hover:bg-white/[0.03] rounded px-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ActivityIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-zinc-300">Attività oggi</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {completedActivities}/{totalActivities}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </Link>

            {/* Miglior streak */}
            <Link
              href="/habits"
              className="flex items-center justify-between py-3 border-b border-white/[0.04] hover:bg-white/[0.03] rounded px-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-zinc-300">Miglior streak</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {bestStreak} {bestStreak === 1 ? "giorno" : "giorni"}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </Link>

            {/* Obiettivi annuali */}
            <Link
              href="/monthly-goals"
              className="flex items-center justify-between py-3 hover:bg-white/[0.03] rounded px-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-zinc-300">Obiettivi annuali</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-white">
                  {goalsOnTrack}/{goals.length} on track
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
