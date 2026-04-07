const OpenAI = require('openai');

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
const generateStudyPlan = async ({ subject, daysAvailable, hoursPerDay, currentLevel = 'beginner' }) => {
  const client = getClient();
  if (!client) {
    return 'AI suggestions are unavailable – please configure your OpenAI API key.';
  }

  const prompt = `You are an expert academic tutor. Create a detailed, day-by-day study plan for the following:
Subject: ${subject}
Available days: ${daysAvailable}
Hours per day: ${hoursPerDay}
Current level: ${currentLevel}

Provide:
1. A structured daily breakdown (topics + activities)
2. Key resources (textbooks, online courses, practice problems)
3. Milestones and self-assessment checkpoints
4. Tips for staying productive

Keep the response concise but actionable.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 800,
    temperature: 0.7,
  });

  return response.choices[0].message.content;
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
    return [];
  }

  const prompt = `Generate 5–10 concrete study tasks for the subject "${subject}"${description ? ` (${description})` : ''}.
Return a JSON array of strings, each being a short, actionable task title.`;

  const response = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 300,
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });

  try {
    const parsed = JSON.parse(response.choices[0].message.content);
    return Array.isArray(parsed.tasks) ? parsed.tasks : [];
  } catch {
    return [];
  }
};

module.exports = { generateStudyPlan, suggestTasks };
