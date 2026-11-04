
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

type PopularServicesChartProps = {
  data: {
    service: string;
    appointments: number;
  }[];
};

export default function PopularServicesChart({
  data,
}: PopularServicesChartProps) {
  return (
    <ChartCard
      title="Popular services"
      description="Most frequently booked clinic services."
      className="col-span-1"
    >
      {data.length > 0 ? (
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 15, left: 5, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#E9EFEB"
              />

              <XAxis
                type="number"
                allowDecimals={false}
                tick={{ fill: "#94A3B8", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              <YAxis
                type="category"
                dataKey="service"
                width={110}
                tick={{ fill: "#64748B", fontSize: 11 }}
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
                fill="#176B55"
                radius={[0, 6, 6, 0]}
                barSize={22}
              />
            </BarChart>
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
          No service bookings available
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Popular services will appear here.
        </p>
      </div>
    </div>
  );
}
