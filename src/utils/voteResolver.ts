export interface Member {
  id: string;
  user_id: string;
  points: number;
}

export interface MatchPlayer {
  user_id: string;
  points_earned: number;
}

export interface BetParticipant {
  user_id: string;
  points_won: number;
}

export interface Vote {
  type: string;
  target_user_id?: string;
  points_modifier?: number;
  target_match_id?: string;
  target_bet_id?: string;
}

export interface VoteConsequencesResult {
  memberUpdates: { id: string; newPoints: number }[];
  matchToDelete?: string;
  betToDelete?: string;
}

/**
 * Aplica lógicamente las consecuencias de una votación aprobada.
 * Retorna las actualizaciones que se deben aplicar a la base de datos para facilitar su testeo,
 * asegurando casos límite (como que los puntos nunca bajen de cero).
 */
export const applyVoteConsequences = (
  vote: Vote,
  members: Member[],
  matchPlayers: MatchPlayer[] = [],
  betParticipants: BetParticipant[] = []
): VoteConsequencesResult => {
  const updates: { id: string; newPoints: number }[] = [];

  if (vote.type === 'acto_extraordinario' || vote.type === 'castigo') {
    if (!vote.target_user_id || vote.points_modifier == null) return { memberUpdates: [] };
    
    const member = members.find(m => m.user_id === vote.target_user_id);
    if (member) {
      const newPoints = Math.max(0, Number(member.points) + Number(vote.points_modifier));
      if (newPoints !== member.points) {
        updates.push({ id: member.id, newPoints });
      }
    }
  } else if (vote.type === 'anulacion_juego') {
    if (!vote.target_match_id) return { memberUpdates: [] };

    for (const mp of matchPlayers) {
      if (mp.points_earned !== 0) {
        const member = members.find(m => m.user_id === mp.user_id);
        if (member) {
          const newPoints = Math.max(0, Number(member.points) - Number(mp.points_earned));
          updates.push({ id: member.id, newPoints });
        }
      }
    }
    return {
      memberUpdates: updates,
      matchToDelete: vote.target_match_id
    };

  } else if (vote.type === 'anulacion_apuesta') {
    if (!vote.target_bet_id) return { memberUpdates: [] };

    for (const bp of betParticipants) {
      if (bp.points_won !== 0) {
        const member = members.find(m => m.user_id === bp.user_id);
        if (member) {
          const newPoints = Math.max(0, Number(member.points) - Number(bp.points_won));
          updates.push({ id: member.id, newPoints });
        }
      }
    }
    return {
      memberUpdates: updates,
      betToDelete: vote.target_bet_id
    };
  }

  return { memberUpdates: updates };
};
