'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authApi } from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import { b64ToBuf, bufToB64 } from '@/lib/webauthn';
import { log } from 'console';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Step 1: Start registration - get challenge from server
            const startResponse = await authApi.registerStart(username);

            console.log('Start response:', startResponse);

            // Validate response structure
            if (!startResponse || !startResponse.publicKey) {
                throw new Error('Invalid response from server: missing publicKey');
            }

            const { publicKey } = startResponse;

            // Step 2: Convert the challenge options for WebAuthn API
            const publicKeyCredentialCreationOptions: PublicKeyCredentialCreationOptions = {
                challenge: b64ToBuf(publicKey.challenge),
                rp: {
                    name: publicKey.rp.name,
                    id: publicKey.rp.id,
                },
                user: {
                    id: b64ToBuf(publicKey.user.id),
                    name: publicKey.user.name,
                    displayName: publicKey.user.displayName,
                },
                pubKeyCredParams: publicKey.pubKeyCredParams,
                timeout: publicKey.timeout,
                attestation: publicKey.attestation || 'none',
                authenticatorSelection: publicKey.authenticatorSelection,
            };

            console.log('Credential creation options:', publicKeyCredentialCreationOptions);

            // Step 3: Create credential using WebAuthn API
            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to create credential');
            }

            console.log('Credential created:', credential);

            // Step 4: Prepare credential data for server (matching webauthn-rs RegisterPublicKeyCredential)
            const attestationResponse = credential.response as AuthenticatorAttestationResponse;
            const credentialData = {
                id: credential.id,
                rawId: bufToB64(credential.rawId),
                type: credential.type,
                response: {
                    attestationObject: bufToB64(attestationResponse.attestationObject),
                    clientDataJSON: bufToB64(attestationResponse.clientDataJSON),
                },
            };

            console.log('Sending credential data:', credentialData);

            // Step 5: Finish registration - send credential to server
            const response = await authApi.registerFinish(username, credentialData);

            console.log('Registration response:', response);

            console.log({uid: response.user_id});
            
            // Save auth data and redirect to login
            if (response.success && response.username) {
                setAuthData(response.username,  response.user_id);

                // Redirect to login page after successful registration
                router.push('/login');
            } else {
                throw new Error('Registration completed but response format unexpected');
            }
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="max-w-md mx-auto px-4 py-16">
                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">Create Account</h1>
                    <p className="text-gray-600 mb-8 text-center">Register with Passkeys for secure access</p>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-6">
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
                                minLength={3}
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
                                    Registering...
                                </span>
                            ) : (
                                'Register with Passkey'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                                Login here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <Link href="/homepage" className="text-gray-600 hover:text-gray-700">
                            ← Back to Homepage
                        </Link>
                    </div>

                </div>
            </main>
        </div>
    );
}