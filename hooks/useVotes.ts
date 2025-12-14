import { useCallback, useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { pollApi } from '@/lib/api';

export const useVotes = (pollId?: string) => {
  const {
    userId,
    addUserVote,
    updateUserVote,
    getUserVote,
    clearUserVote,
  } = useStore();

  const [hasVoted, setHasVoted] = useState(false);
  const [votedOptionId, setVotedOptionId] = useState<string | null>(null);
  const [checkingVote, setCheckingVote] = useState(false);

  const checkUserVote = useCallback(
    async (pollIdParam: string, userIdParam: string) => {
      try {
        setCheckingVote(true);

        const localVote = getUserVote(pollIdParam);

        if (localVote) {
          setHasVoted(true);
          setVotedOptionId(localVote.optionId);
          return { has_voted: true, option_id: localVote.optionId };
        }

        const voteCheck = await pollApi.checkUserVote(pollIdParam, userIdParam);

        if (!voteCheck.has_voted) {
          clearUserVote(pollIdParam);
          setHasVoted(false);
          setVotedOptionId(null);
          return { has_voted: false };
        }

        if (voteCheck.option_id) {
          addUserVote(pollIdParam, voteCheck.option_id);
          setHasVoted(true);
          setVotedOptionId(voteCheck.option_id);
        }

        return voteCheck;
      } catch {
        clearUserVote(pollIdParam);
        setHasVoted(false);
        setVotedOptionId(null);
        return { has_voted: false };
      } finally {
        setCheckingVote(false);
      }
    },
    [getUserVote, addUserVote, clearUserVote]
  );

  const castVote = useCallback(
    async (pollIdParam: string, optionId: string, userIdParam: string) => {
      const result = await pollApi.castVote(pollIdParam, optionId, userIdParam);
      addUserVote(pollIdParam, optionId);
      setHasVoted(true);
      setVotedOptionId(optionId);
      return result;
    },
    [addUserVote]
  );

  const changeVote = useCallback(
    async (pollIdParam: string, userIdParam: string, optionId: string) => {
      const result = await pollApi.changeVote(pollIdParam, userIdParam, optionId);
      updateUserVote(pollIdParam, optionId);
      setHasVoted(true);
      setVotedOptionId(optionId);
      return result;
    },
    [updateUserVote]
  );

  useEffect(() => {
    if (pollId && userId) {
      checkUserVote(pollId, userId);
    }
  }, [pollId, userId, checkUserVote]);

  return {
    hasVoted,
    votedOptionId,
    checkingVote,
    checkUserVote,
    castVote,
    changeVote,
  };
};
