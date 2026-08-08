export const canCreateMatch = (attendees: any[]) => {
  return attendees.length >= 3;
};

export const getAvailableGames = (gamesPlayed: string[]) => {
  return gamesPlayed || [];
};

export const canCheckIn = (eventDateObj: Date, todayObj: Date) => {
  const eventLocal = new Date(eventDateObj.getFullYear(), eventDateObj.getMonth(), eventDateObj.getDate());
  const todayLocal = new Date(todayObj.getFullYear(), todayObj.getMonth(), todayObj.getDate());
  return todayLocal >= eventLocal;
};
