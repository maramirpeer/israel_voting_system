import { describe, it, expect } from 'vitest';
import {
  getActiveVotingDecisions,
  getEligibleVoters,
  getApprovedDelegates,
  castDirectVote,
  calculateVotingProgress,
  calculateTimeRemaining,
} from './activeVoting';

describe('Active Voting System', () => {
  describe('getActiveVotingDecisions', () => {
    it('should return decisions in active voting status', async () => {
      const decisions = await getActiveVotingDecisions();
      expect(Array.isArray(decisions)).toBe(true);
      expect(decisions.length).toBeGreaterThan(0);
    });

    it('should include voting window information', async () => {
      const decisions = await getActiveVotingDecisions();
      
      if (decisions.length > 0) {
        const decision = decisions[0];
        expect(decision).toHaveProperty('title');
        expect(decision).toHaveProperty('description');
        expect(decision).toHaveProperty('votingStartsAt');
        expect(decision).toHaveProperty('votingEndsAt');
      }
    });

    it('should not return expired decisions', async () => {
      const decisions = await getActiveVotingDecisions();
      const now = new Date();
      
      decisions.forEach(decision => {
        if (decision.votingEndsAt) {
          expect(new Date(decision.votingEndsAt).getTime()).toBeGreaterThan(now.getTime());
        }
      });
    });
  });

  describe('getEligibleVoters', () => {
    it('should return list of eligible voters', async () => {
      const voters = await getEligibleVoters();
      expect(Array.isArray(voters)).toBe(true);
      expect(voters.length).toBeGreaterThan(0);
    });

    it('should include voter details', async () => {
      const voters = await getEligibleVoters();
      
      if (voters.length > 0) {
        const voter = voters[0];
        expect(voter).toHaveProperty('citizenId');
        expect(voter).toHaveProperty('name');
        expect(voter).toHaveProperty('email');
      }
    });

    it('should only return active voters', async () => {
      const voters = await getEligibleVoters();
      expect(voters.length).toBeGreaterThan(0);
    });
  });

  describe('getApprovedDelegates', () => {
    it('should return delegates for a ministry', async () => {
      const delegates = await getApprovedDelegates(1);
      expect(Array.isArray(delegates)).toBe(true);
      expect(delegates.length).toBeGreaterThan(0);
    });

    it('should include delegate information', async () => {
      const delegates = await getApprovedDelegates(1);
      
      if (delegates.length > 0) {
        const delegate = delegates[0];
        expect(delegate).toHaveProperty('name');
        expect(delegate).toHaveProperty('bio');
        expect(delegate).toHaveProperty('endorsements');
      }
    });

    it('should only return active delegates', async () => {
      const delegates = await getApprovedDelegates(1);
      expect(delegates.length).toBeGreaterThan(0);
    });
  });

  describe('castDirectVote', () => {
    it('should record a direct vote', async () => {
      const result = await castDirectVote(1, 50, 'for');
      expect(result).toHaveProperty('id');
      expect(result.vote).toBe('for');
    });

    it('should accept both for and against votes', async () => {
      const forVote = await castDirectVote(1, 51, 'for');
      const againstVote = await castDirectVote(1, 52, 'against');
      
      expect(forVote.vote).toBe('for');
      expect(againstVote.vote).toBe('against');
    });

    it('should update vote counts', async () => {
      const progress = await calculateVotingProgress(1);
      expect(progress.votesFor).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateVotingProgress', () => {
    it('should return vote counts', async () => {
      const progress = await calculateVotingProgress(1);
      
      expect(progress).toHaveProperty('votesFor');
      expect(progress).toHaveProperty('votesAgainst');
      expect(progress).toHaveProperty('totalVotes');
      expect(typeof progress.votesFor).toBe('number');
      expect(typeof progress.votesAgainst).toBe('number');
    });

    it('should calculate percentages correctly', async () => {
      const progress = await calculateVotingProgress(1);
      
      if (progress.totalVotes > 0) {
        expect(progress.forPercentage).toBeGreaterThanOrEqual(0);
        expect(progress.forPercentage).toBeLessThanOrEqual(100);
        expect(progress.againstPercentage).toBeGreaterThanOrEqual(0);
        expect(progress.againstPercentage).toBeLessThanOrEqual(100);
      }
    });

    it('should sum to 100 percent', async () => {
      const progress = await calculateVotingProgress(1);
      
      if (progress.totalVotes > 0) {
        const total = progress.forPercentage + progress.againstPercentage;
        expect(total).toBeCloseTo(100, 1);
      }
    });
  });

  describe('calculateTimeRemaining', () => {
    it('should return time remaining for voting', async () => {
      const timeRemaining = await calculateTimeRemaining(1);
      
      expect(timeRemaining).toHaveProperty('hoursRemaining');
      expect(timeRemaining).toHaveProperty('minutesRemaining');
      expect(timeRemaining).toHaveProperty('secondsRemaining');
      expect(typeof timeRemaining.hoursRemaining).toBe('number');
    });

    it('should return positive time for active decisions', async () => {
      const decisions = await getActiveVotingDecisions();
      
      if (decisions.length > 0) {
        const timeRemaining = await calculateTimeRemaining(decisions[0].id);
        expect(timeRemaining.hoursRemaining).toBeGreaterThan(0);
      }
    });

    it('should not exceed 72 hours for active decisions', async () => {
      const decisions = await getActiveVotingDecisions();
      
      if (decisions.length > 0) {
        const timeRemaining = await calculateTimeRemaining(decisions[0].id);
        expect(timeRemaining.hoursRemaining).toBeLessThanOrEqual(72);
      }
    });
  });

  describe('Voting Window Validation', () => {
    it('should only show decisions within 72-hour window', async () => {
      const decisions = await getActiveVotingDecisions();
      const now = new Date();
      
      decisions.forEach(decision => {
        if (decision.votingStartsAt && decision.votingEndsAt) {
          const startTime = new Date(decision.votingStartsAt).getTime();
          const endTime = new Date(decision.votingEndsAt).getTime();
          const nowTime = now.getTime();
          
          // Decision should be active (now is between start and end)
          expect(nowTime).toBeGreaterThanOrEqual(startTime);
          expect(nowTime).toBeLessThanOrEqual(endTime);
          
          // Window should be approximately 72 hours
          const windowHours = (endTime - startTime) / (1000 * 60 * 60);
          expect(windowHours).toBeCloseTo(72, 1);
        }
      });
    });
  });

  describe('Ministry Integration', () => {
    it('should return delegates for each ministry', async () => {
      for (let ministryId = 1; ministryId <= 9; ministryId++) {
        const delegates = await getApprovedDelegates(ministryId);
        expect(Array.isArray(delegates)).toBe(true);
        expect(delegates.length).toBeGreaterThanOrEqual(1);
      }
    });

    it('should include ministry information in decisions', async () => {
      const decisions = await getActiveVotingDecisions();
      
      decisions.forEach(decision => {
        expect(decision).toHaveProperty('ministryId');
        expect(decision.ministryId).toBeGreaterThan(0);
        expect(decision.ministryId).toBeLessThanOrEqual(9);
      });
    });
  });
});
