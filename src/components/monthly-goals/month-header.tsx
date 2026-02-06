"use client";

import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Target } from "lucide-react";
import { itemVariants } from "@/lib/animations";
import { MONTH_NAMES, MONTH_MOTTOS } from "./constants";

interface MonthHeaderProps {
  month: number;
  year: number;
  completionRate: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function MonthHeader({
  month,
  year,
  completionRate,
  onPrevMonth,
  onNextMonth,
}: MonthHeaderProps) {
  return (
    <motion.div variants={itemVariants}>
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={onPrevMonth}
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
          onClick={onNextMonth}
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
  );
}
