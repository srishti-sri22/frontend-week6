'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authApi } from '@/lib/api';
import { useStore } from '@/lib/store';
import { b64ToBuf, bufToB64 } from '@/lib/webauthn';
import { getUserFriendlyMessage, logError, isAuthError, AppError, ErrorCodes } from '@/lib/errorHandler';

export default function LoginPage() {
  const router = useRouter();
  const setUser = useStore((state) => state.setUser);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!username.trim()) {
        throw new AppError('Username is required', ErrorCodes.VALIDATION_ERROR);
      }

      const startResponse = await authApi.authStart(username);
            
      if (!startResponse || !startResponse.publicKey) {
        throw new AppError('Invalid response from server: missing publicKey', ErrorCodes.AUTHENTICATION_ERROR);
      }

      const { publicKey } = startResponse;
      
      const publicKeyCredentialRequestOptions: PublicKeyCredentialRequestOptions = {
        challenge: b64ToBuf(publicKey.challenge),
        timeout: publicKey.timeout,
        rpId: publicKey.rpId,
        allowCredentials: publicKey.allowCredentials?.map((cred: any) => ({
          id: b64ToBuf(cred.id),
          type: cred.type,
          transports: cred.transports,
        })),
        userVerification: publicKey.userVerification || 'preferred',
      };

      let credential: PublicKeyCredential | null = null;
      
      try {
        credential = await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions,
        }) as PublicKeyCredential;
      } catch (credError: any) {
        logError(credError, 'LoginPage - Credential Get');
        
        if (credError.name === 'NotAllowedError') {
          throw new AppError('Passkey authentication was cancelled', ErrorCodes.WEBAUTHN_ERROR);
        } else if (credError.name === 'InvalidStateError') {
          throw new AppError('No passkey found for this account', ErrorCodes.WEBAUTHN_ERROR);
        } else {
          throw new AppError('Failed to retrieve passkey. Please try again.', ErrorCodes.WEBAUTHN_ERROR);
        }
      }

      if (!credential) {
        throw new AppError('Failed to get credential', ErrorCodes.WEBAUTHN_ERROR);
      }

      const assertionResponse = credential.response as AuthenticatorAssertionResponse;
      const credentialData = {
        id: credential.id,
        rawId: bufToB64(credential.rawId),
        type: credential.type,
        response: {
          authenticatorData: bufToB64(assertionResponse.authenticatorData),
          clientDataJSON: bufToB64(assertionResponse.clientDataJSON),
          signature: bufToB64(assertionResponse.signature),
          userHandle: assertionResponse.userHandle ? bufToB64(assertionResponse.userHandle) : null,
        },
      };
      
      const response = await authApi.authFinish(username, credentialData);


      if (!response.success || !response.username) {
        throw new AppError('Authentication completed but response format unexpected', ErrorCodes.AUTHENTICATION_ERROR);
      }

      setUser(response.username, response.user_id, response.display_name);
      
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('username', response.username);
          localStorage.setItem('user_id', response.user_id);
          localStorage.setItem('display_name', response.display_name);
        } catch (storageError) {
          logError(storageError, 'LoginPage - LocalStorage');
        }
      }
      
      router.push('/homepage');
    } catch (err: any) {
      logError(err, 'LoginPage - Login');
      
      const errorMessage = getUserFriendlyMessage(err);
      setError(errorMessage);
      
      if (isAuthError(err)) {
        console.error('Authentication failed:', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <Navbar />
      
      <main className="relative max-w-md mx-auto px-4 py-12 sm:py-20">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100 animate-fadeInUp">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🔐</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-600">Sign in with your Passkey to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl animate-shake">
              <div className="flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div className="flex-1">
                  <p className="text-red-700 font-medium text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-700 placeholder-gray-400"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Authenticating...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🔑</span>
                  <span>Login with Passkey</span>
                </span>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-center text-gray-600 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          <div className="mt-6">
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs text-gray-600 text-center">
                🔒 Secured with Passkey authentication
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center animate-fadeInUp animation-delay-200">
          <Link href="/" className="text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors">
            ← Back to home
          </Link>
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

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
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
  );
}