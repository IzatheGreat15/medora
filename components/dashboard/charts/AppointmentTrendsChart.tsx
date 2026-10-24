
"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCard from "./ChartCard";

const data = [
  { day: "Mon", bookings: 18, completed: 14 },
  { day: "Tue", bookings: 24, completed: 19 },
  { day: "Wed", bookings: 21, completed: 17 },
  { day: "Thu", bookings: 30, completed: 23 },
  { day: "Fri", bookings: 26, completed: 22 },
  { day: "Sat", bookings: 34, completed: 28 },
  { day: "Sun", bookings: 20, completed: 16 },
];

export default function AppointmentTrendsChart() {
  return (
    <ChartCard
      title="Appointment trends"
      description="Bookings and completed appointments over time"
      className="h-full"
    >
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <CartesianGrid
              stroke="#E9EFEB"
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
              dy={10}
            />

            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748B", fontSize: 12 }}
            />

            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E2E8F0",
                fontSize: 12,
              }}
            />

            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingBottom: 20 }}
            />

            <Line
              type="monotone"
              dataKey="bookings"
              name="Bookings"
              stroke="#176B55"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />

            <Line
              type="monotone"
              dataKey="completed"
              name="Completed"
              stroke="#82A995"
              strokeWidth={2.5}
              dot={false}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
