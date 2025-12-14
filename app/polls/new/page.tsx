'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useStore } from '@/lib/store';
import { usePolls } from '@/hooks/usePolls';
import { getUserFriendlyMessage, logError, isAuthError, isValidationError, AppError, ErrorCodes } from '@/lib/errorHandler';

export default function CreatePollPage() {
  const router = useRouter();
  const { username, userId } = useStore();
  const { createPoll } = usePolls();

  const [title, setTitle] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddOption = () => {
    if (options.length >= 10) {
      setError('Maximum 10 options allowed');
      return;
    }
    setOptions([...options, '']);
    setError('');
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
      setError('');
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
    setError('');
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Poll question is required');
      return false;
    }

    if (title.trim().length < 5) {
      setError('Poll question must be at least 5 characters long');
      return false;
    }

    if (title.trim().length > 200) {
      setError('Poll question must not exceed 200 characters');
      return false;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    
    if (validOptions.length < 2) {
      setError('At least 2 options are required');
      return false;
    }

    const uniqueOptions = new Set(validOptions.map(opt => opt.trim().toLowerCase()));
    if (uniqueOptions.size !== validOptions.length) {
      setError('All options must be unique');
      return false;
    }

    for (const option of validOptions) {
      if (option.trim().length < 1) {
        setError('Options cannot be empty');
        return false;
      }
      if (option.trim().length > 100) {
        setError('Options must not exceed 100 characters');
        return false;
      }
    }

    if (!userId) {
      setError('You must be logged in to create a poll');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');

    try {
      setLoading(true);
      const newPoll = await createPoll(title.trim(), validOptions, userId!);
      
      if (!newPoll || !newPoll.id) {
        throw new AppError('Poll created but no ID returned', ErrorCodes.INTERNAL_ERROR);
      }

      router.push(`/polls/${newPoll.id}`);
    } catch (err: any) {
      logError(err, 'CreatePollPage - Submit');
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);

      if (isAuthError(err)) {
        setTimeout(() => router.push('/login'), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setTitle('');
    setOptions(['', '']);
    setError('');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <Navbar />
        
        <main className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-8 animate-fadeInUp">
            <button
              onClick={() => router.back()}
              className="mb-4 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
            >
              ← Back
            </button>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              Create New Poll
            </h1>
            <p className="text-gray-600 text-base sm:text-lg">Design your poll and share it with the community</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl animate-shake">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-700 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => setError('')}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 sm:p-8 space-y-6 border border-gray-100 animate-fadeInUp animation-delay-200">

            <div>
              <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                Poll Question <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                placeholder="What would you like to ask?"
                required
                disabled={loading}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                {title.length}/200 characters
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-bold text-gray-700">
                  Answer Options <span className="text-red-500">*</span>
                </label>
                <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  Minimum 2 options
                </span>
              </div>
              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex gap-2 animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                    <div className="flex-1 relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-semibold">
                        {index + 1}.
                      </span>
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
                        placeholder={`Option ${index + 1}`}
                        required
                        disabled={loading}
                        maxLength={100}
                      />
                    </div>
                    {options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(index)}
                        disabled={loading}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition-all duration-300 border border-red-200 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddOption}
                disabled={loading || options.length >= 10}
                className="mt-4 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 font-semibold transition-all duration-300 border border-blue-200 hover:border-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                + Add Another Option {options.length >= 10 && '(Max reached)'}
              </button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <div className="bg-blue-50/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-base">💡</span>
                  <span>Your poll will be visible to all users. You can close it anytime from the Manage Polls page.</span>
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClearForm}
                  disabled={loading}
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-none"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Poll...
                    </span>
                  ) : (
                    'Create Poll'
                  )}
                </button>
              </div>
            </div>
          </form>
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

          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }

          .animate-fadeInUp {
            animation: fadeInUp 0.8s ease-out forwards;
            opacity: 0;
          }

          .animation-delay-200 {
            animation-delay: 0.2s;
          }

          .animate-shake {
            animation: shake 0.4s ease-in-out;
          }

          .bg-grid-pattern {
            background-image: 
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px);
            background-size: 40px 40px;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}