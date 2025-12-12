'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authApi } from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import { b64ToBuf, bufToB64 } from '@/lib/webauthn';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Step 1: Start authentication - get challenge from server
      const startResponse = await authApi.authStart(username);
      
      console.log('Auth start response:', startResponse);
      
      // Validate response structure
      if (!startResponse || !startResponse.publicKey) {
        throw new Error('Invalid response from server: missing publicKey');
      }

      const { publicKey } = startResponse;
      
      // Step 2: Convert the challenge options for WebAuthn API
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

      console.log('Credential request options:', publicKeyCredentialRequestOptions);

      // Step 3: Get credential using WebAuthn API
      const credential = await navigator.credentials.get({
        publicKey: publicKeyCredentialRequestOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      console.log('Credential retrieved:', credential);

      // Step 4: Prepare credential data for server
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

      console.log('Sending credential data:', credentialData);

      // Step 5: Finish authentication - send credential to server
      const response = await authApi.authFinish(username, credentialData);
      
      console.log('Authentication response:', response);
      
      console.log({ response_user_id: response.user_id});
      // Save auth data
      if (response.success && response.username) {
        setAuthData(response.username, response.user_id);
        
        // Redirect to homepage
        router.push('/homepage');
      } else {
        throw new Error('Authentication completed but response format unexpected');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-md mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Welcome Back</h1>
          <p className="text-gray-600 mb-8 text-center">Login with your Passkey</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                placeholder="Enter your username"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login with Passkey'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}