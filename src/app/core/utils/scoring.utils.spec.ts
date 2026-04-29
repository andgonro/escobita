// Covers: FR-8.1, FR-8.2, FR-8.3, FR-8.4, NFR-1.2, US-8
// BDD Scenarios: SC-51, SC-52, SC-53, SC-54, SC-55, SC-56, SC-57, SC-58, SC-59, SC-60, SC-61, SC-62, SC-63

import { computeRoundResult } from './scoring.utils';
import { Player } from '../../models/player';
import { Card } from '../../models/card';

function makeCard(suit: Card['suit'], rank: Card['rank'], value: number): Card {
  return { suit, rank, value };
}

function makePlayer(id: string, name: string, captured: Card[] = [], escobaCount = 0): Player {
  return { id, name, hand: [], capturedPile: captured, escobaCount };
}

// Build a full 40-card deck programmatically for test helpers
function allCards(): Card[] {
  const suits: Card['suit'][] = ['Oros', 'Copas', 'Espadas', 'Bastos'];
  const rankValues: [Card['rank'], number][] = [
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
  ];
  const cards: Card[] = [];
  for (const suit of suits) {
    for (const [rank, value] of rankValues) {
      cards.push({ suit, rank, value });
    }
  }
  return cards;
}

describe('computeRoundResult — escobas category', () => {
  it('SC-52 — each escoba earns 1 point; players with 0 escobas earn 0', () => {
    const alice = makePlayer('p1', 'Alice', [], 3);
    const bob = makePlayer('p2', 'Bob', [], 1);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.escobas).toBe(3);
    expect(bobScore.escobas).toBe(1);
  });

  it('round number is preserved in RoundResult', () => {
    const alice = makePlayer('p1', 'Alice');
    const bob = makePlayer('p2', 'Bob');
    const result = computeRoundResult([alice, bob], 3, null);
    expect(result.roundNumber).toBe(3);
  });
});

describe('computeRoundResult — most-cards category', () => {
  it('SC-53 — clear winner (most cards) earns 1 point; other earns 0', () => {
    const cards = allCards();
    const alice = makePlayer('p1', 'Alice', cards.slice(0, 22));
    const bob = makePlayer('p2', 'Bob', cards.slice(22, 40));
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.mostCards).toBe(1);
    expect(bobScore.mostCards).toBe(0);
  });

  it('SC-54 — tie in most-cards means both earn 0', () => {
    const cards = allCards();
    const alice = makePlayer('p1', 'Alice', cards.slice(0, 20));
    const bob = makePlayer('p2', 'Bob', cards.slice(20, 40));
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.mostCards).toBe(0);
    expect(bobScore.mostCards).toBe(0);
  });

  it('SC-55 — capturing all 40 cards earns 2 points for most-cards', () => {
    const cards = allCards();
    const alice = makePlayer('p1', 'Alice', cards);
    const bob = makePlayer('p2', 'Bob', []);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    expect(aliceScore.mostCards).toBe(2);
  });
});

describe('computeRoundResult — most-Oros category', () => {
  it('SC-56 — clear winner for most Oros earns 1 point', () => {
    const oros6 = ['1', '2', '3', '4', '5', '6'].map((r) =>
      makeCard('Oros', r as Card['rank'], Number(r)),
    );
    const oros4 = ['7', 'Sota', 'Caballo', 'Rey'].map((r, i) =>
      makeCard('Oros', r as Card['rank'], 7 + i),
    );
    const alice = makePlayer('p1', 'Alice', oros6);
    const bob = makePlayer('p2', 'Bob', oros4);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.mostOros).toBe(1);
    expect(bobScore.mostOros).toBe(0);
  });

  it('SC-57 — capturing all 10 Oros earns 2 points', () => {
    const allOros: Card[] = allCards().filter((c) => c.suit === 'Oros');
    const alice = makePlayer('p1', 'Alice', allOros);
    const bob = makePlayer('p2', 'Bob', []);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    expect(aliceScore.mostOros).toBe(2);
  });

  it('SC-58 — tie in most-Oros means both earn 0', () => {
    const oros5a = allCards()
      .filter((c) => c.suit === 'Oros')
      .slice(0, 5);
    const oros5b = allCards()
      .filter((c) => c.suit === 'Oros')
      .slice(5, 10);
    const alice = makePlayer('p1', 'Alice', oros5a);
    const bob = makePlayer('p2', 'Bob', oros5b);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.mostOros).toBe(0);
    expect(bobScore.mostOros).toBe(0);
  });
});

describe('computeRoundResult — most-sevens category', () => {
  it('SC-59 — clear winner for most sevens earns 1 point', () => {
    const sevens3 = (['Oros', 'Copas', 'Espadas'] as Card['suit'][]).map((s) =>
      makeCard(s, '7', 7),
    );
    const sevens1 = [makeCard('Bastos', '7', 7)];
    const alice = makePlayer('p1', 'Alice', sevens3);
    const bob = makePlayer('p2', 'Bob', sevens1);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.mostSevens).toBe(1);
    expect(bobScore.mostSevens).toBe(0);
  });

  it('SC-60 — capturing all 4 sevens earns 2 points', () => {
    const allSevens = (['Oros', 'Copas', 'Espadas', 'Bastos'] as Card['suit'][]).map((s) =>
      makeCard(s, '7', 7),
    );
    const alice = makePlayer('p1', 'Alice', allSevens);
    const bob = makePlayer('p2', 'Bob', []);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    expect(aliceScore.mostSevens).toBe(2);
  });

  it('SC-61 — tie in most-sevens means both earn 0', () => {
    const aliceSevens = [makeCard('Oros', '7', 7), makeCard('Copas', '7', 7)];
    const bobSevens = [makeCard('Espadas', '7', 7), makeCard('Bastos', '7', 7)];
    const alice = makePlayer('p1', 'Alice', aliceSevens);
    const bob = makePlayer('p2', 'Bob', bobSevens);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.mostSevens).toBe(0);
    expect(bobScore.mostSevens).toBe(0);
  });
});

describe('computeRoundResult — siete de velo category', () => {
  it('SC-62 — holder of 7 of Oros earns 1 siete-de-velo point', () => {
    const sieteDeVelo = makeCard('Oros', '7', 7);
    const alice = makePlayer('p1', 'Alice', [sieteDeVelo]);
    const bob = makePlayer('p2', 'Bob', []);
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    const bobScore = result.playerScores.find((s) => s.playerId === 'p2')!;

    expect(aliceScore.sieteDiVelo).toBe(1);
    expect(bobScore.sieteDiVelo).toBe(0);
  });

  it('SC-62 — siete de velo is awarded independently of most-Oros and most-sevens outcomes', () => {
    // Bob has more oros and more sevens but Alice has the 7 of Oros specifically
    const sieteDeVelo = makeCard('Oros', '7', 7);
    const allOros = allCards().filter((c) => c.suit === 'Oros');
    const alice = makePlayer('p1', 'Alice', [sieteDeVelo]);
    const bob = makePlayer(
      'p2',
      'Bob',
      allOros.filter((c) => c.rank !== '7'),
    );
    const result = computeRoundResult([alice, bob], 1, null);

    const aliceScore = result.playerScores.find((s) => s.playerId === 'p1')!;
    expect(aliceScore.sieteDiVelo).toBe(1);
  });
});

describe('computeRoundResult — total and accumulated scores', () => {
  it('SC-63 — total field equals the sum of all category fields for each player', () => {
    const cards = allCards();
    const sieteDeVelo = makeCard('Oros', '7', 7);
    const alice = makePlayer('p1', 'Alice', [sieteDeVelo, ...cards.slice(1, 22)], 2);
    const bob = makePlayer('p2', 'Bob', cards.slice(22, 40), 0);
    const result = computeRoundResult([alice, bob], 1, null);

    for (const score of result.playerScores) {
      const expected =
        score.escobas + score.mostCards + score.mostOros + score.mostSevens + score.sieteDiVelo;
      expect(score.total).toBe(expected);
    }
  });
});
