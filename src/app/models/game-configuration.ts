export type GameMode = 'Single Player' | 'Multiplayer';

export type AIDifficulty = 'Easy' | 'Medium' | 'Hard';

export interface GameConfiguration {
  mode: GameMode;
  playerNames: string[];
  playerCount: 2 | 3 | 4;
  aiDifficulty: AIDifficulty;
}
