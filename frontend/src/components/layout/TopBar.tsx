'use client';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function TopBar() {
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    clearAuth();
    router.push('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center justify-end px-6 gap-4">
      {user && (
        <span className="text-sm text-slate-600 font-medium">
          Hi, {user.name}
        </span>
      )}
      <button
        onClick={handleLogout}
        className="text-sm text-slate-500 hover:text-red-600 transition-colors"
      >
        Logout
      </button>
    </header>
  );
}
