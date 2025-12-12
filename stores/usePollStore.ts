// ==== FILE: src/stores/usePollStore.ts ====

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { pollApi, Poll } from '@/lib/api';

interface PollState {
  // State
  polls: Poll[];
  loading: boolean;
  error: string;
  filter: 'all' | 'active' | 'closed';
  isLiveConnected: boolean;
  lastUpdateTime: Date | null;
  sseError: string;
  
  // Computed values
  filteredPolls: () => Poll[];
  activePolls: () => number;
  closedPolls: () => number;
  
  // Actions
  setPolls: (polls: Poll[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
  setFilter: (filter: 'all' | 'active' | 'closed') => void;
  setIsLiveConnected: (connected: boolean) => void;
  setLastUpdateTime: (time: Date | null) => void;
  setSseError: (error: string) => void;
  
  updatePoll: (pollData: Poll) => void;
  addPoll: (poll: Poll) => void;
  fetchPolls: () => Promise<void>;
  
  // SSE Management
  eventSource: EventSource | null;
  reconnectTimeout: NodeJS.Timeout | null;
  retryCount: number;
  
  setupSSE: () => void;
  cleanupSSE: () => void;
  connectToSSE: () => void;
}

const getPollId = (poll: Poll | any): string => {
  if (!poll || !poll._id) return '';
  
  if (typeof poll._id === 'string') return poll._id;
  
  if (typeof poll._id === 'object') {
    if ('$oid' in poll._id) return poll._id.$oid;
    if ('toString' in poll._id) return poll._id.toString();
  }
  
  return '';
};

export const usePollStore = create<PollState>()(
  devtools(
    (set, get) => ({
      // Initial state
      polls: [],
      loading: false,
      error: '',
      filter: 'all',
      isLiveConnected: false,
      lastUpdateTime: null,
      sseError: '',
      eventSource: null,
      reconnectTimeout: null,
      retryCount: 0,

      // Computed values
      filteredPolls: () => {
        const { polls, filter } = get();
        if (filter === 'all') return polls;
        const isActive = filter === 'active';
        return polls.filter(poll => !poll.is_closed === isActive);
      },

      activePolls: () => {
        return get().polls.filter(p => !p.is_closed).length;
      },

      closedPolls: () => {
        return get().polls.filter(p => p.is_closed).length;
      },

      // Simple setters
      setPolls: (polls) => set({ polls }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      setFilter: (filter) => set({ filter }),
      setIsLiveConnected: (isLiveConnected) => set({ isLiveConnected }),
      setLastUpdateTime: (lastUpdateTime) => set({ lastUpdateTime }),
      setSseError: (sseError) => set({ sseError }),

      // Update a single poll
      updatePoll: (pollData: Poll) => {
        const pollId = getPollId(pollData);
        if (!pollId) return;

        set((state) => {
          const existingIndex = state.polls.findIndex(
            p => getPollId(p) === pollId
          );

          if (existingIndex >= 0) {
            const newPolls = [...state.polls];
            newPolls[existingIndex] = {
              ...state.polls[existingIndex],
              ...pollData,
              id: state.polls[existingIndex].id
            };
            return { 
              polls: newPolls,
              lastUpdateTime: new Date()
            };
          }

          return state;
        });
      },

      // Add a new poll
      addPoll: (poll: Poll) => {
        set((state) => ({
          polls: [...state.polls, poll],
          lastUpdateTime: new Date()
        }));
      },

      // Fetch polls from API
      fetchPolls: async () => {
        set({ loading: true, error: '' });
        
        try {
          console.log('📥 Fetching polls...');
          const data = await pollApi.getAllPolls();
          console.log('✅ Fetched', data.length, 'polls');
          
          set({ 
            polls: data, 
            loading: false,
            error: ''
          });
          
          // Setup SSE after successful fetch
          get().setupSSE();
        } catch (err: any) {
          console.error('❌ Failed to fetch polls:', err);
          set({ 
            error: err.message || 'Failed to load polls',
            loading: false
          });
        }
      },

      // Setup SSE connection
      setupSSE: () => {
        get().cleanupSSE();
        set({ retryCount: 0, sseError: '' });
        get().connectToSSE();
      },

      // Cleanup SSE
      cleanupSSE: () => {
        const { eventSource, reconnectTimeout } = get();
        
        if (eventSource) {
          console.log('🔌 Closing SSE connection');
          eventSource.close();
          set({ eventSource: null });
        }
        
        if (reconnectTimeout) {
          clearTimeout(reconnectTimeout);
          set({ reconnectTimeout: null });
        }
      },

      // Connect to SSE
      connectToSSE: () => {
        const { retryCount } = get();
        
        // Don't retry more than 5 times
        if (retryCount > 5) {
          console.log('❌ Max SSE retries reached');
          set({ 
            isLiveConnected: false,
            sseError: 'Failed to connect to live updates after 5 attempts'
          });
          return;
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
          const url = `${baseUrl}/api/polls/results/stream`;
          
          console.log(`🔄 Connecting to SSE (attempt ${retryCount + 1}/6):`, url);
          
          const eventSource = new EventSource(url, { 
            withCredentials: true 
          });

          eventSource.onopen = () => {
            console.log('✅ SSE connection established');
            set({ 
              isLiveConnected: true,
              sseError: '',
              retryCount: 0
            });
          };

          eventSource.onmessage = (event) => {
            try {
              // Skip keep-alive messages
              if (event.data === 'keep-alive' || event.data === ':keep-alive') {
                console.log('💓 Keep-alive');
                return;
              }

              const pollData = JSON.parse(event.data);
              
              // Handle heartbeat
              if (pollData.heartbeat) {
                console.log('💓 Heartbeat');
                return;
              }
              
              // Handle errors
              if (pollData.error) {
                console.error('⚠️ SSE error message:', pollData.error);
                return;
              }

              // Update poll
              const pollId = getPollId(pollData);
              if (!pollId) {
                console.warn('⚠️ Received poll without valid ID');
                return;
              }

              console.log('📊 Poll update:', pollId);
              
              const state = get();
              const existingPoll = state.polls.find(p => getPollId(p) === pollId);
              
              if (existingPoll) {
                get().updatePoll(pollData);
              } else {
                get().addPoll(pollData);
              }
            } catch (err) {
              console.error('❌ Error parsing SSE:', err);
            }
          };

          eventSource.onerror = (err) => {
            console.error('❌ SSE error:', err);
            
            set({ isLiveConnected: false });
            
            const currentEventSource = get().eventSource;
            if (currentEventSource) {
              currentEventSource.close();
              set({ eventSource: null });
            }
            
            // Retry with exponential backoff
            const currentRetryCount = get().retryCount;
            const newRetryCount = currentRetryCount + 1;
            const backoffTime = Math.min(1000 * Math.pow(2, newRetryCount - 1), 30000);
            
            set({ 
              retryCount: newRetryCount,
              sseError: `Connection lost. Retrying in ${Math.round(backoffTime / 1000)}s...`
            });
            
            console.log(`🔄 Reconnecting in ${backoffTime}ms (attempt ${newRetryCount}/5)`);
            
            const timeout = setTimeout(() => {
              get().connectToSSE();
            }, backoffTime);
            
            set({ reconnectTimeout: timeout });
          };

          set({ eventSource });
        } catch (err) {
          console.error('❌ Failed to create SSE:', err);
          set({ 
            isLiveConnected: false,
            sseError: 'Failed to establish connection'
          });
        }
      },
    }),
    { name: 'PollStore' }
  )
);