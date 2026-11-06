import OpenAI from 'openai';
import {
  generateStudyPlan,
  suggestTasks,
  sanitizePromptInput,
  validateStudyPlanOutput,
  fallbackPlan,
  clearAICache,
} from '../src/services/aiService';

jest.mock('openai');

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearAICache();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  it('sanitizes prompt input and enforces length limits', () => {
    const raw = '  Physics\u0000\n\t  Mechanics  ';
    expect(sanitizePromptInput(raw, 50)).toBe('Physics Mechanics');
    expect(sanitizePromptInput('A'.repeat(200), 10)).toHaveLength(10);
  });

  it('parses structured study plan responses', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              title: 'Physics sprint',
              summary: 'A focused plan',
              dailyPlan: [
                { day: 1, focus: 'Kinematics', tasks: ['Read chapter', 'Solve problems'] },
              ],
              resources: ['Notes'],
              milestones: ['Finish chapter'],
              tips: ['Study daily'],
            }),
          },
        },
      ],
    });

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreate,
            },
          },
        }) as unknown as OpenAI
    );

    const result = await generateStudyPlan({
      subject: 'Physics',
      daysAvailable: 3,
      hoursPerDay: 2,
      currentLevel: 'beginner',
    });

    expect(result.title).toBe('Physics sprint');
    expect(result.dailyPlan).toHaveLength(1);
    expect(result.dailyPlan[0].focus).toBe('Kinematics');
  });

  it('repairs partial AI JSON payloads using fallback fields', () => {
    const fb = fallbackPlan({
      subject: 'Calculus',
      daysAvailable: 2,
      hoursPerDay: 2,
      currentLevel: 'intermediate',
    });

    const repaired = validateStudyPlanOutput(
      {
        title: 'Custom Calculus Plan',
        dailyPlan: [{ day: 1, focus: 'Limits', tasks: [] }],
        resources: 'invalid-non-array',
      },
      fb
    );

    expect(repaired.title).toBe('Custom Calculus Plan');
    expect(repaired.summary).toBe(fb.summary);
    expect(repaired.dailyPlan[0].tasks.length).toBeGreaterThan(0);
    expect(repaired.resources).toEqual(fb.resources);
  });

  it('falls back gracefully when OpenAI throws or returns invalid JSON', async () => {
    const mockCreate = jest.fn().mockRejectedValue(new Error('Rate limit exceeded'));

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () =>
        ({
          chat: {
            completions: {
              create: mockCreate,
            },
          },
        }) as unknown as OpenAI
    );

    const result = await generateStudyPlan({
      subject: 'Chemistry',
      daysAvailable: 4,
      hoursPerDay: 1.5,
      currentLevel: 'advanced',
    });

    expect(result.title).toContain('Chemistry');
    expect(result.dailyPlan).toHaveLength(4);
  });

  it('falls back to generated tasks when AI is unavailable', async () => {
    delete process.env.OPENAI_API_KEY;

    const tasks = await suggestTasks('Biology', 'cells');
    expect(tasks.length).toBeGreaterThan(0);
    expect(tasks[0]).toContain('Biology');
  });
});
