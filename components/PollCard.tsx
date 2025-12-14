'use client';

import Link from 'next/link';
import { Poll } from '@/lib/api';
import { useStore } from '@/lib/store';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  const { getUserVote } = useStore();
  const userVote = getUserVote(poll.id);

  return (
    <Link href={`/polls/${poll.id}`}>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 cursor-pointer border border-gray-100 hover:border-blue-200 transform hover:scale-102 hover:-translate-y-1 relative">
        
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            poll.is_closed 
              ? 'bg-gray-100 text-gray-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {poll.is_closed ? '✗ Closed' : '✓ Active'}
          </span>

          {userVote && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
              ✓ Voted
            </span>
          )}
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800 pr-32 line-clamp-2">
            {poll.question}
          </h3>
        </div>
        
        <div className="flex items-center gap-6 mb-5 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <span>🗳️</span>
            <span className="font-semibold">{totalVotes}</span>
            <span className="text-gray-500">{totalVotes === 1 ? 'vote' : 'votes'}</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span>📊</span>
            <span className="font-semibold">{poll.options.length}</span>
            <span className="text-gray-500">{poll.options.length === 1 ? 'option' : 'options'}</span>
          </span>
        </div>

        <div className="space-y-3 mb-5">
          {poll.options.slice(0, 3).map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;
            const isUserVote = userVote?.optionId === option.id;

            return (
              <div key={option.id} className="relative">
                <div className="flex justify-between items-center mb-1.5">
                  <span className={`text-sm font-medium text-gray-700 truncate flex-1 mr-3 ${isUserVote ? 'text-blue-700 font-semibold' : ''}`}>
                    {isUserVote && '→ '}{option.text}
                  </span>
                  <div className="flex items-center gap-2 text-sm shrink-0">
                    <span className="font-bold text-blue-600">
                      {percentage.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 text-xs">({option.votes})</span>
                  </div>
                </div>
                
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${isUserVote ? 'bg-green-500' : 'bg-blue-600'}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
          {poll.options.length > 3 && (
            <div className="text-center text-sm text-gray-500 pt-1">
              +{poll.options.length - 3} more {poll.options.length - 3 === 1 ? 'option' : 'options'}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-400">
            
            {new Date(poll.created_at).toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
      </div>
    </Link>
  );
}