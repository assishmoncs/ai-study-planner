import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center animate-fade-in">
        {/* Logo / Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-primary-600 flex items-center justify-center shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          AI Study Planner
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-xl mx-auto">
          Your AI-powered companion for personalized study plans, task management,
          and productivity insights.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link href="/register" className="btn-primary text-base px-8 py-3">
            Get Started – It&apos;s Free
          </Link>
          <Link href="/login" className="btn-secondary text-base px-8 py-3">
            Sign In
          </Link>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left">
          {[
            {
              icon: '🤖',
              title: 'AI-Generated Plans',
              description:
                'Let GPT create a personalized study roadmap based on your goals and schedule.',
            },
            {
              icon: '⏱️',
              title: 'Pomodoro Timer',
              description:
                'Stay focused with built-in work/break cycles and session tracking.',
            },
            {
              icon: '📊',
              title: 'Productivity Analytics',
              description:
                'Visualize your progress with daily activity charts and subject breakdowns.',
            },
          ].map((f) => (
            <div key={f.title} className="card">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-sm text-slate-500">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
