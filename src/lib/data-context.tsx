"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  getDays as fetchDays,
  getHabits as fetchHabits,
  getHabitLogs as fetchHabitLogs,
  getRecentActivities as fetchRecentActivities,
  getGoals as fetchGoals,
  getWheelOfLife as fetchWheelOfLife,
  computeStreakForHabit,
  computeWheelFromGoals,
  computeWheelFromWheelOfLife,
  toggleHabitLog as toggleHabitLogApi,
} from "@/lib/supabase";
import type {
  Day,
  Activity,
  Habit,
  HabitLog,
  Goal,
} from "@/types";

interface WheelDatum {
  category: string;
  value: number;
  fullMark: number;
}

interface DataContextType {
  loading: boolean;
  days: Day[];
  habits: Habit[];
  habitLogs: HabitLog[];
  recentActivities: Activity[];
  goals: Goal[];
  wheelData: WheelDatum[];
  /** Refresh all data from Supabase */
  refresh: () => Promise<void>;
  /** Toggle a habit log and update local state optimistically */
  toggleHabitLog: (habitId: string, date: string) => Promise<void>;
  /** Compute streak using cached logs */
  streakFor: (habitId: string) => number;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData(): DataContextType {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState<Day[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [habitLogs, setHabitLogs] = useState<HabitLog[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [wheelData, setWheelData] = useState<WheelDatum[]>([]);

  const loadAll = useCallback(async () => {
    try {
      const [d, h, hl, ra, g, wol] = await Promise.all([
        fetchDays(),
        fetchHabits(),
        fetchHabitLogs(),
        fetchRecentActivities(5),
        fetchGoals(2026),
        fetchWheelOfLife(),
      ]);
      setDays(d);
      setHabits(h);
      setHabitLogs(hl);
      setRecentActivities(ra);
      setGoals(g);

      if (wol) {
        setWheelData(computeWheelFromWheelOfLife(wol));
      } else {
        setWheelData(computeWheelFromGoals(g));
      }
    } catch (err) {
      console.error("DataProvider fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const toggleHabitLog = useCallback(
    async (habitId: string, date: string) => {
      try {
        const newCompleted = await toggleHabitLogApi(habitId, date);
        setHabitLogs((prev) => {
          const exists = prev.find(
            (l) => l.habit_id === habitId && l.date === date
          );
          if (exists) {
            return prev.map((l) =>
              l.habit_id === habitId && l.date === date
                ? { ...l, completed: newCompleted }
                : l
            );
          }
          return [
            ...prev,
            {
              id: `temp-${Date.now()}`,
              habit_id: habitId,
              date,
              completed: newCompleted,
            },
          ];
        });
      } catch (err) {
        console.error("toggleHabitLog error:", err);
      }
    },
    []
  );

  const streakFor = useCallback(
    (habitId: string) => computeStreakForHabit(habitId, habitLogs),
    [habitLogs]
  );

  return (
    <DataContext.Provider
      value={{
        loading,
        days,
        habits,
        habitLogs,
        recentActivities,
        goals,
        wheelData,
        refresh: loadAll,
        toggleHabitLog,
        streakFor,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
