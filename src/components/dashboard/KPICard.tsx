"use client";

import React, { useEffect, useState } from "react";
import { Card, CardBody } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

interface KPICardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: { value: number; positive: boolean };
  prefix?: string;
  suffix?: string;
}

function useCountUp(target: number, duration = 1500) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return count;
}

export function KPICard({ title, value, icon, iconBg = "bg-navy-100 text-navy-800", trend, prefix = "", suffix = "" }: KPICardProps) {
  const displayValue = useCountUp(value);
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <div className={cn("flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl", iconBg)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-3xl font-bold text-gray-900">
            {prefix}{displayValue.toLocaleString()}{suffix}
          </p>
          <p className="text-sm text-gray-500 mt-0.5">{title}</p>
          {trend && (
            <p className={cn("text-xs font-medium mt-1", trend.positive ? "text-green-600" : "text-red-600")}>
              {trend.positive ? "▲" : "▼"} {trend.value}% this month
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
