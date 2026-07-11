const OpenAI = require('openai');

const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

const fallbackPlan = ({ subject, daysAvailable, hoursPerDay, currentLevel }) => ({
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

let openai = null;

const getClient = () => {
  if (!openai && process.env.OPENAI_API_KEY) {
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return openai;
};

/**
 * Generate a personalised study plan using GPT.
 * @param {object} params
 * @param {string} params.subject
 * @param {number} params.daysAvailable
 * @param {number} params.hoursPerDay
 * @param {string} params.currentLevel - beginner | intermediate | advanced
 * @returns {Promise<string>} AI-generated suggestions
 */
const generateStudyPlan = async ({
  subject,
  daysAvailable,
  hoursPerDay,
  currentLevel = 'beginner',
}) => {
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
    return {
      title: typeof parsed.title === 'string' ? parsed.title : `${subject} study plan`,
      summary:
        typeof parsed.summary === 'string'
          ? parsed.summary
          : fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel }).summary,
      dailyPlan: Array.isArray(parsed.dailyPlan)
        ? parsed.dailyPlan
        : fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel }).dailyPlan,
      resources: Array.isArray(parsed.resources)
        ? parsed.resources
        : fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel }).resources,
      milestones: Array.isArray(parsed.milestones)
        ? parsed.milestones
        : fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel }).milestones,
      tips: Array.isArray(parsed.tips)
        ? parsed.tips
        : fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel }).tips,
    };
  } catch {
    return fallbackPlan({ subject, daysAvailable, hoursPerDay, currentLevel });
  }
};

/**
 * Suggest tasks for a given study plan.
 * @param {string} subject
 * @param {string} description
 * @returns {Promise<string[]>}
 */
const suggestTasks = async (subject, description = '') => {
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
    const parsed = JSON.parse(response.choices[0].message.content);
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

module.exports = { generateStudyPlan, suggestTasks };
