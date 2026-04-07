'use client';
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
  const formatted = data.map((d) => ({
    date: d._id,
    tasks: d.tasksCompleted,
    minutes: d.minutesStudied,
  }));

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-slate-800 mb-4">{title}</h2>
      {formatted.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
          No activity data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="colorMinutes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
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
