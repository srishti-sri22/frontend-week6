'use client';

import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import PollCard from '@/components/PollCard';
import ProtectedRoute from '@/components/ProtectedRoute';
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
    console.log(poll.id);
    const isActive = !poll.is_closed;
    return filter === 'active' ? isActive : !isActive;
  });


  console.log("all polls coming",filteredPolls);

  return (
      <div className="min-h-screen bg-gray-50">
        <Navbar username={username} />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Polls</h1>
            <p className="text-gray-600">Browse and vote on active polls</p>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All ({polls.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'active'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilter('closed')}
              className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'closed'
                  ? 'bg-gray-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Closed
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading polls...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-700">{error}</p>
              <button
                onClick={fetchPolls}
                className="mt-2 text-red-600 hover:text-red-800 font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          

          {!loading && !error && (
            <>
              {filteredPolls.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                  <p className="text-gray-600 text-lg">No polls found</p>
                  <p className="text-gray-500 mt-2">Be the first to create one!</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredPolls.map((poll, index) => (

                    <PollCard key={poll.id?.toString() || `poll-${index}`} poll={poll} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
  );
}