
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";

const data = [
  { branch: "Cebu", appointments: 128 },
  { branch: "Mandaue", appointments: 94 },
  { branch: "Lapu-Lapu", appointments: 72 },
];

export default function BranchPerformanceChart() {
  return (
    <ChartCard
      title="Branch performance"
      description="Appointment volume by branch"
      className="h-full"
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#E9EFEB"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="branch"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              dy={8}
            />

            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />

            <Tooltip
              formatter={(value) => [
                `${value} appointments`,
                "Total",
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
              }}
            />

            <Bar
              dataKey="appointments"
              name="Appointments"
              fill="#82A995"
              radius={[6, 6, 0, 0]}
              barSize={38}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
