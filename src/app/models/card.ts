// T-1: Card, Suit, Rank types
// Covers: FR-1.1, FR-1.2, FR-1.5, TR-1.2, AD-5, AD-8

export type Suit = 'Oros' | 'Copas' | 'Espadas' | 'Bastos';

export type Rank = '1' | '2' | '3' | '4' | '5' | '6' | '7' | 'Sota' | 'Caballo' | 'Rey';

export interface Card {
  readonly suit: Suit;
  readonly rank: Rank;
  readonly value: number;
}
