import { canUserBet, distributeBetPoints } from '../betsLogic';

describe('betsLogic', () => {
  describe('canUserBet', () => {
    it('should return true if total bets plus new amount is exactly 3', () => {
      expect(canUserBet(1, 2)).toBe(true);
    });

    it('should return true if total bets plus new amount is less than 3', () => {
      expect(canUserBet(0, 1)).toBe(true);
    });

    it('should return false if total bets plus new amount is greater than 3', () => {
      expect(canUserBet(2, 2)).toBe(false);
    });
  });

  describe('distributeBetPoints', () => {
    it('should return 0 if there are no winners', () => {
      expect(distributeBetPoints(10, 0)).toBe(0);
    });

    it('should return 0 if the total pool is 0', () => {
      expect(distributeBetPoints(0, 5)).toBe(0);
    });

    it('should distribute points evenly among winners', () => {
      expect(distributeBetPoints(10, 2)).toBe(5);
    });

    it('should round the distributed points to 1 decimal place', () => {
      // 5 points / 3 winners = 1.6666... -> 1.7
      expect(distributeBetPoints(5, 3)).toBe(1.7);
    });
    
    it('should handle large pools and large winner counts correctly', () => {
      // 100 points / 7 winners = 14.285... -> 14.3
      expect(distributeBetPoints(100, 7)).toBe(14.3);
    });
  });
});
