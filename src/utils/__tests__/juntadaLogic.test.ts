import { canModifyJuntadaDateOrState, canCreateMatchInJuntada } from '../juntadaLogic';

describe('juntadaLogic', () => {
  describe('canModifyJuntadaDateOrState', () => {
    it('debe permitir anular o postergar si hay 0 check-ins', () => {
      expect(canModifyJuntadaDateOrState(0)).toBe(true);
    });

    it('NO debe permitir modificar la juntada si hay 1 o más check-ins', () => {
      expect(canModifyJuntadaDateOrState(1)).toBe(false);
      expect(canModifyJuntadaDateOrState(5)).toBe(false);
    });
  });

  describe('canCreateMatchInJuntada', () => {
    it('NO debe permitir crear partida si hay menos de 3 check-ins', () => {
      expect(canCreateMatchInJuntada(0)).toBe(false);
      expect(canCreateMatchInJuntada(1)).toBe(false);
      expect(canCreateMatchInJuntada(2)).toBe(false);
    });

    it('debe permitir crear partida si hay 3 o más check-ins', () => {
      expect(canCreateMatchInJuntada(3)).toBe(true);
      expect(canCreateMatchInJuntada(10)).toBe(true);
    });
  });
});
