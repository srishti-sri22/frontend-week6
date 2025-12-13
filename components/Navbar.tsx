'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { clearAuthData } from '@/lib/auth';

interface NavbarProps {
  username?: string | null;
}

export default function Navbar({ username }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      clearAuthData();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-2xl font-bold text-blue-600">
              Polling Poller Polled
            </Link>
            {username && (
              <div className="hidden md:flex space-x-4">
                <Link href="/" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Home
                </Link>
                <Link href="/homepage" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Polls
                </Link>
                <Link href="/polls/new" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  Create Poll
                </Link>
                <Link href="/polls/manage" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md">
                  My Polls
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {username ? (
              <>
                <span className="text-gray-700">Welcome, <strong>{username}</strong></span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
              <Link href="/homepage" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Polls
                </Link>
                <Link href="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Login
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-blue-600 px-3 py-2">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
