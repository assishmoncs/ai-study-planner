import OpenAI from 'openai';
import type { AIGeneratePayload, AIStudyPlanResponse } from '../types/index';

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const fallbackPlan = ({
  subject,
  daysAvailable,
  hoursPerDay,
  currentLevel,
}: AIGeneratePayload): AIStudyPlanResponse => ({
  title: `${subject} study plan`,
  summary: `A ${currentLevel} friendly plan for the next ${daysAvailable} days at ${hoursPerDay}h/day.`,
  dailyPlan: Array.from({ length: Number(daysAvailable) || 1 }, (_value, index) => ({
    day: index + 1,
    focus: `${subject} topic ${index + 1}`,
    tasks: ['Review notes', 'Complete practice problems', 'Summarize key ideas'],
  })),
  resources: ['Course notes', 'Practice questions', 'One short recap video'],
  milestones: [
    'Finish a baseline review',
    'Complete one timed practice session',
    'Do a final revision',
  ],
  tips: ['Study in focused blocks', 'Review mistakes immediately', 'Rest between cycles'],
});

const getClient = (): OpenAI | null => {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
};

const generateStudyPlan = async ({
  subject,
  daysAvailable,
  hoursPerDay,
  currentLevel = 'beginner',
}: AIGeneratePayload): Promise<AIStudyPlanResponse> => {
  const client = getClient();
  if (!client) {
    return fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel });
  }

  try {
    const prompt = `You are an expert academic tutor. Create a detailed study plan for the following:
Subject: ${subject}
Available days: ${daysAvailable}
Hours per day: ${hoursPerDay}
Current level: ${currentLevel}

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

    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 800,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content || '';
    const parsed = JSON.parse(content);
    if (!parsed || typeof parsed !== 'object') throw new Error('Invalid AI response');
    const fb = fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel });
    return {
      title: typeof parsed.title === 'string' ? parsed.title : fb.title,
      summary: typeof parsed.summary === 'string' ? parsed.summary : fb.summary,
      dailyPlan: Array.isArray(parsed.dailyPlan) ? parsed.dailyPlan : fb.dailyPlan,
      resources: Array.isArray(parsed.resources) ? parsed.resources : fb.resources,
      milestones: Array.isArray(parsed.milestones) ? parsed.milestones : fb.milestones,
      tips: Array.isArray(parsed.tips) ? parsed.tips : fb.tips,
    };
  } catch {
    return fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel });
  }
};

const suggestTasks = async (subject: string, description = ''): Promise<string[]> => {
  const client = getClient();
  if (!client) {
    return [
      `Review core ${subject} concepts`,
      `Complete a short ${subject} practice set`,
      `Summarize the main ideas from today's session`,
    ];
  }

  const prompt = `Generate 5–10 concrete study tasks for the subject "${subject}"${description ? ` (${description})` : ''}.
Return JSON only in this shape:
{ "tasks": ["task 1", "task 2"] }`;

  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.6,
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    if (Array.isArray(parsed.tasks)) return parsed.tasks;
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [
      `Review core ${subject} concepts`,
      `Complete a short ${subject} practice set`,
      `Summarize the main ideas from today's session`,
    ];
  }
};

export { generateStudyPlan, suggestTasks };
