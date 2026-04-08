'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/layout/ThemeProvider';

export default function TopBar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white/85 dark:bg-slate-950/85 border-b border-slate-200 dark:border-slate-800 backdrop-blur flex items-center justify-end px-6 gap-4 transition-colors duration-300">
      <button
        onClick={toggleTheme}
        className="btn-secondary !px-3"
        aria-label="Toggle theme"
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
      {user && (
        <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
          Hi, {user.name}
        </span>
      )}
      <button
        onClick={handleLogout}
        className="text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
      >
        Logout
      </button>
    </header>
  );
}
