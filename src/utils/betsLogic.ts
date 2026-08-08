/**
 * Verifica si un usuario puede hacer una apuesta, considerando que el límite máximo
 * por usuario por juntada es de 3 puntos.
 *
 * @param currentUserTotalBets Puntos totales apostados por el usuario en la juntada actual.
 * @param newBetAmount Cantidad de puntos que quiere apostar ahora.
 * @returns boolean indicando si puede o no hacer la apuesta.
 */
export const canUserBet = (currentUserTotalBets: number, newBetAmount: number): boolean => {
  return (currentUserTotalBets + newBetAmount) <= 3;
};

/**
 * Calcula la distribución de los puntos del pozo total entre los ganadores.
 * Los puntos se dividen equitativamente y se redondean a 1 decimal.
 *
 * @param totalPool Puntos totales apostados en la apuesta (todas las opciones).
 * @param winnersCount Cantidad de ganadores (personas que eligieron la opción correcta).
 * @returns La cantidad de puntos que recibe cada ganador, o 0 si no hay ganadores.
 */
export const distributeBetPoints = (totalPool: number, winnersCount: number): number => {
  if (winnersCount <= 0 || totalPool <= 0) return 0;
  
  // Dividir equitativamente
  const pointsPerWinner = totalPool / winnersCount;
  
  // Redondear a 1 decimal (ej: 2.5)
  return Math.round(pointsPerWinner * 10) / 10;
};
