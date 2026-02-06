"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CATEGORIES, MonthlyGoal } from "@/types";
import { STATUS_CONFIG } from "./constants";

interface EditGoalModalProps {
  editingGoal: MonthlyGoal | null;
  editValue: string;
  editStatus: MonthlyGoal["status"];
  saving: boolean;
  onClose: () => void;
  onEditValueChange: (value: string) => void;
  onEditStatusChange: (status: MonthlyGoal["status"]) => void;
  onSave: () => void;
}

export function EditGoalModal({
  editingGoal,
  editValue,
  editStatus,
  saving,
  onClose,
  onEditValueChange,
  onEditStatusChange,
  onSave,
}: EditGoalModalProps) {
  return (
    <AnimatePresence>
      {editingGoal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full max-w-md rounded-2xl border border-white/[0.1] bg-[#141414] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                Aggiorna Obiettivo
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/[0.08] transition-colors"
              >
                <X className="w-5 h-5 text-zinc-400" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-sm font-medium text-white mb-1">
                  {editingGoal.title}
                </p>
                {editingGoal.category && (
                  <Badge
                    variant="outline"
                    style={{
                      borderColor: CATEGORIES[editingGoal.category]?.color,
                      color: CATEGORIES[editingGoal.category]?.color,
                    }}
                  >
                    {CATEGORIES[editingGoal.category]?.emoji}{" "}
                    {CATEGORIES[editingGoal.category]?.name}
                  </Badge>
                )}
              </div>

              {/* Current value input */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Valore attuale
                  {editingGoal.target_value && (
                    <span className="text-zinc-500">
                      {" "}
                      / {editingGoal.target_value}
                      {editingGoal.unit ? ` ${editingGoal.unit}` : ""}
                    </span>
                  )}
                </label>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => onEditValueChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/[0.1] text-white focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 transition-all"
                  min={0}
                />
              </div>

              {/* Status select */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">
                  Stato
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    Object.entries(STATUS_CONFIG) as [
                      MonthlyGoal["status"],
                      (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG],
                    ][]
                  ).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => onEditStatusChange(key)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                          editStatus === key
                            ? "border-white/[0.2] bg-white/[0.08] text-white"
                            : "border-white/[0.06] bg-white/[0.02] text-zinc-400 hover:bg-white/[0.05]"
                        }`}
                      >
                        <Icon
                          className="w-4 h-4"
                          style={{ color: cfg.color }}
                        />
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save button */}
              <button
                onClick={onSave}
                disabled={saving}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Salva"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
