import { useState } from 'react';
import { authApi } from '@/lib/api';
import { bufToB64, b64ToBuf } from '@/lib/webauthn';

export const usePasskeyRegister = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const register = async (username: string) => {
        if (!username) {
            setError('Username is required');
            return null;
        }

        setLoading(true);
        setError(null);

        try {
            const options = await authApi.registerStart(username);

            options.publicKey.challenge = b64ToBuf(options.publicKey.challenge);
            options.publicKey.user.id = b64ToBuf(options.publicKey.user.id);

            const credential: any = await navigator.credentials.create(options);
            console.log(credential);
            
            const credentialPayload = {
                id: credential.id,
                rawId: bufToB64(credential.rawId),
                type: credential.type,
                response: {
                    clientDataJSON: bufToB64(credential.response.clientDataJSON),
                    attestationObject: bufToB64(credential.response.attestationObject),
                },
            };

            const result = await authApi.registerFinish(username, credentialPayload);

            setLoading(false);
            return result;
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.message);
            setLoading(false);
            return null;
        }
    };

    return { register, loading, error };
};