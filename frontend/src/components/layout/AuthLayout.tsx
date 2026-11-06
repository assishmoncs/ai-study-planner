'use client';
import Link from 'next/link';
import { BookOpen, Check, Moon, Sparkles, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from './ThemeProvider';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isDark, toggleTheme } = useTheme();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-indigo-600 p-12 text-white lg:flex lg:flex-col xl:p-16">
        <Link href="/" className="relative z-10 flex items-center gap-3 text-lg font-semibold">
          <BookOpen className="h-7 w-7" />
          Study Planner.
        </Link>
        <div className="relative z-10 my-auto max-w-lg py-16">
          <span className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" />A calmer way to learn
          </span>
          <h2 className="text-5xl font-semibold leading-[1.12] tracking-tight xl:text-6xl">
            A clear plan.
            <br />A focused mind.
            <br />
            <span className="text-indigo-200">A little progress.</span>
          </h2>
          <p className="mt-7 max-w-sm text-base leading-7 text-indigo-100">
            Bring your goals, tasks, and focus time together. Build a study routine that works for
            you.
          </p>
          <ul className="mt-10 space-y-4 text-sm text-indigo-50">
            {[
              'Personalized roadmaps with a little help from AI',
              'Focused study sessions, one step at a time',
              'A clear view of how far you’ve come',
            ].map((text) => (
              <li className="flex items-center gap-3" key={text}>
                <span className="rounded-full bg-white/10 p-1">
                  <Check className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative z-10 text-xs text-indigo-200">Built for the way you learn.</p>
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-52 -right-40 h-[36rem] w-[36rem] rounded-full border-[80px] border-white/5"
        />
      </aside>
      <div className="flex min-h-dvh flex-col px-6 py-6 sm:px-12 lg:px-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold lg:invisible">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            Study Planner.
          </Link>
          <button
            type="button"
            className="btn-secondary !h-11 !w-11 !p-0"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mx-auto my-auto w-full max-w-sm py-10"
        >
          {children}
        </motion.div>
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Your next chapter starts with a plan.
        </p>
      </div>
    </div>
  );
}
