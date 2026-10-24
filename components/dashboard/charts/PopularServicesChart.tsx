
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
  { service: "General consultation", appointments: 86 },
  { service: "Dental cleaning", appointments: 62 },
  { service: "Skin consultation", appointments: 44 },
  { service: "Follow-up", appointments: 38 },
];

export default function PopularServicesChart() {
  return (
    <ChartCard
      title="Popular services"
      description="Appointments by service"
      className="h-full"
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 12, left: 8, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#E9EFEB"
              strokeDasharray="3 3"
              horizontal={false}
            />

            <XAxis
              type="number"
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
            />

            <YAxis
              type="category"
              dataKey="service"
              width={125}
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#64748B", fontSize: 11 }}
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
              fill="#176B55"
              radius={[0, 6, 6, 0]}
              barSize={22}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
