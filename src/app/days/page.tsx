"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useData } from "@/lib/data-context";
import { CATEGORIES, Category } from "@/types";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { CalendarDays, Zap, ChevronRight, Plus } from "lucide-react";
import Link from "next/link";

export default function DaysPage() {
  const { loading, days } = useData();

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
        duration: 0.5,
        ease: "easeOut" as const,
      },
    },
  };

  const energyDotVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { duration: 0.4, ease: "easeOut" as const },
  };

  const getEnergyColor = (level: number): string => {
    if (level <= 3) return "bg-red-500/70";
    if (level <= 5) return "bg-orange-500/70";
    if (level <= 7) return "bg-amber-500/70";
    return "bg-emerald-500/70";
  };

  const getEnergyGlow = (level: number): string => {
    if (level <= 3) return "shadow-red-500/20";
    if (level <= 5) return "shadow-orange-500/20";
    if (level <= 7) return "shadow-amber-500/20";
    return "shadow-emerald-500/20";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 rounded bg-white/[0.05] animate-pulse" />
            <div className="h-4 w-96 rounded bg-white/[0.05] animate-pulse" />
          </div>
        </div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-white/[0.05] animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="space-y-2"
      >
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CalendarDays className="w-8 h-8 text-amber-400" />
              Registro Giorni
            </h1>
            <p className="text-white/60">Visualizza e analizza i tuoi giorni registrati</p>
          </div>
          <Link href="/days/new">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20"
            >
              <Plus className="w-5 h-5" />
              Nuovo Giorno
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {days.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" as const }}
        >
          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
            <CardContent className="pt-12 pb-12 text-center">
              <CalendarDays className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-lg">Nessun giorno registrato</p>
              <p className="text-white/40 text-sm mt-2">Inizia a registrare i tuoi giorni per vedere i dati qui</p>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {days.map((day) => {
            const activities = day.activities || [];

            return (
              <motion.div key={day.id} variants={itemVariants}>
                <Link href={`/days/${day.date}`}>
                  <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer group">
                    <CardContent className="p-5">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <CalendarDays className="w-5 h-5 text-amber-400/70" />
                            <h2 className="text-lg font-semibold text-white">
                              {formatDate(day.date)}
                            </h2>
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-300" />
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <Zap className="w-4 h-4 text-amber-400/70" />
                            <span className="text-white/70 text-sm font-medium">Energia:</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {[...Array(10)].map((_, i) => (
                              <motion.div
                                key={i}
                                variants={energyDotVariants}
                                animate="animate"
                                transition={{
                                  delay: i * 0.05,
                                  duration: 0.4,
                                  ease: "easeOut" as const,
                                }}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  i < day.energy_level
                                    ? `${getEnergyColor(day.energy_level)} shadow-lg ${getEnergyGlow(day.energy_level)}`
                                    : "bg-white/10"
                                }`}
                              />
                            ))}
                            <span className="text-white/80 text-sm font-semibold ml-2">
                              {day.energy_level}/10
                            </span>
                          </div>
                        </div>

                        {day.notes && (
                          <div className="border-l-2 border-amber-500/50 pl-3 py-1">
                            <p className="text-white/60 text-sm italic">{day.notes}</p>
                          </div>
                        )}

                        {activities.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-white/50 text-xs uppercase font-medium tracking-wider">
                              Attività ({activities.length})
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {activities.map((activity, idx) => {
                                const category = CATEGORIES[activity.category as Category];
                                return (
                                  <motion.div
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2, ease: "easeOut" as const }}
                                  >
                                    <Badge
                                      variant="outline"
                                      className={`group/badge cursor-default px-2.5 py-1 text-xs font-medium border-white/[0.06] hover:border-white/[0.12] transition-all ${
                                        activity.completed
                                          ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20"
                                          : `bg-${category.bgColor} text-${category.textColor}`
                                      }`}
                                    >
                                      <span className="inline-block animate-pulse group-hover/badge:animate-none mr-1">
                                        {category.emoji}
                                      </span>
                                      {category.name}
                                    </Badge>
                                  </motion.div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
