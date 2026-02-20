"use client";

import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

interface DeptData {
  name: string;
  value: number;
}

interface DepartmentChartProps {
  data: DeptData[];
}

const COLORS = ["#1E3A5F", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EF4444", "#F97316", "#14B8A6"];

export function DepartmentChart({ data }: DepartmentChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          outerRadius={90}
          dataKey="value"
          labelLine={false}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12 }}
          formatter={(value) => [`${value} alumni`, ""]}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
