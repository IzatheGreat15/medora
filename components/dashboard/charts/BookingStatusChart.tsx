
"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import ChartCard from "./ChartCard";

const data = [
  { name: "Confirmed", value: 48, color: "#176B55" },
  { name: "Pending", value: 18, color: "#E9B949" },
  { name: "Completed", value: 28, color: "#82A995" },
  { name: "Declined", value: 6, color: "#E87979" },
];

const total = data.reduce((sum, item) => sum + item.value, 0);

export default function BookingStatusChart() {
  return (
    <ChartCard
      title="Booking status"
      description="Breakdown of appointments"
      className="h-full"
    >
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={62}
              outerRadius={88}
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value, name) => [
                `${value} appointments`,
                name,
              ]}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-[#173F35]">
            {total}
          </span>
          <span className="mt-1 text-xs text-slate-500">Appointments</span>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="truncate text-xs text-slate-500">
              {item.name}
            </span>
            <span className="ml-auto text-sm font-semibold text-[#173F35]">
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </ChartCard>
  );
}
