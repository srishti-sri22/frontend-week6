const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';

export interface Poll {
  id: string;
  question: string;
  creator_id: string;
  options: PollOption[];
  is_closed: boolean;
  created_at: string;
  total_votes: number;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  voters: string[];
}

export const authApi = {
  registerStart: async (username: string, displayName: string) => {
    const trimmedUsername = username.trim();
    const trimmedDisplayName = displayName.trim();

    const res = await fetch(`${API_BASE_URL}/auth/register/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: trimmedUsername, display_name: trimmedDisplayName })
    });

    if (!res.ok) {
      if (res.status === 409) {
        throw new Error('USERNAME_EXISTS');
      }
      // Try to parse JSON error, fallback to text
      try {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      } catch (jsonError) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed');
      }
    }
    return res.json();
  },

  registerFinish: async (username: string, credential: any) => {
    const trimmedUsername = username.trim();

    const res = await fetch(`${API_BASE_URL}/auth/register/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: trimmedUsername, credential }),
    });

    if (!res.ok) {
      try {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || 'Registration failed');
      } catch (jsonError) {
        const errorText = await res.text();
        throw new Error(errorText || 'Registration failed');
      }
    }
    return res.json();
  },

  authStart: async (username: string) => {
    const trimmedUsername = username.trim();

    const res = await fetch(`${API_BASE_URL}/auth/login/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: trimmedUsername })
    });

    if (!res.ok) {
      try {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || 'Authentication start failed');
      } catch (jsonError) {
        const errorText = await res.text();
        throw new Error(errorText || 'Authentication start failed');
      }
    }
    return res.json();
  },

  authFinish: async (username: string, credential: any) => {
    const trimmedUsername = username.trim();

    const res = await fetch(`${API_BASE_URL}/auth/login/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: trimmedUsername, credential }),
    });

    if (!res.ok) {
      try {
        const errorData = await res.json();
        throw new Error(errorData.detail || errorData.message || 'Authentication failed');
      } catch (jsonError) {
        const errorText = await res.text();
        throw new Error(errorText || 'Authentication failed');
      }
    }
    return res.json();
  },

  logout: async () => {
    const res = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Logout failed');
    return Promise.resolve();
  }
};

export const pollApi = {
  createPoll: async (question: string, options: string[], creatorId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        question,
        options,
        creator_id: creatorId
      }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to create poll');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create poll');
      }
    }

    return response.json();
  },

  getPoll: async (pollId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch poll');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch poll');
      }
    }
    return response.json();
  },

  getUserPolls: async (userId: string): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE_URL}/polls/user/${userId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch user polls');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch user polls');
      }
    }
    return response.json();
  },

  getAllPolls: async (): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      credentials: 'include'
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to fetch polls');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to fetch polls');
      }
    }
    return response.json();
  },

  castVote: async (pollId: string, optionId: string, userId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        user_id: userId,
        option_id: optionId
      }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to cast vote');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to cast vote');
      }
    }

    return response.json();
  },

  changeVote: async (pollId: string, userId: string, optionId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/change/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        user_id: userId,
        option_id: optionId
      }),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to change vote');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to change vote');
      }
    }
    return response.json();
  },

  closePoll: async (pollId: string, userId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/close`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to close poll');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to close poll');
      }
    }
    return response.json();
  },

  resetPoll: async (pollId: string, userId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId }),
    });
    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.detail || errorData.message || 'Failed to reset poll');
      } catch (jsonError) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to reset poll');
      }
    }
    return response.json();
  },

  checkUserVote: async (pollId: string, userId: string): Promise<{ has_voted: boolean; option_id?: string }> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote/check?user_id=${userId}`, {
      method: 'GET',
      credentials: 'include',
    });
    if (!response.ok) {
      return { has_voted: false };
    }
    return response.json();
  },
};