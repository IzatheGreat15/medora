
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import ChartCard from "./ChartCard";

type AppointmentTrendsChartProps = {
  data: {
    day: string;
    bookings: number;
    completed: number;
  }[];
};

export default function AppointmentTrendsChart({
  data,
}: AppointmentTrendsChartProps) {
  return (
    <ChartCard
      title="Appointment trends"
      description="Booking activity and completed appointments over time."
      className="col-span-1"
    >
      {data.length > 0 ? (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E9EFEB"
              />

              <XAxis
                dataKey="day"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                minTickGap={20}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #E2E8F0",
                  fontSize: 12,
                }}
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
      ) : (
        <EmptyChart />
      )}
    </ChartCard>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center text-center">
      <div>
        <p className="text-sm font-medium text-slate-700">
          No appointment data available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Booking trends will appear here.
        </p>
      </div>
    </div>
  );
}
