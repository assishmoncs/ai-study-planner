'use client';
import AuthLayout from '@/components/layout/AuthLayout';
import { Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';
import { useToast } from '@/components/ui/Toaster';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { toast } = useToast();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const onSubmit = async (data: RegisterForm) => {
    setServerError('');
    try {
      const res = await apiClient.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      setAuth(res.data.data.user, res.data.data.accessToken);
      toast({
        title: 'Account created',
        description: 'Your study workspace is ready.',
        variant: 'success',
      });
      router.push('/dashboard');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setServerError(message || 'Registration failed. Please try again.');
      toast({
        title: 'Registration failed',
        description: message || 'Please try again.',
        variant: 'error',
      });
    }
  };

  return (
    <AuthLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Create an account
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            A little structure for everything you want to learn.
          </p>
        </div>

        {serverError && (
          <div
            role="alert"
            className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-300 rounded-lg text-sm"
          >
            {serverError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Full Name
            </label>
            <input
              id="name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'name-error' : undefined}
              autoComplete="name"
              type="text"
              className="input"
              placeholder="Jane Smith"
              {...register('name', { required: 'Name is required' })}
            />
            {errors.name && (
              <p
                id="name-error"
                role="alert"
                className="text-rose-600 dark:text-rose-400 text-xs mt-1"
              >
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              autoComplete="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              {...register('email', { required: 'Email is required' })}
            />
            {errors.email && (
              <p
                id="email-error"
                role="alert"
                className="text-rose-600 dark:text-rose-400 text-xs mt-1"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Password
            </label>
            <input
              id="password"
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="input"
              placeholder="Min. 8 characters"
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
              })}
            />
            {errors.password && (
              <p
                id="password-error"
                role="alert"
                className="text-rose-600 dark:text-rose-400 text-xs mt-1"
              >
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
              type="password"
              className="input"
              placeholder="••••••••"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (val) => val === watch('password') || 'Passwords do not match',
              })}
            />
            {errors.confirmPassword && (
              <p
                id="confirmPassword-error"
                role="alert"
                className="text-rose-600 dark:text-rose-400 text-xs mt-1"
              >
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            aria-pressed={showPassword}
            className="inline-flex min-h-9 items-center gap-2 text-xs font-medium text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-300"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPassword ? 'Hide password' : 'Show password'}
          </button>
          <button
            type="submit"
            className="btn-primary w-full py-2.5"
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            )}
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
          Already have an account?{' '}
          <Link
            href="/login"
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
          >
            Sign In
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
