// T-2: Player model
// Covers: FR-3.1, TR-1.3, AD-8

import { Card } from './card';

export interface Player {
  readonly id: string;
  readonly name: string;
  readonly hand: Card[];
  readonly capturedPile: Card[];
  readonly escobaCount: number;
}
