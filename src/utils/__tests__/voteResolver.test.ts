import { applyVoteConsequences, Member, MatchPlayer, BetParticipant, Vote } from '../voteResolver';

describe('voteResolver', () => {
  const mockMembers: Member[] = [
    { id: 'm1', user_id: 'u1', points: 10 },
    { id: 'm2', user_id: 'u2', points: 5 },
    { id: 'm3', user_id: 'u3', points: 0 },
  ];

  describe('Acto Extraordinario y Castigo', () => {
    it('debe sumar puntos al usuario objetivo correctamente', () => {
      const vote: Vote = { type: 'acto_extraordinario', target_user_id: 'u2', points_modifier: 3 };
      const result = applyVoteConsequences(vote, mockMembers);

      expect(result.memberUpdates).toHaveLength(1);
      expect(result.memberUpdates[0]).toEqual({ id: 'm2', newPoints: 8 });
    });

    it('debe restar puntos al usuario objetivo correctamente', () => {
      const vote: Vote = { type: 'castigo', target_user_id: 'u1', points_modifier: -4 };
      const result = applyVoteConsequences(vote, mockMembers);

      expect(result.memberUpdates).toHaveLength(1);
      expect(result.memberUpdates[0]).toEqual({ id: 'm1', newPoints: 6 });
    });

    it('NO debe dejar puntos en negativo (el mínimo es 0)', () => {
      const vote: Vote = { type: 'castigo', target_user_id: 'u2', points_modifier: -10 };
      const result = applyVoteConsequences(vote, mockMembers);

      expect(result.memberUpdates).toHaveLength(1);
      expect(result.memberUpdates[0]).toEqual({ id: 'm2', newPoints: 0 }); // De 5 bajó a 0 y topeó
    });

    it('NO debe generar actualización si los puntos ya son 0 y se resta más', () => {
      const vote: Vote = { type: 'castigo', target_user_id: 'u3', points_modifier: -2 };
      const result = applyVoteConsequences(vote, mockMembers);

      // Como u3 ya tiene 0, restarle 2 lo deja en 0, no hay cambios reales que guardar
      expect(result.memberUpdates).toHaveLength(0);
    });
  });

  describe('Anulación de Juego', () => {
    const mockMatchPlayers: MatchPlayer[] = [
      { user_id: 'u1', points_earned: 5 },
      { user_id: 'u2', points_earned: -3 }, // Supongamos que perdió 3 puntos en otro contexto o es 0
      { user_id: 'u3', points_earned: 0 },
    ];

    it('debe revertir los puntos ganados de los jugadores afectados y marcar partida para borrado', () => {
      const vote: Vote = { type: 'anulacion_juego', target_match_id: 'match1' };
      const result = applyVoteConsequences(vote, mockMembers, mockMatchPlayers);

      // u1 ganó 5 puntos. Su puntaje actual es 10 -> debe bajar a 5
      // u2 ganó -3 puntos (perdió). Su puntaje actual es 5 -> debe subir a 8 (reversión). 
      // Ojo, en nuestra app points_earned suele ser positivo o 0. Si hay negativos, la reversión resta negativos sumando.
      // u3 ganó 0 puntos. No hay actualización necesaria.

      expect(result.matchToDelete).toBe('match1');
      expect(result.memberUpdates).toEqual(
        expect.arrayContaining([
          { id: 'm1', newPoints: 5 }, // 10 - 5
          { id: 'm2', newPoints: 8 }, // 5 - (-3) = 8
        ])
      );
    });

    it('NO debe bajar de 0 al revertir puntos', () => {
      const vote: Vote = { type: 'anulacion_juego', target_match_id: 'match2' };
      const edgeMatchPlayers: MatchPlayer[] = [
        { user_id: 'u2', points_earned: 10 }, // u2 tiene 5 pts, si le revertimos 10 baja a -5 (tope 0)
      ];
      const result = applyVoteConsequences(vote, mockMembers, edgeMatchPlayers);

      expect(result.memberUpdates).toHaveLength(1);
      expect(result.memberUpdates[0]).toEqual({ id: 'm2', newPoints: 0 });
    });
  });

  describe('Anulación de Apuesta', () => {
    const mockBetParticipants: BetParticipant[] = [
      { user_id: 'u1', points_won: 2 },
      { user_id: 'u3', points_won: -1 }, // Perdió 1 punto apostando
    ];

    it('debe revertir los puntos ganados/perdidos y marcar apuesta para borrado', () => {
      const vote: Vote = { type: 'anulacion_apuesta', target_bet_id: 'bet1' };
      const result = applyVoteConsequences(vote, mockMembers, [], mockBetParticipants);

      expect(result.betToDelete).toBe('bet1');
      expect(result.memberUpdates).toEqual(
        expect.arrayContaining([
          { id: 'm1', newPoints: 8 }, // 10 - 2
          { id: 'm3', newPoints: 1 }, // 0 - (-1) = 1
        ])
      );
    });
  });
});
