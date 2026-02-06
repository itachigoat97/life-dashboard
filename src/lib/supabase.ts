import { createClient } from "@supabase/supabase-js";
import {
  Day,
  Activity,
  Habit,
  HabitLog,
  Goal,
  MonthlyGoal,
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

// ── Monthly Goals ────────────────────────────────────

export async function fetchMonthlyGoals(
  month: number,
  year: number
): Promise<MonthlyGoal[]> {
  const { data, error } = await supabase
    .from("monthly_goals")
    .select("*")
    .eq("month", month)
    .eq("year", year)
    .order("category", { ascending: true })
    .order("title", { ascending: true });

  if (error) throw error;
  return (data as MonthlyGoal[]) ?? [];
}

export async function updateMonthlyGoal(
  id: string,
  updates: Partial<Pick<MonthlyGoal, "current_value" | "status" | "title" | "description" | "target_value" | "unit">>
): Promise<MonthlyGoal> {
  const { data, error } = await supabase
    .from("monthly_goals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as MonthlyGoal;
}

export async function createMonthlyGoal(
  goal: Omit<MonthlyGoal, "id" | "created_at" | "updated_at">
): Promise<MonthlyGoal> {
  const { data, error } = await supabase
    .from("monthly_goals")
    .insert(goal)
    .select()
    .single();

  if (error) throw error;
  return data as MonthlyGoal;
}

export async function deleteMonthlyGoal(id: string): Promise<void> {
  const { error } = await supabase
    .from("monthly_goals")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

export async function getMonthlyStats(
  month: number,
  year: number
): Promise<{
  total: number;
  completed: number;
  in_progress: number;
  pending: number;
  failed: number;
  completionRate: number;
}> {
  const goals = await fetchMonthlyGoals(month, year);
  const total = goals.length;
  const completed = goals.filter((g) => g.status === "completed").length;
  const in_progress = goals.filter((g) => g.status === "in_progress").length;
  const pending = goals.filter((g) => g.status === "pending").length;
  const failed = goals.filter((g) => g.status === "failed").length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, completed, in_progress, pending, failed, completionRate };
}

export async function getDaysForMonth(
  month: number,
  year: number
): Promise<Day[]> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("days")
    .select("*")
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: true });

  if (error) throw error;
  return (data as Day[]) ?? [];
}

export async function getWheelOfLifeForMonth(
  month: number,
  year: number
): Promise<WheelOfLife | null> {
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate =
    month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  const { data, error } = await supabase
    .from("wheel_of_life")
    .select("*")
    .gte("date", startDate)
    .lt("date", endDate)
    .order("date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as WheelOfLife | null;
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
