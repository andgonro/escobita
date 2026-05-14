import { TestBed } from '@angular/core/testing';
import { AiStrategyService } from './ai-strategy.service';
import { GameState } from '../../models/game-state';
import { Player } from '../../models/player';
import { Card, Suit, Rank } from '../../models/card';

// Covers: TR-1.1, TR-1.2, TR-1.3, TR-1.6, FR-3.1, FR-3.2, FR-3.3, FR-3.4, FR-3.5, FR-4.1, FR-4.2, FR-4.3, FR-4.4, FR-4.5, FR-4.6, FR-4.7, FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6, US-6, US-7, US-8

function card(suit: Suit, rank: Rank, value: number): Card {
  return { suit, rank, value };
}

function createState(aiPlayer: Player, table: Card[]): GameState {
  return {
    deck: [],
    table,
    players: [
      {
        id: 'human-1',
        name: 'Human',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
      aiPlayer,
    ],
    turnIndex: 1,
    roundNumber: 1,
    matchScores: {
      'human-1': 0,
      'ai-1': 0,
    },
    lastCapturerId: null,
  };
}

function pickIndex(index: number): (maxExclusive: number) => number {
  return (maxExclusive: number) => Math.min(index, Math.max(maxExclusive - 1, 0));
}

function captureKey(cards: Card[]): string {
  return cards
    .map((currentCard) => `${currentCard.suit}-${currentCard.rank}-${currentCard.value}`)
    .sort()
    .join('|');
}

describe('AiStrategyService', () => {
  let service: AiStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AiStrategyService);
  });

  it('returns a valid play decision shape from decide', () => {
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [{ suit: 'Oros', rank: '1', value: 1 }],
      capturedPile: [],
      escobaCount: 0,
    };

    const state: GameState = {
      deck: [],
      table: [],
      players: [
        {
          id: 'human-1',
          name: 'Human',
          hand: [],
          capturedPile: [],
          escobaCount: 0,
        },
        aiPlayer,
      ],
      turnIndex: 1,
      roundNumber: 1,
      matchScores: {
        'human-1': 0,
        'ai-1': 0,
      },
      lastCapturerId: null,
    };

    const decision = service.decide(state, aiPlayer, 'Easy', () => 0);

    expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
    expect(decision.captureSubset).toEqual([]);
  });

  it('supports decide calls without providing randomFn', () => {
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [{ suit: 'Oros', rank: '1', value: 1 }],
      capturedPile: [],
      escobaCount: 0,
    };

    const state: GameState = {
      deck: [],
      table: [],
      players: [
        {
          id: 'human-1',
          name: 'Human',
          hand: [],
          capturedPile: [],
          escobaCount: 0,
        },
        aiPlayer,
      ],
      turnIndex: 1,
      roundNumber: 1,
      matchScores: {
        'human-1': 0,
        'ai-1': 0,
      },
      lastCapturerId: null,
    };

    const decision = service.decide(state, aiPlayer, 'Easy');

    expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
    expect(decision.captureSubset).toEqual([]);
  });

  it('always selects an escoba-yielding capture when one exists in Easy mode', () => {
    const table = [card('Oros', '7', 7), card('Copas', '3', 3)];
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Espadas', 'Sota', 8), card('Bastos', '5', 5)],
      capturedPile: [],
      escobaCount: 0,
    };

    const state = createState(aiPlayer, table);

    const decision = service.decide(state, aiPlayer, 'Easy', pickIndex(0));

    expect(decision.cardToPlay).toEqual(aiPlayer.hand[1]);
    expect(decision.captureSubset).toEqual(table);
  });

  it('selects one escoba play when multiple escoba captures exist', () => {
    const table = [card('Oros', '7', 7), card('Copas', '3', 3)];
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Espadas', '5', 5), card('Bastos', '5', 5)],
      capturedPile: [],
      escobaCount: 0,
    };

    const state = createState(aiPlayer, table);

    const decision = service.decide(state, aiPlayer, 'Easy', pickIndex(1));

    expect(decision.cardToPlay).toEqual(aiPlayer.hand[1]);
    expect(decision.captureSubset).toEqual(table);
  });

  it('returns a capture (not a placement) when captures exist but no escoba does', () => {
    const table = [card('Oros', '7', 7), card('Copas', '3', 3), card('Bastos', '2', 2)];
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Espadas', 'Sota', 8), card('Bastos', '5', 5)],
      capturedPile: [],
      escobaCount: 0,
    };

    const state = createState(aiPlayer, table);

    const decision = service.decide(state, aiPlayer, 'Easy', pickIndex(0));
    const captureTotal = decision.captureSubset.reduce(
      (sum, capturedCard) => sum + capturedCard.value,
      0,
    );

    expect(decision.captureSubset.length).toBeGreaterThan(0);
    expect(aiPlayer.hand).toContain(decision.cardToPlay);
    expect(captureTotal + decision.cardToPlay.value).toBe(15);
    expect(decision.captureSubset.every((capturedCard) => state.table.includes(capturedCard))).toBe(
      true,
    );
  });

  it('returns a placement with empty capture subset when no capture exists', () => {
    const table = [card('Oros', '1', 1), card('Copas', '1', 1)];
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Espadas', 'Sota', 8), card('Bastos', 'Caballo', 9)],
      capturedPile: [],
      escobaCount: 0,
    };

    const state = createState(aiPlayer, table);

    const decision = service.decide(state, aiPlayer, 'Easy', pickIndex(1));

    expect(decision.cardToPlay).toEqual(aiPlayer.hand[1]);
    expect(decision.captureSubset).toEqual([]);
  });

  it('makes Easy decisions from current hand/table only, regardless of prior captured history', () => {
    const table = [card('Oros', '7', 7), card('Copas', '3', 3)];

    const aiPlayerWithEmptyHistory: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Espadas', 'Sota', 8), card('Bastos', '5', 5)],
      capturedPile: [],
      escobaCount: 0,
    };

    const aiPlayerWithDifferentHistory: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Espadas', 'Sota', 8), card('Bastos', '5', 5)],
      capturedPile: [card('Oros', '1', 1), card('Bastos', '7', 7)],
      escobaCount: 2,
    };

    const stateA = createState(aiPlayerWithEmptyHistory, table);
    const stateB = createState(aiPlayerWithDifferentHistory, table);

    const decisionA = service.decide(stateA, aiPlayerWithEmptyHistory, 'Easy', pickIndex(0));
    const decisionB = service.decide(stateB, aiPlayerWithDifferentHistory, 'Easy', pickIndex(0));

    expect(decisionA).toEqual(decisionB);
    expect(decisionA.cardToPlay).toEqual(aiPlayerWithEmptyHistory.hand[1]);
    expect(decisionA.captureSubset).toEqual(table);
  });

  it('returns one valid subset when a single hand card has multiple capture subsets', () => {
    const table = [
      card('Oros', '3', 3),
      card('Copas', '2', 2),
      card('Espadas', '7', 7),
      card('Bastos', '4', 4),
      card('Oros', '1', 1),
    ];
    const aiPlayer: Player = {
      id: 'ai-1',
      name: 'Laia',
      hand: [card('Copas', '5', 5), card('Bastos', 'Sota', 8)],
      capturedPile: [],
      escobaCount: 0,
    };

    const state = createState(aiPlayer, table);
    const decision = service.decide(state, aiPlayer, 'Easy', pickIndex(1));
    const captureTotal = decision.captureSubset.reduce(
      (sum, capturedCard) => sum + capturedCard.value,
      0,
    );

    const validSubsetsForFive = [
      [table[0], table[2]],
      [table[1], table[2], table[4]],
      [table[1], table[0], table[4], table[3]],
    ];
    const validCaptureKeys = validSubsetsForFive.map((subset) => captureKey(subset));

    expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
    expect(captureTotal + decision.cardToPlay.value).toBe(15);
    expect(decision.captureSubset.every((capturedCard) => table.includes(capturedCard))).toBe(true);
    expect(validCaptureKeys).toContain(captureKey(decision.captureSubset));
  });

  describe('Medium / Intermedio', () => {
    it('selects an escoba in Medium mode when both escoba and non-escoba captures exist', () => {
      const table = [
        card('Oros', '6', 6),
        card('Copas', '1', 1),
        card('Oros', '2', 2),
        card('Bastos', '2', 2),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Espadas', '4', 4), card('Copas', '5', 5)],
        capturedPile: [],
        escobaCount: 0,
      };

      const state = createState(aiPlayer, table);
      const decision = service.decide(state, aiPlayer, 'Medium', pickIndex(0));

      expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(decision.captureSubset).toEqual(table);
    });

    it('selects the capture with more high-value cards in Medium mode when no escoba exists', () => {
      const table = [
        card('Oros', '1', 1),
        card('Bastos', '7', 7),
        card('Copas', '5', 5),
        card('Espadas', '3', 3),
        card('Bastos', '1', 1),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Copas', '7', 7), card('Bastos', 'Sota', 8)],
        capturedPile: [],
        escobaCount: 0,
      };

      const state = createState(aiPlayer, table);
      const decision = service.decide(state, aiPlayer, 'Medium', pickIndex(0));
      const captureTotal = decision.captureSubset.reduce(
        (sum, capturedCard) => sum + capturedCard.value,
        0,
      );

      expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(decision.captureSubset).toEqual([table[0], table[1]]);
      expect(captureTotal + decision.cardToPlay.value).toBe(15);
      expect(decision.captureSubset.every((capturedCard) => table.includes(capturedCard))).toBe(
        true,
      );
    });

    it('breaks ties randomly in Medium mode when captures have identical high-value counts', () => {
      const table = [
        card('Oros', '7', 7),
        card('Copas', '3', 3),
        card('Oros', '5', 5),
        card('Bastos', '5', 5),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Espadas', '5', 5), card('Copas', 'Sota', 8)],
        capturedPile: [],
        escobaCount: 0,
      };

      const state = createState(aiPlayer, table);

      const firstDecision = service.decide(state, aiPlayer, 'Medium', pickIndex(0));
      const secondDecision = service.decide(state, aiPlayer, 'Medium', pickIndex(1));

      expect(firstDecision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(firstDecision.captureSubset).toEqual([table[0], table[1]]);
      expect(secondDecision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(secondDecision.captureSubset).toEqual([table[2], table[3]]);
    });

    it('counts the 7 of Oros only once in the Medium high-value score', () => {
      const table = [
        card('Oros', '7', 7),
        card('Copas', '3', 3),
        card('Oros', '4', 4),
        card('Bastos', '6', 6),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Espadas', '5', 5), card('Copas', 'Sota', 8)],
        capturedPile: [],
        escobaCount: 0,
      };

      const state = createState(aiPlayer, table);
      const decision = service.decide(state, aiPlayer, 'Medium', pickIndex(1));

      expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(decision.captureSubset).toEqual([table[2], table[3]]);
    });

    it('returns a random placement in Medium mode when no capture exists', () => {
      const table = [card('Oros', '1', 1), card('Copas', '1', 1)];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Espadas', 'Sota', 8), card('Bastos', 'Caballo', 9)],
        capturedPile: [],
        escobaCount: 0,
      };

      const state = createState(aiPlayer, table);
      const decision = service.decide(state, aiPlayer, 'Medium', pickIndex(1));

      expect(decision.cardToPlay).toEqual(aiPlayer.hand[1]);
      expect(decision.captureSubset).toEqual([]);
    });

    it('keeps Medium decisions stateless across rounds with different captured history', () => {
      const table = [
        card('Oros', '1', 1),
        card('Bastos', '7', 7),
        card('Copas', '5', 5),
        card('Espadas', '3', 3),
        card('Bastos', '1', 1),
      ];

      const aiPlayerWithEmptyHistory: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Copas', '7', 7), card('Bastos', 'Sota', 8)],
        capturedPile: [],
        escobaCount: 0,
      };
      const aiPlayerWithDifferentHistory: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Copas', '7', 7), card('Bastos', 'Sota', 8)],
        capturedPile: [card('Oros', '7', 7), card('Oros', '1', 1), card('Bastos', '7', 7)],
        escobaCount: 1,
      };

      const stateA = createState(aiPlayerWithEmptyHistory, table);
      const stateB = createState(aiPlayerWithDifferentHistory, table);

      const decisionA = service.decide(stateA, aiPlayerWithEmptyHistory, 'Medium', pickIndex(0));
      const decisionB = service.decide(
        stateB,
        aiPlayerWithDifferentHistory,
        'Medium',
        pickIndex(0),
      );

      expect(decisionA).toEqual(decisionB);
      expect(decisionA.cardToPlay).toEqual(aiPlayerWithEmptyHistory.hand[0]);
      expect(decisionA.captureSubset).toEqual([table[0], table[1]]);
    });
  });

  describe('Hard / Difícil', () => {
    it('always selects an escoba-yielding capture when one exists in Hard mode', () => {
      const table = [
        card('Oros', '6', 6),
        card('Copas', '1', 1),
        card('Oros', '2', 2),
        card('Bastos', '2', 2),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Espadas', '4', 4), card('Copas', '5', 5)],
        capturedPile: [],
        escobaCount: 0,
      };

      const decision = service.decide(createState(aiPlayer, table), aiPlayer, 'Hard', pickIndex(0));

      expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(decision.captureSubset).toEqual(table);
    });

    it('prefers capturing high-value table cards over placement when no escoba exists', () => {
      const table = [
        card('Oros', '1', 1),
        card('Bastos', '7', 7),
        card('Copas', '5', 5),
        card('Espadas', '3', 3),
        card('Bastos', '1', 1),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Copas', '7', 7), card('Bastos', 'Sota', 8)],
        capturedPile: [],
        escobaCount: 0,
      };

      const decision = service.decide(createState(aiPlayer, table), aiPlayer, 'Hard', pickIndex(0));
      const captureTotal = decision.captureSubset.reduce(
        (sum, capturedCard) => sum + capturedCard.value,
        0,
      );

      expect(decision.captureSubset.length).toBeGreaterThan(0);
      expect(decision.cardToPlay).toEqual(aiPlayer.hand[0]);
      expect(decision.captureSubset).toEqual([table[0], table[1]]);
      expect(captureTotal + decision.cardToPlay.value).toBe(15);
      expect(decision.captureSubset.every((capturedCard) => table.includes(capturedCard))).toBe(
        true,
      );
    });

    it('does not access the human hand while deciding in Hard mode', () => {
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Oros', '7', 7), card('Copas', 'Sota', 8)],
        capturedPile: [],
        escobaCount: 0,
      };

      const humanPlayerWithoutReadableHand = {
        id: 'human-1',
        name: 'Human',
        get hand() {
          throw new Error('Human hand must not be accessed in Hard mode decision logic');
        },
        capturedPile: [],
        escobaCount: 0,
      } as unknown as Player;

      const state: GameState = {
        deck: [],
        table: [card('Bastos', '7', 7), card('Copas', '1', 1), card('Espadas', '2', 2)],
        players: [humanPlayerWithoutReadableHand, aiPlayer],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: {
          'human-1': 0,
          'ai-1': 0,
        },
        lastCapturerId: null,
      };

      const decision = service.decide(state, aiPlayer, 'Hard', pickIndex(0));

      expect(aiPlayer.hand).toContain(decision.cardToPlay);
      expect(decision.captureSubset.length).toBeGreaterThan(0);
    });

    it('produces a valid Hard decision when captured history contributes known cards', () => {
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Oros', '1', 1), card('Copas', 'Sota', 8)],
        capturedPile: [card('Bastos', 'Rey', 10), card('Espadas', '2', 2)],
        escobaCount: 0,
      };
      const humanPlayer: Player = {
        id: 'human-1',
        name: 'Human',
        hand: [card('Bastos', 'Caballo', 9)],
        capturedPile: [card('Oros', '7', 7), card('Copas', '4', 4)],
        escobaCount: 0,
      };
      const table = [card('Espadas', '7', 7), card('Bastos', '3', 3), card('Copas', '6', 6)];

      const state: GameState = {
        deck: [],
        table,
        players: [humanPlayer, aiPlayer],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: {
          'human-1': 0,
          'ai-1': 0,
        },
        lastCapturerId: null,
      };

      const decision = service.decide(state, aiPlayer, 'Hard', pickIndex(0));
      const captureTotal = decision.captureSubset.reduce(
        (sum, capturedCard) => sum + capturedCard.value,
        0,
      );

      expect(aiPlayer.hand).toContain(decision.cardToPlay);
      expect(decision.captureSubset.every((capturedCard) => table.includes(capturedCard))).toBe(
        true,
      );

      if (decision.captureSubset.length > 0) {
        expect(captureTotal + decision.cardToPlay.value).toBe(15);
      }
    });

    it('selects a different move than Medium when probability weighting favors a non-greedy option', () => {
      const table = [
        card('Oros', '1', 1),
        card('Copas', '2', 2),
        card('Bastos', '7', 7),
        card('Espadas', '5', 5),
      ];
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Copas', '7', 7), card('Espadas', 'Sota', 8)],
        capturedPile: [card('Oros', '2', 2), card('Oros', '3', 3)],
        escobaCount: 0,
      };
      const humanPlayer: Player = {
        id: 'human-1',
        name: 'Human',
        hand: [card('Oros', '4', 4), card('Bastos', '1', 1)],
        capturedPile: [card('Oros', '7', 7), card('Copas', '7', 7)],
        escobaCount: 0,
      };
      const state: GameState = {
        deck: [
          card('Oros', '5', 5),
          card('Copas', '6', 6),
          card('Espadas', '1', 1),
          card('Bastos', '2', 2),
        ],
        table,
        players: [humanPlayer, aiPlayer],
        turnIndex: 1,
        roundNumber: 2,
        matchScores: {
          'human-1': 9,
          'ai-1': 10,
        },
        lastCapturerId: 'human-1',
      };

      const mediumDecision = service.decide(state, aiPlayer, 'Medium', pickIndex(0));
      const hardDecision = service.decide(state, aiPlayer, 'Hard', pickIndex(0));

      expect(mediumDecision.captureSubset).toEqual([table[0], table[2]]);
      expect(hardDecision).not.toEqual(mediumDecision);
      expect(hardDecision.captureSubset.length).toBeGreaterThan(0);
      expect(aiPlayer.hand).toContain(hardDecision.cardToPlay);
    });

    it('completes Hard mode decision under 100ms for a realistic complex state', () => {
      const aiPlayer: Player = {
        id: 'ai-1',
        name: 'Laia',
        hand: [card('Oros', '5', 5), card('Copas', '6', 6), card('Espadas', '7', 7)],
        capturedPile: [card('Bastos', '1', 1), card('Bastos', '2', 2), card('Bastos', '3', 3)],
        escobaCount: 1,
      };
      const human: Player = {
        id: 'human-1',
        name: 'Human',
        hand: [card('Oros', '2', 2), card('Copas', '3', 3), card('Espadas', '4', 4)],
        capturedPile: [
          card('Copas', '7', 7),
          card('Oros', 'Rey', 10),
          card('Espadas', 'Caballo', 9),
        ],
        escobaCount: 0,
      };
      const state: GameState = {
        deck: [
          card('Oros', '3', 3),
          card('Copas', '4', 4),
          card('Espadas', '5', 5),
          card('Bastos', '6', 6),
          card('Oros', '7', 7),
        ],
        table: [
          card('Oros', '4', 4),
          card('Copas', '5', 5),
          card('Espadas', '1', 1),
          card('Bastos', '4', 4),
          card('Bastos', '1', 1),
          card('Copas', '2', 2),
        ],
        players: [human, aiPlayer],
        turnIndex: 1,
        roundNumber: 2,
        matchScores: {
          'human-1': 9,
          'ai-1': 10,
        },
        lastCapturerId: 'human-1',
      };

      const start = Date.now();
      const decision = service.decide(state, aiPlayer, 'Hard', pickIndex(0));
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(100);
      expect(decision.captureSubset.length).toBeGreaterThan(0);
      expect(aiPlayer.hand).toContain(decision.cardToPlay);
    });
  });
});
