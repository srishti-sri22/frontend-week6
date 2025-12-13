'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { authApi } from '@/lib/api';
import { setAuthData } from '@/lib/auth';
import { b64ToBuf, bufToB64 } from '@/lib/webauthn';

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
            const startResponse = await authApi.registerStart(username);

            console.log('Start response:', startResponse);

            if (!startResponse || !startResponse.publicKey) {
                throw new Error('Invalid response from server: missing publicKey');
            }

            const { publicKey } = startResponse;

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

            const credential = await navigator.credentials.create({
                publicKey: publicKeyCredentialCreationOptions,
            }) as PublicKeyCredential;

            if (!credential) {
                throw new Error('Failed to create credential');
            }

            console.log('Credential created:', credential);

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

            const response = await authApi.registerFinish(username, credentialData);

            console.log('Registration response:', response);

            console.log({uid: response.user_id});
            
            if (response.success && response.username) {
                setAuthData(response.username,  response.user_id);
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
            
            <Navbar />

            <main className="relative max-w-md mx-auto px-4 py-12 sm:py-20">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-100 animate-fadeInUp">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl">✨</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
                        <p className="text-gray-600">Register with Passkeys for secure access</p>
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

                    <form onSubmit={handleRegister} className="space-y-6">
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
                                placeholder="Choose a username"
                                required
                                minLength={3}
                            />
                            <p className="mt-2 text-xs text-gray-500">Must be at least 3 characters long</p>
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
                                    <span>Creating account...</span>
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <span>🔑</span>
                                    <span>Create Account with Passkey</span>
                                </span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100">
                        <p className="text-center text-gray-600 text-sm">
                            Already have an account?{' '}
                            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline transition-colors">
                                Sign in here
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6">
                        <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100">
                            <p className="text-xs text-gray-600 text-center">
                                🔒 Your passkey will be stored securely on your device
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