/**
 * Lógica de negocio para las Juntadas.
 */

/**
 * Verifica si es posible cancelar o postergar una juntada.
 * La regla es que no puede haber ningún check-in realizado.
 * @param checkInsCount Cantidad de usuarios que ya hicieron check-in
 */
export const canModifyJuntadaDateOrState = (checkInsCount: number): boolean => {
  return checkInsCount === 0;
};

/**
 * Verifica si es posible crear una partida en una juntada.
 * La regla es que debe haber al menos 3 personas con check-in.
 * @param checkInsCount Cantidad de usuarios que ya hicieron check-in
 */
export const canCreateMatchInJuntada = (checkInsCount: number): boolean => {
  return checkInsCount >= 3;
};
