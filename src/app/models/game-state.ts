// T-3: GameState and TurnPhase models
// Covers: FR-5.8, TR-1.4, AD-2, AD-8

import { Card } from './card';
import { Player } from './player';

export type TurnPhase = 'awaiting-card-play' | 'awaiting-confirmation';

export interface GameState {
  readonly deck: Card[];
  readonly table: Card[];
  readonly players: Player[];
  readonly turnIndex: number;
  readonly roundNumber: number;
  readonly matchScores: Record<string, number>;
  readonly lastCapturerId: string | null;
}
