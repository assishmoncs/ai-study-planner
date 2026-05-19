'use client';
import { useTheme } from '@/components/layout/ThemeProvider';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DataPoint {
  _id: string;
  tasksCompleted: number;
  minutesStudied: number;
}

interface ActivityChartProps {
  data: DataPoint[];
  title?: string;
}

export default function ActivityChart({ data, title = 'Daily Activity (last 30 days)' }: ActivityChartProps) {
  const { isDark } = useTheme();
  const formatted = data.map((d) => ({
    date: d._id,
    tasks: d.tasksCompleted,
    minutes: d.minutesStudied,
  }));

  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#334155' : '#cbd5e1';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    borderRadius: '12px',
    color: isDark ? '#e2e8f0' : '#0f172a',
  };

  return (
    <div className="card overflow-hidden">
      <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
      {formatted.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No activity data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="date"
              minTickGap={24}
              tick={{ fontSize: 11, fill: tickColor }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis tick={{ fontSize: 11, fill: tickColor }} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number, name: string) => [
                name === 'minutes' ? `${value} min` : value,
                name === 'minutes' ? 'Study time' : 'Tasks done',
              ]}
            />
            <Area
              type="monotone"
              dataKey="minutes"
              stroke="#6366f1"
              fill="url(#colorMinutes)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
