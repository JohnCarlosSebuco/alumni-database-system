"use client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from "recharts";
import type { WaitingTimeRow } from "@/lib/utils/courseAlignment";

interface Props { data: WaitingTimeRow[]; }

export function WaitingTimeChart({ data }: Props) {
  const respondents = data.reduce((s, r) => s + r.count, 0);
  return (
    <div className="space-y-6">
      {/* Bar chart */}
      <div>
        <p className="text-xs text-gray-400 mb-3">Based on {respondents} respondents</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical" margin={{ top: 2, right: 56, left: 4, bottom: 2 }}>
            <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" width={140}
              tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(value: number, _: string, props: { payload: WaitingTimeRow }) =>
                [`${props.payload.count} alumni (${value}%)`, "Share"]
              }
            />
            <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
              {data.map((row) => <Cell key={row.bucket} fill={row.color} />)}
              <LabelList dataKey="percentage" position="right"
                formatter={(v: number) => `${v}%`}
                style={{ fontSize: 11, fontWeight: 600, fill: "#374151" }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Frequency table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left font-semibold text-gray-700 pb-2">Waiting Time for First Job</th>
            <th className="text-center font-semibold text-gray-700 pb-2 w-32">Frequency</th>
            <th className="text-center font-semibold text-gray-700 pb-2 w-32">Percentage</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((row) => (
            <tr key={row.bucket}>
              <td className="py-3 text-gray-700">{row.label}</td>
              <td className="py-3 text-center text-gray-600">{row.count}</td>
              <td className="py-3 text-center text-gray-600">{row.percentage}%</td>
            </tr>
          ))}
          <tr className="border-t border-gray-300">
            <td className="py-3 font-semibold text-gray-700">Total</td>
            <td className="py-3 text-center font-semibold text-gray-700">{respondents}</td>
            <td className="py-3 text-center font-semibold text-gray-700">100%</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
