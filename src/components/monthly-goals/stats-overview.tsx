"use client";

import { motion } from "framer-motion";
import { Target, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { containerVariants, itemVariants } from "@/lib/animations";

interface StatsOverviewProps {
  totalGoals: number;
  completedGoals: number;
  inProgressGoals: number;
  failedGoals: number;
}

export function StatsOverview({
  totalGoals,
  completedGoals,
  inProgressGoals,
  failedGoals,
}: StatsOverviewProps) {
  const stats = [
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
  ];

  return (
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-2 md:grid-cols-4 gap-4"
    >
      {stats.map((stat) => (
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
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.iconColor} opacity-60`} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}
