"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { containerVariants, itemVariants } from "@/lib/animations";

interface ProgressSectionProps {
  completionRate: number;
  completedGoals: number;
  totalGoals: number;
  avgEnergy: number | null;
  energyByDay: number[];
}

export function ProgressSection({
  completionRate,
  completedGoals,
  totalGoals,
  avgEnergy,
  energyByDay,
}: ProgressSectionProps) {
  return (
    <motion.div
      variants={containerVariants}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      {/* Circular Progress */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300">
          <CardContent className="pt-6 flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="10"
                />
                <motion.circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#d4af37"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 52}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                  animate={{
                    strokeDashoffset:
                      2 * Math.PI * 52 * (1 - completionRate / 100),
                  }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  style={{
                    filter: "drop-shadow(0 0 8px rgba(212, 175, 55, 0.4))",
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {completionRate}%
                </span>
                <span className="text-xs text-zinc-400">completamento</span>
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              {completedGoals} di {totalGoals} obiettivi raggiunti
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy + Mini Sparkline */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] transition-all duration-300 h-full">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-400" />
              Energia del Mese
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {avgEnergy !== null ? (
              <>
                <div className="relative w-28 h-28">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 opacity-20 blur-xl"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div className="relative w-full h-full rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-white">
                        {avgEnergy}
                      </div>
                      <div className="text-xs text-zinc-400">/10</div>
                    </div>
                  </div>
                </div>
                {/* Mini sparkline */}
                {energyByDay.length > 1 && (
                  <div className="w-full h-12 flex items-end gap-[2px]">
                    {energyByDay.map((e, i) => (
                      <motion.div
                        key={i}
                        className="flex-1 rounded-t bg-gradient-to-t from-green-500/60 to-green-400/40"
                        initial={{ height: 0 }}
                        animate={{ height: `${(e / 10) * 100}%` }}
                        transition={{ delay: i * 0.03, duration: 0.4 }}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-zinc-500 text-sm py-8">
                Nessun dato energia per questo mese
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
