"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MonthlyGoal } from "@/types";
import {
  fetchMonthlyGoals,
  updateMonthlyGoal,
  getDaysForMonth,
  getWheelOfLifeForMonth,
  computeWheelFromGoals as computeWheelFromMonthlyGoals,
  computeWheelFromWheelOfLife,
} from "@/lib/supabase";
import { containerVariants } from "@/lib/animations";

import { MonthHeader } from "@/components/monthly-goals/month-header";
import { StatsOverview } from "@/components/monthly-goals/stats-overview";
import { ProgressSection } from "@/components/monthly-goals/progress-section";
import { GoalsByCategory } from "@/components/monthly-goals/goals-by-category";
import { ComparisonRadar } from "@/components/monthly-goals/comparison-radar";
import { EditGoalModal } from "@/components/monthly-goals/edit-goal-modal";

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
  const [editStatus, setEditStatus] =
    useState<MonthlyGoal["status"]>("pending");
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
          ? Math.round(
              (energies.reduce((a, b) => a + b, 0) / energies.length) * 10
            ) / 10
          : null
      );
      setEnergyByDay(energies);

      // Wheel of Life for this month
      if (wolData) {
        setWheelData(computeWheelFromWheelOfLife(wolData));
      } else {
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

  // ── Navigation ──

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

  // ── Goal editing ──

  const openEditModal = (goal: MonthlyGoal) => {
    setEditingGoal(goal);
    setEditValue(String(goal.current_value));
    setEditStatus(goal.status);
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

  // ── Computed stats ──

  const totalGoals = goals.length;
  const completedGoals = goals.filter((g) => g.status === "completed").length;
  const inProgressGoals = goals.filter(
    (g) => g.status === "in_progress"
  ).length;
  const failedGoals = goals.filter((g) => g.status === "failed").length;
  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const isPastMonth =
    year < now.getFullYear() ||
    (year === now.getFullYear() && month < now.getMonth() + 1);

  // ── Loading skeleton ──

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
        <MonthHeader
          month={month}
          year={year}
          completionRate={completionRate}
          onPrevMonth={goToPrevMonth}
          onNextMonth={goToNextMonth}
        />

        <StatsOverview
          totalGoals={totalGoals}
          completedGoals={completedGoals}
          inProgressGoals={inProgressGoals}
          failedGoals={failedGoals}
        />

        <ProgressSection
          completionRate={completionRate}
          completedGoals={completedGoals}
          totalGoals={totalGoals}
          avgEnergy={avgEnergy}
          energyByDay={energyByDay}
        />

        <GoalsByCategory goals={goals} onEditGoal={openEditModal} />

        <ComparisonRadar
          month={month}
          wheelData={wheelData}
          prevWheelData={prevWheelData}
          isPastMonth={isPastMonth}
        />
      </motion.div>

      <EditGoalModal
        editingGoal={editingGoal}
        editValue={editValue}
        editStatus={editStatus}
        saving={saving}
        onClose={() => setEditingGoal(null)}
        onEditValueChange={setEditValue}
        onEditStatusChange={setEditStatus}
        onSave={handleSaveGoal}
      />
    </>
  );
}
