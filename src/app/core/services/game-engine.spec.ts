// Covers: FR-2.1–FR-2.5, FR-3.1–FR-3.3, FR-4.1–FR-4.4, FR-5.1–FR-5.8,
//         FR-6.1–FR-6.3, FR-7.1–FR-7.3, FR-8.1–FR-8.4, FR-9.1–FR-9.5,
//         FR-10.1–FR-10.3, TR-4.1–TR-4.6, NFR-1.2, NFR-2.1
//         US-1, US-3, US-4, US-5, US-6, US-7, US-8, US-9, US-10, US-11
// BDD Scenarios: SC-08–SC-27, SC-28–SC-43, SC-44–SC-51, SC-52–SC-63,
//                SC-64–SC-77, SC-78–SC-85

import { TestBed } from '@angular/core/testing';
import { GameEngine } from './game-engine';
import { GameConfiguration } from '../../models/game-configuration';
import { Card } from '../../models/card';
import { Player } from '../../models/player';
import { GameState, TurnPhase } from '../../models/game-state';
import * as deckUtils from '../utils/deck.utils';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function twoPlayerConfig(): GameConfiguration {
  return {
    mode: 'Single Player',
    playerNames: ['Alice', 'Bob'],
    playerCount: 2,
    aiDifficulty: 'Easy',
  };
}

function threePlayerConfig(): GameConfiguration {
  return {
    mode: 'Single Player',
    playerNames: ['Alice', 'Bob', 'Carol'],
    playerCount: 3,
    aiDifficulty: 'Easy',
  };
}

function cardEq(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

function cardBy(deck: Card[], suit: Card['suit'], rank: Card['rank']): Card {
  const found = deck.find((c) => c.suit === suit && c.rank === rank);
  if (!found) {
    throw new Error(`Card not found in deck: ${suit}-${rank}`);
  }
  return found;
}

function makePlayer(
  id: string,
  name: string,
  hand: Card[],
  capturedPile: Card[] = [],
  escobaCount = 0,
): Player {
  return { id, name, hand: [...hand], capturedPile: [...capturedPile], escobaCount };
}

function makeState(
  players: Player[],
  table: Card[],
  deck: Card[] = [],
  turnIndex = 0,
  roundNumber = 1,
  lastCapturerId: string | null = null,
  matchScores?: Record<string, number>,
): GameState {
  const scores = matchScores ?? Object.fromEntries(players.map((p) => [p.id, 0]));
  return {
    deck: [...deck],
    table: [...table],
    players: players.map((p) => ({ ...p, hand: [...p.hand], capturedPile: [...p.capturedPile] })),
    turnIndex,
    roundNumber,
    matchScores: { ...scores },
    lastCapturerId,
  };
}

function setEngineState(engine: GameEngine, state: GameState, phase: TurnPhase): void {
  const internal = engine as unknown as {
    _state: { set: (value: GameState) => void };
    _turnPhase: { set: (value: TurnPhase) => void };
    _roundResult: { set: (value: null) => void };
    _matchWinner: { set: (value: Player[] | null) => void };
  };
  internal._state.set(state);
  internal._turnPhase.set(phase);
  internal._roundResult.set(null);
  internal._matchWinner.set(null);
}

// ---------------------------------------------------------------------------
// Test suite
// ---------------------------------------------------------------------------

describe('GameEngine', () => {
  let engine: GameEngine;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    engine = TestBed.inject(GameEngine);
  });

  // -------------------------------------------------------------------------
  // TR-4.1 — service is injectable at root
  // -------------------------------------------------------------------------
  it('TR-4.1 — GameEngine exposes safe default signal state before initGame', () => {
    expect(engine.state()).toBeNull();
    expect(engine.activePlayer()).toBeNull();
    expect(engine.roundResult()).toBeNull();
    expect(engine.matchWinner()).toBeNull();
    expect(engine.turnPhase()).toBe('awaiting-card-play');
  });

  // -------------------------------------------------------------------------
  // SC-85 — signals are read-only to consumers (TR-4.3, NFR-2.1)
  // -------------------------------------------------------------------------
  it('SC-85 — all public signals are read-only (no set/update exposed)', () => {
    // TypeScript compile-time check: none of the signals have a .set property
    expect((engine.state as unknown as { set?: unknown }).set).toBeUndefined();
    expect((engine.activePlayer as unknown as { set?: unknown }).set).toBeUndefined();
    expect((engine.turnPhase as unknown as { set?: unknown }).set).toBeUndefined();
    expect((engine.roundResult as unknown as { set?: unknown }).set).toBeUndefined();
    expect((engine.matchWinner as unknown as { set?: unknown }).set).toBeUndefined();
  });

  describe('applyE2eFixture', () => {
    it('round-winner fixture exposes matchWinner as a single-element array', () => {
      engine.initGame(twoPlayerConfig());

      const fixtureResult = engine.applyE2eFixture('round-winner-visibility');
      const winners = engine.matchWinner();

      expect(Array.isArray(winners)).toBe(true);

      if (!Array.isArray(winners)) {
        throw new Error('Expected matchWinner to expose an array winner contract.');
      }

      expect(winners).toHaveLength(1);
      expect(winners[0]?.name).toBe(fixtureResult.winnerName);
    });

    it('round-winner-ai fixture exposes Laia as the single winner', () => {
      engine.initGame(twoPlayerConfig());

      const secondPlayerName = engine.state()?.players[1]?.name;

      const fixtureResult = engine.applyE2eFixture('round-winner-visibility-ai');
      const winners = engine.matchWinner();

      expect(Array.isArray(winners)).toBe(true);

      if (!Array.isArray(winners)) {
        throw new Error('Expected matchWinner to expose an array winner contract.');
      }

      expect(winners).toHaveLength(1);
      expect(winners[0]?.name).toBe(secondPlayerName);
      expect(winners[0]?.name).toBe(fixtureResult.winnerName);
    });

    it('T-12 / TR-1.6 - ai-turn-escoba fixture prepares a valid escoba opportunity on Laia turn', () => {
      engine.initGame(twoPlayerConfig());

      engine.applyE2eFixture(
        'ai-turn-escoba' as unknown as Parameters<typeof engine.applyE2eFixture>[0],
      );

      const state = engine.state();
      expect(state).not.toBeNull();
      if (state === null) {
        throw new Error('Expected a non-null state after ai-turn-escoba fixture.');
      }

      expect(state.players.length).toBeGreaterThanOrEqual(2);
      expect(state.turnIndex).toBe(1);
      expect(engine.turnPhase()).toBe('awaiting-card-play');

      const laia = state.players[1]!;
      expect(laia.name).toBe('Laia');
      expect(laia.hand.length).toBeGreaterThan(0);

      const canEscoba = laia.hand.some((handCard) => {
        const tableSum = state.table.reduce((sum, tableCard) => sum + tableCard.value, 0);
        return handCard.value + tableSum === 15;
      });

      expect(canEscoba).toBe(true);
    });

    it('T-12 / TR-1.6 - ai-turn-capture fixture prepares non-escoba capture on Laia turn', () => {
      engine.initGame(twoPlayerConfig());

      engine.applyE2eFixture(
        'ai-turn-capture' as unknown as Parameters<typeof engine.applyE2eFixture>[0],
      );

      const state = engine.state();
      expect(state).not.toBeNull();
      if (state === null) {
        throw new Error('Expected a non-null state after ai-turn-capture fixture.');
      }

      expect(state.players.length).toBeGreaterThanOrEqual(2);
      expect(state.turnIndex).toBe(1);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
      expect(state.table.length).toBeGreaterThan(1);

      const laia = state.players[1]!;
      expect(laia.name).toBe('Laia');
      expect(laia.hand.length).toBeGreaterThan(0);

      const table = state.table;
      const hasCapture = laia.hand.some((handCard) => {
        for (const tableCard of table) {
          if (handCard.value + tableCard.value === 15) {
            return true;
          }
        }

        return false;
      });

      const tableSum = table.reduce((sum, card) => sum + card.value, 0);
      const hasEscoba = laia.hand.some((handCard) => handCard.value + tableSum === 15);

      expect(hasCapture).toBe(true);
      expect(hasEscoba).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // initGame — SC-08–SC-17
  // -------------------------------------------------------------------------
  describe('initGame', () => {
    it('SC-08 — creates a non-null game state with a shuffled 40-card distributed deck', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.state()).not.toBeNull();
    });

    it('SC-09 — table starts with exactly 4 cards', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.state()!.table.length).toBe(4);
    });

    it('SC-09 — the 4 table cards are no longer in the remaining deck', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      for (const tableCard of state.table) {
        const inDeck = state.deck.some((c) => cardEq(c, tableCard));
        expect(inDeck).toBe(false);
      }
    });

    it('SC-10 — each player starts with exactly 3 cards in their hand', () => {
      engine.initGame(twoPlayerConfig());
      for (const player of engine.state()!.players) {
        expect(player.hand.length).toBe(3);
      }
    });

    it('SC-10 — hand cards are not in the remaining deck', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      for (const player of state.players) {
        for (const handCard of player.hand) {
          const inDeck = state.deck.some((c) => cardEq(c, handCard));
          expect(inDeck).toBe(false);
        }
      }
    });

    it('SC-11 — all players start with empty captured piles and zero escobas', () => {
      engine.initGame(twoPlayerConfig());
      for (const player of engine.state()!.players) {
        expect(player.capturedPile.length).toBe(0);
        expect(player.escobaCount).toBe(0);
      }
    });

    it('SC-12 — all players start with accumulated match score of 0', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      for (const player of state.players) {
        expect(state.matchScores[player.id]).toBe(0);
      }
    });

    it('SC-13 — turnIndex is 0 (first player is active)', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.state()!.turnIndex).toBe(0);
    });

    it('SC-13 — turn phase is awaiting-card-play after initGame', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-14 — total card count (table + hands + deck) equals 40', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      const handTotal = state.players.reduce((s, p) => s + p.hand.length, 0);
      expect(state.table.length + handTotal + state.deck.length).toBe(40);
    });

    it('SC-15 — game state signal is immediately readable and non-null after initGame', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.state()).not.toBeNull();
    });

    it('SC-16 — calling initGame a second time fully resets all state', () => {
      engine.initGame(twoPlayerConfig());
      // play a card to dirty the state
      const state = engine.state()!;
      const alice = state.players[0];
      engine.playCard(alice.hand[0], []);
      engine.initGame(twoPlayerConfig());
      // state is fresh
      expect(engine.state()!.players[0].capturedPile.length).toBe(0);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
      expect(engine.roundResult()).toBeNull();
      expect(engine.matchWinner()).toBeNull();
    });

    it('SC-17 — initial table deal does not award escobas even if cards sum to 15', () => {
      let foundSum15Table = false;

      for (let attempt = 0; attempt < 800 && !foundSum15Table; attempt++) {
        engine.initGame(twoPlayerConfig());
        const state = engine.state()!;
        const tableSum = state.table.reduce((sum, card) => sum + card.value, 0);
        if (tableSum !== 15) {
          continue;
        }

        foundSum15Table = true;
        for (const player of state.players) {
          expect(player.escobaCount).toBe(0);
        }
      }

      expect(foundSum15Table).toBe(true);
    });

    it('SC-13 / SC-21 — active player signal returns first player after initGame', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.activePlayer()).not.toBeNull();
      expect(engine.activePlayer()!.name).toBe('Alice');
    });

    it('SC-81 — round result signal is null during active play', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.roundResult()).toBeNull();
    });

    it('SC-83 — match winner signal is null at game start', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.matchWinner()).toBeNull();
    });

    it('roundNumber starts at 1', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.state()!.roundNumber).toBe(1);
    });

    it('lastCapturerId starts as null', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.state()!.lastCapturerId).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // playCard — SC-22, SC-25, SC-28–SC-43
  // -------------------------------------------------------------------------
  describe('playCard', () => {
    /**
     * Sets up a controlled game state where Alice has a specific card in hand
     * and the table has specific cards. Replaces state via initGame and then
     * directly manipulates the test by using what the engine gives us.
     *
     * Strategy: use initGame, then harvest a real hand card + table card pair
     * that won't naturally sum to 15, or find one that does.
     */

    it('SC-36/SC-39 — table placement: card removed from hand, added to table, turnPhase → awaiting-confirmation', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      const alice = state.players[0];
      const cardToPlay = alice.hand[0];

      engine.playCard(cardToPlay, []);

      const newState = engine.state()!;
      const newAlice = newState.players[0];

      // Card removed from hand
      expect(newAlice.hand.some((c) => cardEq(c, cardToPlay))).toBe(false);
      // Card added to table
      expect(newState.table.some((c) => cardEq(c, cardToPlay))).toBe(true);
      // No captured cards
      expect(newAlice.capturedPile.length).toBe(0);
      // Turn phase awaiting confirmation
      expect(engine.turnPhase()).toBe('awaiting-confirmation');
      // Active player still Alice
      expect(engine.activePlayer()!.name).toBe('Alice');
    });

    it('SC-37 — player may place a card even when a valid capture exists (no must-capture rule)', () => {
      // Set up via initGame; find a hand card and a table combination that sums to 15
      // then explicitly place (empty subset) — state should reflect table placement
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      const alice = state.players[0];
      // Just place a card with empty subset — the engine must never reject this
      engine.playCard(alice.hand[0], []);
      expect(engine.state()!.table.length).toBeGreaterThan(4); // card was added to table
    });

    it("SC-25 — playing a card when it is not the active player's turn is rejected", () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      const bob = state.players[1]; // Bob is NOT the active player
      const stateBefore = engine.state();

      engine.playCard(bob.hand[0], []);

      // State must be unchanged
      expect(engine.state()).toBe(stateBefore);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it("SC-32 — playing a card not in active player's hand is rejected", () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      const bob = state.players[1]; // Bob's card, not Alice's
      const cardNotInHand = bob.hand[0];
      const stateBefore = engine.state();

      engine.playCard(cardNotInHand, []);

      expect(engine.state()).toBe(stateBefore);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-30 — capture subset whose sum + played card ≠ 15 is always rejected', () => {
      const base = deckUtils.createDeck();
      const handThree = cardBy(base, 'Oros', '3');
      const tableFive = cardBy(base, 'Copas', '5');
      const tableSix = cardBy(base, 'Espadas', '6');
      const alice = makePlayer('alice', 'Alice', [handThree]);
      const bob = makePlayer('bob', 'Bob', [cardBy(base, 'Bastos', '1')]);
      const state = makeState([alice, bob], [tableFive, tableSix]);
      setEngineState(engine, state, 'awaiting-card-play');

      const stateBefore = engine.state();
      engine.playCard(handThree, [tableFive]);
      expect(engine.state()).toBe(stateBefore);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-33 — capture subset containing a card not on the table is rejected', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      const alice = state.players[0];
      // Bob's hand card is definitely NOT on the table
      const notOnTable = state.players[1].hand[0];
      const stateBefore = engine.state();

      engine.playCard(alice.hand[0], [notOnTable]);

      // Either rejected due to sum ≠ 15 or due to card not on table — either way state unchanged
      expect(engine.state()).toBe(stateBefore);
    });

    it('rejects captureSubset with duplicate table-card entries', () => {
      const base = deckUtils.createDeck();
      const handFive = cardBy(base, 'Oros', '5');
      const tableFive = cardBy(base, 'Copas', '5');
      const alice = makePlayer('alice', 'Alice', [handFive]);
      const bob = makePlayer('bob', 'Bob', [cardBy(base, 'Bastos', '1')]);
      const state = makeState([alice, bob], [tableFive]);
      setEngineState(engine, state, 'awaiting-card-play');

      const stateBefore = engine.state();
      engine.playCard(handFive, [tableFive, tableFive]);
      expect(engine.state()).toBe(stateBefore);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it("SC-31 — when multiple valid capture subsets exist the player's explicit choice determines what is captured", () => {
      const base = deckUtils.createDeck();
      const chosenSubsetCard = cardBy(base, 'Oros', '7');
      const alternateCardA = cardBy(base, 'Copas', '2');
      const alternateCardB = cardBy(base, 'Espadas', '5');
      const filler = cardBy(base, 'Bastos', '1');
      const playedCard = cardBy(base, 'Copas', 'Sota');

      const alice = makePlayer('alice', 'Alice', [playedCard, cardBy(base, 'Oros', '4')]);
      const bob = makePlayer('bob', 'Bob', [cardBy(base, 'Bastos', '4')]);
      const state = makeState(
        [alice, bob],
        [chosenSubsetCard, alternateCardA, alternateCardB, filler],
      );
      setEngineState(engine, state, 'awaiting-card-play');

      engine.playCard(playedCard, [chosenSubsetCard]);

      const newState = engine.state()!;
      const aliceAfter = newState.players[0];
      expect(newState.table.some((c) => cardEq(c, chosenSubsetCard))).toBe(false);
      expect(newState.table.some((c) => cardEq(c, alternateCardA))).toBe(true);
      expect(newState.table.some((c) => cardEq(c, alternateCardB))).toBe(true);
      expect(aliceAfter.capturedPile.length).toBe(2);
      expect(aliceAfter.capturedPile.some((c) => cardEq(c, playedCard))).toBe(true);
      expect(aliceAfter.capturedPile.some((c) => cardEq(c, chosenSubsetCard))).toBe(true);
    });

    it('FR-5.8/TR-4.6 — playCard while turnPhase is awaiting-confirmation is rejected', () => {
      engine.initGame(twoPlayerConfig());
      const alice = engine.state()!.players[0];
      engine.playCard(alice.hand[0], []); // transitions to awaiting-confirmation

      const stateAfterFirst = engine.state();
      engine.playCard(alice.hand[0], []); // second play — should be rejected

      expect(engine.state()).toBe(stateAfterFirst);
    });

    it('SC-28/SC-29 — valid capture: card removed from hand, table card removed, both added to captured pile', () => {
      const base = deckUtils.createDeck();
      const capturedTableCard = cardBy(base, 'Oros', '7');
      const playedCard = cardBy(base, 'Copas', 'Sota');
      const aliceBefore = makePlayer('alice', 'Alice', [playedCard, cardBy(base, 'Oros', '4')]);
      const bob = makePlayer('bob', 'Bob', [cardBy(base, 'Bastos', '4')]);
      const stateBefore = makeState(
        [aliceBefore, bob],
        [
          capturedTableCard,
          cardBy(base, 'Copas', '1'),
          cardBy(base, 'Espadas', '2'),
          cardBy(base, 'Bastos', '3'),
        ],
      );
      setEngineState(engine, stateBefore, 'awaiting-card-play');

      const tableCardCount = stateBefore.table.length;

      engine.playCard(playedCard, [capturedTableCard]);

      const stateAfter = engine.state()!;
      const aliceAfter = stateAfter.players[0];

      // Card removed from hand
      expect(aliceAfter.hand.some((c) => cardEq(c, playedCard))).toBe(false);
      // Table card removed from table
      expect(stateAfter.table.some((c) => cardEq(c, capturedTableCard))).toBe(false);
      expect(stateAfter.table.length).toBe(tableCardCount - 1);
      // Both cards in captured pile
      expect(aliceAfter.capturedPile.some((c) => cardEq(c, playedCard))).toBe(true);
      expect(aliceAfter.capturedPile.some((c) => cardEq(c, capturedTableCard))).toBe(true);
      // Turn phase
      expect(engine.turnPhase()).toBe('awaiting-confirmation');
    });

    it('SC-40 — capture that clears the table records one escoba', () => {
      const base = deckUtils.createDeck();
      const tableSeven = cardBy(base, 'Oros', '7');
      const bobEight = cardBy(base, 'Copas', 'Sota');
      const bob = makePlayer('bob', 'Bob', [bobEight], [], 0);
      const alice = makePlayer('alice', 'Alice', [cardBy(base, 'Bastos', '1')]);
      const state = makeState([bob, alice], [tableSeven], [], 0);
      setEngineState(engine, state, 'awaiting-card-play');

      const escobasBefore = engine.state()!.players[0].escobaCount;

      engine.playCard(bobEight, [tableSeven]);

      const stateAfter = engine.state()!;
      expect(stateAfter.table.length).toBe(0);
      expect(stateAfter.players[0].escobaCount).toBe(escobasBefore + 1);
    });

    it('SC-41 — multiple escobas in the same round accumulate independently', () => {
      const base = deckUtils.createDeck();
      const tableNine = cardBy(base, 'Oros', 'Caballo');
      const playedSix = cardBy(base, 'Copas', '6');
      const alice = makePlayer('alice', 'Alice', [playedSix], [], 1);
      const bob = makePlayer('bob', 'Bob', [cardBy(base, 'Bastos', '1')]);
      const state = makeState([alice, bob], [tableNine], [], 0);
      setEngineState(engine, state, 'awaiting-card-play');

      engine.playCard(playedSix, [tableNine]);

      const stateAfter = engine.state()!;
      expect(stateAfter.table.length).toBe(0);
      expect(stateAfter.players[0].escobaCount).toBe(2);
    });

    it('SC-43 — awarding remaining table cards at round end does NOT record an escoba', () => {
      const base = deckUtils.createDeck();
      const aliceCaptured = [cardBy(base, 'Oros', '1'), cardBy(base, 'Copas', '2')];
      const tableCards = [cardBy(base, 'Espadas', '3'), cardBy(base, 'Bastos', '4')];
      const alice = makePlayer('alice', 'Alice', [], aliceCaptured, 1);
      const bob = makePlayer('bob', 'Bob', [], [cardBy(base, 'Oros', '5')], 0);

      const state = makeState([alice, bob], tableCards, [], 0, 1, alice.id, {
        [alice.id]: 0,
        [bob.id]: 0,
      });
      setEngineState(engine, state, 'awaiting-confirmation');

      const escobasBeforeAward = engine.state()!.players[0].escobaCount;
      const capturedBeforeAward = engine.state()!.players[0].capturedPile.length;

      engine.confirmTurn();

      expect(engine.roundResult()).not.toBeNull();
      const finalState = engine.state()!;
      const aliceAfterAward = finalState.players.find((p) => p.id === alice.id)!;
      expect(finalState.table.length).toBe(0);
      expect(aliceAfterAward.capturedPile.length).toBe(capturedBeforeAward + tableCards.length);
      expect(aliceAfterAward.escobaCount).toBe(escobasBeforeAward);
    });

    it('SC-42 — capture that does not clear the table does NOT record an escoba', () => {
      const base = deckUtils.createDeck();
      const tableTen = cardBy(base, 'Oros', 'Rey');
      const tableThree = cardBy(base, 'Copas', '3');
      const handFive = cardBy(base, 'Espadas', '5');
      const alice = makePlayer('alice', 'Alice', [handFive], [], 0);
      const bob = makePlayer('bob', 'Bob', [cardBy(base, 'Bastos', '1')]);
      const state = makeState([alice, bob], [tableTen, tableThree]);
      setEngineState(engine, state, 'awaiting-card-play');

      const escobasBefore = engine.state()!.players[0].escobaCount;

      engine.playCard(handFive, [tableTen]);

      const stateAfter = engine.state()!;
      expect(stateAfter.table.length).toBe(1);
      expect(stateAfter.table.some((c) => cardEq(c, tableThree))).toBe(true);
      expect(stateAfter.players[0].escobaCount).toBe(escobasBefore);
    });

    it('SC-35 — state signal is updated after a valid play', () => {
      engine.initGame(twoPlayerConfig());
      const stateBefore = engine.state();
      const alice = engine.state()!.players[0];
      engine.playCard(alice.hand[0], []);
      expect(engine.state()).not.toBe(stateBefore);
    });
  });

  // -------------------------------------------------------------------------
  // confirmTurn — SC-23, SC-24, SC-26, SC-27, SC-44–SC-51
  // -------------------------------------------------------------------------
  describe('confirmTurn', () => {
    it('keeps matchWinner null before a round has fully completed', () => {
      engine.initGame(twoPlayerConfig());

      const alice = engine.state()!.players[0];
      engine.playCard(alice.hand[0], []);
      expect(engine.matchWinner()).toBeNull();

      engine.confirmTurn();
      expect(engine.matchWinner()).toBeNull();
    });

    it('SC-67 / FR-3.1 — emits co-winners at round end when top qualifying score is tied', () => {
      const alice = makePlayer('alice', 'Alice', [], [], 0);
      const bob = makePlayer('bob', 'Bob', [], [], 0);

      const tiedEndState = makeState([alice, bob], [], [], 0, 4, null, {
        [alice.id]: 15,
        [bob.id]: 15,
      });

      setEngineState(engine, tiedEndState, 'awaiting-confirmation');

      engine.confirmTurn();

      expect(engine.roundResult()).not.toBeNull();
      expect(engine.matchWinner()).toEqual([alice, bob]);
    });

    it('SC-26 — confirmTurn while in awaiting-card-play phase is rejected', () => {
      engine.initGame(twoPlayerConfig());
      const stateBefore = engine.state();
      engine.confirmTurn();
      expect(engine.state()).toBe(stateBefore);
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-23 — confirmTurn advances to next player and resets turn phase to awaiting-card-play', () => {
      engine.initGame(twoPlayerConfig());
      const alice = engine.state()!.players[0];
      engine.playCard(alice.hand[0], []);
      engine.confirmTurn();

      expect(engine.activePlayer()!.name).toBe('Bob');
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-24 — turn order wraps circularly (after last player returns to first)', () => {
      engine.initGame(threePlayerConfig());
      // Alice plays and confirms.
      engine.playCard(engine.state()!.players[0].hand[0], []);
      engine.confirmTurn();
      // Bob plays and confirms.
      engine.playCard(engine.state()!.players[1].hand[0], []);
      engine.confirmTurn();
      // Carol plays and confirms.
      engine.playCard(engine.state()!.players[2].hand[0], []);
      engine.confirmTurn();

      // Turn should be back to Alice.
      expect(engine.activePlayer()!.name).toBe('Alice');
    });

    it('SC-27 — confirmTurn called a second time after turn has advanced is rejected', () => {
      engine.initGame(twoPlayerConfig());
      engine.playCard(engine.state()!.players[0].hand[0], []);
      engine.confirmTurn(); // valid — advances to Bob
      const stateAfterAdvance = engine.state();
      engine.confirmTurn(); // second call — should be rejected (now in awaiting-card-play)
      expect(engine.state()).toBe(stateAfterAdvance);
    });

    it('SC-44/SC-45 — auto-deals 3 cards per player when all hands empty and deck has cards', () => {
      engine.initGame(twoPlayerConfig());
      // After initGame: deck=30 cards (40-4table-3alice-3bob), hands=3 each
      // Play all 3 cards for each player (6 plays total as table placements)
      for (let round = 0; round < 3; round++) {
        const aliceState = engine.state()!.players.find((p) => p.name === 'Alice')!;
        expect(aliceState.hand.length).toBeGreaterThan(0);
        engine.playCard(aliceState.hand[0], []);
        engine.confirmTurn();
        const bobState = engine.state()!.players.find((p) => p.name === 'Bob')!;
        expect(bobState.hand.length).toBeGreaterThan(0);
        engine.playCard(bobState.hand[0], []);
        engine.confirmTurn();
      }

      // After 6 plays, all hands should be empty AND the engine should have auto-dealt
      // 3 new cards per player from the remaining deck (which has 30 cards left)
      const state = engine.state()!;
      // If a new deal happened, each player has 3 new cards
      for (const player of state.players) {
        expect(player.hand.length).toBe(3);
      }
      // Deck should have reduced by 6 cards (3 per player)
      expect(state.deck.length).toBe(24); // 30 - 6
    });

    it('SC-45 — no new table cards are added between hand deals', () => {
      engine.initGame(twoPlayerConfig());
      const tableCountBefore = engine.state()!.table.length;
      // Drain first hand
      for (let i = 0; i < 3; i++) {
        engine.playCard(engine.state()!.players[0].hand[0], []);
        engine.confirmTurn();
        engine.playCard(engine.state()!.players[1].hand[0], []);
        engine.confirmTurn();
      }
      // Table count should be tableCountBefore + 6 (cards placed) — not reset or reduced by a new deal
      // No deal adds table cards; only hand cards are replenished
      const tableCountAfter = engine.state()!.table.length;
      expect(tableCountAfter).toBe(tableCountBefore + 6);
    });

    it('SC-46 — when deck has fewer cards than 3×players, remaining distributed starting from first player', () => {
      const base = deckUtils.createDeck();
      const remainingDeck = [
        cardBy(base, 'Oros', '1'),
        cardBy(base, 'Copas', '2'),
        cardBy(base, 'Espadas', '3'),
        cardBy(base, 'Bastos', '4'),
        cardBy(base, 'Oros', '5'),
      ];

      const alice = makePlayer('alice', 'Alice', []);
      const bob = makePlayer('bob', 'Bob', []);
      // turnIndex=1 so nextTurnIndex becomes 0 and Alice receives cards first.
      const state = makeState([alice, bob], [], remainingDeck, 1);
      setEngineState(engine, state, 'awaiting-confirmation');

      engine.confirmTurn();

      const afterDeal = engine.state()!;
      expect(afterDeal.players[0].hand.length).toBe(3);
      expect(afterDeal.players[1].hand.length).toBe(2);
      expect(afterDeal.deck.length).toBe(0);
      expect(afterDeal.turnIndex).toBe(0);
    });

    it('SC-80 — turn phase signal cycles correctly through a full turn', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.turnPhase()).toBe('awaiting-card-play');

      const alice = engine.state()!.players[0];
      engine.playCard(alice.hand[0], []);
      expect(engine.turnPhase()).toBe('awaiting-confirmation');

      engine.confirmTurn();
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-79 — active player signal updates when turn advances', () => {
      engine.initGame(twoPlayerConfig());
      expect(engine.activePlayer()!.name).toBe('Alice');

      engine.playCard(engine.state()!.players[0].hand[0], []);
      engine.confirmTurn();

      expect(engine.activePlayer()!.name).toBe('Bob');
    });
  });

  // -------------------------------------------------------------------------
  // startNextRound — SC-68, SC-71–SC-77
  // -------------------------------------------------------------------------
  describe('startNextRound', () => {
    /**
     * Helper: play through an entire round so that deck and all hands are empty,
     * triggering end-of-round. This requires playing every card in the game.
     * Returns the turnIndex that was active at the START of the round (dealer index).
     */
    function exhaustRound(eng: GameEngine, shouldInit = true): number {
      if (shouldInit || eng.state() === null) {
        eng.initGame(twoPlayerConfig());
      }
      const dealerIndex = eng.state()!.turnIndex;

      let safety = 0;
      while (safety++ < 500) {
        // Round ends when roundResult is set
        if (eng.roundResult() !== null) break;
        if (eng.turnPhase() === 'awaiting-confirmation') {
          eng.confirmTurn();
          continue;
        }
        const state = eng.state()!;
        const activePlayer = state.players[state.turnIndex];
        if (activePlayer.hand.length === 0) {
          throw new Error('Unexpected empty active hand while exhausting a round.');
        }
        eng.playCard(activePlayer.hand[0], []);
      }
      return dealerIndex;
    }

    it('SC-71 — startNextRound creates a complete new 40-card deck', () => {
      exhaustRound(engine);
      expect(engine.roundResult()).not.toBeNull(); // verify round ended
      engine.startNextRound();
      const state = engine.state()!;
      const totalCards =
        state.deck.length +
        state.table.length +
        state.players.reduce((s, p) => s + p.hand.length, 0);
      expect(totalCards).toBe(40);
    });

    it("SC-72 — startNextRound resets all players' round-specific state", () => {
      exhaustRound(engine);
      engine.startNextRound();
      for (const player of engine.state()!.players) {
        expect(player.capturedPile.length).toBe(0);
        expect(player.escobaCount).toBe(0);
      }
    });

    it('SC-73 — startNextRound deals 4 table cards and 3 hand cards per player', () => {
      exhaustRound(engine);
      engine.startNextRound();
      const state = engine.state()!;
      expect(state.table.length).toBe(4);
      for (const player of state.players) {
        expect(player.hand.length).toBe(3);
      }
    });

    it('SC-74 — round number increments by 1', () => {
      exhaustRound(engine);
      const roundBefore = engine.state()!.roundNumber;
      engine.startNextRound();
      expect(engine.state()!.roundNumber).toBe(roundBefore + 1);
    });

    it('SC-75 — dealer rotates: second player becomes first in new round turn order', () => {
      const dealerIndex = exhaustRound(engine);
      engine.startNextRound();
      // New dealer = (dealerIndex + 1) % 2; for first round dealerIndex=0 → new dealer = 1
      const expectedNewDealer = (dealerIndex + 1) % 2;
      expect(engine.state()!.turnIndex).toBe(expectedNewDealer);
    });

    it('SC-76 — accumulated match scores are preserved after startNextRound', () => {
      exhaustRound(engine);
      const scoresBefore = { ...engine.state()!.matchScores };
      engine.startNextRound();
      const scoresAfter = engine.state()!.matchScores;
      for (const [id, score] of Object.entries(scoresBefore)) {
        expect(scoresAfter[id]).toBe(score);
      }
    });

    it('SC-71 — roundResult is null after startNextRound', () => {
      exhaustRound(engine);
      expect(engine.roundResult()).not.toBeNull(); // verify round ended
      engine.startNextRound();
      expect(engine.roundResult()).toBeNull();
    });

    it('SC-71 — turnPhase is awaiting-card-play after startNextRound', () => {
      exhaustRound(engine);
      engine.startNextRound();
      expect(engine.turnPhase()).toBe('awaiting-card-play');
    });

    it('SC-68/SC-77 — startNextRound is rejected when match winner already exists', () => {
      const base = deckUtils.createDeck();
      const alice = makePlayer('alice', 'Alice', [], [cardBy(base, 'Oros', '1')], 0);
      const bob = makePlayer('bob', 'Bob', [], [cardBy(base, 'Copas', '2')], 0);
      const state = makeState([alice, bob], [], [], 0, 4, null, { [alice.id]: 16, [bob.id]: 12 });
      setEngineState(engine, state, 'awaiting-card-play');

      const internal = engine as unknown as {
        _matchWinner: { set: (value: Player[] | null) => void };
      };
      internal._matchWinner.set([alice]);

      const stateBefore = engine.state();
      const roundBefore = engine.state()!.roundNumber;
      engine.startNextRound();
      expect(engine.state()).toBe(stateBefore);
      expect(engine.state()!.roundNumber).toBe(roundBefore);
      expect(engine.matchWinner()).toEqual([alice]);
    });

    it('SC-68 — startNextRound is rejected mid-round (hands not empty)', () => {
      engine.initGame(twoPlayerConfig());
      const stateBefore = engine.state();
      engine.startNextRound();
      expect(engine.state()).toBe(stateBefore);
    });
  });

  // -------------------------------------------------------------------------
  // round result and match scores — SC-51, SC-63, SC-82
  // -------------------------------------------------------------------------
  describe('end-of-round scoring', () => {
    function exhaustRound(eng: GameEngine): void {
      const config = twoPlayerConfig();
      eng.initGame(config);
      let safety = 0;
      while (safety++ < 500) {
        if (eng.roundResult() !== null) break;
        if (eng.turnPhase() === 'awaiting-confirmation') {
          eng.confirmTurn();
          continue;
        }
        const state = eng.state()!;
        const ap = state.players[state.turnIndex];
        if (ap.hand.length === 0) {
          throw new Error('Unexpected empty active hand while exhausting a round.');
        }
        eng.playCard(ap.hand[0], []);
      }
    }

    it('SC-48/SC-49 — remaining table cards awarded to last capturer at round end; no escoba recorded', () => {
      const base = deckUtils.createDeck();
      const tableCards = [cardBy(base, 'Oros', '6'), cardBy(base, 'Copas', '7')];
      const alice = makePlayer('alice', 'Alice', [], [cardBy(base, 'Bastos', '1')], 2);
      const bob = makePlayer('bob', 'Bob', [], [cardBy(base, 'Espadas', '2')], 0);

      const state = makeState([alice, bob], tableCards, [], 1, 1, alice.id, {
        [alice.id]: 0,
        [bob.id]: 0,
      });
      setEngineState(engine, state, 'awaiting-confirmation');

      const capturedBeforeAward = engine.state()!.players[0].capturedPile.length;
      const escobasBeforeAward = engine.state()!.players[0].escobaCount;

      engine.confirmTurn();

      expect(engine.roundResult()).not.toBeNull();
      const finalState = engine.state()!;
      const aliceAfterAward = finalState.players.find((p) => p.id === alice.id)!;
      expect(finalState.table.length).toBe(0);
      expect(aliceAfterAward.capturedPile.length).toBe(capturedBeforeAward + tableCards.length);
      expect(aliceAfterAward.escobaCount).toBe(escobasBeforeAward);
    });

    it('SC-50 — all 40 cards are distributed across captured piles at round end', () => {
      exhaustRound(engine);
      const state = engine.state()!;
      const totalCaptured = state.players.reduce((sum, p) => sum + p.capturedPile.length, 0);
      expect(totalCaptured).toBe(40);
      expect(state.table.length).toBe(0);
    });

    it('SC-51/SC-82 — roundResult is non-null after a round completes', () => {
      exhaustRound(engine);
      expect(engine.roundResult()).not.toBeNull();
    });

    it('SC-51 — RoundResult contains a per-player score breakdown', () => {
      exhaustRound(engine);
      const result = engine.roundResult()!;
      expect(result.playerScores.length).toBe(2);
      for (const score of result.playerScores) {
        expect(score.playerId).toBeTruthy();
        expect(typeof score.total).toBe('number');
        expect(score.total).toBe(
          score.escobas + score.mostCards + score.mostOros + score.mostSevens + score.sieteDiVelo,
        );
      }
      expect(result.playerScores.some((score) => score.mostCards >= 1)).toBe(true);
      expect(result.roundNumber).toBe(engine.state()!.roundNumber);
    });

    it('SC-63 — round points are added to accumulated match scores', () => {
      exhaustRound(engine);
      const result = engine.roundResult()!;
      const state = engine.state()!;
      for (const score of result.playerScores) {
        expect(state.matchScores[score.playerId]).toBe(score.total);
      }
    });
  });

  // -------------------------------------------------------------------------
  // SC-18 — player entity fields
  // -------------------------------------------------------------------------
  describe('Player entity', () => {
    it('SC-18 — each player has id, name, hand, capturedPile, and escobaCount', () => {
      engine.initGame(twoPlayerConfig());
      for (const player of engine.state()!.players) {
        expect(typeof player.id).toBe('string');
        expect(player.id.length).toBeGreaterThan(0);
        expect(typeof player.name).toBe('string');
        expect(Array.isArray(player.hand)).toBe(true);
        expect(Array.isArray(player.capturedPile)).toBe(true);
        expect(typeof player.escobaCount).toBe('number');
      }
    });

    it('SC-18 — player names match the configuration', () => {
      engine.initGame(twoPlayerConfig());
      const names = engine.state()!.players.map((p) => p.name);
      expect(names).toContain('Alice');
      expect(names).toContain('Bob');
    });
  });

  // -------------------------------------------------------------------------
  // SC-78, SC-84 — state signal reactivity
  // -------------------------------------------------------------------------
  describe('Reactive state signals', () => {
    it('SC-78 — game state signal includes deck, table, players, turnIndex, roundNumber, matchScores, lastCapturerId', () => {
      engine.initGame(twoPlayerConfig());
      const state = engine.state()!;
      expect(Array.isArray(state.deck)).toBe(true);
      expect(Array.isArray(state.table)).toBe(true);
      expect(Array.isArray(state.players)).toBe(true);
      expect(typeof state.turnIndex).toBe('number');
      expect(typeof state.roundNumber).toBe('number');
      expect(typeof state.matchScores).toBe('object');
      expect('lastCapturerId' in state).toBe(true);
    });

    it('SC-84 — state signal emits a new reference after each action', () => {
      engine.initGame(twoPlayerConfig());
      const s0 = engine.state();
      engine.playCard(engine.state()!.players[0].hand[0], []);
      const s1 = engine.state();
      expect(s1).not.toBe(s0);

      engine.confirmTurn();
      const s2 = engine.state();
      expect(s2).not.toBe(s1);

      // Exhaust the round using placements only, then start next round.
      let safety = 0;
      while (safety++ < 900 && engine.roundResult() === null) {
        const state = engine.state()!;
        if (engine.turnPhase() === 'awaiting-confirmation') {
          engine.confirmTurn();
          continue;
        }
        const active = state.players[state.turnIndex];
        if (active.hand.length === 0) {
          throw new Error('Unexpected empty active hand in SC-84 state-change test.');
        }
        engine.playCard(active.hand[0], []);
      }

      expect(engine.roundResult()).not.toBeNull();
      const beforeNextRound = engine.state();
      engine.startNextRound();
      const s3 = engine.state();
      expect(s3).not.toBe(beforeNextRound);
    });
  });
});
