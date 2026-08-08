import { canCreateMatch, getAvailableGames, canCheckIn } from '../rules';

describe('Reglas de Juntadas y Partidas', () => {
  describe('canCreateMatch (Mínimo de 3 asistentes)', () => {
    it('debe devolver false si hay menos de 3 asistentes', () => {
      expect(canCreateMatch([])).toBe(false);
      expect(canCreateMatch([{ user_id: '1' }])).toBe(false);
      expect(canCreateMatch([{ user_id: '1' }, { user_id: '2' }])).toBe(false);
    });

    it('debe devolver true si hay 3 o más asistentes', () => {
      expect(canCreateMatch([{ user_id: '1' }, { user_id: '2' }, { user_id: '3' }])).toBe(true);
      expect(canCreateMatch([{ user_id: '1' }, { user_id: '2' }, { user_id: '3' }, { user_id: '4' }])).toBe(true);
    });
  });

  describe('getAvailableGames (Juegos de la Juntada)', () => {
    it('debe devolver un array vacío si no hay juegos previos', () => {
      expect(getAvailableGames([])).toEqual([]);
      expect(getAvailableGames(null as any)).toEqual([]);
    });

    it('debe devolver la lista de juegos si existen', () => {
      const games = ['Metegol', 'UNO', 'Truco'];
      expect(getAvailableGames(games)).toEqual(['Metegol', 'UNO', 'Truco']);
    });
  });

  describe('canCheckIn', () => {
    it('debería permitir check-in si la fecha actual es igual a la planificada', () => {
      const event = new Date(2025, 0, 15, 20, 0); // 15 Ene 2025 20:00
      const today = new Date(2025, 0, 15, 8, 0); // 15 Ene 2025 08:00
      expect(canCheckIn(event, today)).toBe(true);
    });

    it('debería permitir check-in si la fecha actual es posterior', () => {
      const event = new Date(2025, 0, 15, 20, 0);
      const today = new Date(2025, 0, 16, 8, 0);
      expect(canCheckIn(event, today)).toBe(true);
    });

    it('NO debería permitir check-in si la fecha actual es anterior', () => {
      const event = new Date(2025, 0, 15, 20, 0);
      const today = new Date(2025, 0, 14, 23, 59);
      expect(canCheckIn(event, today)).toBe(false);
    });
  });
});
