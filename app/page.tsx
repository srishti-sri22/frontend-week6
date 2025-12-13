'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getUsername, isAuthenticated } from '@/lib/auth';

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setUsername(getUsername());
  }, []);

  if (!mounted) {
    return null; 
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Navbar username={username}/>
      
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">

        <div className="text-center mb-12 animate-fadeInUp">
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
            Create polls that <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">matter</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Gather opinions, make decisions together, and see results in real-time with our secure polling platform.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isAuthenticated() ? (
              <>
                <Link 
                  href="/polls/new"
                  className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  Create a Poll
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <Link 
                  href="/polls/manage"
                  className="group px-8 py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  Manage My Polls
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <Link 
                  href="/homepage"
                  className="group px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  View All Polls
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/register"
                  className="group px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  Get Started Free
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
                <Link 
                  href="/homepage"
                  className="group px-8 py-4 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 border-2 border-gray-200 hover:border-blue-300 transform hover:scale-105 hover:-translate-y-1"
                >
                  Explore Polls
                  <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-12 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fadeInUp animation-delay-200 group border border-gray-100">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-200 transition-colors duration-300">
              <span className="text-3xl">🗳️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Easy Poll Creation</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Create beautiful polls in seconds with our intuitive interface and customizable options
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fadeInUp animation-delay-400 group border border-gray-100">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-200 transition-colors duration-300">
              <span className="text-3xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Secure & Private</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Passwordless authentication with Passkeys ensures your data stays safe and secure
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 text-center transform transition-all duration-300 hover:shadow-xl hover:-translate-y-2 animate-fadeInUp animation-delay-600 group border border-gray-100 sm:col-span-2 lg:col-span-1">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-200 transition-colors duration-300">
              <span className="text-3xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Live Results</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              Watch votes come in real-time with beautiful visualizations and instant updates
            </p>
          </div>
        </div>

        <div className="mt-16 mb-12 bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-10 sm:p-16 animate-fadeInUp animation-delay-800 border border-gray-100">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-16">How It Works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
            <div className="text-center transform transition-all duration-300 hover:-translate-y-1 animate-fadeInUp animation-delay-1000">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Sign Up</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Create your free account in seconds</p>
            </div>

            <div className="text-center transform transition-all duration-300 hover:-translate-y-1 animate-fadeInUp animation-delay-1200">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Create Poll</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Add your question and options</p>
            </div>

            <div className="text-center transform transition-all duration-300 hover:-translate-y-1 animate-fadeInUp animation-delay-1400">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Share</h4>
              <p className="text-gray-600 text-sm leading-relaxed">Invite others to participate</p>
            </div>

            <div className="text-center transform transition-all duration-300 hover:-translate-y-1 animate-fadeInUp animation-delay-1600">
              <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-2 text-lg">Analyze</h4>
              <p className="text-gray-600 text-sm leading-relaxed">View results and insights</p>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center animate-fadeInUp animation-delay-1800">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl shadow-2xl p-12 sm:p-16 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
            <div className="relative z-10">
              {isAuthenticated() ? (
                <>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Welcome back, {username}!</h2>
                  <p className="text-lg sm:text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                    Ready to create your next poll or vote on existing ones?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      href="/polls/new"
                      className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                    >
                      Create New Poll
                    </Link>
                    <Link 
                      href="/polls/manage"
                      className="inline-block px-10 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 hover:bg-white/20"
                    >
                      Manage My Polls
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to get started?</h2>
                  <p className="text-lg sm:text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                    Join our community and start creating polls that drive meaningful decisions
                  </p>
                  <Link 
                    href="/register"
                    className="inline-block px-10 py-4 bg-white text-blue-600 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                  >
                    Create Free Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-100 {
          animation-delay: 0.1s;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-600 {
          animation-delay: 0.6s;
        }

        .animation-delay-800 {
          animation-delay: 0.8s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-1200 {
          animation-delay: 1.2s;
        }

        .animation-delay-1400 {
          animation-delay: 1.4s;
        }

        .animation-delay-1600 {
          animation-delay: 1.6s;
        }

        .animation-delay-1800 {
          animation-delay: 1.8s;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
          background-size: 40px 40px;
        }
      `}</style>
    </div>
  );
}