'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Loader2, Mail, Lock, LogOut } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { setUser, setToken, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const handleLogin = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login(data.email, data.password);
      setUser(response.user);
      setToken(response.token);
      toast.success('Login successful!');
      router.push('/chat');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Don't have an account?{' '}
            <Link
              href="/auth/register"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign up
            </Link>
          </p>
          {isAuthenticated && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">You are currently logged in</p>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-secondary"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          )}
        </div>

        <div className="card p-8">
          <form onSubmit={form.handleSubmit(handleLogin)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('email')}
                  type="email"
                  autoComplete="email"
                  className="input pl-10"
                  placeholder="Enter your email"
                />
              </div>
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...form.register('password')}
                  type="password"
                  autoComplete="current-password"
                  className="input pl-10"
                  placeholder="Enter your password"
                />
              </div>
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">
                  {form.formState.errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-lg w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
