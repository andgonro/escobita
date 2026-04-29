// Covers: FR-1.1, FR-1.2, FR-1.3, FR-1.4, FR-1.5, NFR-1.2, US-2
// BDD Scenarios: SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07

import { createDeck, shuffleDeck } from './deck.utils';

describe('createDeck', () => {
  it('SC-01 — returns exactly 40 cards', () => {
    const deck = createDeck();
    expect(deck.length).toBe(40);
  });

  it('SC-01 — deck includes all four suits: Oros, Copas, Espadas, Bastos', () => {
    const deck = createDeck();
    const suits = new Set(deck.map((c) => c.suit));
    expect(suits.has('Oros')).toBe(true);
    expect(suits.has('Copas')).toBe(true);
    expect(suits.has('Espadas')).toBe(true);
    expect(suits.has('Bastos')).toBe(true);
  });

  it('SC-01 — each suit contains exactly 10 cards', () => {
    const deck = createDeck();
    const bySuit = deck.reduce<Record<string, number>>((acc, c) => {
      acc[c.suit] = (acc[c.suit] ?? 0) + 1;
      return acc;
    }, {});
    expect(bySuit['Oros']).toBe(10);
    expect(bySuit['Copas']).toBe(10);
    expect(bySuit['Espadas']).toBe(10);
    expect(bySuit['Bastos']).toBe(10);
  });

  it('SC-02 — each suit contains exactly one card of each rank', () => {
    const deck = createDeck();
    const ranks = ['1', '2', '3', '4', '5', '6', '7', 'Sota', 'Caballo', 'Rey'] as const;
    const suits = ['Oros', 'Copas', 'Espadas', 'Bastos'] as const;
    for (const suit of suits) {
      for (const rank of ranks) {
        const count = deck.filter((c) => c.suit === suit && c.rank === rank).length;
        expect(count).toBe(1);
      }
    }
  });

  it('SC-03 — numbered ranks 1-7 carry their rank number as value', () => {
    const deck = createDeck();
    const suits = ['Oros', 'Copas', 'Espadas', 'Bastos'] as const;
    for (let n = 1; n <= 7; n++) {
      for (const suit of suits) {
        const card = deck.find((c) => c.rank === String(n) && c.suit === suit);
        expect(card?.value).toBe(n);
      }
    }
  });

  it('SC-03 — Sota carries value 8', () => {
    const deck = createDeck();
    const suits = ['Oros', 'Copas', 'Espadas', 'Bastos'] as const;
    for (const suit of suits) {
      const card = deck.find((c) => c.rank === 'Sota' && c.suit === suit);
      expect(card?.value).toBe(8);
    }
  });

  it('SC-03 — Caballo carries value 9', () => {
    const deck = createDeck();
    const suits = ['Oros', 'Copas', 'Espadas', 'Bastos'] as const;
    for (const suit of suits) {
      const card = deck.find((c) => c.rank === 'Caballo' && c.suit === suit);
      expect(card?.value).toBe(9);
    }
  });

  it('SC-03 — Rey carries value 10', () => {
    const deck = createDeck();
    const suits = ['Oros', 'Copas', 'Espadas', 'Bastos'] as const;
    for (const suit of suits) {
      const card = deck.find((c) => c.rank === 'Rey' && c.suit === suit);
      expect(card?.value).toBe(10);
    }
  });

  it('SC-04 — the sum of all 40 card values equals 220', () => {
    const deck = createDeck();
    const total = deck.reduce((sum, c) => sum + c.value, 0);
    expect(total).toBe(220);
  });

  it('SC-06 — calling createDeck twice returns two independent array references', () => {
    const d1 = createDeck();
    const d2 = createDeck();
    expect(d1).not.toBe(d2);
  });

  it('SC-06 — both decks contain 40 cards with matching content', () => {
    const d1 = createDeck();
    const d2 = createDeck();
    expect(d1.length).toBe(40);
    expect(d2.length).toBe(40);
    expect(d1.map((c) => `${c.suit}-${c.rank}`).sort()).toEqual(
      d2.map((c) => `${c.suit}-${c.rank}`).sort(),
    );
  });

  it('SC-07 — a card cannot have its suit, rank, or value mutated once created (immutable value)', () => {
    const deck = createDeck();
    const card = deck[0];
    const originalSuit = card.suit;
    const originalRank = card.rank;
    const originalValue = card.value;
    // Attempt mutation — TypeScript readonly or Object.freeze should prevent it
    // We verify the card's properties are unchanged after a simulated mutation attempt
    try {
      (card as { suit: string }).suit = 'MutatedSuit';
    } catch {
      // frozen object throws in strict mode — expected
    }
    expect(card.suit).toBe(originalSuit);
    try {
      (card as { rank: string }).rank = 'MutatedRank';
    } catch {
      // frozen object throws
    }
    expect(card.rank).toBe(originalRank);
    try {
      (card as { value: number }).value = 999;
    } catch {
      // frozen object throws
    }
    expect(card.value).toBe(originalValue);
  });
});

describe('shuffleDeck', () => {
  it('SC-05 — returns a new array reference (does not return the original)', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled).not.toBe(deck);
  });

  it('SC-05 — does not mutate the input array', () => {
    const deck = createDeck();
    const originalOrder = deck.map((c) => `${c.suit}-${c.rank}`);
    shuffleDeck(deck);
    const afterOrder = deck.map((c) => `${c.suit}-${c.rank}`);
    expect(afterOrder).toEqual(originalOrder);
  });

  it('SC-05 — shuffled deck contains the same 40 cards as the original', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled.length).toBe(40);
    expect(shuffled.map((c) => `${c.suit}-${c.rank}`).sort()).toEqual(
      deck.map((c) => `${c.suit}-${c.rank}`).sort(),
    );
  });

  it('SC-05 — two shuffles of the same deck produce different orderings from each other (probabilistic)', () => {
    const deck = createDeck();
    const s1 = shuffleDeck(deck).map((c) => `${c.suit}-${c.rank}`);
    const s2 = shuffleDeck(deck).map((c) => `${c.suit}-${c.rank}`);
    // With 40 cards there is a 1/40! chance both match — effectively impossible
    expect(s1.join(',')).not.toEqual(s2.join(','));
  });

  it('SC-05 — a shuffle differs from the original unshuffled order', () => {
    const deck = createDeck();
    const original = deck.map((c) => `${c.suit}-${c.rank}`);
    const shuffled = shuffleDeck(deck).map((c) => `${c.suit}-${c.rank}`);
    expect(shuffled.join(',')).not.toEqual(original.join(','));
  });
});
