'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface SubjectEntry {
  _id: string;
  totalCompletedHours: number;
  totalTargetHours: number;
  planCount: number;
}

const COLORS = ['#2563eb', '#0f766e', '#7c3aed', '#d97706', '#059669', '#db2777'];

export default function SubjectBreakdown({ data }: { data: SubjectEntry[] }) {
  const chartData = data.map((d) => ({
    name: d._id,
    value: Math.round(d.totalCompletedHours * 10) / 10,
  }));

  return (
    <div className="card overflow-hidden">
      <h2 className="mb-4 text-base font-semibold text-slate-800 dark:text-slate-100">Subject Breakdown</h2>
      {chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
          No subjects yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={chartData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
              {chartData.map((_entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(v: number) => [`${v}h`, 'Studied']} />
            <Legend iconType="circle" iconSize={10} />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
