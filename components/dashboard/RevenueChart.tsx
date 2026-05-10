"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart({
  data,
}: {
  data: { date: string; revenue: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <AreaChart
          data={data}
          margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
        >
          <defs>
            <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="0%"
                stopColor="oklch(0.18 0.012 50)"
                stopOpacity={0.18}
              />
              <stop
                offset="100%"
                stopColor="oklch(0.18 0.012 50)"
                stopOpacity={0}
              />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="2 4"
            stroke="oklch(0.9 0.006 80)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke="oklch(0.5 0.01 60)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="oklch(0.5 0.01 60)"
            fontSize={10}
            tickFormatter={(v) => formatCurrency(Number(v))}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <Tooltip
            cursor={{ stroke: "oklch(0.18 0.012 50)", strokeWidth: 1 }}
            contentStyle={{
              background: "oklch(0.985 0.004 80)",
              border: "1px solid oklch(0.9 0.006 80)",
              borderRadius: 6,
              fontSize: 12,
              boxShadow: "none",
            }}
            formatter={(v) => [formatCurrency(Number(v)), "Revenue"]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="oklch(0.18 0.012 50)"
            strokeWidth={1.25}
            fill="url(#rev)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
