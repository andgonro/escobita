// T-5: Deck utilities
// Covers: FR-1.1, FR-1.2, FR-1.3, FR-1.4, TR-2.1, TR-2.2, TR-2.3, TR-2.4, AD-4, AD-8

import { Card, Rank, Suit } from '../../models/card';

const SUITS: Suit[] = ['Oros', 'Copas', 'Espadas', 'Bastos'];

const RANK_VALUES: ReadonlyMap<Rank, number> = new Map<Rank, number>([
  ['1', 1],
  ['2', 2],
  ['3', 3],
  ['4', 4],
  ['5', 5],
  ['6', 6],
  ['7', 7],
  ['Sota', 8],
  ['Caballo', 9],
  ['Rey', 10],
]);

function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 1) {
    return 0;
  }

  const cryptoApi = globalThis.crypto;
  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure random source is not available.');
  }

  const maxUint32 = 0x1_0000_0000;
  const limit = Math.floor(maxUint32 / maxExclusive) * maxExclusive;
  const buffer = new Uint32Array(1);

  do {
    cryptoApi.getRandomValues(buffer);
  } while (buffer[0] >= limit);

  return buffer[0] % maxExclusive;
}

/**
 * Creates a complete, freshly ordered 40-card Spanish deck.
 * Deterministic — always returns the same suit/rank order.
 * Covers FR-1.1, FR-1.2, FR-1.3.
 */
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const [rank, value] of RANK_VALUES) {
      deck.push(Object.freeze({ suit, rank, value }));
    }
  }
  return deck;
}

/**
 * Returns a new array with the same cards in a randomised order.
 * Does NOT mutate the input array.
 * Uses the Fisher-Yates algorithm for uniform distribution.
 * Covers FR-1.4, TR-2.3.
 */
export function shuffleDeck(deck: Card[]): Card[] {
  const result = [...deck];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
