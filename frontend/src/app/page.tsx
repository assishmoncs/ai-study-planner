import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  Clock3,
  Sparkles,
  Timer,
} from 'lucide-react';

const FEATURES = [
  {
    number: '01',
    icon: Sparkles,
    title: 'Turn a goal into a plan.',
    text: 'Tell us what you’re learning. Create an AI-assisted roadmap around your level, schedule, and ambitions.',
  },
  {
    number: '02',
    icon: Timer,
    title: 'Make time for deep focus.',
    text: 'Break the work into manageable tasks and focused sessions. Take a breath, then take the next step.',
  },
  {
    number: '03',
    icon: BarChart3,
    title: 'See your effort add up.',
    text: 'Track your study hours and completed tasks. Find your rhythm with a clear view of your progress.',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-dvh overflow-hidden">
      <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-6 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-bold sm:text-base">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <BookOpen className="h-5 w-5" />
          </span>
          Study Planner<span className="-ml-2 text-indigo-500">.</span>
        </Link>
        <nav aria-label="Public navigation" className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-300"
          >
            Sign in
          </Link>
          <Link href="/register" className="btn-primary hidden sm:inline-flex">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:pb-24 lg:pt-20">
          <div className="animate-fade-in">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              Your ambition. A clearer direction.
            </div>
            <h1 className="max-w-xl text-5xl font-semibold leading-[1.08] tracking-[-0.045em] sm:text-6xl xl:text-7xl">
              Less overwhelm.
              <br />
              <span className="text-indigo-600 dark:text-indigo-400">More progress.</span>
            </h1>
            <p className="mt-7 max-w-md text-base leading-7 text-slate-500 dark:text-slate-400 sm:text-lg sm:leading-8">
              A thoughtful home for your study life. Turn big goals into clear plans, find your
              focus, and see how far you can go.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/register" className="btn-primary !px-6 !py-3.5">
                Build your study plan
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/login" className="btn-secondary !px-6 !py-3.5">
                Open your workspace
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Your plans, tasks, and focus time. All together.
            </p>
          </div>
          <div
            className="relative mx-auto w-full max-w-lg lg:ml-auto"
            aria-label="Illustrative study plan preview"
          >
            <div
              aria-hidden="true"
              className="absolute -inset-8 -z-10 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-800/10"
            />
            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-24px_rgba(79,70,229,0.2)] dark:border-slate-700 dark:bg-slate-900 sm:p-7">
              <div className="mb-7 flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <BookOpen className="h-4 w-4 text-indigo-500" />
                  Your study space
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  Example plan
                </span>
              </div>
              <p className="eyebrow">One step at a time</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Let’s make today count.
              </h2>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                A little focus can take you a long way.
              </p>
              <div className="my-6 rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-500/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-indigo-800 dark:text-indigo-200">
                    Introduction to mathematics
                  </span>
                  <Sparkles className="h-4 w-4 text-indigo-500" />
                </div>
                <div className="mb-2 mt-4 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Weekly progress</span>
                  <span>2 of 3 tasks</span>
                </div>
                <div className="h-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950">
                  <div className="h-full w-2/3 rounded-full bg-indigo-500" />
                </div>
              </div>
              <div className="space-y-3">
                {[
                  'Review lecture notes',
                  'Practice the fundamentals',
                  'Work through a problem set',
                ].map((task, i) => (
                  <div
                    key={task}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-slate-800"
                  >
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${i < 2 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400' : 'border-2 border-slate-200 dark:border-slate-600'}`}
                    >
                      {i < 2 && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span
                      className={`text-xs ${i < 2 ? 'text-slate-400 line-through dark:text-slate-500' : 'font-medium'}`}
                    >
                      {task}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-950 px-4 py-3.5 text-white dark:bg-indigo-600">
                <span className="flex items-center gap-2 text-xs">
                  <Clock3 className="h-4 w-4 text-indigo-300 dark:text-indigo-100" />A moment to
                  focus
                </span>
                <span className="text-lg font-semibold tabular-nums tracking-tight">25:00</span>
              </div>
            </div>
          </div>
        </section>
        <section className="border-y border-slate-200/70 bg-white/60 dark:border-slate-800 dark:bg-slate-900/30">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16">
            <p className="eyebrow">Find your rhythm</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
              A simpler path from intention to action.
            </h2>
            <div className="mt-10 grid gap-9 md:grid-cols-3">
              {FEATURES.map(({ number, icon: Icon, title, text }) => (
                <div key={number}>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-slate-400">{number}</span>
                  </div>
                  <h3 className="text-base font-semibold">{title}</h3>
                  <p className="mt-3 max-w-sm text-sm leading-7 text-slate-500 dark:text-slate-400">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 py-7 text-xs text-slate-500 dark:text-slate-400 sm:flex-row sm:px-8">
        <span>Study Planner. Built for the way you learn.</span>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 font-medium text-indigo-600 dark:text-indigo-400"
        >
          Start your next chapter
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </footer>
    </div>
  );
}
