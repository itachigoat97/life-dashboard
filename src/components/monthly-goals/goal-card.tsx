"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MonthlyGoal } from "@/types";
import { STATUS_CONFIG } from "./constants";

interface GoalCardProps {
  goal: MonthlyGoal;
  onEdit: (goal: MonthlyGoal) => void;
}

export function GoalCard({ goal, onEdit }: GoalCardProps) {
  const progress =
    goal.target_value && goal.target_value > 0
      ? Math.min((goal.current_value / goal.target_value) * 100, 100)
      : goal.status === "completed"
        ? 100
        : 0;
  const statusCfg = STATUS_CONFIG[goal.status];
  const StatusIcon = statusCfg.icon;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="cursor-pointer"
      onClick={() => onEdit(goal)}
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
                  {goal.unit ? ` ${goal.unit}` : ""} / {goal.target_value}
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
}
