'use client';

import PomodoroTimer from '@/components/pomodoro/PomodoroTimer';

const TIPS = [
  'Use a single task per focus block.',
  'Keep your phone away during focus mode.',
  'Review mistakes during each break.',
  'Log completed sessions to keep study hours accurate.',
];

export default function PomodoroPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-title">Pomodoro Timer</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Stay focused with adjustable work/break cycles and automatic study-hour logging.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
        <PomodoroTimer />

        <aside className="card space-y-4">
          <div>
            <p className="eyebrow">Focus tips</p>
            <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-slate-100">
              Make every cycle count
            </h2>
          </div>

          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            {TIPS.map((tip) => (
              <li
                key={tip}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/40"
              >
                {tip}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
