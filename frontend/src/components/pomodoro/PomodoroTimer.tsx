'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Bell, BellOff, Pause, Play, RotateCcw, SkipForward, TimerReset } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/Toaster';
import type { StudyPlan } from '@/types';

type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface PomodoroTimerProps {
  compact?: boolean;
}

const DEFAULT_SETTINGS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const modeLabels: Record<TimerMode, string> = {
  focus: 'Focus',
  shortBreak: 'Short break',
  longBreak: 'Long break',
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const getNextMode = (mode: TimerMode, completedFocusSessions: number): TimerMode => {
  if (mode === 'focus') {
    return (completedFocusSessions + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
  }
  return 'focus';
};

export default function PomodoroTimer({ compact = false }: PomodoroTimerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [mode, setMode] = useState<TimerMode>('focus');
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_SETTINGS.focus * 60);
  const [running, setRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [focusMinutes, setFocusMinutes] = useState(DEFAULT_SETTINGS.focus);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(DEFAULT_SETTINGS.shortBreak);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULT_SETTINGS.longBreak);
  const [activePlanId, setActivePlanId] = useState<string>('');

  const { data: activePlans = [] } = useQuery<StudyPlan[]>({
    queryKey: ['study-plans', { status: 'active' }],
    queryFn: () => apiClient.get('/study-plans?status=active').then((res) => res.data.data.plans),
  });

  useEffect(() => {
    if (activePlans.length > 0 && !activePlanId) {
      setActivePlanId(activePlans[0]._id);
    }
  }, [activePlans, activePlanId]);

  const currentDurationMinutes = useMemo(() => {
    if (mode === 'focus') return focusMinutes;
    if (mode === 'shortBreak') return shortBreakMinutes;
    return longBreakMinutes;
  }, [mode, focusMinutes, shortBreakMinutes, longBreakMinutes]);

  useEffect(() => {
    if (!running) {
      setSecondsLeft(currentDurationMinutes * 60);
    }
  }, [currentDurationMinutes, running]);

  const logHoursMutation = useMutation({
    mutationFn: async (payload: { planId: string; hours: number }) =>
      apiClient.post(`/study-plans/${payload.planId}/log-hours`, { hours: payload.hours }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      toast({
        title: 'Study time logged',
        description: 'Completed focus time was added to your active plan.',
        variant: 'success',
      });
    },
    onError: () => {
      toast({
        title: 'Could not log hours',
        description: 'Your session completed, but logging to the plan failed.',
        variant: 'error',
      });
    },
  });

  const playSound = useCallback(() => {
    if (!soundEnabled || typeof window === 'undefined') return;
    const AudioContextConstructor =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    const context = new AudioContextConstructor();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.value = 880;
    gain.gain.value = 0.06;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();
    window.setTimeout(() => {
      oscillator.stop();
      context.close().catch(() => undefined);
    }, 450);
  }, [soundEnabled]);

  const notify = useCallback((title: string, body: string) => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  }, []);

  const finishSession = useCallback((automated = true) => {
    const nextMode = getNextMode(mode, completedFocusSessions);
    if (mode === 'focus' && activePlanId) {
      logHoursMutation.mutate({ planId: activePlanId, hours: focusMinutes / 60 });
    }

    if (mode === 'focus') {
      setCompletedFocusSessions((count) => count + 1);
    }

    setMode(nextMode);
    setSecondsLeft(
      (nextMode === 'focus' ? focusMinutes : nextMode === 'shortBreak' ? shortBreakMinutes : longBreakMinutes) * 60
    );
    setRunning(false);

    if (automated) {
      playSound();
      notify(
        mode === 'focus' ? 'Focus session complete' : 'Break finished',
        mode === 'focus' ? 'Time for a break.' : 'Back to a focus session.'
      );
    }
  }, [
    activePlanId,
    completedFocusSessions,
    focusMinutes,
    longBreakMinutes,
    logHoursMutation,
    mode,
    playSound,
    shortBreakMinutes,
    notify,
  ]);

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          window.setTimeout(() => finishSession(true), 0);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [running, finishSession]);

  const handleStart = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    setRunning(true);
  };

  const handleReset = () => {
    setRunning(false);
    setMode('focus');
    setCompletedFocusSessions(0);
    setSecondsLeft(focusMinutes * 60);
  };

  const handleSkip = () => {
    finishSession(false);
  };

  const totalSeconds = currentDurationMinutes * 60;
  const progress = totalSeconds === 0 ? 0 : 1 - secondsLeft / totalSeconds;
  const radius = compact ? 92 : 120;
  const stroke = 10;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - progress * circumference;

  return (
    <div className={`card ${compact ? 'space-y-4' : 'space-y-6'}`}>
      <div className={`flex flex-col gap-4 ${compact ? '' : 'xl:flex-row xl:items-start xl:justify-between'}`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">Pomodoro</p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-slate-100">
            {modeLabels[mode]} session
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Cycle {completedFocusSessions + 1} • Automatically logs completed focus time to your active plan.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary" onClick={() => setSoundEnabled((value) => !value)}>
            {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {soundEnabled ? 'Sound on' : 'Sound off'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={async () => {
              if ('Notification' in window) {
                await Notification.requestPermission();
              }
            }}
          >
            <Bell className="h-4 w-4" />
            Enable notifications
          </button>
        </div>
      </div>

      <div className={`grid gap-6 ${compact ? '' : 'xl:grid-cols-[minmax(0,1fr)_18rem]'}`}>
        <div className="flex flex-col items-center gap-5">
          <div className="relative flex items-center justify-center">
            <svg viewBox="0 0 280 280" className={compact ? 'h-56 w-56' : 'h-72 w-72'}>
              <circle cx="140" cy="140" r={radius} className="fill-none stroke-slate-200 dark:stroke-slate-800" strokeWidth={stroke} />
              <circle
                cx="140"
                cy="140"
                r={radius}
                className="fill-none stroke-violet-500 transition-[stroke-dashoffset] duration-1000 ease-linear"
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 140 140)"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <p className={compact ? 'text-4xl font-semibold tracking-tight' : 'text-5xl font-semibold tracking-tight'}>
                {formatTime(secondsLeft)}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                {running ? 'Running' : 'Paused'} • {modeLabels[mode]}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {!running ? (
              <button type="button" className="btn-primary" onClick={handleStart}>
                <Play className="h-4 w-4" />
                Start
              </button>
            ) : (
              <button type="button" className="btn-secondary" onClick={() => setRunning(false)}>
                <Pause className="h-4 w-4" />
                Pause
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={handleReset}>
              <TimerReset className="h-4 w-4" />
              Reset
            </button>
            <button type="button" className="btn-secondary" onClick={handleSkip}>
              <SkipForward className="h-4 w-4" />
              Skip
            </button>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Active study plan
            </label>
            <select
              className="input"
              value={activePlanId}
              onChange={(event) => setActivePlanId(event.target.value)}
              disabled={activePlans.length === 0}
            >
              {activePlans.length === 0 ? (
                <option value="">Create an active plan first</option>
              ) : (
                activePlans.map((plan) => (
                  <option key={plan._id} value={plan._id}>
                    {plan.title}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Focus</label>
              <input
                type="number"
                min="1"
                className="input"
                value={focusMinutes}
                onChange={(event) => setFocusMinutes(Number(event.target.value) || 25)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Short break</label>
              <input
                type="number"
                min="1"
                className="input"
                value={shortBreakMinutes}
                onChange={(event) => setShortBreakMinutes(Number(event.target.value) || 5)}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">Long break</label>
              <input
                type="number"
                min="1"
                className="input"
                value={longBreakMinutes}
                onChange={(event) => setLongBreakMinutes(Number(event.target.value) || 15)}
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Completed focus blocks</span>
              <span className="font-semibold text-slate-950 dark:text-slate-100">{completedFocusSessions}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Current session length</span>
              <span className="font-semibold text-slate-950 dark:text-slate-100">{currentDurationMinutes}m</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Auto-log</span>
              <span className="font-semibold text-slate-950 dark:text-slate-100">
                {activePlanId ? 'Enabled' : 'No active plan'}
              </span>
            </div>
          </div>

          {logHoursMutation.isPending && (
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <RotateCcw className="h-4 w-4 animate-spin" />
              Saving study hours...
            </div>
          )}

          <div className="flex items-start gap-3 rounded-xl border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-100">
            <ArrowRight className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Complete a focus session to automatically add <span className="font-semibold">{focusMinutes / 60}h</span> to your active study plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
