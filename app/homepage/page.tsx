'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PollCard from '@/components/PollCard';
import { pollApi, Poll } from '@/lib/api';
import { getUsername } from '@/lib/auth';

export default function Homepage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getUsername());
  }, []);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const data = await pollApi.getAllPolls();
      setPolls(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const filteredPolls = polls.filter(poll => {
    if (filter === 'all') return true;
    const isActive = !poll.is_closed;
    return filter === 'active' ? isActive : !isActive;
  });

  const activeCount = polls.filter(p => !p.is_closed).length;
  const closedCount = polls.filter(p => p.is_closed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar username={username} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8 sm:mb-12 animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-3">
            All Polls
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">Browse and vote on active polls from the community</p>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4 mb-8 animate-fadeInUp animation-delay-200">
          <button
            onClick={() => setFilter('all')}
            className={`group px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
              filter === 'all'
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              All 
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === 'all' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {polls.length}
              </span>
            </span>
          </button>
          
          <button
            onClick={() => setFilter('active')}
            className={`group px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
              filter === 'active'
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${filter === 'active' ? 'bg-white' : 'bg-green-500'} animate-pulse`}></span>
              Active
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === 'active' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {activeCount}
              </span>
            </span>
          </button>
          
          <button
            onClick={() => setFilter('closed')}
            className={`group px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg ${
              filter === 'closed'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-2">
              Closed
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                filter === 'closed' ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {closedCount}
              </span>
            </span>
          </button>
        </div>

        {loading && (
          <div className="text-center py-16 sm:py-20 animate-fadeIn">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="animate-ping absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
            </div>
            <p className="mt-6 text-gray-600 text-lg font-medium">Loading polls...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-2xl p-6 mb-8 shadow-lg animate-fadeInUp">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⚠️</div>
              <div className="flex-1">
                <p className="text-red-700 font-semibold text-lg mb-2">Oops! Something went wrong</p>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={fetchPolls}
                  className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {filteredPolls.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeInUp">
                <div className="text-6xl sm:text-7xl mb-6">📊</div>
                <p className="text-gray-700 text-xl sm:text-2xl font-bold mb-3">No polls found</p>
                <p className="text-gray-500 text-base sm:text-lg mb-8">
                  {filter === 'all' 
                    ? "Be the first to create a poll!" 
                    : `No ${filter} polls available right now`}
                </p>
                {filter === 'all' && (
                  <a 
                    href="/polls/new"
                    className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Create Your First Poll
                  </a>
                )}
              </div>
            ) : (
              <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPolls.map((poll, index) => (
                  <div 
                    key={poll.id?.toString() || `poll-${index}`}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <PollCard poll={poll} />
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

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

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}