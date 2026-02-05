'use client';

import { motion } from 'framer-motion';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Award } from 'lucide-react';

import { CATEGORIES, Category } from '@/types';
import { mockGoals, getWheelOfLifeData } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const fadeInVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5 },
  }),
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
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
      const category = goal.category || 'altro';
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
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Goals 2026</h1>
        <p className="text-white/60">I tuoi obiettivi annuali</p>
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div custom={0} variants={fadeInVariants}>
          <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">Obiettivi totali</p>
                  <p className="text-3xl font-bold">{totalGoals}</p>
                </div>
                <Target className="w-10 h-10 text-[#d4af37]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={1} variants={fadeInVariants}>
          <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">Completamento medio</p>
                  <p className="text-3xl font-bold">{averageCompletion}%</p>
                </div>
                <TrendingUp className="w-10 h-10 text-[#d4af37]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div custom={2} variants={fadeInVariants}>
          <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm mb-2">In linea con il piano</p>
                  <p className="text-3xl font-bold">
                    {goalsOnTrack}/{goalsWithTargets.length}
                  </p>
                </div>
                <Award className="w-10 h-10 text-[#d4af37]" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Ruota della Vita Section */}
      <motion.div
        custom={3}
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-sm overflow-hidden">
          <CardHeader>
            <CardTitle className="text-2xl">Ruota della Vita</CardTitle>
            <p className="text-white/60 text-sm mt-2">Equilibrio tra le aree della tua vita</p>
          </CardHeader>
          <CardContent>
            {/* Radar Chart */}
            <div className="mb-8">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={formattedWheelData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
                  <PolarAngleAxis
                    dataKey="name"
                    tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
                  />
                  <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: 'rgba(255, 255, 255, 0.5)' }} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#d4af37"
                    fill="#d4af37"
                    fillOpacity={0.3}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Scores Grid */}
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.4 }}
            >
              {formattedWheelData.map((item, index) => {
                const categoryInfo = CATEGORIES[item.originalCategory as Category];
                return (
                  <motion.div
                    key={item.originalCategory}
                    custom={index}
                    variants={fadeInVariants}
                    className="p-4 rounded-lg border border-white/[0.08] bg-white/[0.02]"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{categoryInfo.emoji}</span>
                        <span className="text-sm font-medium">{categoryInfo.name}</span>
                      </div>
                      <span className="text-lg font-bold text-[#d4af37]">{item.value}/10</span>
                    </div>
                    <Progress
                      value={(item.value / 10) * 100}
                      className="h-2 bg-white/[0.08]"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                    />
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
        transition={{ delay: 0.5 }}
      >
        {(Object.entries(goalsByCategory) as [string, typeof goals][]).map(
          ([category, categoryGoals], categoryIndex) => {
            const categoryInfo =
              category !== 'altro' ? CATEGORIES[category as Category] : null;

            return (
              <motion.div
                key={category}
                custom={categoryIndex}
                variants={fadeInVariants}
              >
                {/* Category Header */}
                <div className="mb-4 flex items-center gap-3">
                  {categoryInfo && (
                    <>
                      <span className="text-3xl">{categoryInfo.emoji}</span>
                      <div>
                        <h2 className="text-2xl font-bold">{categoryInfo.name}</h2>
                        <p className="text-white/50 text-sm">{categoryInfo.description}</p>
                      </div>
                    </>
                  )}
                  {category === 'altro' && (
                    <div>
                      <h2 className="text-2xl font-bold">Altro</h2>
                      <p className="text-white/50 text-sm">Obiettivi senza categoria</p>
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
                        custom={goalIndex}
                        variants={fadeInVariants}
                      >
                        <Card className="border-white/[0.08] bg-white/[0.03] backdrop-blur-sm h-full">
                          <CardHeader>
                            <CardTitle className="text-lg">{goal.title}</CardTitle>
                            {categoryInfo && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  'w-fit mt-2',
                                  categoryInfo.borderColor,
                                  categoryInfo.textColor
                                )}
                              >
                                {categoryInfo.emoji} {categoryInfo.name}
                              </Badge>
                            )}
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {goal.target_value !== null ? (
                              <>
                                {/* Progress Bar */}
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-white/60 text-sm">Progresso</span>
                                    <span className="font-semibold">{Math.round(progress)}%</span>
                                  </div>
                                  <Progress
                                    value={Math.min(progress, 100)}
                                    className="h-3 bg-white/[0.08]"
                                    style={{
                                      backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                    }}
                                  />
                                </div>

                                {/* Progress Details */}
                                <div className="text-sm text-white/70">
                                  <p>
                                    <span className="font-semibold text-white">
                                      {goal.current_value}
                                    </span>
                                    {goal.unit && <span className="ml-1">{goal.unit}</span>}
                                    <span className="mx-1">/</span>
                                    <span className="font-semibold text-white">
                                      {goal.target_value}
                                    </span>
                                    {goal.unit && <span className="ml-1">{goal.unit}</span>}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <div className="text-sm text-white/60">
                                <p>
                                  Valore attuale:{' '}
                                  <span className="font-semibold text-white">
                                    {goal.current_value}
                                  </span>
                                  {goal.unit && <span className="ml-1">{goal.unit}</span>}
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
  );
}
