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


  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navbar username={username} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Polls</h1>
              <p className="text-gray-600">Manage your created polls</p>
            </div>
            <button
              onClick={() => router.push('/polls/new')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
            >
               Create New Poll
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading your polls...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchUserPolls}
                className="mt-2 text-red-600 hover:text-red-800 font-semibold"
              >
                Try Again
              </button>
            </div>
          )}


          {!loading && !error && (
            <>
              {polls.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-600 text-lg mb-4">You haven't created any polls yet</p>
                  <button
                    onClick={() => router.push('/polls/new')}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                  >
                    Create Your First Poll
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {polls.map((poll) => {
                    console.log("poll detail",poll);
                    const pollid = poll.id;
                    const isActive = !poll.is_closed;
                    const isLoading = actionLoading === poll.id;

                    return (
                      <div key={poll.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-2xl font-bold text-gray-900">{poll.question}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {isActive ? 'Active' : 'Closed'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span>🗳️ {poll.total_votes || 0} votes</span>
                              <span>📊 {poll.options.length} options</span>
                              <span>🕐 Created: {new Date(poll.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-semibold text-gray-700 mb-2">Options:</h4>
                          <div className="space-y-2">
                            {poll.options.map((option) => (
                              <div key={option.id} className="flex justify-between items-center">
                                <span className="text-gray-700">{option.text}</span>
                                <span className="text-sm text-gray-500">{option.votes} votes</span>
                              </div>
                            ))}
                          </div>
                        </div>


                        <div className="flex gap-3">
                          <button
                            onClick={() => router.push(`/polls/${pollid}`)}
                            className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 font-semibold"
                          >
                            View Details
                          </button>
                          
                          {isActive && (
                            <button
                              onClick={() => handleClosePoll(poll.id)}
                              disabled={isLoading}
                              className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 font-semibold disabled:opacity-50"
                            >
                              {isLoading ? 'Closing...' : 'Close Poll'}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleResetPoll(poll.id)}
                            disabled={isLoading}
                            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold disabled:opacity-50"
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
      </div>
    </ProtectedRoute>
  );
}