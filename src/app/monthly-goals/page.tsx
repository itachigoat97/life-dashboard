"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CATEGORIES, Category, MonthlyGoal } from "@/types";
import {
  fetchMonthlyGoals,
  updateMonthlyGoal,
  getDaysForMonth,
  getWheelOfLifeForMonth,
  computeWheelFromGoals as computeWheelFromMonthlyGoals,
  computeWheelFromWheelOfLife,
} from "@/lib/supabase";
import {
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  X,
  TrendingUp,
  Zap,
  BarChart3,
} from "lucide-react";

const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

const MONTH_MOTTOS: Record<number, string> = {
  1: "L'Inizio",
  2: "Il Raccolto",
  3: "Il Risveglio",
  4: "La Fioritura",
  5: "L'Espansione",
  6: "La Maturità",
  7: "La Riflessione",
  8: "La Rigenerazione",
  9: "Il Rinnovamento",
  10: "La Raccolta",
  11: "La Profondità",
  12: "Il Compimento",
};

const STATUS_CONFIG = {
  completed: { label: "Completato", color: "#22c55e", icon: CheckCircle2 },
  in_progress: { label: "In Corso", color: "#f59e0b", icon: Clock },
  pending: { label: "In Attesa", color: "#6b7280", icon: Target },
  failed: { label: "Fallito", color: "#ef4444", icon: AlertCircle },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function MonthlyGoalsPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgEnergy, setAvgEnergy] = useState<number | null>(null);
  const [wheelData, setWheelData] = useState<
    { category: string; value: number; fullMark: number }[]
  >([]);
  const [prevWheelData, setPrevWheelData] = useState<
    { category: string; value: number; fullMark: number }[]
  >([]);
  const [energyByDay, setEnergyByDay] = useState<number[]>([]);

  // Modal state
  const [editingGoal, setEditingGoal] = useState<MonthlyGoal | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editStatus, setEditStatus] = useState<MonthlyGoal["status"]>("pending");
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [goalsData, daysData, wolData] = await Promise.all([
        fetchMonthlyGoals(month, year),
        getDaysForMonth(month, year),
        getWheelOfLifeForMonth(month, year),
      ]);

      setGoals(goalsData);

      // Average energy
      const energies = daysData
        .filter((d) => d.energy_level > 0)
        .map((d) => d.energy_level);
      setAvgEnergy(
        energies.length > 0
          ? Math.round((energies.reduce((a, b) => a + b, 0) / energies.length) * 10) / 10
          : null
      );
      setEnergyByDay(energies);

      // Wheel of Life for this month
      if (wolData) {
        setWheelData(computeWheelFromWheelOfLife(wolData));
      } else {
        // Compute from monthly goals
        const goalLikeData = goalsData
          .filter((g) => g.category)
          .map((g) => ({
            id: g.id,
            title: g.title,
            target_value: g.target_value,
            current_value: g.current_value,
            unit: g.unit,
            category: g.category,
            year: g.year,
            created_at: g.created_at,
          }));
        setWheelData(computeWheelFromMonthlyGoals(goalLikeData));
      }

      // Previous month wheel
      const prevMonth = month === 1 ? 12 : month - 1;
      const prevYear = month === 1 ? year - 1 : year;
      const prevWol = await getWheelOfLifeForMonth(prevMonth, prevYear);
      if (prevWol) {
        setPrevWheelData(computeWheelFromWheelOfLife(prevWol));
      } else {
        const prevGoals = await fetchMonthlyGoals(prevMonth, prevYear);
        if (prevGoals.length > 0) {
          const prevGoalLike = prevGoals
            .filter((g) => g.category)
            .map((g) => ({
              id: g.id,
              title: g.title,
              target_value: g.target_value,
              current_value: g.current_value,
              unit: g.unit,
              category: g.category,
              year: g.year,
              created_at: g.created_at,
            }));
          setPrevWheelData(computeWheelFromMonthlyGoals(prevGoalLike));
        } else {
          setPrevWheelData([]);
        }
      }
    } catch (err) {
      console.error("Failed to load monthly goals:", err);
    } finally {
      setLoading(false);
    }
  }, [month, year]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goToPrevMonth = () => {
    if (month === 1) {
      setMonth(12);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      setMonth(1);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const handleSaveGoal = async () => {
    if (!editingGoal) return;
    setSaving(true);
    try {
      const updates: Parameters<typeof updateMonthlyGoal>[1] = {
        current_value: Number(editValue),
        status: editStatus,
      };
      await updateMonthlyGoal(editingGoal.id, updates);
      setEditingGoal(null);
      await loadData();
    } catch (err) {
      console.error("Failed to update goal:", err);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (goal: MonthlyGoal) => {
    setEditingGoal(goal);
    setEditValue(String(goal.current_value));
    setEditStatus(goal.status);
  };

  // Stats
  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const inProgressGoals = goals.filter((g) => g.status === "in_progress").length;
  const failedGoals = goals.filter((g) => g.status === "failed").length;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  // Group by category
  const categoryOrder: Category[] = [
    "anima",
    "mente",
    "cuore",
    "corpo",
    "abito",
    "portafoglio",
  ];
  const goalsByCategory = categoryOrder
    .map((cat) => ({
      category: cat,
      goals: goals.filter((g) => g.category === cat),
    }))
    .filter((group) => group.goals.length > 0);

  const isPastMonth =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);

  // Radar data for comparison
  const radarData = wheelData.map((item) => {
    const catInfo = CATEGORIES[item.category as Category];
    const prevItem = prevWheelData.find((p) => p.category === item.category);
    return {
      name: `${catInfo?.emoji ?? ""} ${catInfo?.name ?? item.category}`,
      current: item.value,
      previous: prevItem?.value ?? 0,
      fullMark: 10,
    };
  });

  // Loading skeleton
  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="h-10 w-10 rounded-lg bg-white/[0.05]" />
          <div className="h-12 w-64 rounded-lg bg-white/[0.05]" />
          <div className="h-10 w-10 rounded-lg bg-white/[0.05]" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-white/[0.05]" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-white/[0.05]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* ── HEADER: Month Navigation ── */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={goToPrevMonth}
              className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
            >
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <motion.h1
                key={`${month}-${year}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-3xl sm:text-4xl font-bold text-white"
              >
                {MONTH_NAMES[month - 1]} {year}
              </motion.h1>
              <motion.p
                key={`motto-${month}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-sm mt-1 bg-gradient-to-r from-amber-400 to-yellow-200 bg-clip-text text-transparent font-medium"
              >
                {MONTH_MOTTOS[month]}
              </motion.p>
            </div>
            <button
              onClick={goToNextMonth}
              className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.1] hover:border-white/[0.15] transition-all"
            >
              <ChevronRight className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Score pill */}
          <div className="flex justify-center mt-4">
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10"
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(212, 175, 55, 0.2)",
                  "0 0 20px 0 rgba(212, 175, 55, 0.1)",
                  "0 0 0 0 rgba(212, 175, 55, 0.2)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span className="text-amber-400 font-bold text-lg">
                {completionRate}%
              </span>
              <span className="text-amber-400/70 text-sm">completato</span>
            </motion.div>
          </div>
        </motion.div>

        {/* ── OVERVIEW SECTION ── */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            {
              label: "Totali",
              value: totalGoals,
              icon: Target,
              gradient: "from-blue-500/10",
              iconColor: "text-blue-400",
              borderHover: "hover:border-blue-400/30",
            },
            {
              label: "Completati",
              value: completedGoals,
              icon: CheckCircle2,
              gradient: "from-green-500/10",
              iconColor: "text-green-400",
              borderHover: "hover:border-green-400/30",
            },
            {
              label: "In Corso",
              value: inProgressGoals,
              icon: Clock,
              gradient: "from-amber-500/10",
              iconColor: "text-amber-400",
              borderHover: "hover:border-amber-400/30",
            },
            {
              label: "Falliti",
              value: failedGoals,
              icon: AlertCircle,
              gradient: "from-red-500/10",
              iconColor: "text-red-400",
              borderHover: "hover:border-red-400/30",
            },
          ].map((stat) => (
            <motion.div key={stat.label} variants={itemVariants}>
              <Card
                className={`border-white/[0.06] bg-gradient-to-br ${stat.gradient} via-white/[0.05] to-white/[0.02] backdrop-blur-xl ${stat.borderHover} hover:shadow-lg transition-all duration-300`}
              >
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-400 font-medium mb-1">
                        {stat.label}
                      </p>
                      <p className="text-3xl font-bold text-white">
                        {stat.value}
                      </p>
                    </div>
                    <stat.icon className={`w-8 h-8 ${stat.iconColor} opacity-60`} />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* ── CIRCULAR PROGRESS + ENERGY ── */}
        <motion.div
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Circular Progress */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300">
              <CardContent className="pt-6 flex flex-col items-center">
                <div className="relative w-40 h-40 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="10"
                    />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="52"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 52}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                      animate={{
                        strokeDashoffset:
                          2 * Math.PI * 52 * (1 - completionRate / 100),
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      style={{
                        filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))",
                      }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {completionRate}%
                    </span>
                    <span className="text-xs text-zinc-400">completamento</span>
                  </div>
                </div>
                <p className="text-sm text-zinc-400">
                  {completedGoals} di {totalGoals} obiettivi raggiunti
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Energy + Mini Sparkline */}
          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 h-full">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Energia del Mese
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                {avgEnergy !== null ? (
                  <>
                    <div className="relative w-28 h-28">
                      <motion.div
                        className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 opacity-20 blur-xl"
                        animate={{ scale: [1, 1.15, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-white">
                            {avgEnergy}
                          </div>
                          <div className="text-xs text-zinc-400">/10</div>
                        </div>
                      </div>
                    </div>
                    {/* Mini sparkline */}
                    {energyByDay.length > 1 && (
                      <div className="w-full h-12 flex items-end gap-[2px]">
                        {energyByDay.map((e, i) => (
                          <motion.div
                            key={i}
                            className="flex-1 rounded-t bg-gradient-to-t from-green-500/60 to-green-400/40"
                            initial={{ height: 0 }}
                            animate={{ height: `${(e / 10) * 100}%` }}
                            transition={{ delay: i * 0.03, duration: 0.4 }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-zinc-500 text-sm py-8">
                    Nessun dato energia per questo mese
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* ── GOALS BY CATEGORY ── */}
        <motion.div variants={containerVariants} className="space-y-6">
          <motion.h2
            variants={itemVariants}
            className="text-2xl font-bold text-white flex items-center gap-2"
          >
            <BarChart3 className="w-6 h-6 text-amber-400" />
            Obiettivi per Categoria
          </motion.h2>

          {goalsByCategory.length === 0 && (
            <motion.div
              variants={itemVariants}
              className="text-center py-16 text-zinc-500"
            >
              <Target className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>Nessun obiettivo per questo mese</p>
            </motion.div>
          )}

          {goalsByCategory.map(({ category, goals: catGoals }) => {
            const catInfo = CATEGORIES[category];
            return (
              <motion.div key={category} variants={itemVariants}>
                {/* Category Header */}
                <div
                  className="flex items-center gap-3 mb-3 px-3 py-2 rounded-lg border-l-4"
                  style={{ borderColor: catInfo.color }}
                >
                  <span className="text-2xl">{catInfo.emoji}</span>
                  <div>
                    <h3
                      className="text-lg font-bold"
                      style={{ color: catInfo.color }}
                    >
                      {catInfo.name}
                    </h3>
                    <p className="text-xs text-zinc-500">{catInfo.description}</p>
                  </div>
                  <Badge
                    variant="outline"
                    className="ml-auto"
                    style={{ borderColor: catInfo.color, color: catInfo.color }}
                  >
                    {catGoals.filter((g) => g.status === "completed").length}/
                    {catGoals.length}
                  </Badge>
                </div>

                {/* Goals list */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {catGoals.map((goal) => {
                    const progress =
                      goal.target_value && goal.target_value > 0
                        ? Math.min(
                            (goal.current_value / goal.target_value) * 100,
                            100
                          )
                        : goal.status === "completed"
                          ? 100
                          : 0;
                    const statusCfg = STATUS_CONFIG[goal.status];
                    const StatusIcon = statusCfg.icon;

                    return (
                      <motion.div
                        key={goal.id}
                        whileHover={{ scale: 1.01 }}
                        className="cursor-pointer"
                        onClick={() => openEditModal(goal)}
                      >
                        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.04] to-white/[0.01] backdrop-blur-xl hover:border-white/[0.15] hover:shadow-lg transition-all duration-300 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1"
                            style={{
                              backgroundColor: statusCfg.color,
                              opacity: 0.6,
                            }}
                          />
                          <CardContent className="pt-4 pb-4 pl-5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-white text-sm truncate">
                                  {goal.title}
                                </h4>
                                {goal.target_value && (
                                  <p className="text-xs text-zinc-400 mt-0.5">
                                    {goal.current_value}
                                    {goal.unit ? ` ${goal.unit}` : ""} /{" "}
                                    {goal.target_value}
                                    {goal.unit ? ` ${goal.unit}` : ""}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                <Badge
                                  variant="outline"
                                  className="text-[10px] px-2 py-0.5"
                                  style={{
                                    borderColor: statusCfg.color,
                                    color: statusCfg.color,
                                  }}
                                >
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {statusCfg.label}
                                </Badge>
                              </div>
                            </div>
                            <div className="mt-2">
                              <Progress
                                value={progress}
                                className="h-1.5 bg-white/[0.06]"
                                color={statusCfg.color}
                              />
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* ── COMPARISON SECTION (only for past months or if prev data exists) ── */}
        {(isPastMonth || prevWheelData.length > 0) && radarData.length > 0 && (
          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  Confronto con {MONTH_NAMES[month === 1 ? 11 : month - 2]}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis
                      dataKey="name"
                      tick={{
                        fill: "rgba(255,255,255,0.7)",
                        fontSize: 12,
                      }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={false}
                    />
                    {prevWheelData.length > 0 && (
                      <Radar
                        name={MONTH_NAMES[month === 1 ? 11 : month - 2]}
                        dataKey="previous"
                        stroke="#6b7280"
                        fill="#6b7280"
                        fillOpacity={0.15}
                        strokeDasharray="4 4"
                      />
                    )}
                    <Radar
                      name={MONTH_NAMES[month - 1]}
                      dataKey="current"
                      stroke="#d4af37"
                      fill="#d4af37"
                      fillOpacity={0.25}
                    />
                    <Legend
                      wrapperStyle={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>

      {/* ── EDIT MODAL ── */}
      <AnimatePresence>
        {editingGoal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setEditingGoal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#141414] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">
                  Aggiorna Obiettivo
                </h3>
                <button
                  onClick={() => setEditingGoal(null)}
                  className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-sm font-medium text-white mb-1">
                    {editingGoal.title}
                  </p>
                  {editingGoal.category && (
                    <Badge
                      variant="outline"
                      style={{
                        borderColor:
                          CATEGORIES[editingGoal.category]?.color,
                        color: CATEGORIES[editingGoal.category]?.color,
                      }}
                    >
                      {CATEGORIES[editingGoal.category]?.emoji}{" "}
                      {CATEGORIES[editingGoal.category]?.name}
                    </Badge>
                  )}
                </div>

                {/* Current value input */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Valore attuale
                    {editingGoal.target_value && (
                      <span className="text-zinc-500">
                        {" "}
                        / {editingGoal.target_value}
                        {editingGoal.unit ? ` ${editingGoal.unit}` : ""}
                      </span>
                    )}
                  </label>
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                    min={0}
                  />
                </div>

                {/* Status select */}
                <div>
                  <label className="block text-sm text-zinc-400 mb-2">
                    Stato
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(
                      Object.entries(STATUS_CONFIG) as [
                        MonthlyGoal["status"],
                        (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG],
                      ][]
                    ).map(([key, cfg]) => {
                      const Icon = cfg.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setEditStatus(key)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                            editStatus === key
                              ? "border-white/[0.2] bg-white/[0.08] text-white"
                              : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
                          }`}
                        >
                          <Icon
                            className="w-4 h-4"
                            style={{ color: cfg.color }}
                          />
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Save button */}
                <button
                  onClick={handleSaveGoal}
                  disabled={saving}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Salva"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
