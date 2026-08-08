export const canCreateMatch = (attendees: any[]) => {
  return attendees.length >= 3;
};

export const getAvailableGames = (gamesPlayed: string[]) => {
  return gamesPlayed || [];
};
