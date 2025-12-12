'use client';

import Link from 'next/link';
import { Poll } from '@/lib/api';

interface PollCardProps {
  poll: Poll;
}

export default function PollCard({ poll }: PollCardProps) {
  // Calculate total votes
  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes, 0);
  console.log("inside  poll ");

  return (
    <Link href={`/polls/${poll.id}`}>
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer border border-gray-200">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-800 flex-1">{poll.question}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
            poll.is_closed ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {poll.is_closed ? 'Closed' : 'Active'}
          </span>
        </div>
        
        {/* Poll Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-500">
          <span>🗳️ {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}</span>
          <span>📊 {poll.options.length} options</span>
        </div>

        {/* Options with Progress Bars */}
        <div className="space-y-3">
          {poll.options.map((option) => {
            const percentage = totalVotes > 0 ? (option.votes / totalVotes) * 100 : 0;

            return (
              <div key={option.id} className="relative">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                    {option.text}
                  </span>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-bold text-blue-600">{percentage.toFixed(1)}%</span>
                    <span className="text-gray-500">({option.votes})</span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Created At */}
        <div className="mt-4 text-xs text-gray-400">
          Created: {new Date(poll.created_at).toLocaleDateString()}
        </div>
      </div>
    </Link>
  );
}