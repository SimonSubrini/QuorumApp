import { generateNextBracketRound, shuffleArray } from '../tournamentLogic';

describe('tournamentLogic', () => {
  describe('shuffleArray', () => {
    it('should return an array of the same length', () => {
      const arr = [1, 2, 3, 4, 5];
      expect(shuffleArray(arr).length).toBe(arr.length);
    });

    it('should contain all the original elements', () => {
      const arr = ['A', 'B', 'C', 'D'];
      const result = shuffleArray(arr);
      arr.forEach(element => {
        expect(result).toContain(element);
      });
    });

    it('should not mutate the original array', () => {
      const arr = [1, 2, 3];
      const copy = [...arr];
      shuffleArray(arr);
      expect(arr).toEqual(copy);
    });
  });

  describe('generateNextBracketRound', () => {
    it('should return an empty array if there are no teams', () => {
      expect(generateNextBracketRound([])).toEqual([]);
    });

    it('should return a WINNER state if only 1 team is left', () => {
      const result = generateNextBracketRound(['Team A']);
      expect(result).toEqual([['Team A', 'WINNER']]);
    });

    it('should pair up an even number of teams properly', () => {
      const teams = ['A', 'B', 'C', 'D'];
      const result = generateNextBracketRound(teams);
      
      expect(result.length).toBe(2);
      expect(result[0].length).toBe(2);
      expect(result[1].length).toBe(2);
      
      // Flatten the result to ensure all original teams are present
      const flattened = result.flat();
      teams.forEach(team => {
        expect(flattened).toContain(team);
      });
    });

    it('should give a BYE to the last team if there is an odd number of teams', () => {
      const teams = ['A', 'B', 'C'];
      const result = generateNextBracketRound(teams);
      
      // 3 teams = 2 matches (one normal match, one BYE)
      expect(result.length).toBe(2);
      
      // Flatten the result and check for BYE
      const flattened = result.flat();
      expect(flattened).toContain('BYE');
      
      teams.forEach(team => {
        expect(flattened).toContain(team);
      });
    });
  });
});
