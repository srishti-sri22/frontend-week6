'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { pollApi, Poll } from '@/lib/api';
import { getUsername, getUserId, isAuthenticated } from '@/lib/auth';

export default function PollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string; // Extract id from params
  
  console.log("Poll id of the person is:", pollId);
  
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  
  const userId = getUserId();

  // Initialize username on client side only
  useEffect(() => {
    setUsername(getUsername());
  }, []);

  useEffect(() => {
      fetchPoll();

  }, [pollId]);

  const fetchPoll = async () => {
    console.log("inside fetch poll");
    try {
      setLoading(true);
      console.log("Fetching poll with ID:", pollId);
      const data = await pollApi.getPoll(pollId);
      console.log(" data is",data);
      console.log("api is",pollApi);

      setPoll(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load poll');
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async () => {
    if (!selectedOption || !userId || !isAuthenticated()) {
      router.push('/login');
      return;
    }

    try {
      setVoting(true);
      console.log("pollId---->",pollId);
      console.log("selectedOption--->",selectedOption);
      console.log("userId-->",userId);

      await pollApi.castVote(pollId, selectedOption, userId);
      setHasVoted(true);
      await fetchPoll();
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar username={username} />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar username={username} />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-700 text-lg">{error || 'Poll not found'}</p>
            <button
              onClick={() => router.push('/homepage')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isActive = !poll.is_closed;
  const totalVotes = poll.total_votes || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar username={username} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 text-blue-600 hover:text-blue-700 font-semibold"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-3xl font-bold text-gray-900">{poll.question}</h1>
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {isActive ? '✓ Active' : '✗ Closed'}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-600">
            <span>👤 Created by <strong>{poll.creator_id}</strong></span>
            <span>🗳️ <strong>{totalVotes}</strong> total votes</span>
          </div>

          {/* Voting Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {hasVoted ? 'Your vote has been recorded!' : 'Cast Your Vote'}
            </h2>

            {poll.options.map((option) => {
              const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
              const isSelected = selectedOption === option.id;

              return (
                <div key={option.id} className="relative">
                  <button
                    onClick={() => !hasVoted && isActive && setSelectedOption(option.id)}
                    disabled={hasVoted || !isActive}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-400 hover:bg-gray-50'
                    } ${(hasVoted || !isActive) ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold text-gray-900">{option.text}</span>
                      <span className="text-sm font-bold text-blue-600">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 mb-2">
                      {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Vote Button */}
          {!hasVoted && isActive && (
            <button
              onClick={handleVote}
              disabled={!selectedOption || voting}
              className="mt-6 w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {voting ? 'Submitting Vote...' : 'Submit Vote'}
            </button>
          )}

          {!isAuthenticated() && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">
                Please <a href="/login" className="font-semibold underline">login</a> to vote on this poll.
              </p>
            </div>
          )}

          {hasVoted && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-semibold">✓ Thank you for voting!</p>
            </div>
          )}

          {!isActive && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-gray-700">This poll is closed and no longer accepting votes.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}