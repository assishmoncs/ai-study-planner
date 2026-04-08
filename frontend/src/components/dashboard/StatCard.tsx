import Card from '@/components/ui/Card';

interface StatCardProps {
  title: string;
  value: string;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

const COLOR_MAP: Record<StatCardProps['color'], string> = {
  blue: 'bg-blue-100/70 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300',
  green: 'bg-green-100/70 dark:bg-green-900/30 text-green-600 dark:text-green-300',
  purple: 'bg-purple-100/70 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300',
  orange: 'bg-orange-100/70 dark:bg-orange-900/30 text-orange-600 dark:text-orange-300',
};

export default function StatCard({ title, value, icon, color }: StatCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${COLOR_MAP[color]}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{value}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{title}</p>
      </div>
    </Card>
  );
}
