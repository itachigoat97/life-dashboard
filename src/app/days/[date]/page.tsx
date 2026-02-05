'use client';

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

  // Group activities by category
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

  // Get energy color based on level
  const getEnergyColor = (level: number) => {
    if (level >= 8) return 'bg-emerald-500';
    if (level >= 6) return 'bg-amber-500';
    if (level >= 4) return 'bg-orange-500';
    return 'bg-red-500';
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
      <div className="min-h-screen bg-[#0a0a0a] p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <Link
            href="/days"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors mb-8"
          >
            <ArrowLeft size={20} />
            <span>Torna ai giorni</span>
          </Link>

          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-white/60 text-lg">Giorno non trovato</p>
              <p className="text-white/40 text-sm mt-2">
                La data richiesta non esiste nel calendario
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <Link
            href="/days"
            className="inline-flex items-center gap-2 text-white/60 hover:text-[#d4af37] transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Torna ai giorni</span>
          </Link>
        </motion.div>

        {/* Header with Date and Energy Level */}
        <motion.div variants={itemVariants}>
          <Card className="border-white/[0.08] bg-white/[0.03]">
            <CardContent className="pt-6">
              <div className="flex flex-col gap-6">
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">
                    {formatDate(date)}
                  </h1>
                  <p className="text-white/40 text-sm">{date}</p>
                </div>

                {/* Energy Level */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap size={20} className="text-[#d4af37]" />
                    <span className="text-white font-medium">Energia: {day.energy_level}/10</span>
                  </div>
                  <div className="w-full bg-white/[0.05] rounded-full h-3 overflow-hidden border border-white/[0.08]">
                    <motion.div
                      className={`h-full rounded-full ${getEnergyColor(day.energy_level)}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${(day.energy_level / 10) * 100}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notes Section */}
        {day.notes && (
          <motion.div variants={itemVariants}>
            <Card className="border-white/[0.08] bg-white/[0.03]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText size={20} className="text-[#d4af37]" />
                  Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-white/80 leading-relaxed">{day.notes}</p>
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
                    <div className={`flex items-center gap-3 mb-4 pb-3 border-b ${categoryConfig.borderColor}`}>
                      <span className="text-2xl">{categoryConfig.emoji}</span>
                      <h2 className={`text-lg font-semibold ${categoryConfig.textColor}`}>
                        {categoryConfig.name}
                      </h2>
                      <Badge className="ml-auto bg-white/[0.08] text-white/60 border-white/[0.08]">
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
                                ease: 'easeOut',
                                delay: index * 0.05,
                              },
                            },
                          }}
                          initial="hidden"
                          animate="visible"
                        >
                          <Card
                            className={`border-l-4 border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.05] transition-colors ${categoryConfig.borderColor}`}
                          >
                            <CardContent className="pt-4">
                              <div className="flex gap-4">
                                {/* Completion Status Icon */}
                                <div className="flex-shrink-0 pt-1">
                                  {activity.completed ? (
                                    <motion.div
                                      initial={{ scale: 0 }}
                                      animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 200 }}
                                    >
                                      <CheckCircle2
                                        size={24}
                                        className="text-emerald-500"
                                      />
                                    </motion.div>
                                  ) : (
                                    <Circle
                                      size={24}
                                      className="text-white/30"
                                    />
                                  )}
                                </div>

                                {/* Activity Content */}
                                <div className="flex-grow">
                                  <h3
                                    className={`font-medium ${
                                      activity.completed
                                        ? 'text-white/50 line-through'
                                        : 'text-white'
                                    }`}
                                  >
                                    {activity.title}
                                  </h3>
                                  {activity.description && (
                                    <p className="text-white/50 text-sm mt-1">
                                      {activity.description}
                                    </p>
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
            <Card className="border-white/[0.08] bg-white/[0.03]">
              <CardContent className="pt-8 pb-8 text-center">
                <p className="text-white/60">Nessuna attività per questo giorno</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
