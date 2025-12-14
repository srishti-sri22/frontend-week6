import { useState } from 'react';
import { authApi } from '@/lib/api';
import { bufToB64, b64ToBuf } from '@/lib/webauthn';

export const usePasskeyLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (username: string) => {
    if (!username) {
      setError('Username is required');
      return null;
    }

    setLoading(true);
    setError(null);

    try {

      const options = await authApi.authStart(username);

      options.publicKey.challenge = b64ToBuf(options.publicKey.challenge);
      options.publicKey.allowCredentials = options.publicKey.allowCredentials.map((c: any) => ({
        ...c,
        id: b64ToBuf(c.id),
      }));

      const credential: any = await navigator.credentials.get(options);

      const credentialPayload = {
        id: credential.id,
        rawId: bufToB64(credential.rawId),
        type: credential.type,
        response: {
          clientDataJSON: bufToB64(credential.response.clientDataJSON),
          authenticatorData: bufToB64(credential.response.authenticatorData),
          signature: bufToB64(credential.response.signature),
          userHandle: credential.response.userHandle ? bufToB64(credential.response.userHandle) : null,
        },
      };
      const result = await authApi.authFinish(username, credentialPayload);
      setLoading(false);
      return result;
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return { login, loading, error };
};