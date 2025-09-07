'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2, LogOut } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading, logout } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      router.push('/auth/login');
    }
  }, [isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }


  return null;
}
