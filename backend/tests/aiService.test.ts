import OpenAI from 'openai';

jest.mock('openai');

describe('aiService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
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
        }) as any
    );

    const { generateStudyPlan } = await import('../src/services/aiService');
    const result = await generateStudyPlan({
      subject: 'Physics',
      daysAvailable: 3,
      hoursPerDay: 2,
      currentLevel: 'beginner',
    });

    expect(result.title).toBe('Physics sprint');
    expect(result.dailyPlan).toHaveLength(1);
  });

  it('falls back to generated tasks when AI is unavailable', async () => {
    delete process.env.OPENAI_API_KEY;

    const { suggestTasks } = await import('../src/services/aiService');
    const tasks = await suggestTasks('Biology', 'cells');
    expect(tasks.length).toBeGreaterThan(0);
  });
});
