
import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import ChartCard from "./ChartCard";

type BookingStatusChartProps = {
  data: {
    name: string;
    value: number;
  }[];
};

const statusColors: Record<string, string> = {
  Confirmed: "#176B55",
  Pending: "#E9A23B",
  Completed: "#5B9BD5",
  Declined: "#D97777",
  Cancelled: "#94A3B8",
};

export default function BookingStatusChart({
  data,
}: BookingStatusChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const chartData = data.filter((item) => item.value > 0);

  return (
    <ChartCard
      title="Booking status"
      description="Distribution of appointment statuses."
      className="col-span-1"
    >
      {total > 0 ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <div className="h-[230px] w-full max-w-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={statusColors[entry.name] ?? "#94A3B8"}
                    />
                  ))}
                </Pie>

                <Tooltip
                  formatter={(value) => [
                    `${value} appointments`,
                    "Count",
                  ]}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #E2E8F0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="w-full space-y-3">
            <div className="mb-4">
              <p className="text-3xl font-bold text-[#173F35]">
                {total}
              </p>
              <p className="text-xs text-slate-500">
                Total appointments
              </p>
            </div>

            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{
                      backgroundColor:
                        statusColors[item.name] ?? "#94A3B8",
                    }}
                  />
                  <span className="truncate text-sm text-slate-600">
                    {item.name}
                  </span>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-sm font-semibold text-[#173F35]">
                    {item.value}
                  </span>
                  <span className="ml-2 text-xs text-slate-400">
                    {Math.round((item.value / total) * 100)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex h-[280px] items-center justify-center text-center">
          <div>
            <p className="text-sm font-medium text-slate-700">
              No booking data available
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Status distribution will appear here.
            </p>
          </div>
        </div>
      )}
    </ChartCard>
  );
}
