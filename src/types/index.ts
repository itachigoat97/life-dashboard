export type Category =
  | "anima"
  | "mente"
  | "cuore"
  | "corpo"
  | "abito"
  | "portafoglio";

export interface CategoryConfig {
  name: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
}

export const CATEGORIES: Record<Category, CategoryConfig> = {
  anima: {
    name: "Anima",
    emoji: "🧘",
    color: "#a855f7",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
    textColor: "text-purple-400",
    description: "Meditazione, visualizzazione, gratitudine",
  },
  mente: {
    name: "Mente",
    emoji: "🧠",
    color: "#3b82f6",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/30",
    textColor: "text-blue-400",
    description: "Lettura, studio, progetti, coding",
  },
  cuore: {
    name: "Cuore",
    emoji: "❤️",
    color: "#ec4899",
    bgColor: "bg-pink-500/10",
    borderColor: "border-pink-500/30",
    textColor: "text-pink-400",
    description: "Famiglia, amici, relazioni",
  },
  corpo: {
    name: "Corpo",
    emoji: "💪",
    color: "#22c55e",
    bgColor: "bg-green-500/10",
    borderColor: "border-green-500/30",
    textColor: "text-green-400",
    description: "Sport, palestra, salute",
  },
  abito: {
    name: "Abito",
    emoji: "👔",
    color: "#f97316",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/30",
    textColor: "text-orange-400",
    description: "Immagine, lifestyle, social",
  },
  portafoglio: {
    name: "Portafoglio",
    emoji: "💰",
    color: "#d4af37",
    bgColor: "bg-amber-500/10",
    borderColor: "border-amber-500/30",
    textColor: "text-amber-400",
    description: "Lavoro, clienti, revenue",
  },
};

export interface Day {
  id: string;
  date: string;
  energy_level: number;
  notes: string | null;
  created_at: string;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  day_id: string;
  category: Category;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
}

export interface Habit {
  id: string;
  name: string;
  category: Category;
  emoji: string | null;
  target_per_week: number;
  created_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  date: string;
  completed: boolean;
}

export interface Goal {
  id: string;
  title: string;
  target_value: number | null;
  current_value: number;
  unit: string | null;
  category: Category | null;
  year: number;
  created_at: string;
}
