'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import { 
  AppError, 
  ErrorCodes, 
  getUserFriendlyMessage, 
  logError,
  isAuthError 
} from '@/lib/errorHandler';

export default function Navbar() {
  const router = useRouter();
  const { username, isAuthenticated, clearUser } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string>('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLogoutError('');
    setIsLoggingOut(true);
    
    try {
      await authApi.logout();
      
      clearUser();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        localStorage.removeItem('display_name');
      }
      
      router.push('/login');
      
    } catch (error: unknown) {
      logError(error, 'Navbar logout');
      
      clearUser();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        localStorage.removeItem('display_name');
      }
      
      if (isAuthError(error)) {
        router.push('/login');
      } else {
        const errorMessage = getUserFriendlyMessage(error);
        setLogoutError(errorMessage);
        
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:scale-105 transform"
              >
                
                Poll-Sphere
              </Link>
            </div>

            {isAuthenticated && (
              <div className="hidden lg:flex items-center space-x-1">
                <Link 
                  href="/" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Home
                </Link>
                <Link 
                  href="/homepage" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Polls
                </Link>
                <Link 
                  href="/polls/new" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  Create Poll
                </Link>
                <Link 
                  href="/polls/manage" 
                  className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                >
                  My Polls
                </Link>
              </div>
            )}

            <div className="hidden md:flex items-center space-x-3">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 text-sm sm:text-base">
                    Welcome, <strong className="text-blue-600">{username}</strong>
                  </span>
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    {isLoggingOut ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Logging out...</span>
                      </span>
                    ) : (
                      'Logout'
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/homepage" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                  >
                    Polls
                  </Link>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg transition-all duration-200 font-medium"
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-colors duration-200"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-fadeIn">
              {isAuthenticated ? (
                <div className="flex flex-col space-y-2">
                  <div className="px-4 py-2 text-gray-700 text-sm border-b border-gray-100">
                    Welcome, <strong className="text-blue-600">{username}</strong>
                  </div>
                  <Link 
                    href="/" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/homepage" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Polls
                  </Link>
                  <Link 
                    href="/polls/new" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Create Poll
                  </Link>
                  <Link 
                    href="/polls/manage" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Polls
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    disabled={isLoggingOut}
                    className="text-left px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link 
                    href="/homepage" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Polls
                  </Link>
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 px-4 py-3 rounded-lg transition-all duration-200 font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link 
                    href="/register" 
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </nav>

      {logoutError && (
        <div className="fixed top-20 right-4 z-50 animate-slideIn">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-xl max-w-md">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div className="flex-1">
                <p className="text-red-700 font-medium text-sm">{logoutError}</p>
                <p className="text-red-600 text-xs mt-1">Redirecting to login...</p>
              </div>
              <button
                onClick={() => setLogoutError('')}
                className="text-red-400 hover:text-red-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}