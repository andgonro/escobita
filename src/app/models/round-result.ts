// T-4: RoundResult and PlayerRoundScore models
// Covers: FR-8.4, TR-1.5, AD-3, AD-6

export interface PlayerRoundScore {
  readonly playerId: string;
  readonly escobas: number;
  readonly mostCards: number;
  readonly mostOros: number;
  readonly mostSevens: number;
  readonly sieteDiVelo: number;
  readonly total: number;
}

export interface RoundResult {
  readonly roundNumber: number;
  readonly playerScores: PlayerRoundScore[];
}
