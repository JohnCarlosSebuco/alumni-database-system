import React from "react";
import { cn } from "@/lib/utils/cn";

type BadgeVariant = "success" | "warning" | "error" | "info" | "default" | "navy";

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-gold-100 text-gold-600",
  error:   "bg-red-100 text-red-700",
  info:    "bg-blue-100 text-blue-700",
  default: "bg-gray-100 text-gray-700",
  navy:    "bg-navy-100 text-navy-800",
};

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
