'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { pollApi, Poll } from '@/lib/api';
import { getUsername, getUserId } from '@/lib/auth';

export default function ManagePollsPage() {
  const router = useRouter();
  const username = getUsername();
  const userId = getUserId();

  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUserPolls();
    }
  }, [userId]);

  const fetchUserPolls = async () => {
    if (!userId) return;
    console.log(userId)
    try {
      setLoading(true);
      const data = await pollApi.getUserPolls(userId);
      setPolls(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  const handleClosePoll = async (pollId: string) => {
    if (!userId || !confirm('Are you sure you want to close this poll?')) return;

    try {
      setActionLoading(pollId);
      await pollApi.closePoll(pollId, userId);
      await fetchUserPolls();
    } catch (err: any) {
      alert(err.message || 'Failed to close poll');
    } finally {
      setActionLoading(null);
    }
  };
  
  const handleResetPoll = async (pollId: string) => {
    if (!userId || !confirm('Are you sure you want to reset this poll? All votes will be removed.')) return;

    try {
      setActionLoading(pollId);
      await pollApi.resetPoll(pollId, userId);
      await fetchUserPolls();
    } catch (err: any) {
      alert(err.message || 'Failed to reset poll');
    } finally {
      setActionLoading(null);
    }
  };

  const activePolls = polls.filter(p => !p.is_closed).length;
  const closedPolls = polls.filter(p => p.is_closed).length;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Navbar username={username} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 animate-fadeInUp">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
                My Polls
              </h1>
              <p className="text-gray-600 text-base sm:text-lg">Manage and track your created polls</p>
              <div className="flex gap-4 mt-3 text-sm">
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  <span className="font-semibold">{activePolls}</span> Active
                </span>
                <span className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                  <span className="font-semibold">{closedPolls}</span> Closed
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/polls/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              + Create New Poll
            </button>
          </div>

          {loading && (
            <div className="text-center py-16 sm:py-20 animate-fadeIn">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <div className="animate-ping absolute top-0 left-1/2 transform -translate-x-1/2 rounded-full h-16 w-16 border-4 border-blue-400 opacity-20"></div>
              </div>
              <p className="mt-6 text-gray-600 text-lg font-medium">Loading your polls...</p>
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
                    onClick={fetchUserPolls}
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
              {polls.length === 0 ? (
                <div className="text-center py-16 sm:py-20 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl animate-fadeInUp">
                  <div className="text-6xl sm:text-7xl mb-6">📊</div>
                  <p className="text-gray-700 text-xl sm:text-2xl font-bold mb-3">No polls yet</p>
                  <p className="text-gray-500 text-base sm:text-lg mb-8">
                    Create your first poll and start gathering opinions!
                  </p>
                  <button
                    onClick={() => router.push('/polls/new')}
                    className="inline-block px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Create Your First Poll
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {polls.map((poll, index) => {
                    const pollid = poll.id;
                    const isActive = !poll.is_closed;
                    const isLoading = actionLoading === poll.id;

                    return (
                      <div 
                        key={poll.id} 
                        className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 animate-fadeInUp"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-3">
                              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">{poll.question}</h3>
                              <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                isActive ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {isActive ? '✓ Active' : '✗ Closed'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-gray-600">
                              <span className="flex items-center gap-1.5">
                                <span>🗳️</span>
                                <span className="font-semibold">{poll.total_votes || 0}</span> votes
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span>📊</span>
                                <span className="font-semibold">{poll.options.length}</span> options
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span>🕐</span>
                                {new Date(poll.created_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-6 p-5 bg-gray-50/80 backdrop-blur-sm rounded-xl border border-gray-100">
                          <h4 className="font-bold text-gray-800 mb-3 text-sm uppercase tracking-wide">Poll Options</h4>
                          <div className="space-y-2">
                            {poll.options.map((option, idx) => (
                              <div key={option.id} className="flex justify-between items-center py-2 px-3 bg-white rounded-lg">
                                <span className="text-gray-700 font-medium">{idx + 1}. {option.text}</span>
                                <span className="text-sm font-bold text-blue-600">{option.votes} votes</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <button
                            onClick={() => router.push(`/polls/${pollid}`)}
                            className="px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-semibold transition-all duration-300 border border-blue-200 hover:border-blue-300"
                          >
                            View Details
                          </button>
                          
                          {isActive && (
                            <button
                              onClick={() => handleClosePoll(poll.id)}
                              disabled={isLoading}
                              className="px-5 py-2.5 bg-yellow-50 text-yellow-700 rounded-xl hover:bg-yellow-100 font-semibold disabled:opacity-50 transition-all duration-300 border border-yellow-200 hover:border-yellow-300"
                            >
                              {isLoading ? 'Closing...' : 'Close Poll'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleResetPoll(poll.id)}
                            disabled={isLoading}
                            className="px-5 py-2.5 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-semibold disabled:opacity-50 transition-all duration-300 border border-red-200 hover:border-red-300"
                          >
                            {isLoading ? 'Resetting...' : 'Reset Poll'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
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
        `}</style>
      </div>
    </ProtectedRoute>
  );
}