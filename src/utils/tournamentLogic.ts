/**
 * Desordena un arreglo aleatoriamente usando el algoritmo de Fisher-Yates.
 * 
 * @param array Arreglo a mezclar.
 * @returns Un nuevo arreglo con los elementos mezclados.
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * Genera la próxima ronda de cruces (llaves) en un torneo basado en los equipos que avanzaron.
 * 
 * @param advancingTeams Array de strings con los IDs/Nombres de los equipos que ganaron la ronda anterior.
 * @returns Array de cruces, donde cada cruce es un Array de 2 strings. Si queda impar, el último pasa directo o se cruza con un placeholder.
 */
export const generateNextBracketRound = (advancingTeams: string[]): string[][] => {
  if (advancingTeams.length === 0) return [];
  if (advancingTeams.length === 1) return [[advancingTeams[0], 'WINNER']];

  // Mezclar equipos al azar para evitar que los cruces sean predecibles
  const shuffled = shuffleArray(advancingTeams);
  
  const nextRound: string[][] = [];
  for (let i = 0; i < shuffled.length; i += 2) {
    if (i + 1 < shuffled.length) {
      nextRound.push([shuffled[i], shuffled[i+1]]);
    } else {
      // Caso impar: El último equipo pasa directo ("BYE")
      nextRound.push([shuffled[i], 'BYE']);
    }
  }
  
  return nextRound;
};
