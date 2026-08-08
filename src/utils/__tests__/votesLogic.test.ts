import { isVoteApproved } from '../votesLogic';

describe('votesLogic', () => {
  describe('isVoteApproved', () => {
    it('should return false if there are 0 members in the group', () => {
      expect(isVoteApproved(0, 0)).toBe(false);
    });

    it('should return false if approval is exactly 50%', () => {
      expect(isVoteApproved(5, 10)).toBe(false);
    });

    it('should return false if approval is 59%', () => {
      expect(isVoteApproved(59, 100)).toBe(false);
    });

    it('should return true if approval is exactly 60%', () => {
      expect(isVoteApproved(6, 10)).toBe(true);
    });

    it('should return true if approval is greater than 60%', () => {
      expect(isVoteApproved(8, 10)).toBe(true);
    });

    it('should handle large numbers correctly', () => {
      expect(isVoteApproved(600, 1000)).toBe(true);
      expect(isVoteApproved(599, 1000)).toBe(false);
    });
  });
});
