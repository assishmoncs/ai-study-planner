import OpenAI from 'openai';
import logger from '../utils/logger';
import type {
  AIGeneratePayload,
  AIDailyPlanItem,
  AIStudyPlanResponse,
  SkillLevel,
} from '../types/index';

const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_DAYS_AVAILABLE = 60;
const MAX_HOURS_PER_DAY = 16;
const CACHE_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE_ENTRIES = 100;

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const planCache = new Map<string, CacheEntry<AIStudyPlanResponse>>();
const taskCache = new Map<string, CacheEntry<string[]>>();

/**
 * Clears the in-memory AI response cache (useful for testing and cache invalidation).
 */
export const clearAICache = (): void => {
  planCache.clear();
  taskCache.clear();
};

/**
 * Sanitizes user-supplied text before embedding it into an LLM prompt
 * to prevent prompt injection and excessive token consumption.
 */
export const sanitizePromptInput = (raw: unknown, maxLength = 150): string => {
  if (typeof raw !== 'string') return '';
  return (
    raw
      // eslint-disable-next-line no-control-regex -- Intentionally replace ASCII control characters before normalizing whitespace.
      .replace(/[\u0000-\u001F\u007F]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, maxLength)
  );
};

const clampNumber = (value: unknown, min: number, max: number, fallback: number): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(max, Math.max(min, num));
};

const normalizeLevel = (level?: string): SkillLevel => {
  if (level === 'intermediate' || level === 'advanced') return level;
  return 'beginner';
};

/**
 * Generates a deterministic, level-aware fallback study plan when the OpenAI API
 * is unconfigured, rate-limited, or returns an unrecoverable error.
 */
export const fallbackPlan = ({
  subject,
  daysAvailable,
  hoursPerDay,
  currentLevel = 'beginner',
}: AIGeneratePayload): AIStudyPlanResponse => {
  const cleanSubject = sanitizePromptInput(subject, 120) || 'General Study';
  const safeDays = Math.round(clampNumber(daysAvailable, 1, MAX_DAYS_AVAILABLE, 7));
  const safeHours = clampNumber(hoursPerDay, 0.5, MAX_HOURS_PER_DAY, 2);
  const safeLevel = normalizeLevel(currentLevel);

  const phases =
    safeLevel === 'advanced'
      ? ['Deep Architecture & Edge Cases', 'Complex Problem Solving', 'Timed Synthesis & Review']
      : safeLevel === 'intermediate'
        ? [
            'Core Concept Consolidation',
            'Applied Practice & Drills',
            'Mock Assessment & Refinement',
          ]
        : ['Foundational Concepts', 'Guided Examples & Practice', 'Active Recall & Summary'];

  return {
    title: `${cleanSubject} study plan`,
    summary: `A ${safeLevel} friendly plan for the next ${safeDays} days at ${safeHours}h/day.`,
    dailyPlan: Array.from({ length: safeDays }, (_value, index) => {
      const phaseIndex = Math.min(
        phases.length - 1,
        Math.floor((index / Math.max(1, safeDays)) * phases.length)
      );
      return {
        day: index + 1,
        focus: `${cleanSubject} topic ${index + 1} (${phases[phaseIndex]})`,
        tasks: [
          `Review ${cleanSubject} core notes for Day ${index + 1}`,
          `Complete targeted ${cleanSubject} practice problems`,
          'Summarize key takeaways and log questions for review',
        ],
      };
    }),
    resources: [
      `${cleanSubject} structured course notes & reference documentation`,
      `Curated ${cleanSubject} practice problem sets (${safeLevel} level)`,
      'Active recall flashcards and concise recap summaries',
    ],
    milestones: [
      `Complete baseline ${cleanSubject} concept review`,
      'Finish mid-plan timed practice session with 80%+ accuracy',
      'Complete comprehensive final revision and self-assessment',
    ],
    tips: [
      `Study in focused Pomodoro blocks totalling ${safeHours}h/day`,
      'Review mistakes immediately and document root causes',
      'Use spaced repetition and rest between intensive focus cycles',
    ],
  };
};

const validateStringArray = (candidate: unknown, fallback: string[]): string[] => {
  if (!Array.isArray(candidate)) return fallback;
  const cleaned = candidate
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());
  return cleaned.length > 0 ? cleaned : fallback;
};

const validateDailyPlanArray = (
  candidate: unknown,
  fallback: AIDailyPlanItem[]
): AIDailyPlanItem[] => {
  if (!Array.isArray(candidate) || candidate.length === 0) return fallback;

  const validated: AIDailyPlanItem[] = [];
  for (let i = 0; i < candidate.length; i++) {
    const item = candidate[i] as Record<string, unknown> | null;
    if (!item || typeof item !== 'object') continue;

    const day =
      typeof item.day === 'number' && Number.isFinite(item.day) && item.day > 0
        ? Math.round(item.day)
        : i + 1;
    const focus =
      typeof item.focus === 'string' && item.focus.trim().length > 0
        ? item.focus.trim()
        : fallback[i]?.focus || `Day ${day} Focus`;
    const tasks = validateStringArray(
      item.tasks,
      fallback[i]?.tasks || ['Review notes', 'Complete practice problems']
    );

    validated.push({ day, focus, tasks });
  }

  return validated.length > 0 ? validated : fallback;
};

/**
 * Validates and normalizes raw parsed JSON from OpenAI into a strict AIStudyPlanResponse.
 */
export const validateStudyPlanOutput = (
  parsed: unknown,
  fb: AIStudyPlanResponse
): AIStudyPlanResponse => {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('Invalid AI response shape');
  }
  const obj = parsed as Record<string, unknown>;
  return {
    title:
      typeof obj.title === 'string' && obj.title.trim().length > 0 ? obj.title.trim() : fb.title,
    summary:
      typeof obj.summary === 'string' && obj.summary.trim().length > 0
        ? obj.summary.trim()
        : fb.summary,
    dailyPlan: validateDailyPlanArray(obj.dailyPlan, fb.dailyPlan),
    resources: validateStringArray(obj.resources, fb.resources),
    milestones: validateStringArray(obj.milestones, fb.milestones),
    tips: validateStringArray(obj.tips, fb.tips),
  };
};

const getClient = (): OpenAI | null => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: Number(process.env.OPENAI_TIMEOUT_MS) || 15_000,
    maxRetries: 1,
  });
};

const getModel = (): string => process.env.OPENAI_MODEL || DEFAULT_MODEL;

const getCached = <T>(cache: Map<string, CacheEntry<T>>, key: string): T | null => {
  if (process.env.NODE_ENV === 'test') return null;
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }
  return entry.value;
};

const setCached = <T>(cache: Map<string, CacheEntry<T>>, key: string, value: T): void => {
  if (process.env.NODE_ENV === 'test') return;
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) cache.delete(oldestKey);
  }
  cache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
};

/**
 * Generates a structured, personalized AI study plan with schema validation,
 * token budget optimization, caching, and graceful deterministic fallback.
 *
 * @param payload - Subject, available days, daily hours, and skill level
 * @returns Validated AIStudyPlanResponse
 */
const generateStudyPlan = async ({
  subject,
  daysAvailable,
  hoursPerDay,
  currentLevel = 'beginner',
  goals,
}: AIGeneratePayload): Promise<AIStudyPlanResponse> => {
  const cleanSubject = sanitizePromptInput(subject, 120) || 'General Study';
  const safeDays = Math.round(clampNumber(daysAvailable, 1, MAX_DAYS_AVAILABLE, 7));
  const safeHours = clampNumber(hoursPerDay, 0.5, MAX_HOURS_PER_DAY, 2);
  const safeLevel = normalizeLevel(currentLevel);
  const cleanGoals = sanitizePromptInput(goals, 250);

  const fb = fallbackPlan({
    subject: cleanSubject,
    daysAvailable: safeDays,
    hoursPerDay: safeHours,
    currentLevel: safeLevel,
  });

  const client = getClient();
  if (!client) {
    logger.debug(
      { subject: cleanSubject },
      'AI client unconfigured; returning fallback study plan'
    );
    return fb;
  }

  const cacheKey = `${cleanSubject.toLowerCase()}|${safeDays}|${safeHours}|${safeLevel}|${cleanGoals}`;
  const cached = getCached(planCache, cacheKey);
  if (cached) {
    logger.debug({ subject: cleanSubject }, 'Returning cached AI study plan');
    return cached;
  }

  const startTime = Date.now();
  try {
    const prompt = `You are an expert academic tutor. Create a detailed study plan for the following:
Subject: ${cleanSubject}
Available days: ${safeDays}
Hours per day: ${safeHours}
Current level: ${safeLevel}${cleanGoals ? `\nSpecific goals: ${cleanGoals}` : ''}

Return JSON only with this shape:
{
  "title": string,
  "summary": string,
  "dailyPlan": [{ "day": number, "focus": string, "tasks": string[] }],
  "resources": string[],
  "milestones": string[],
  "tips": string[]
}

Keep it concise, realistic, and actionable.`;

    const tokenBudget = Math.min(1600, Math.max(800, safeDays * 55));

    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: tokenBudget,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices?.[0]?.message?.content || '';
    const parsed = JSON.parse(content);
    const validated = validateStudyPlanOutput(parsed, fb);

    logger.info(
      {
        event: 'ai.generate_study_plan.success',
        subject: cleanSubject,
        daysAvailable: safeDays,
        durationMs: Date.now() - startTime,
      },
      'Generated AI study plan'
    );

    setCached(planCache, cacheKey, validated);
    return validated;
  } catch (err) {
    logger.warn(
      {
        err,
        event: 'ai.generate_study_plan.fallback',
        subject: cleanSubject,
        durationMs: Date.now() - startTime,
      },
      'AI study plan generation failed; using deterministic fallback'
    );
    return fb;
  }
};

/**
 * Generates 5-10 concrete, actionable study tasks for a given subject and optional context.
 * Falls back to deterministic study tasks when OpenAI is unavailable.
 *
 * @param subject - Academic or professional topic
 * @param description - Optional additional context or sub-topic
 * @returns Array of actionable task titles
 */
const suggestTasks = async (subject: string, description = ''): Promise<string[]> => {
  const cleanSubject = sanitizePromptInput(subject, 120) || 'General Study';
  const cleanDescription = sanitizePromptInput(description, 300);

  const defaultTasks = [
    `Review core ${cleanSubject} concepts${cleanDescription ? ` (${cleanDescription})` : ''}`,
    `Complete a targeted ${cleanSubject} practice problem set`,
    `Create active-recall flashcards for key ${cleanSubject} definitions`,
    `Summarize the main takeaways from today's ${cleanSubject} session`,
    `Run a 25-minute timed self-quiz on ${cleanSubject}`,
  ];

  const client = getClient();
  if (!client) {
    return defaultTasks;
  }

  const cacheKey = `tasks|${cleanSubject.toLowerCase()}|${cleanDescription.toLowerCase()}`;
  const cached = getCached(taskCache, cacheKey);
  if (cached) return cached;

  const prompt = `Generate 5–10 concrete study tasks for the subject "${cleanSubject}"${cleanDescription ? ` (${cleanDescription})` : ''}.
Return JSON only in this shape:
{ "tasks": ["task 1", "task 2"] }`;

  const startTime = Date.now();
  try {
    const response = await client.chat.completions.create({
      model: getModel(),
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 350,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(response.choices?.[0]?.message?.content || '{}');
    const candidateList = Array.isArray(parsed?.tasks)
      ? parsed.tasks
      : Array.isArray(parsed)
        ? parsed
        : [];
    const cleaned = candidateList
      .filter((t: unknown): t is string => typeof t === 'string' && t.trim().length > 0)
      .map((t: string) => t.trim())
      .slice(0, 12);

    if (cleaned.length > 0) {
      setCached(taskCache, cacheKey, cleaned);
      logger.info(
        {
          event: 'ai.suggest_tasks.success',
          subject: cleanSubject,
          count: cleaned.length,
          durationMs: Date.now() - startTime,
        },
        'Generated AI task suggestions'
      );
      return cleaned;
    }
    return defaultTasks;
  } catch (err) {
    logger.warn(
      {
        err,
        event: 'ai.suggest_tasks.fallback',
        subject: cleanSubject,
        durationMs: Date.now() - startTime,
      },
      'AI task suggestion failed; using deterministic fallback'
    );
    return defaultTasks;
  }
};

export { generateStudyPlan, suggestTasks };
