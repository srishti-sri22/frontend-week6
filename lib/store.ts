import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Poll } from './api';

interface UserState {
  username: string | null;
  userId: string | null;
  displayName: string | null;
  isAuthenticated: boolean;
  isLoggedIn: boolean;
  registeredUsername: string | null; // Store username after registration for auto-fill on login
}

interface PollState {
  polls: Poll[];
  userPolls: Poll[];
  currentPoll: Poll | null;
  pollsLoading: boolean;
  pollsError: string | null;
}

interface VoteState {
  userVotes: Record<string, { pollId: string; optionId: string }>;
}

interface AppState extends UserState, PollState, VoteState {
  setUser: (username: string | null, userId: string | null, displayName?: string | null) => void;
  setLoggedIn: (isLoggedIn: boolean) => void;
  setRegisteredUsername: (username: string | null) => void;
  clearUser: () => void;
  setPolls: (polls: Poll[]) => void;
  setUserPolls: (polls: Poll[]) => void;
  setCurrentPoll: (poll: Poll | null) => void;
  updatePoll: (pollId: string, updatedPoll: Poll) => void;
  setPollsLoading: (loading: boolean) => void;
  setPollsError: (error: string | null) => void;
  addUserVote: (pollId: string, optionId: string) => void;
  updateUserVote: (pollId: string, optionId: string) => void;
  getUserVote: (pollId: string) => { pollId: string; optionId: string } | null;
  clearVotes: () => void;
  clearUserVote: (pollId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      username: null,
      userId: null,
      displayName: null,
      isAuthenticated: false,
      isLoggedIn: false,
      registeredUsername: null,
      polls: [],
      userPolls: [],
      currentPoll: null,
      pollsLoading: false,
      pollsError: null,
      userVotes: {},

      setUser: (username, userId, displayName = null) =>
        set({
          username,
          userId,
          displayName,
          isAuthenticated: !!(username && userId),
        }),

      setLoggedIn: (isLoggedIn) =>
        set({ isLoggedIn }),

      setRegisteredUsername: (username) =>
        set({ registeredUsername: username }),

      clearUser: () =>
        set({
          username: null,
          userId: null,
          displayName: null,
          isAuthenticated: false,
          isLoggedIn: false,
          registeredUsername: null,
          userPolls: [],
          userVotes: {},
        }),

      setPolls: (polls) => set({ polls }),

      setUserPolls: (polls) => set({ userPolls: polls }),

      setCurrentPoll: (poll) => set({ currentPoll: poll }),

      updatePoll: (pollId, updatedPoll) =>
        set((state) => ({
          polls: state.polls.map((p) => (p.id === pollId ? updatedPoll : p)),
          userPolls: state.userPolls.map((p) => (p.id === pollId ? updatedPoll : p)),
          currentPoll: state.currentPoll?.id === pollId ? updatedPoll : state.currentPoll,
        })),

      setPollsLoading: (loading) => set({ pollsLoading: loading }),

      setPollsError: (error) => set({ pollsError: error }),

      addUserVote: (pollId, optionId) =>
        set((state) => ({
          userVotes: {
            ...state.userVotes,
            [pollId]: { pollId, optionId },
          },
        })),

      updateUserVote: (pollId, optionId) =>
        set((state) => ({
          userVotes: {
            ...state.userVotes,
            [pollId]: { pollId, optionId },
          },
        })),

      getUserVote: (pollId) => {
        const state = get();
        return state.userVotes[pollId] || null;
      },

      clearVotes: () => set({ userVotes: {} }),

      clearUserVote: (pollId) =>
        set((state) => {
          const updatedVotes = { ...state.userVotes };
          delete updatedVotes[pollId];
          return { userVotes: updatedVotes };
        }),
    }),
    {
      name: 'poll-app-storage',
      partialize: (state) => ({
        username: state.username,
        userId: state.userId,
        displayName: state.displayName,
        isAuthenticated: state.isAuthenticated,
        isLoggedIn: state.isLoggedIn,
        registeredUsername: state.registeredUsername,
        userVotes: state.userVotes,
      }),
    }
  )
);