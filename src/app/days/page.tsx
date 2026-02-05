"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES } from "@/types";
import { mockDays, getActivitiesForDay } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { CalendarDays, Zap, ChevronRight } from "lucide-react";
import Link from "next/link";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const,
    },
  },
};

function getEnergyColor(level: number): string {
  if (level >= 8) return "bg-emerald-500";
  if (level >= 5) return "bg-amber-500";
  return "bg-red-500";
}

function getEnergyLabel(level: number): string {
  if (level >= 8) return "High";
  if (level >= 5) return "Medium";
  return "Low";
}

export default function DailyLogPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-8">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3 mb-2">
          <CalendarDays className="w-8 h-8" style={{ color: "#d4af37" }} />
          <h1 className="text-4xl md:text-5xl font-bold">Daily Log</h1>
        </div>
        <p className="text-white/60 text-lg mt-2">Il tuo diario giornaliero</p>
      </motion.div>

      {/* Days List */}
      {mockDays.length > 0 ? (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {mockDays.map((day) => {
            const activities = getActivitiesForDay(day.id);
            const completedCount = activities.filter((a) => a.completed).length;
            const totalCount = activities.length;
            const categoriesPresent = Array.from(
              new Set(activities.map((a) => a.category))
            );

            return (
              <motion.div key={day.id} variants={itemVariants}>
                <Link href={`/days/${day.date}`}>
                  <Card className="border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:border-white/[0.15] hover:shadow-lg hover:shadow-amber-500/10 group">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        {/* Left Column: Date & Energy */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-4">
                            <div>
                              <h3 className="text-xl font-semibold text-white">
                                {formatDate(day.date)}
                              </h3>
                              <p className="text-sm text-white/50 mt-1">
                                {new Date(day.date).toLocaleDateString("it-IT", {
                                  weekday: "long",
                                })}
                              </p>
                            </div>
                          </div>

                          {/* Energy Level */}
                          <div className="flex items-center gap-2 mb-4">
                            <Zap className="w-4 h-4" style={{ color: "#d4af37" }} />
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${getEnergyColor(
                                    day.energy_level
                                  )}`}
                                />
                                <span className="text-sm font-medium">
                                  {day.energy_level}/10 - {getEnergyLabel(day.energy_level)}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                {Array.from({ length: 10 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-1.5 h-1.5 rounded-full ${
                                      i < day.energy_level
                                        ? getEnergyColor(day.energy_level)
                                        : "bg-white/10"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Category Dots */}
                          {categoriesPresent.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <span className="text-xs text-white/50">Categories:</span>
                              <div className="flex gap-2 flex-wrap">
                                {categoriesPresent.map((category) => (
                                  <div
                                    key={category}
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{
                                      backgroundColor: CATEGORIES[category].color,
                                    }}
                                    title={CATEGORIES[category].name}
                                  />
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Notes Preview */}
                          {day.notes && (
                            <p className="text-sm text-white/70 line-clamp-2 italic">
                              &quot;{day.notes}&quot;
                            </p>
                          )}
                        </div>

                        {/* Right Column: Activity Count & Action */}
                        <div className="flex flex-col items-end justify-between h-full gap-4">
                          <Badge
                            variant="outline"
                            className="bg-white/[0.08] text-white/90 border border-white/[0.15] whitespace-nowrap"
                          >
                            {completedCount}/{totalCount} activities
                          </Badge>

                          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-amber-400 transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center py-16"
        >
          <CalendarDays className="w-16 h-16 text-white/20 mb-4" />
          <h2 className="text-xl font-semibold text-white/60 mb-2">
            No daily logs yet
          </h2>
          <p className="text-white/40">Start tracking your days to see them here</p>
        </motion.div>
      )}
    </div>
  );
}
