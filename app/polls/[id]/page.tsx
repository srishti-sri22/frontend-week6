'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useStore } from '@/lib/store';
import { usePolls } from '@/hooks/usePolls';
import { useVotes } from '@/hooks/useVotes';
import { ChartColumn } from 'lucide-react';
import { Poll } from '@/lib/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000/api';

export default function PollDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pollId = params.id as string;
  
  const { username, userId, isAuthenticated, updatePoll } = useStore();
  const { currentPoll, pollsLoading, pollsError, fetchPollById } = usePolls();
  const { hasVoted, votedOptionId, castVote, changeVote } = useVotes(pollId);
  
  const [voting, setVoting] = useState(false);
  const [changingVote, setChangingVote] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isEditingVote, setIsEditingVote] = useState(false);
  const [animateOptions, setAnimateOptions] = useState(false);
  const [liveUpdates, setLiveUpdates] = useState(true);
  
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (pollId) {
      fetchPollById(pollId);
    }
  }, [pollId, fetchPollById]);

  useEffect(() => {
    if (!pollId || !liveUpdates) return;

    const eventSource = new EventSource(`${API_BASE_URL}/polls/${pollId}/stream`);
    eventSourceRef.current = eventSource;

    eventSource.onmessage = (event) => {
      if (event.data === 'keep-alive') return;
      
      try {
        const updatedPoll: Poll = JSON.parse(event.data);
        updatePoll(pollId, updatedPoll);
      } catch (err) {
        console.error('Error parsing SSE data:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [pollId, liveUpdates, updatePoll]);

  useEffect(() => {
    if (currentPoll) {
      setTimeout(() => setAnimateOptions(true), 100);
    }
  }, [currentPoll]);

  useEffect(() => {
    if (votedOptionId && !isEditingVote) {
      setSelectedOption(votedOptionId);
    }
  }, [votedOptionId, isEditingVote]);

  const handleVote = async () => {
    if (!selectedOption || !userId || !isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setVoting(true);
      await castVote(pollId, selectedOption, userId);
      setIsEditingVote(false);
      await fetchPollById(pollId);
    } catch (err: any) {
      setError(err.message || 'Failed to vote');
    } finally {
      setVoting(false);
    }
  };

  const handleChangeVote = async () => {
    if (!selectedOption || !userId || !isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      setChangingVote(true);
      await changeVote(pollId, userId, selectedOption);
      setIsEditingVote(false);
      await fetchPollById(pollId);
    } catch (err: any) {
      setError(err.message || 'Failed to change vote');
    } finally {
      setChangingVote(false);
    }
  };

  const handleEditVote = () => {
    setIsEditingVote(true);
  };

  const handleCancelEdit = () => {
    setIsEditingVote(false);
    setSelectedOption(votedOptionId);
  };

  const toggleLiveUpdates = () => {
    setLiveUpdates(!liveUpdates);
  };

  if (pollsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (pollsError || !currentPoll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-16">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-700 text-lg">{pollsError || 'Poll not found'}</p>
            <button
              onClick={() => router.push('/homepage')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  const poll = currentPoll;
  const isActive = !poll.is_closed;
  const totalVotes = poll.total_votes || 0;
  const maxVotes = Math.max(...poll.options.map(o => o.votes), 1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => router.back()}
            className="text-slate-600 hover:text-slate-900 font-medium transition-colors flex items-center gap-2"
          >
            <span>←</span> Back
          </button>
          
          <button
            onClick={toggleLiveUpdates}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
              liveUpdates 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${liveUpdates ? 'bg-green-500 animate-pulse' : 'bg-slate-400'}`}></span>
            {liveUpdates ? 'Live Updates On' : 'Live Updates Off'}
          </button>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-all duration-500 hover:shadow-md">
            <div className="mb-8">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h1 className="text-3xl font-bold text-slate-900">{poll.question}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                  isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                }`}>
                  {isActive ? '● Active' : '● Closed'}
                </span>
              </div>
              <div className="flex gap-6 text-sm text-slate-500">
                {/* <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>👤</span>
            <span>by <span className="font-semibold text-gray-700">{poll.creator_id}</span></span>
          </div> */}
                <span className="font-medium text-slate-700">{totalVotes} votes</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  {hasVoted && !isEditingVote ? '✓ Your vote recorded' : 'Select an option'}
                </h2>
                {hasVoted && !isEditingVote && isActive && (
                  <button
                    onClick={handleEditVote}
                    className="px-4 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 font-medium text-sm transition-colors"
                  >
                    Change Vote
                  </button>
                )}
              </div>

              {poll.options.map((option, index) => {
                const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                const isSelected = selectedOption === option.id;

                return (
                  <div 
                    key={option.id} 
                    className="relative"
                    style={{
                      animation: animateOptions ? `slideIn 0.4s ease-out ${index * 0.1}s both` : 'none'
                    }}
                  >
                    <button
                      onClick={() => (!hasVoted || isEditingVote) && isActive && setSelectedOption(option.id)}
                      disabled={(hasVoted && !isEditingVote) || !isActive}
                      className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                      } ${((hasVoted && !isEditingVote) || !isActive) ? 'cursor-default' : 'cursor-pointer'}`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-slate-900">{option.text}</span>
                        <span className="text-sm font-bold text-blue-600">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
                      </div>
                      
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>

            {!hasVoted && isActive && (
              <button
                onClick={handleVote}
                disabled={!selectedOption || voting}
                className="mt-6 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
              >
                {voting ? 'Submitting...' : 'Submit Vote'}
              </button>
            )}

            {isEditingVote && isActive && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleChangeVote}
                  disabled={!selectedOption || changingVote}
                  className="flex-1 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 font-medium disabled:bg-slate-300 disabled:cursor-not-allowed transition-all"
                >
                  {changingVote ? 'Updating...' : 'Confirm Change'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={changingVote}
                  className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {!isAuthenticated && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 text-sm">
                  Please <a href="/login" className="font-semibold underline">login</a> to vote on this poll.
                </p>
              </div>
            )}

            {!isActive && (
              <div className="mt-6 p-4 bg-slate-100 border border-slate-200 rounded-xl">
                <p className="text-slate-600 text-sm">This poll is closed and no longer accepting votes.</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 transition-all duration-500 hover:shadow-md">
            <div className="flex items-center gap-2 mb-6">
              <ChartColumn className="w-5 h-5 text-slate-600" />
              <h2 className="text-xl font-bold text-slate-900">Vote Distribution</h2>
              {liveUpdates && (
                <span className="ml-auto text-xs text-green-600 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Live
                </span>
              )}
            </div>
            
            <div className="relative" style={{ height: '320px' }}>
              <div className="absolute left-0 top-0 w-12 flex flex-col justify-between text-xs text-slate-500 text-right pr-2" style={{ height: '280px' }}>
                <span>{maxVotes}</span>
                <span>{Math.floor(maxVotes * 0.75)}</span>
                <span>{Math.floor(maxVotes * 0.5)}</span>
                <span>{Math.floor(maxVotes * 0.25)}</span>
                <span>0</span>
              </div>
              
              <div className="absolute left-14 right-0 top-0 flex flex-col justify-between" style={{ height: '280px' }}>
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-slate-200"></div>
                ))}
              </div>
              
              <div className="absolute left-14 right-0 top-0 flex items-end justify-around gap-4 px-4" style={{ height: '280px' }}>
                {poll.options.map((option, index) => {
                  const votePercentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
                  const barHeight = maxVotes > 0 ? ((option.votes / maxVotes) * 100) : 0;
                  
                  return (
                    <div 
                      key={option.id} 
                      className="flex flex-col items-center justify-end"
                      style={{
                        width: `${100 / poll.options.length - 2}%`,
                        maxWidth: '120px',
                        height: '100%',
                        animation: animateOptions ? `slideUp 0.6s ease-out ${(index * 0.15) + 0.3}s both` : 'none'
                      }}
                    >
                      <div className="mb-1 text-sm font-bold text-slate-700" style={{ minHeight: '20px' }}>
                        {option.votes > 0 ? option.votes : ''}
                      </div>
                      
                      <div 
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg relative group cursor-pointer hover:from-blue-700 hover:to-blue-500 transition-all duration-300"
                        style={{ 
                          height: `${barHeight}%`,
                          minHeight: option.votes > 0 ? '12px' : '0px'
                        }}
                      >
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg z-10">
                          <div className="font-semibold">{option.text}</div>
                          <div className="text-slate-300">{option.votes} votes ({votePercentage.toFixed(1)}%)</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="absolute left-14 right-0 flex justify-around gap-4 px-4 pt-2 border-t border-slate-300" style={{ top: '280px', height: '40px' }}>
                {poll.options.map((option, index) => (
                  <div 
                    key={option.id} 
                    className="text-center text-xs text-slate-600 font-medium truncate"
                    style={{
                      width: `${100 / poll.options.length - 2}%`,
                      maxWidth: '120px',
                      animation: animateOptions ? `fadeIn 0.4s ease-out ${(index * 0.15) + 0.5}s both` : 'none'
                    }}
                    title={option.text}
                  >
                    {option.text}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{totalVotes}</div>
                <div className="text-xs text-slate-600 mt-1">Total Votes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">{poll.options.length}</div>
                <div className="text-xs text-slate-600 mt-1">Options</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-900">
                  {poll.options.reduce((max, opt) => opt.votes > max ? opt.votes : max, 0)}
                </div>
                <div className="text-xs text-slate-600 mt-1">Highest Votes</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scaleY(0);
            transform-origin: bottom;
          }
          to {
            opacity: 1;
            transform: translateY(0) scaleY(1);
            transform-origin: bottom;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}