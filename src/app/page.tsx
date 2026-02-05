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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, Category } from "@/types";
import {
  mockDays,
  mockActivities,
  mockHabits,
  getWheelOfLifeData,
  getStreakForHabit,
  getActivitiesForDay,
  getHabitLogsForDate,
} from "@/lib/mock-data";
import { formatDate, toISODate } from "@/lib/utils";
import {
  Zap,
  Activity,
  Flame,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
  Sparkles,
} from "lucide-react";

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
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const glowVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: "easeOut" as const,
    },
  },
  pulse: {
    boxShadow: [
      "0 0 0 0 rgba(212, 175, 55, 0.4)",
      "0 0 0 20px rgba(212, 175, 55, 0)",
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
};

const slideInVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  }),
};

const counterVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut" as const,
    },
  },
};

const radarVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1,
      ease: "easeOut" as const,
    },
  },
};

const AnimatedCounter = ({ value }: { value: number }) => {
  return (
    <motion.span variants={counterVariants}>
      {value}
    </motion.span>
  );
};

export default function Dashboard() {
  const today = new Date();
  const todayDate = toISODate(today);
  const todayDay = mockDays.find((d) => d.date === todayDate) || mockDays[0];
  const todayActivities = getActivitiesForDay(todayDay.id);
  const todayHabitLogs = getHabitLogsForDate(todayDate);

  // Calculate stats
  const completedActivities = todayActivities.filter((a) => a.completed).length;
  const totalActivities = todayActivities.length;
  const totalStreaks = mockHabits.reduce((sum, habit) => {
    return sum + getStreakForHabit(habit.id);
  }, 0);

  // Get wheel of life data
  const wheelData = getWheelOfLifeData();
  const chartData = wheelData.map((item) => ({
    ...item,
    category: CATEGORIES[item.category as Category].emoji,
  }));

  // Get unique habit streaks for display
  const habitsWithStreaks = mockHabits.map((habit) => ({
    ...habit,
    streak: getStreakForHabit(habit.id),
    completed: todayHabitLogs.some((log) => log.habit_id === habit.id),
  }));

  // Get recent activities (last 5)
  const recentActivities = mockActivities.slice(0, 5);

  const energyPercentage = (todayDay.energy_level / 10) * 100;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div className="mb-12" variants={itemVariants}>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <p className="text-sm text-zinc-400">Buongiorno,</p>
            </div>
            <h1 className="text-5xl sm:text-6xl font-bold mb-4">
              <span className="text-white">Ciao </span>
              <motion.span
                className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0%", "100%", "0%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
              >
                Paolo
              </motion.span>
            </h1>
            <div className="flex items-center gap-2 text-zinc-400">
              <Calendar className="w-4 h-4" />
              <p>{formatDate(today)}</p>
            </div>
          </div>

          {/* Energy Meter */}
          <motion.div
            className="flex flex-col items-center"
            variants={glowVariants}
            animate={["visible", "pulse"]}
          >
            <div className="relative w-32 h-32">
              <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 opacity-20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              />
              <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold text-white">
                    <AnimatedCounter value={todayDay.energy_level} />
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">/10</div>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-zinc-400 font-medium">Energia oggi</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Wheel of Life Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full hover:border-white/[0.12] hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                </motion.div>
                Ruota della Vita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <motion.div variants={radarVariants}>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={chartData}>
                    <PolarGrid
                      strokeOpacity={0.15}
                      stroke="rgba(255,255,255,0.1)"
                    />
                    <PolarAngleAxis
                      dataKey="category"
                      tick={{
                        fill: "#a1a1a1",
                        fontSize: 12,
                      }}
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
                      dot={{
                        fill: "#d4af37",
                        r: 5,
                        filter: "drop-shadow(0 0 6px rgba(212, 175, 55, 0.6))",
                      }}
                      activeDot={{ r: 7 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Stats Grid */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Energy Card */}
            <motion.div
              className="group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/[0.06] bg-gradient-to-br from-green-500/10 via-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full hover:border-green-400/30 hover:shadow-lg hover:shadow-green-500/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-green-400" />
                    Energia
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-4xl font-bold text-white">
                      <AnimatedCounter value={todayDay.energy_level} />
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">su 10</p>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" as const }}
                  >
                    <Progress
                      value={energyPercentage}
                      color="#22c55e"
                      className="h-2 bg-white/[0.05]"
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Activities Card */}
            <motion.div
              className="group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/[0.06] bg-gradient-to-br from-blue-500/10 via-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full hover:border-blue-400/30 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-400" />
                    Attività
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <p className="text-4xl font-bold text-white">
                      <AnimatedCounter value={completedActivities} />
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      di {totalActivities} completate
                    </p>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut" as const }}
                  >
                    <Progress
                      value={(completedActivities / (totalActivities || 1)) * 100}
                      color="#3b82f6"
                      className="h-2 bg-white/[0.05]"
                    />
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Streak Card */}
            <motion.div
              className="group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/[0.06] bg-gradient-to-br from-orange-500/10 via-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full hover:border-orange-400/30 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-orange-400" />
                    Streak Totale
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">
                    <AnimatedCounter value={totalStreaks} />
                  </p>
                  <p className="text-xs text-zinc-500 mt-3">giorni consecutivi</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Days Logged Card */}
            <motion.div
              className="group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border-white/[0.06] bg-gradient-to-br from-purple-500/10 via-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full hover:border-purple-400/30 hover:shadow-lg hover:shadow-purple-500/5 transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    Giorni Registrati
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-4xl font-bold text-white">
                    <AnimatedCounter value={mockDays.length} />
                  </p>
                  <p className="text-xs text-zinc-500 mt-3">nel database</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Habits Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <Flame className="w-5 h-5 text-orange-400" />
              </motion.div>
              Abitudini Oggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitsWithStreaks.map((habit, idx) => {
                const categoryData = CATEGORIES[habit.category as Category];
                return (
                  <motion.div
                    key={habit.id}
                    custom={idx}
                    variants={slideInVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-4 rounded-lg border border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-transparent backdrop-blur hover:border-white/[0.12] hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <motion.div
                          className="text-3xl"
                          animate={
                            habit.completed
                              ? {
                                  scale: [1, 1.2, 1],
                                  rotate: [0, 10, -10, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 0.6,
                            repeat: habit.completed ? 0 : 0,
                          }}
                        >
                          {habit.emoji}
                        </motion.div>
                        <div>
                          <p className="font-medium text-white text-sm">
                            {habit.name}
                          </p>
                          <Badge
                            variant="outline"
                            className="text-xs mt-1"
                            style={{
                              borderColor: categoryData?.color,
                              color: categoryData?.color,
                            }}
                          >
                            {categoryData?.name}
                          </Badge>
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          type: "spring",
                          stiffness: 200,
                          damping: 10,
                        }}
                      >
                        {habit.completed ? (
                          <CheckCircle2
                            className="w-6 h-6 flex-shrink-0 text-amber-400"
                            style={{
                              filter:
                                "drop-shadow(0 0 8px rgba(251, 146, 60, 0.6))",
                            }}
                          />
                        ) : (
                          <Circle className="w-6 h-6 flex-shrink-0 text-zinc-600" />
                        )}
                      </motion.div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <Flame className="w-3 h-3 text-orange-400" />
                      </motion.div>
                      <span className="font-medium">
                        <AnimatedCounter value={habit.streak} /> {habit.streak === 1 ? "giorno" : "giorni"}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Activities Section */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] hover:shadow-lg transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-400" />
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, idx) => {
                const categoryData = CATEGORIES[activity.category as Category];
                return (
                  <motion.div
                    key={activity.id}
                    custom={idx}
                    variants={slideInVariants}
                    initial="hidden"
                    animate="visible"
                    className="p-4 rounded-lg border border-white/[0.06] bg-gradient-to-r from-white/[0.04] to-transparent backdrop-blur hover:border-white/[0.12] hover:shadow-lg transition-all duration-300 flex items-start gap-4 relative overflow-hidden"
                  >
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{
                        backgroundColor: categoryData?.color,
                        opacity: 0.6,
                      }}
                    />
                    <div className="flex-shrink-0 mt-1">
                      {activity.completed ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 15,
                          }}
                        >
                          <CheckCircle2
                            className="w-5 h-5 text-amber-400"
                            style={{
                              filter:
                                "drop-shadow(0 0 6px rgba(251, 146, 60, 0.5))",
                            }}
                          />
                        </motion.div>
                      ) : (
                        <Circle className="w-5 h-5 text-zinc-600" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4
                          className={`font-medium ${
                            activity.completed
                              ? "text-zinc-500 line-through"
                              : "text-white"
                          }`}
                        >
                          {activity.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-xs flex-shrink-0"
                          style={{
                            borderColor: categoryData?.color,
                            color: categoryData?.color,
                          }}
                        >
                          {categoryData?.emoji} {categoryData?.name}
                        </Badge>
                      </div>
                      {activity.description && (
                        <p className="text-sm text-zinc-400">
                          {activity.description}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
