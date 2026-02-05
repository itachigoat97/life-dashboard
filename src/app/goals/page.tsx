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
import { mockGoals, getWheelOfLifeData } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Target, TrendingUp, Award } from "lucide-react";

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
    transition: { duration: 0.4, ease: "easeOut" as const },
  },
};

export default function GoalsPage() {
  const wheelData = getWheelOfLifeData();
  const goals = mockGoals;

  // Calculate summary stats
  const totalGoals = goals.length;
  const goalsWithTargets = goals.filter((g) => g.target_value !== null);
  const averageCompletion =
    goalsWithTargets.length > 0
      ? Math.round(
          goalsWithTargets.reduce((sum, g) => {
            const progress = g.target_value ? (g.current_value / g.target_value) * 100 : 0;
            return sum + Math.min(progress, 100);
          }, 0) / goalsWithTargets.length
        )
      : 0;

  // Calculate goals on track (expected progress based on current month)
  const currentMonth = new Date().getMonth() + 1;
  const expectedProgress = (currentMonth / 12) * 100;
  const goalsOnTrack = goalsWithTargets.filter((g) => {
    const progress = g.target_value ? (g.current_value / g.target_value) * 100 : 0;
    return progress >= expectedProgress;
  }).length;

  // Group goals by category
  const goalsByCategory = goals.reduce(
    (acc, goal) => {
      const category = goal.category || "altro";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(goal);
      return acc;
    },
    {} as Record<string, typeof goals>
  );

  // Format wheel data for chart with emoji and name
  const formattedWheelData = wheelData.map((item) => {
    const categoryInfo = CATEGORIES[item.category as Category];
    return {
      ...item,
      name: `${categoryInfo.emoji} ${categoryInfo.name}`,
      originalCategory: item.category,
    };
  });

  return (
    <motion.div
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="space-y-8">
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-white">Obiettivi 2026</h1>
          <p className="text-white/60">I tuoi obiettivi annuali</p>
        </motion.div>

        {/* Summary Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Obiettivi totali</p>
                    <motion.p
                      className="text-3xl font-bold text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" as const }}
                    >
                      {totalGoals}
                    </motion.p>
                  </div>
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                      rotate: [0, 5, 0],
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Target className="w-10 h-10 text-[#d4af37]" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">Completamento medio</p>
                    <motion.p
                      className="text-3xl font-bold text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" as const }}
                    >
                      {averageCompletion}%
                    </motion.p>
                  </div>
                  <motion.div
                    animate={{
                      y: [0, -4, 0],
                    }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <TrendingUp className="w-10 h-10 text-[#d4af37]" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <CardContent className="pt-6 relative">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm font-medium mb-2">In linea con il piano</p>
                    <motion.p
                      className="text-3xl font-bold text-white"
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.4, ease: "easeOut" as const }}
                    >
                      {goalsOnTrack}/{goalsWithTargets.length}
                    </motion.p>
                  </div>
                  <motion.div
                    animate={{
                      rotate: [0, 10, 0],
                    }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                  >
                    <Award className="w-10 h-10 text-[#d4af37]" />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Ruota della Vita Section */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden">
            <CardHeader>
              <CardTitle className="text-2xl">Ruota della Vita</CardTitle>
              <p className="text-white/60 text-sm mt-2">Equilibrio tra le aree della tua vita</p>
            </CardHeader>
            <CardContent>
              {/* Radar Chart */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" as const }}
                >
                  <ResponsiveContainer width="100%" height={450}>
                    <RadarChart
                      data={formattedWheelData}
                      margin={{ top: 30, right: 50, bottom: 30, left: 50 }}
                    >
                      <PolarGrid
                        stroke="rgba(255, 255, 255, 0.1)"
                      />
                      <PolarAngleAxis
                        dataKey="name"
                        tick={{
                          fill: "rgba(255, 255, 255, 0.8)",
                          fontSize: 14,
                          fontWeight: 500,
                        }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 10]}
                        tick={false}
                      />
                      <Radar
                        name="Punteggio"
                        dataKey="value"
                        stroke="#d4af37"
                        fill="#d4af37"
                        fillOpacity={0.25}
                        isAnimationActive={true}
                        animationDuration={800}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* Category Scores Grid */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {formattedWheelData.map((item, index) => {
                  const categoryInfo = CATEGORIES[item.originalCategory as Category];
                  const percentage = (item.value / 10) * 100;

                  return (
                    <motion.div
                      key={item.originalCategory}
                      variants={itemVariants}
                      transition={{ delay: index * 0.05 }}
                      className="p-4 rounded-lg border border-white/[0.06] bg-gradient-to-br from-white/[0.02] to-white/[0.01] hover:border-white/[0.12] transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{categoryInfo.emoji}</span>
                          <span className="text-sm font-medium text-white">
                            {categoryInfo.name}
                          </span>
                        </div>
                        <motion.span
                          className="text-lg font-bold"
                          animate={{
                            color: [
                              categoryInfo.color || "#d4af37",
                              "rgba(212, 175, 55, 0.7)",
                              categoryInfo.color || "#d4af37",
                            ],
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        >
                          {item.value}/10
                        </motion.span>
                      </div>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.6, ease: "easeOut" as const }}
                      >
                        <Progress
                          value={percentage}
                          className="h-2 bg-white/[0.08]"
                          style={{
                            "--progress-background": categoryInfo.color || "#d4af37",
                          } as React.CSSProperties}
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals by Category Section */}
        <motion.div
          className="space-y-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {(Object.entries(goalsByCategory) as [string, typeof goals][]).map(
            ([category, categoryGoals], categoryIndex) => {
              const categoryInfo =
                category !== "altro" ? CATEGORIES[category as Category] : null;

              return (
                <motion.div
                  key={category}
                  variants={itemVariants}
                  transition={{ delay: categoryIndex * 0.05 }}
                >
                  {/* Category Header */}
                  <div className="mb-4 flex items-center gap-3">
                    {categoryInfo && (
                      <>
                        <motion.span
                          className="text-3xl"
                          animate={{
                            y: [0, -4, 0],
                          }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {categoryInfo.emoji}
                        </motion.span>
                        <div>
                          <h2 className="text-2xl font-bold text-white">
                            {categoryInfo.name}
                          </h2>
                          <p className="text-white/50 text-sm">
                            {categoryInfo.description}
                          </p>
                        </div>
                      </>
                    )}
                    {category === "altro" && (
                      <div>
                        <h2 className="text-2xl font-bold text-white">Altro</h2>
                        <p className="text-white/50 text-sm">
                          Obiettivi senza categoria
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Goals Grid */}
                  <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {categoryGoals.map((goal, goalIndex) => {
                      const progress =
                        goal.target_value !== null && goal.target_value > 0
                          ? (goal.current_value / goal.target_value) * 100
                          : 0;

                      return (
                        <motion.div
                          key={goal.id}
                          variants={itemVariants}
                          transition={{ delay: goalIndex * 0.05 }}
                        >
                          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl h-full overflow-hidden group">
                            <div
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                              style={{
                                background: `linear-gradient(135deg, ${categoryInfo?.color || "#d4af37"}10 0%, transparent 100%)`,
                              }}
                            />
                            <CardHeader className="relative">
                              <CardTitle className="text-lg text-white">
                                {goal.title}
                              </CardTitle>
                              {categoryInfo && (
                                <Badge
                                  variant="default"
                                  className={cn(
                                    "w-fit mt-2",
                                    categoryInfo.bgColor,
                                    categoryInfo.borderColor,
                                    categoryInfo.textColor
                                  )}
                                >
                                  {categoryInfo.emoji} {categoryInfo.name}
                                </Badge>
                              )}
                            </CardHeader>
                            <CardContent className="space-y-4 relative">
                              {goal.target_value !== null ? (
                                <>
                                  {/* Progress Bar */}
                                  <div>
                                    <div className="flex justify-between items-center mb-2">
                                      <span className="text-white/60 text-sm">
                                        Progresso
                                      </span>
                                      <motion.span
                                        className="font-semibold text-white"
                                        animate={{
                                          textShadow: progress > 75
                                            ? [
                                                `0 0 5px ${categoryInfo?.color || "#d4af37"}`,
                                                `0 0 10px ${categoryInfo?.color || "#d4af37"}`,
                                                `0 0 5px ${categoryInfo?.color || "#d4af37"}`,
                                              ]
                                            : "none",
                                        }}
                                        transition={{
                                          duration: 1,
                                          repeat: Infinity,
                                        }}
                                      >
                                        {Math.round(progress)}%
                                      </motion.span>
                                    </div>
                                    <motion.div
                                      initial={{ width: 0 }}
                                      animate={{ width: "100%" }}
                                      transition={{
                                        duration: 0.6,
                                        ease: "easeOut" as const,
                                      }}
                                    >
                                      <Progress
                                        value={Math.min(progress, 100)}
                                        className="h-3 bg-white/[0.08]"
                                        style={{
                                          "--progress-background":
                                            categoryInfo?.color || "#d4af37",
                                        } as React.CSSProperties}
                                      />
                                    </motion.div>
                                  </div>

                                  {/* Progress Details */}
                                  <div className="text-sm text-white/70">
                                    <p>
                                      <span className="font-semibold text-white">
                                        {goal.current_value}
                                      </span>
                                      {goal.unit && (
                                        <span className="ml-1">{goal.unit}</span>
                                      )}
                                      <span className="mx-1">/</span>
                                      <span className="font-semibold text-white">
                                        {goal.target_value}
                                      </span>
                                      {goal.unit && (
                                        <span className="ml-1">{goal.unit}</span>
                                      )}
                                    </p>
                                  </div>
                                </>
                              ) : (
                                <div className="text-sm text-white/60">
                                  <p>
                                    Valore attuale:{" "}
                                    <span className="font-semibold text-white">
                                      {goal.current_value}
                                    </span>
                                    {goal.unit && (
                                      <span className="ml-1">{goal.unit}</span>
                                    )}
                                  </p>
                                </div>
                              )}

                              {/* Year Badge */}
                              <Badge
                                variant="outline"
                                className="bg-white/[0.05] border-white/[0.1] text-white/70"
                              >
                                {goal.year}
                              </Badge>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              );
            }
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}