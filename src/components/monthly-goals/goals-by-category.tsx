"use client";

import { motion } from "framer-motion";
import { Target, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, Category, MonthlyGoal } from "@/types";
import { containerVariants, itemVariants } from "@/lib/animations";
import { GoalCard } from "./goal-card";

interface GoalsByCategoryProps {
  goals: MonthlyGoal[];
  onEditGoal: (goal: MonthlyGoal) => void;
}

const CATEGORY_ORDER: Category[] = [
  "anima",
  "mente",
  "cuore",
  "corpo",
  "abito",
  "portafoglio",
];

export function GoalsByCategory({ goals, onEditGoal }: GoalsByCategoryProps) {
  const goalsByCategory = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    goals: goals.filter((g) => g.category === cat),
  })).filter((group) => group.goals.length > 0);

  return (
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
              {catGoals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} onEdit={onEditGoal} />
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
