
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

type BranchPerformanceChartProps = {
  data: {
    branch: string;
    appointments: number;
  }[];
};

export default function BranchPerformanceChart({
  data,
}: BranchPerformanceChartProps) {
  return (
    <ChartCard
      title="Branch performance"
      description="Appointment volume across your clinic branches."
      className="col-span-1"
    >
      {data.length > 0 ? (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E9EFEB"
              />

              <XAxis
                dataKey="branch"
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
              />

              <YAxis
                allowDecimals={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip
                formatter={(value) => [
                  `${value} appointments`,
                  "Bookings",
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
                barSize={35}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-center">
          <div>
            <p className="text-sm font-medium text-slate-700">
              No branch bookings available
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Branch performance will appear here.
            </p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
