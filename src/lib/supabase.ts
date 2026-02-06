import { createClient } from "@supabase/supabase-js";
import {
  Day,
  Activity,
  Habit,
  HabitLog,
  Goal,
  Category,
  WheelOfLife,
} from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Days ──────────────────────────────────────────────

export async function getDays(): Promise<Day[]> {
  const { data, error } = await supabase
    .from("days")
    .select("*, activities(*)")
    .order("date", { ascending: false });

  if (error) throw error;
  return (data as Day[]) ?? [];
}

export async function getDay(date: string): Promise<Day | null> {
  const { data, error } = await supabase
    .from("days")
    .select("*, activities(*)")
    .eq("date", date)
    .maybeSingle();

  if (error) throw error;
  return data as Day | null;
}

export async function createDay(day: {
  date: string;
  energy_level: number;
  notes?: string | null;
}): Promise<Day> {
  const { data, error } = await supabase
    .from("days")
    .insert(day)
    .select()
    .single();

  if (error) throw error;
  return data as Day;
}

// ── Activities ────────────────────────────────────────

export async function getActivitiesForDay(dayId: string): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .eq("day_id", dayId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Activity[]) ?? [];
}

export async function getRecentActivities(
  limit: number = 5
): Promise<Activity[]> {
  const { data, error } = await supabase
    .from("activities")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data as Activity[]) ?? [];
}

export async function createActivity(activity: {
  day_id: string;
  category: Category;
  title: string;
  description?: string | null;
  completed?: boolean;
}): Promise<Activity> {
  const { data, error } = await supabase
    .from("activities")
    .insert(activity)
    .select()
    .single();

  if (error) throw error;
  return data as Activity;
}

// ── Habits ────────────────────────────────────────────

export async function getHabits(): Promise<Habit[]> {
  const { data, error } = await supabase
    .from("habits")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data as Habit[]) ?? [];
}

export async function getHabitLogs(
  habitIds?: string[],
  fromDate?: string,
  toDate?: string
): Promise<HabitLog[]> {
  let query = supabase.from("habit_logs").select("*");

  if (habitIds && habitIds.length > 0) {
    query = query.in("habit_id", habitIds);
  }
  if (fromDate) {
    query = query.gte("date", fromDate);
  }
  if (toDate) {
    query = query.lte("date", toDate);
  }

  query = query.order("date", { ascending: false });

  const { data, error } = await query;
  if (error) throw error;
  return (data as HabitLog[]) ?? [];
}

export async function toggleHabitLog(
  habitId: string,
  date: string
): Promise<boolean> {
  const { data: existing } = await supabase
    .from("habit_logs")
    .select("id, completed")
    .eq("habit_id", habitId)
    .eq("date", date)
    .maybeSingle();

  if (existing) {
    const newVal = !existing.completed;
    const { error } = await supabase
      .from("habit_logs")
      .update({ completed: newVal })
      .eq("id", existing.id);
    if (error) throw error;
    return newVal;
  } else {
    const { error } = await supabase
      .from("habit_logs")
      .insert({ habit_id: habitId, date, completed: true });
    if (error) throw error;
    return true;
  }
}

// ── Goals ─────────────────────────────────────────────

export async function getGoals(year?: number): Promise<Goal[]> {
  let query = supabase.from("goals").select("*");

  if (year) {
    query = query.eq("year", year);
  }

  query = query.order("created_at", { ascending: true });

  const { data, error } = await query;
  if (error) throw error;
  return (data as Goal[]) ?? [];
}

// ── Wheel of Life ─────────────────────────────────────

export async function getWheelOfLife(): Promise<WheelOfLife | null> {
  const { data, error } = await supabase
    .from("wheel_of_life")
    .select("*")
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as WheelOfLife | null;
}

// ── Client-side computations ──────────────────────────

export function computeStreakForHabit(
  habitId: string,
  logs: HabitLog[]
): number {
  const completedDates = logs
    .filter((l) => l.habit_id === habitId && l.completed)
    .map((l) => l.date)
    .sort()
    .reverse();

  if (completedDates.length === 0) return 0;

  let streak = 0;
  const current = new Date();

  for (let i = 0; i < 60; i++) {
    const dateStr = current.toISOString().split("T")[0];
    if (completedDates.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export function computeWheelFromGoals(
  goals: Goal[]
): { category: Category; value: number; fullMark: number }[] {
  const categories: Category[] = [
    "anima",
    "mente",
    "cuore",
    "corpo",
    "abito",
    "portafoglio",
  ];
  return categories.map((cat) => {
    const catGoals = goals.filter((g) => g.category === cat);
    const avg =
      catGoals.length > 0
        ? catGoals.reduce((sum, g) => {
            const pct = g.target_value
              ? (g.current_value / g.target_value) * 10
              : 5;
            return sum + Math.min(pct, 10);
          }, 0) / catGoals.length
        : 5;
    return {
      category: cat,
      value: Math.round(avg * 10) / 10,
      fullMark: 10,
    };
  });
}

export function computeWheelFromWheelOfLife(
  wol: WheelOfLife
): { category: Category; value: number; fullMark: number }[] {
  const categories: Category[] = [
    "anima",
    "mente",
    "cuore",
    "corpo",
    "abito",
    "portafoglio",
  ];
  return categories.map((cat) => ({
    category: cat,
    value: wol[cat as keyof WheelOfLife] as number,
    fullMark: 10,
  }));
}
