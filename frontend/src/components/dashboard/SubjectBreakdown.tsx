'use client';
import { BookOpen } from 'lucide-react';
import { useReducedMotion } from 'framer-motion';
import { useTheme } from '@/components/layout/ThemeProvider';
import EmptyState from '@/components/ui/EmptyState';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SubjectEntry {
  _id: string;
  totalCompletedHours: number;
  totalTargetHours: number;
  planCount: number;
}

const COLORS = ['#6366f1', '#14b8a6', '#a78bfa', '#f59e0b', '#38bdf8', '#ec4899'];

export default function SubjectBreakdown({ data }: { data: SubjectEntry[] }) {
  const { isDark } = useTheme();
  const reduceMotion = useReducedMotion();
  const chartData = data.map((d) => ({
    name: d._id,
    value: Math.round(d.totalCompletedHours * 10) / 10,
  }));

  return (
    <div className="card h-full overflow-hidden">
      <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
        Subject breakdown
      </h2>
      <p className="mb-6 mt-1 text-xs text-slate-500 dark:text-slate-400">
        Where your study time goes.
      </p>
      {chartData.every((entry) => entry.value <= 0) ? (
        <div className="min-h-[260px]">
          <EmptyState
            icon={BookOpen}
            title="Make time for what matters"
            description="Log study hours to a plan to see your subject breakdown."
          />
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              isAnimationActive={!reduceMotion}
              stroke="none"
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? '#111827' : '#ffffff',
                borderColor: isDark ? '#334155' : '#e2e8f0',
                borderRadius: 12,
                color: isDark ? '#e2e8f0' : '#0f172a',
              }}
              itemStyle={{ color: isDark ? '#e2e8f0' : '#0f172a' }}
              formatter={(v: number) => [`${v}h`, 'Studied']}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, lineHeight: '24px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
