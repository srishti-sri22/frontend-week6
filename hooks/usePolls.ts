import { useCallback } from 'react';
import { useStore } from '@/lib/store';
import { pollApi } from '@/lib/api';

export const usePolls = () => {
  const {
    polls,
    userPolls,
    currentPoll,
    pollsLoading,
    pollsError,
    setPolls,
    setUserPolls,
    setCurrentPoll,
    updatePoll,
    setPollsLoading,
    setPollsError,
    userId,
  } = useStore();

  const fetchAllPolls = useCallback(async () => {
    try {
      setPollsLoading(true);
      setPollsError(null);
      const data = await pollApi.getAllPolls();
      setPolls(data);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load polls';
      setPollsError(errorMessage);
      throw error;
    } finally {
      setPollsLoading(false);
    }
  }, [setPolls, setPollsLoading, setPollsError]);

  const fetchUserPolls = useCallback(async (userIdParam?: string) => {
    const id = userIdParam || userId;
    if (!id) return;

    try {
      setPollsLoading(true);
      setPollsError(null);
      const data = await pollApi.getUserPolls(id);
      setUserPolls(data);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load your polls';
      setPollsError(errorMessage);
      throw error;
    } finally {
      setPollsLoading(false);
    }
  }, [userId, setUserPolls, setPollsLoading, setPollsError]);

  const fetchPollById = useCallback(async (pollId: string) => {
    try {
      setPollsLoading(true);
      setPollsError(null);
      const data = await pollApi.getPoll(pollId);
      setCurrentPoll(data);
      updatePoll(pollId, data);
      return data;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load poll';
      setPollsError(errorMessage);
      throw error;
    } finally {
      setPollsLoading(false);
    }
  }, [setCurrentPoll, updatePoll, setPollsLoading, setPollsError]);

  const createPoll = useCallback(async (question: string, options: string[], creatorId: string) => {
    try {
      setPollsLoading(true);
      setPollsError(null);
      const newPoll = await pollApi.createPoll(question, options, creatorId);
      await fetchAllPolls();
      if (creatorId === userId) {
        await fetchUserPolls();
      }
      return newPoll;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create poll';
      setPollsError(errorMessage);
      throw error;
    } finally {
      setPollsLoading(false);
    }
  }, [userId, fetchAllPolls, fetchUserPolls, setPollsLoading, setPollsError]);

  const closePoll = useCallback(async (pollId: string, userIdParam: string) => {
    try {
      await pollApi.closePoll(pollId, userIdParam);
      await fetchPollById(pollId);
      await fetchUserPolls();
    } catch (error: any) {
      throw error;
    }
  }, [fetchPollById, fetchUserPolls]);

  const resetPoll = useCallback(async (pollId: string, userIdParam: string) => {
    try {
      await pollApi.resetPoll(pollId, userIdParam);
      await fetchPollById(pollId);
      await fetchUserPolls();
    } catch (error: any) {
      throw error;
    }
  }, [fetchPollById, fetchUserPolls]);

  return {
    polls,
    userPolls,
    currentPoll,
    pollsLoading,
    pollsError,
    fetchAllPolls,
    fetchUserPolls,
    fetchPollById,
    createPoll,
    closePoll,
    resetPoll,
  };
};