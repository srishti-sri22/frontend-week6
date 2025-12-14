import { log } from "console";

const API_BASE_URL = 'http://127.0.0.1:8000/api';

export interface Poll {
  id: string ;
  question: string;
  creator_id: string;  
  options: PollOption[];
  is_closed: boolean;
  created_at: string;
  updated_at: string,
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
    const res = await fetch(`${API_BASE_URL}/auth/register/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, display_name: displayName })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Registration start error:', errorText);
      throw new Error(errorText || 'Registration start failed');
    }
    return res.json();
  },
  registerFinish: async (username: string, credential: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/register/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, credential }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Registration finish error:', errorText);
      throw new Error(errorText || 'Registration failed');
    }
    return res.json();
  },

  authStart: async (username: string) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username })
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Auth start error:', errorText);
      throw new Error(errorText || 'Authentication start failed');
    }
    return res.json();
  },

  authFinish: async (username: string, credential: any) => {
    const res = await fetch(`${API_BASE_URL}/auth/login/finish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, credential }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Auth finish error:', errorText);
      throw new Error(errorText || 'Authentication failed');
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
    console.log('Creating poll with creator_id:', creatorId);
    
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
      const errorText = await response.text();
      console.error('Create poll error:', errorText);
      throw new Error(errorText || 'Failed to create poll');
    }
    
    return response.json();
  },

  getPoll: async (pollId: string): Promise<Poll> => {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
      credentials: 'include'
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch poll');
    }
    return response.json();
  },

  getUserPolls: async (userId: string): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE_URL}/polls/user/${userId}`, {
      credentials: 'include'
    });
    console.log("Get User Polls", response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch user polls');
    }
    return response.json();
  },

  getAllPolls: async (): Promise<Poll[]> => {
    const response = await fetch(`${API_BASE_URL}/polls`, {
      credentials: 'include'
    });
    console.log("getAllPolls function responsse", response);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to fetch polls');
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
    console.log(response);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to cast vote');
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
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to change vote');
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
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to close poll');
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
      const errorText = await response.text();
      throw new Error(errorText || 'Failed to reset poll');
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