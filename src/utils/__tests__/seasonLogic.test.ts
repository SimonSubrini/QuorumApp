import { calculateSeasonEndDate } from '../seasonLogic';

describe('seasonLogic', () => {
  describe('calculateSeasonEndDate', () => {
    it('debe calcular correctamente el final de temporada de 1 mes', () => {
      const start = new Date(2024, 0, 15, 10, 0, 0); // Enero 15
      const end = calculateSeasonEndDate(start, '1_month');
      expect(end.getFullYear()).toBe(2024);
      expect(end.getMonth()).toBe(1); // Febrero
      expect(end.getDate()).toBe(15);
    });

    it('debe calcular correctamente el final de temporada de 6 meses (cruzando el año)', () => {
      const start = new Date(2024, 9, 10, 10, 0, 0); // Octubre 10
      const end = calculateSeasonEndDate(start, '6_months');
      expect(end.getFullYear()).toBe(2025);
      expect(end.getMonth()).toBe(3); // Abril
      expect(end.getDate()).toBe(10);
    });

    it('debe calcular correctamente el final de temporada de 1 año', () => {
      const start = new Date(2024, 4, 1, 0, 0, 0); // Mayo 1
      const end = calculateSeasonEndDate(start, '1_year');
      expect(end.getFullYear()).toBe(2025);
      expect(end.getMonth()).toBe(4);
      expect(end.getDate()).toBe(1);
    });

    it('debe manejar años bisiestos correctamente al sumar 1 mes', () => {
      const start = new Date(2024, 0, 31, 0, 0, 0); // 31 Enero 2024 (bisiesto)
      const end = calculateSeasonEndDate(start, '1_month');
      
      // En año bisiesto 2024, Febrero tiene 29. 
      // JavaScript new Date(2024, 1, 31) se desborda 2 días.
      // 29 feb + 2 = 2 de Marzo
      expect(end.getMonth()).toBe(2); // Marzo
      expect(end.getDate()).toBe(2);
    });

    it('debe manejar años bisiestos correctamente al sumar 1 año (29 de febrero)', () => {
      const start = new Date(2024, 1, 29, 10, 0, 0); // 29 Febrero 2024
      const end = calculateSeasonEndDate(start, '1_year');
      
      // 2025 no es bisiesto, JS saltará al 1 de marzo de 2025.
      expect(end.getFullYear()).toBe(2025);
      expect(end.getMonth()).toBe(2); // Marzo
      expect(end.getDate()).toBe(1); // 1 de Marzo
    });
  });
});
