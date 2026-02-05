import { Day, Activity, Habit, HabitLog, Goal, Category } from "@/types";

// Seeded PRNG for deterministic values (avoids hydration mismatch)
function seededRandom(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

const today = new Date();
const toISO = (d: Date) => d.toISOString().split("T")[0];
const daysAgo = (n: number) => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};

const energyLevels = [8, 6, 9, 7, 8, 6, 7, 9, 8, 7, 6, 8, 9, 7];

export const mockDays: Day[] = Array.from({ length: 14 }, (_, i) => ({
  id: `day-${i}`,
  date: toISO(daysAgo(i)),
  energy_level: energyLevels[i],
  notes:
    i === 0
      ? "Giornata produttiva! Sessione focus mattutina eccezionale."
      : i === 1
        ? "Un po' stanco ma ho completato tutto."
        : i === 3
          ? "Giornata di recupero, focus sulla salute mentale."
          : null,
  created_at: daysAgo(i).toISOString(),
}));

const activityTemplates: {
  category: Category;
  title: string;
  description: string;
}[] = [
  {
    category: "anima",
    title: "Meditazione mattutina",
    description: "20 min mindfulness",
  },
  {
    category: "anima",
    title: "Diario della gratitudine",
    description: "3 cose per cui sono grato",
  },
  {
    category: "mente",
    title: "Lettura",
    description: "30 pagine Atomic Habits",
  },
  {
    category: "mente",
    title: "Sessione di coding",
    description: "Sviluppo feature su progetto principale",
  },
  {
    category: "mente",
    title: "Studio TypeScript",
    description: "Pattern avanzati e generics",
  },
  {
    category: "cuore",
    title: "Chiamata famiglia",
    description: "Videochiamata con genitori",
  },
  {
    category: "cuore",
    title: "Cena con amici",
    description: "Serata al ristorante giapponese",
  },
  {
    category: "corpo",
    title: "Palestra",
    description: "Upper body + cardio 45 min",
  },
  {
    category: "corpo",
    title: "Corsa mattutina",
    description: "5km al parco",
  },
  {
    category: "corpo",
    title: "Stretching",
    description: "Routine serale 15 min",
  },
  {
    category: "abito",
    title: "Creazione contenuti",
    description: "Post LinkedIn + stories IG",
  },
  {
    category: "abito",
    title: "Routine skincare",
    description: "Routine completa mattina e sera",
  },
  {
    category: "portafoglio",
    title: "Meeting cliente",
    description: "Call strategica progetto web",
  },
  {
    category: "portafoglio",
    title: "Fatturazione",
    description: "Emessa fattura Q1",
  },
  {
    category: "portafoglio",
    title: "Sviluppo business",
    description: "Contatto con 5 potenziali clienti",
  },
];

export const mockActivities: Activity[] = mockDays.flatMap((day, dayIdx) => {
  const count = Math.floor(seededRandom(dayIdx * 100) * 3) + 3;
  const shuffled = [...activityTemplates].sort(
    (a, b) => seededRandom(dayIdx * 50 + activityTemplates.indexOf(a)) -
              seededRandom(dayIdx * 50 + activityTemplates.indexOf(b))
  );
  return shuffled.slice(0, count).map((tmpl, i) => ({
    id: `act-${dayIdx}-${i}`,
    day_id: day.id,
    category: tmpl.category,
    title: tmpl.title,
    description: tmpl.description,
    completed: seededRandom(dayIdx * 200 + i) > 0.15,
    created_at: day.created_at,
  }));
});

export const mockHabits: Habit[] = [
  {
    id: "hab-1",
    name: "Meditazione",
    category: "anima",
    emoji: "🧘",
    target_per_week: 7,
    created_at: "2026-01-01",
  },
  {
    id: "hab-2",
    name: "Lettura 30 min",
    category: "mente",
    emoji: "📚",
    target_per_week: 7,
    created_at: "2026-01-01",
  },
  {
    id: "hab-3",
    name: "Palestra",
    category: "corpo",
    emoji: "🏋️",
    target_per_week: 5,
    created_at: "2026-01-01",
  },
  {
    id: "hab-4",
    name: "Diario",
    category: "anima",
    emoji: "📝",
    target_per_week: 7,
    created_at: "2026-01-01",
  },
  {
    id: "hab-5",
    name: "Coding",
    category: "mente",
    emoji: "💻",
    target_per_week: 6,
    created_at: "2026-01-01",
  },
  {
    id: "hab-6",
    name: "Skincare",
    category: "abito",
    emoji: "✨",
    target_per_week: 7,
    created_at: "2026-01-01",
  },
  {
    id: "hab-7",
    name: "Niente zucchero",
    category: "corpo",
    emoji: "🚫",
    target_per_week: 7,
    created_at: "2026-01-01",
  },
  {
    id: "hab-8",
    name: "Networking",
    category: "portafoglio",
    emoji: "🤝",
    target_per_week: 3,
    created_at: "2026-01-01",
  },
];

export const mockHabitLogs: HabitLog[] = [];
for (let hIdx = 0; hIdx < mockHabits.length; hIdx++) {
  const habit = mockHabits[hIdx];
  for (let i = 0; i < 60; i++) {
    const rand = seededRandom(hIdx * 1000 + i);
    const threshold =
      habit.target_per_week >= 7 ? 0.75 : habit.target_per_week >= 5 ? 0.65 : 0.4;
    mockHabitLogs.push({
      id: `hlog-${habit.id}-${i}`,
      habit_id: habit.id,
      date: toISO(daysAgo(i)),
      completed: rand < threshold,
    });
  }
}

export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    title: "Libri letti",
    target_value: 24,
    current_value: 3,
    unit: "libri",
    category: "mente",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-2",
    title: "Revenue annuale",
    target_value: 100000,
    current_value: 12500,
    unit: "€",
    category: "portafoglio",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-3",
    title: "Giorni di allenamento",
    target_value: 250,
    current_value: 28,
    unit: "giorni",
    category: "corpo",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-4",
    title: "Meditazioni completate",
    target_value: 365,
    current_value: 30,
    unit: "sessioni",
    category: "anima",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-5",
    title: "Nuovi clienti",
    target_value: 12,
    current_value: 2,
    unit: "clienti",
    category: "portafoglio",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-6",
    title: "Post pubblicati",
    target_value: 100,
    current_value: 8,
    unit: "post",
    category: "abito",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-7",
    title: "Viaggi",
    target_value: 4,
    current_value: 0,
    unit: "viaggi",
    category: "cuore",
    year: 2026,
    created_at: "2026-01-01",
  },
  {
    id: "goal-8",
    title: "Peso forma",
    target_value: 75,
    current_value: 80,
    unit: "kg",
    category: "corpo",
    year: 2026,
    created_at: "2026-01-01",
  },
];

export function getActivitiesForDay(dayId: string): Activity[] {
  return mockActivities.filter((a) => a.day_id === dayId);
}

export function getDayByDate(date: string): Day | undefined {
  return mockDays.find((d) => d.date === date);
}

export function getHabitLogsForDate(date: string): HabitLog[] {
  return mockHabitLogs.filter((l) => l.date === date);
}

export function getStreakForHabit(habitId: string): number {
  const logs = mockHabitLogs
    .filter((l) => l.habit_id === habitId && l.completed)
    .map((l) => l.date)
    .sort()
    .reverse();

  if (logs.length === 0) return 0;

  let streak = 0;
  const current = new Date(today);

  for (let i = 0; i < 60; i++) {
    const dateStr = toISO(current);
    if (logs.includes(dateStr)) {
      streak++;
    } else if (i > 0) {
      break;
    }
    current.setDate(current.getDate() - 1);
  }

  return streak;
}

export function getWheelOfLifeData() {
  const categories: Category[] = [
    "anima",
    "mente",
    "cuore",
    "corpo",
    "abito",
    "portafoglio",
  ];
  return categories.map((cat) => {
    const goals = mockGoals.filter((g) => g.category === cat);
    const avg =
      goals.length > 0
        ? goals.reduce((sum, g) => {
            const pct = g.target_value
              ? (g.current_value / g.target_value) * 10
              : 5;
            return sum + Math.min(pct, 10);
          }, 0) / goals.length
        : 5;
    return {
      category: cat,
      value: Math.round(avg * 10) / 10,
      fullMark: 10,
    };
  });
}
