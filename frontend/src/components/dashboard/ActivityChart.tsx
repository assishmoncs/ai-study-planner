'use client';
import { useId } from 'react';
import { useReducedMotion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import EmptyState from '@/components/ui/EmptyState';
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

export default function ActivityChart({ data, title = 'Study activity' }: ActivityChartProps) {
  const { isDark } = useTheme();
  const gradientId = useId();
  const reduceMotion = useReducedMotion();
  const formatted = data.map((d) => ({
    date: d._id,
    tasks: d.tasksCompleted,
    minutes: d.minutesStudied,
  }));

  const tickColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#263247' : '#eef2f6';
  const tooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#cbd5e1',
    borderRadius: '12px',
    color: isDark ? '#e2e8f0' : '#0f172a',
  };

  return (
    <div className="card h-full overflow-hidden">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">{title}</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Every focused minute moves you forward.
          </p>
        </div>
        <span className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="h-2 w-2 rounded-full bg-indigo-500" />
          Minutes studied
        </span>
      </div>
      {formatted.length === 0 ? (
        <div className="min-h-[260px]">
          <EmptyState
            icon={BarChart3}
            title="Your progress starts here"
            description="Complete a task to see your study activity take shape."
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart
            data={formatted}
            accessibilityLayer
            margin={{ top: 10, right: 10, bottom: 0, left: -20 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 5" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              minTickGap={24}
              tick={{ fontSize: 11, fill: tickColor }}
              tickFormatter={(v) => v.slice(5)}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tickMargin={8}
              tick={{ fontSize: 11, fill: tickColor }}
            />
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
              fill={`url(#${gradientId})`}
              isAnimationActive={!reduceMotion}
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
