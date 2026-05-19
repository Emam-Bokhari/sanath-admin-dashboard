import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../../lib/utils";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { useGetRevenueGrowthQuery } from "../../../redux/features/dashboard/dashboardApi";

const YEARS = ["2026", "2025"] as const;
type Year = typeof YEARS[number];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const EMPTY_CHART = MONTHS.map((month) => ({ month, revenue: 0 }));

const RevenueTrendChart: React.FC = () => {
  const [year, setYear] = useState<Year>(YEARS[0]);
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useGetRevenueGrowthQuery(year);

  const chartData = data?.length
    ? data.map((item: { month: string; revenue: number }) => ({
        month: item.month,
        revenue: item.revenue ?? 0,
      }))
    : EMPTY_CHART;

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-[15px] font-medium text-gray-900">Revenue Trend</p>
          <p className="text-xs text-gray-400">Monthly revenue — {year}</p>
        </div>

        {/* Year selector */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
          >
            <span className="text-slate-700">{year}</span>
            <ChevronDown className={cn("w-3 h-3 text-slate-500 transition-transform", open && "rotate-180")} />
          </button>

          {open && (
            <div className="absolute right-0 mt-1.5 w-24 bg-white rounded-lg border border-slate-100 shadow-lg z-20 py-1 overflow-hidden">
              {YEARS.map((y) => (
                <button
                  key={y}
                  onClick={() => { setYear(y); setOpen(false); }}
                  className={cn(
                    "w-full text-left px-3 py-1.5 text-xs transition-colors",
                    year === y
                      ? "bg-blue-50 text-blue-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {y}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className={cn("transition-opacity", isLoading && "opacity-40")}>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#22c996" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#22c996" stopOpacity={0.01} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#888" }} axisLine={false} tickLine={false} />
            <YAxis
              tick={{ fontSize: 11, fill: "#888" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `£${v >= 1000 ? Math.round(v / 1000) + "k" : v}`}
            />
            <Tooltip formatter={(v) => [`£${Number(v).toLocaleString()}`, "Revenue"]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#22c996"
              strokeWidth={2}
              fill="url(#revenueGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom stats — will be populated from backend */}
      <div className="grid grid-cols-3 gap-0 border-t border-gray-100 mt-4 pt-4">
        {[
          { label: "This Month", value: data?.thisMonth ?? "—" },
          { label: "Target",     value: data?.target    ?? "—" },
          { label: "Achievement",value: data?.achievement ?? "—", green: true },
        ].map(({ label, value, green }) => (
          <div key={label}>
            <p className="text-[11px] text-gray-400 mb-1">{label}</p>
            <p className={cn("text-base font-medium", green ? "text-green-500" : "text-gray-900")}>
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueTrendChart;
