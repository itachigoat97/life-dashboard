"use client";

import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { CATEGORIES, Category } from "@/types";
import { itemVariants } from "@/lib/animations";
import { MONTH_NAMES } from "./constants";

interface ComparisonRadarProps {
  month: number;
  wheelData: { category: string; value: number; fullMark: number }[];
  prevWheelData: { category: string; value: number; fullMark: number }[];
  isPastMonth: boolean;
}

export function ComparisonRadar({
  month,
  wheelData,
  prevWheelData,
  isPastMonth,
}: ComparisonRadarProps) {
  const radarData = wheelData.map((item) => {
    const catInfo = CATEGORIES[item.category as Category];
    const prevItem = prevWheelData.find((p) => p.category === item.category);
    return {
      name: `${catInfo?.emoji ?? ""} ${catInfo?.name ?? item.category}`,
      current: item.value,
      previous: prevItem?.value ?? 0,
      fullMark: 10,
    };
  });

  if (!(isPastMonth || prevWheelData.length > 0) || radarData.length === 0) {
    return null;
  }

  const prevMonthIndex = month === 1 ? 11 : month - 2;

  return (
    <motion.div variants={itemVariants}>
      <Card className="border-white/[0.06] bg-gradient-to-br from-white/[0.05] to-white/[0.02] backdrop-blur-xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Confronto con {MONTH_NAMES[prevMonthIndex]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded-full bg-[#d4af37]" />
              <span className="text-sm text-white/70">
                {MONTH_NAMES[month - 1]}
              </span>
            </div>
            {prevWheelData.length > 0 && (
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-1 rounded-full bg-[#60a5fa]"
                  style={{ opacity: 0.8 }}
                />
                <span className="text-sm text-white/70">
                  {MONTH_NAMES[prevMonthIndex]}
                </span>
              </div>
            )}
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart
              data={radarData}
              margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
            >
              <PolarGrid stroke="rgba(255,255,255,0.12)" />
              <PolarAngleAxis
                dataKey="name"
                tick={{
                  fill: "rgba(255,255,255,0.8)",
                  fontSize: 13,
                  fontWeight: 500,
                }}
              />
              <PolarRadiusAxis angle={90} domain={[0, 10]} tick={false} />
              {prevWheelData.length > 0 && (
                <Radar
                  name={MONTH_NAMES[prevMonthIndex]}
                  dataKey="previous"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  fill="#60a5fa"
                  fillOpacity={0.12}
                  strokeDasharray="6 3"
                  dot={{ fill: "#60a5fa", r: 4 }}
                />
              )}
              <Radar
                name={MONTH_NAMES[month - 1]}
                dataKey="current"
                stroke="#d4af37"
                strokeWidth={2.5}
                fill="#d4af37"
                fillOpacity={0.2}
                dot={{
                  fill: "#d4af37",
                  r: 5,
                  filter: "drop-shadow(0 0 4px rgba(212,175,55,0.5))",
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
