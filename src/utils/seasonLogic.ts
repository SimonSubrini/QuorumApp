export type SeasonDuration = '1_month' | '6_months' | '1_year';

/**
 * Calcula la fecha de expiración de una temporada basándose en la fecha de inicio y la duración elegida.
 * Maneja correctamente los cambios de año y los años bisiestos usando Date nativo.
 */
export const calculateSeasonEndDate = (startDate: Date, duration: SeasonDuration): Date => {
  const endDate = new Date(startDate.getTime()); // Clonar la fecha

  if (duration === '1_month') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (duration === '6_months') {
    endDate.setMonth(endDate.getMonth() + 6);
  } else if (duration === '1_year') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  return endDate;
};
