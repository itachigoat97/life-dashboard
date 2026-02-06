"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, Category } from "@/types";
import { createDay, createActivity } from "@/lib/supabase";
import { toISODate } from "@/lib/utils";
import { ArrowLeft, Plus, Trash2, Save, Zap, FileText, Sparkles } from "lucide-react";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/animations";

interface ActivityForm {
  category: Category;
  title: string;
  description: string;
  completed: boolean;
}

export default function NewDayPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [date, setDate] = useState(toISODate(new Date()));
  const [energyLevel, setEnergyLevel] = useState(7);
  const [notes, setNotes] = useState("");
  const [activities, setActivities] = useState<ActivityForm[]>([]);

  // Activity form state
  const [newActivity, setNewActivity] = useState<ActivityForm>({
    category: "mente",
    title: "",
    description: "",
    completed: false,
  });

  const addActivity = () => {
    if (!newActivity.title.trim()) return;
    setActivities((prev) => [...prev, { ...newActivity }]);
    setNewActivity({
      category: "mente",
      title: "",
      description: "",
      completed: false,
    });
  };

  const removeActivity = (index: number) => {
    setActivities((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const day = await createDay({
        date,
        energy_level: energyLevel,
        notes: notes || null,
      });

      // Create activities
      for (const activity of activities) {
        await createActivity({
          day_id: day.id,
          category: activity.category,
          title: activity.title,
          description: activity.description || null,
          completed: activity.completed,
        });
      }

      router.push(`/days/${date}`);
    } catch (err) {
      console.error("Error saving day:", err);
      alert("Errore nel salvataggio. Riprova.");
    } finally {
      setSaving(false);
    }
  };

  const getEnergyColor = (level: number) => {
    if (level <= 3) return "#ef4444";
    if (level <= 5) return "#f97316";
    if (level <= 7) return "#eab308";
    return "#22c55e";
  };

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

      {/* Page Title */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold text-white">Nuovo Giorno</h1>
      </motion.div>

      {/* Date Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Energy Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Livello di Energia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-white/70">Livello:</span>
              <span
                className="text-2xl font-bold"
                style={{ color: getEnergyColor(energyLevel) }}
              >
                {energyLevel}/10
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={energyLevel}
              onChange={(e) => setEnergyLevel(Number(e.target.value))}
              className="w-full h-2 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${getEnergyColor(energyLevel)} ${(energyLevel / 10) * 100}%, rgba(255,255,255,0.05) ${(energyLevel / 10) * 100}%)`,
              }}
            />
            <div className="flex justify-between text-xs text-white/50">
              <span>Scarico</span>
              <span>Carico</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Note
            </CardTitle>
          </CardHeader>
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Scrivi le tue note per il giorno..."
              className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all resize-none"
              rows={4}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Activities Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl border border-white/[0.06]">
          <CardHeader>
            <CardTitle className="text-amber-400 flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Attività
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Added Activities List */}
            {activities.length > 0 && (
              <div className="space-y-3 pb-6 border-b border-white/[0.06]">
                {activities.map((activity, index) => (
                  <motion.div
                    key={index}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-start justify-between p-3 bg-white/[0.03] rounded-lg border border-white/[0.05]"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="default"
                          className="bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        >
                          {CATEGORIES[activity.category].emoji}{" "}
                          {CATEGORIES[activity.category].name}
                        </Badge>
                        {activity.completed && (
                          <Badge className="bg-green-500/20 text-green-300 border border-green-500/30">
                            Completato
                          </Badge>
                        )}
                      </div>
                      <p className="text-white font-medium truncate">
                        {activity.title}
                      </p>
                      {activity.description && (
                        <p className="text-white/60 text-sm truncate">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeActivity(index)}
                      className="ml-3 flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Add Activity Form */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-white/70">
                Aggiungi Attività
              </h3>

              {/* Category Select */}
              <select
                value={newActivity.category}
                onChange={(e) =>
                  setNewActivity((prev) => ({
                    ...prev,
                    category: e.target.value as Category,
                  }))
                }
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              >
                {(
                  Object.entries(CATEGORIES) as [
                    Category,
                    typeof CATEGORIES[Category],
                  ][]
                ).map(([key, val]) => (
                  <option key={key} value={key} className="bg-zinc-900">
                    {val.emoji} {val.name}
                  </option>
                ))}
              </select>

              {/* Title Input */}
              <input
                type="text"
                value={newActivity.title}
                onChange={(e) =>
                  setNewActivity((prev) => ({
                    ...prev,
                    title: e.target.value,
                  }))
                }
                placeholder="Titolo dell'attività"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />

              {/* Description Input */}
              <input
                type="text"
                value={newActivity.description}
                onChange={(e) =>
                  setNewActivity((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descrizione (opzionale)"
                className="w-full bg-white/[0.05] border border-white/[0.1] rounded-lg px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
              />

              {/* Completed Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newActivity.completed}
                  onChange={(e) =>
                    setNewActivity((prev) => ({
                      ...prev,
                      completed: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 rounded bg-white/[0.05] border border-white/[0.1] text-amber-500 cursor-pointer"
                />
                <span className="text-white/70">Contrassegna come completato</span>
              </label>

              {/* Add Activity Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={addActivity}
                disabled={!newActivity.title.trim()}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/30 text-amber-300 font-medium hover:from-amber-500/30 hover:to-amber-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Aggiungi Attività
              </motion.button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Save Button */}
      <motion.div variants={itemVariants}>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={saving}
          className="w-full py-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-black font-bold text-lg hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {saving ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Salvataggio..." : "Salva Giorno"}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
