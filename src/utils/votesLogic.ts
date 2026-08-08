/**
 * Calcula si una votación alcanza el cuórum necesario (más del 60% de aprobación).
 * 
 * @param yesVotes Cantidad de votos afirmativos (SÍ).
 * @param totalMembers Cantidad total de miembros en el grupo.
 * @returns boolean indicando si la votación fue aprobada.
 */
export const isVoteApproved = (yesVotes: number, totalMembers: number): boolean => {
  if (totalMembers <= 0) return false;
  
  // El criterio es estricto: mayor o igual a 60% del TOTAL de miembros del grupo.
  const approvalPercentage = yesVotes / totalMembers;
  
  return approvalPercentage >= 0.6;
};
