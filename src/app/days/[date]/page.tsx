"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, Category } from "@/types";
import { getDayByDate, getActivitiesForDay } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import { ArrowLeft, Zap, CheckCircle2, Circle, FileText } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function DayDetailPage() {
  const params = useParams();
  const date = params.date as string;

  const day = getDayByDate(date);
  const activities = day ? getActivitiesForDay(day.id) : [];

  const activitiesByCategory = activities.reduce(
    (acc, activity) => {
      if (!acc[activity.category]) {
        acc[activity.category] = [];
      }
      acc[activity.category].push(activity);
      return acc;
    },
    {} as Record<Category, typeof activities>
  );

  const getEnergyColor = (level: number): string => {
    if (level <= 3) return "bg-gradient-to-r from-red-500 to-red-600";
    if (level <= 5) return "bg-gradient-to-r from-orange-500 to-amber-500";
    if (level <= 7) return "bg-gradient-to-r from-amber-500 to-yellow-500";
    return "bg-gradient-to-r from-emerald-500 to-green-600";
  };

  const getEnergyGlow = (level: number): string => {
    if (level <= 3) return "shadow-red-500/30";
    if (level <= 5) return "shadow-orange-500/30";
    if (level <= 7) return "shadow-amber-500/30";
    return "shadow-emerald-500/30";
  };

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

  if (!day) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" as const }}
        className="space-y-6"
      >
        <Link
          href="/days"
          className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 transition-all group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
          >
            <ArrowLeft size={20} />
          </motion.div>
          <span>Torna ai giorni</span>
        </Link>

        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-white/60 text-lg">Giorno non trovato</p>
            <p className="text-white/40 text-sm mt-2">La data richiesta non esiste nel calendario</p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Back Button */}
      <motion.div variants={itemVariants}>
        <Link
          href="/days"
          className="inline-flex items-center gap-2 text-white/60 hover:text-amber-400 transition-all group"
        >
          <motion.div
            whileHover={{ x: -4 }}
            transition={{ duration: 0.2, ease: "easeOut" as const }}
          >
            <ArrowLeft size={20} />
          </motion.div>
          <span>Torna ai giorni</span>
        </Link>
      </motion.div>

      {/* Header with Date and Energy Level */}
      <motion.div variants={itemVariants}>
        <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {formatDate(date)}
                </h1>
                <p className="text-white/40 text-sm">{date}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-amber-400" />
                  <span className="text-white font-medium">Energia: {day.energy_level}/10</span>
                </div>
                <div className="relative">
                  <div className="w-full bg-white/[0.05] rounded-full h-4 overflow-hidden border border-white/[0.08]">
                    <motion.div
                      className={`h-full rounded-full ${getEnergyColor(day.energy_level)} shadow-lg ${getEnergyGlow(day.energy_level)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.energy_level / 10) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" as const, delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes Section */}
      {day.notes && (
        <motion.div variants={itemVariants}>
          <Card className="border-l-4 border-amber-500/50 border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <FileText size={20} className="text-amber-400" />
                Note
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 leading-relaxed italic">{day.notes}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Activities by Category */}
      {Object.entries(activitiesByCategory).length > 0 ? (
        <motion.div variants={itemVariants} className="space-y-6">
          {(Object.entries(activitiesByCategory) as Array<[Category, typeof activities]>).map(
            ([category, categoryActivities]) => {
              const categoryConfig = CATEGORIES[category];

              return (
                <div key={category}>
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-4 pb-3">
                    <span className="text-2xl">{categoryConfig.emoji}</span>
                    <h2 className={`text-lg font-semibold ${categoryConfig.textColor}`}>
                      {categoryConfig.name}
                    </h2>
                    <Badge variant="default" className="ml-auto bg-white/[0.1] text-white/70 border-white/[0.08]">
                      {categoryActivities.length}
                    </Badge>
                  </div>

                  {/* Activities List */}
                  <div className="space-y-3">
                    {categoryActivities.map((activity, index) => (
                      <motion.div
                        key={activity.id}
                        variants={{
                          hidden: { opacity: 0, x: -20 },
                          visible: {
                            opacity: 1,
                            x: 0,
                            transition: {
                              duration: 0.4,
                              ease: "easeOut" as const,
                              delay: index * 0.05,
                            },
                          },
                        }}
                        initial="hidden"
                        animate="visible"
                      >
                        <Card
                          className={`border-l-4 ${categoryConfig.borderColor} border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl hover:border-white/[0.12] hover:shadow-lg transition-all duration-300`}
                        >
                          <CardContent className="pt-4">
                            <div className="flex gap-4">
                              <div className="flex-shrink-0 pt-1">
                                {activity.completed ? (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: "spring", stiffness: 200, ease: "easeOut" as const }}
                                  >
                                    <CheckCircle2 size={24} className="text-emerald-500" />
                                  </motion.div>
                                ) : (
                                  <Circle size={24} className="text-white/30" />
                                )}
                              </div>

                              <div className="flex-grow">
                                <h3
                                  className={`font-medium ${
                                    activity.completed ? "text-white/50 line-through" : "text-white"
                                  }`}
                                >
                                  {activity.title}
                                </h3>
                                {activity.description && (
                                  <p className="text-white/50 text-sm mt-1">{activity.description}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            }
          )}
        </motion.div>
      ) : (
        <motion.div variants={itemVariants}>
          <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl">
            <CardContent className="pt-8 pb-8 text-center">
              <p className="text-white/60">Nessuna attività per questo giorno</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
