import * as React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variant === "default" && "bg-amber-500/10 text-amber-400 border border-amber-500/20",
        variant === "outline" && "border border-white/10 text-zinc-400",
        className
      )}
      {...props}
    />
  );
}

export { Badge };
