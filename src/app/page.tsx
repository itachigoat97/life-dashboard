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
import { CATEGORIES, Category } from '@/types';
import {
  mockDays,
  mockActivities,
  mockHabits,
  getWheelOfLifeData,
  getStreakForHabit,
  getActivitiesForDay,
  getHabitLogsForDate,
} from '@/lib/mock-data';
import { formatDate, toISODate } from '@/lib/utils';
import {
  Zap,
  Activity,
  Flame,
  TrendingUp,
  Calendar,
  CheckCircle2,
  Circle,
} from 'lucide-react';

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
      ease: 'easeOut' as const,
    },
  },
};

export default function Dashboard() {
  // Get today's data
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
  const chartData = wheelData.map((item) => {
    const categoryKey = Object.keys(CATEGORIES).find(
      (key) => CATEGORIES[key as Category].name === item.category
    ) as Category | undefined;

    if (!categoryKey) return item;

    return {
      ...item,
      category: `${CATEGORIES[categoryKey].emoji} ${CATEGORIES[categoryKey].name}`,
    };
  });

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
      className="min-h-screen bg-[#0a0a0a] p-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div className="mb-8" variants={itemVariants}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Buongiorno, Paolo
            </h1>
            <p className="text-gray-400 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formatDate(today)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-2">
              <Zap className="w-5 h-5" style={{ color: '#d4af37' }} />
              <span className="text-3xl font-bold text-white">
                {todayDay.energy_level}/10
              </span>
            </div>
            <p className="text-sm text-gray-400">Energia oggi</p>
          </div>
        </div>
      </motion.div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left Column: Wheel of Life Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-1">
          <Card className="bg-white/[0.03] border-white/[0.08] h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5" style={{ color: '#d4af37' }} />
                Ruota della Vita
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={chartData}>
                  <PolarGrid strokeOpacity={0.1} stroke="rgba(255,255,255,0.1)" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{
                      fill: '#999',
                      fontSize: 12,
                    }}
                    angle={90}
                    type="number"
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 10]}
                    tick={{
                      fill: '#666',
                      fontSize: 10,
                    }}
                  />
                  <Radar
                    name="Livello"
                    dataKey="value"
                    stroke="#d4af37"
                    fill="#d4af37"
                    fillOpacity={0.25}
                    dot={{ fill: '#d4af37', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column: Stats Grid */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* Energy Card */}
            <Card className="bg-white/[0.03] border-white/[0.08]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" style={{ color: '#d4af37' }} />
                  Energia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-white">
                    {todayDay.energy_level}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">su 10</p>
                </div>
                <Progress
                  value={energyPercentage}
                  className="h-2 bg-white/[0.05]"
                />
              </CardContent>
            </Card>

            {/* Activities Card */}
            <Card className="bg-white/[0.03] border-white/[0.08]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" style={{ color: '#d4af37' }} />
                  Attività
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-3xl font-bold text-white">
                    {completedActivities}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    di {totalActivities} completate
                  </p>
                </div>
                <Progress
                  value={(completedActivities / (totalActivities || 1)) * 100}
                  className="h-2 bg-white/[0.05]"
                />
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card className="bg-white/[0.03] border-white/[0.08]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Flame className="w-4 h-4" style={{ color: '#d4af37' }} />
                  Streak Totale
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{totalStreaks}</p>
                <p className="text-xs text-gray-400 mt-1">giorni consecutivi</p>
              </CardContent>
            </Card>

            {/* Days Logged Card */}
            <Card className="bg-white/[0.03] border-white/[0.08]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={{ color: '#d4af37' }} />
                  Giorni Registrati
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-white">{mockDays.length}</p>
                <p className="text-xs text-gray-400 mt-1">nel database</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Habits Section */}
      <motion.div variants={itemVariants} className="mb-8">
        <Card className="bg-white/[0.03] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Flame className="w-5 h-5" style={{ color: '#d4af37' }} />
              Abitudini Oggi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {habitsWithStreaks.map((habit) => {
                const categoryData = CATEGORIES[habit.category as Category];
                return (
                  <motion.div
                    key={habit.id}
                    variants={itemVariants}
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{habit.emoji}</span>
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
                      {habit.completed ? (
                        <CheckCircle2
                          className="w-5 h-5 flex-shrink-0"
                          style={{ color: '#d4af37' }}
                        />
                      ) : (
                        <Circle className="w-5 h-5 flex-shrink-0 text-gray-600" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Flame className="w-3 h-3" style={{ color: '#d4af37' }} />
                      <span>{habit.streak} giorni</span>
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
        <Card className="bg-white/[0.03] border-white/[0.08]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" style={{ color: '#d4af37' }} />
              Attività Recenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity) => {
                const categoryData = CATEGORIES[activity.category as Category];
                return (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                    className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.05] hover:border-white/[0.1] transition-all flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {activity.completed ? (
                        <CheckCircle2
                          className="w-5 h-5"
                          style={{ color: '#d4af37' }}
                        />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4
                          className={`font-medium ${
                            activity.completed
                              ? 'text-gray-400 line-through'
                              : 'text-white'
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
                        <p className="text-sm text-gray-400">
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
