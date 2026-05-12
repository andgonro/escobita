// T-8, T-9, T-10, T-11: GameEngine service
// Covers: FR-2.1–FR-2.5, FR-3.1–FR-3.3, FR-4.1–FR-4.4, FR-5.1–FR-5.8,
//         FR-6.1–FR-6.3, FR-7.1–FR-7.3, FR-8.1–FR-8.4, FR-9.1–FR-9.5,
//         FR-10.1–FR-10.3, TR-4.1–TR-4.6, AD-1, AD-2, AD-3, AD-7, AD-8

import { Injectable, Signal, computed, isDevMode, signal } from '@angular/core';
import { GameConfiguration } from '../../models/game-configuration';
import { Card } from '../../models/card';
import { Player } from '../../models/player';
import { GameState, TurnPhase } from '../../models/game-state';
import { RoundResult } from '../../models/round-result';
import { createDeck, shuffleDeck } from '../utils/deck.utils';
import { computeRoundResult } from '../utils/scoring.utils';
import { checkWinCondition } from '../utils/win-condition.utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cardEq(a: Card, b: Card): boolean {
  return a.suit === b.suit && a.rank === b.rank;
}

function bytesToUuidV4(bytes: Uint8Array): string {
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

function generateId(): string {
  const cryptoApi = globalThis.crypto;
  if (cryptoApi?.randomUUID) {
    return cryptoApi.randomUUID();
  }

  if (!cryptoApi?.getRandomValues) {
    throw new Error('Secure random source is not available for player id generation.');
  }

  const bytes = new Uint8Array(16);
  cryptoApi.getRandomValues(bytes);
  return bytesToUuidV4(bytes);
}

function warn(message: string): void {
  if (isDevMode()) {
    console.warn(message);
  }
}

function buildPlayers(playerNames: string[]): Player[] {
  return playerNames.map((name) => ({
    id: generateId(),
    name,
    hand: [],
    capturedPile: [],
    escobaCount: 0,
  }));
}

function dealInitialState(
  shuffled: Card[],
  players: Player[],
  matchScores: Record<string, number>,
  roundNumber: number,
): GameState {
  const remaining = [...shuffled];

  // Deal 4 cards face-up to the table (FR-2.2)
  const table = remaining.splice(0, 4);

  // Deal 3 cards per player in order (FR-2.3)
  const dealtPlayers = players.map((p) => ({
    ...p,
    hand: remaining.splice(0, 3),
    capturedPile: [],
    escobaCount: 0,
  }));

  return {
    deck: remaining,
    table,
    players: dealtPlayers,
    turnIndex: 0,
    roundNumber,
    matchScores,
    lastCapturerId: null,
  };
}

function freezeArray<T>(items: T[]): T[] {
  return Object.freeze([...items]) as T[];
}

function freezePlayer(player: Player): Player {
  return Object.freeze({
    ...player,
    hand: freezeArray(player.hand),
    capturedPile: freezeArray(player.capturedPile),
  }) as Player;
}

function freezeGameState(state: GameState): GameState {
  return Object.freeze({
    ...state,
    deck: freezeArray(state.deck),
    table: freezeArray(state.table),
    players: freezeArray(state.players.map(freezePlayer)),
    matchScores: Object.freeze({ ...state.matchScores }) as Record<string, number>,
  }) as GameState;
}

export type EngineE2eFixture =
  | 'escoba-visibility'
  | 'round-winner-visibility'
  | 'round-co-winner-visibility'
  | 'round-complete-no-winner'
  | 'pre-final-turn-no-winner';

export interface EngineE2eFixtureResult {
  escobaPlayerName?: string;
  escobaCount?: number;
  roundNumber?: number;
  winnerName?: string;
  topScore?: number;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class GameEngine {
  // Private writable signals (AD-2, AD-3, AD-8)
  private readonly _state = signal<GameState | null>(null);
  private readonly _turnPhase = signal<TurnPhase>('awaiting-card-play');
  private readonly _roundResult = signal<RoundResult | null>(null);
  private readonly _matchWinner = signal<Player[] | null>(null);

  // Public read-only signals (TR-4.3, NFR-2.1)
  readonly state: Signal<GameState | null> = this._state.asReadonly();
  readonly turnPhase: Signal<TurnPhase> = this._turnPhase.asReadonly();
  readonly roundResult: Signal<RoundResult | null> = this._roundResult.asReadonly();
  readonly matchWinner: Signal<Player[] | null> = this._matchWinner.asReadonly();

  /** Computed signal: derives the active player from current state. */
  readonly activePlayer: Signal<Player | null> = computed(() => {
    const s = this._state();
    if (!s) return null;
    return s.players[s.turnIndex] ?? null;
  });

  /**
   * Applies deterministic fixture snapshots for Cypress E2E setup through a controlled, public seam.
   * This avoids test-time private signal mutation from outside the service boundary.
   */
  applyE2eFixture(fixture: EngineE2eFixture): EngineE2eFixtureResult {
    if (!isDevMode()) {
      throw new Error('[GameEngine] applyE2eFixture is only available in dev mode.');
    }

    const state = this._state();
    if (!state) {
      throw new Error('[GameEngine] applyE2eFixture requires an initialized game state.');
    }

    switch (fixture) {
      case 'escoba-visibility': {
        const escobaPlayer = state.players[0] ?? null;
        if (!escobaPlayer) {
          throw new Error('[GameEngine] escoba fixture requires at least one player.');
        }

        const escobaCount = Math.max(1, escobaPlayer.escobaCount + 1);
        const escobaState: GameState = {
          ...state,
          table: [],
          lastCapturerId: escobaPlayer.id,
          players: state.players.map((player) => {
            if (player.id !== escobaPlayer.id) {
              return player;
            }

            return {
              ...player,
              escobaCount,
            };
          }),
        };

        this._state.set(freezeGameState(escobaState));

        return {
          escobaPlayerName: escobaPlayer.name,
          escobaCount,
        };
      }

      case 'round-winner-visibility': {
        const winner = state.players[0] ?? null;
        if (!winner) {
          throw new Error('[GameEngine] round/winner fixture requires at least one player.');
        }

        const roundResult: RoundResult = {
          roundNumber: state.roundNumber + 41,
          playerScores: state.players.map((player, playerIndex) => ({
            playerId: player.id,
            escobas: playerIndex === 0 ? 2 : 0,
            mostCards: playerIndex === 0 ? 1 : 0,
            mostOros: playerIndex === 0 ? 1 : 0,
            mostSevens: playerIndex === 0 ? 1 : 0,
            sieteDiVelo: 0,
            total: playerIndex === 0 ? 13 : 1,
          })),
        };

        this._roundResult.set(roundResult);
        this._matchWinner.set([winner]);
        this._turnPhase.set('awaiting-card-play');

        return {
          roundNumber: roundResult.roundNumber,
          winnerName: winner.name,
          topScore: roundResult.playerScores[0]?.total ?? 0,
        };
      }

      case 'round-co-winner-visibility': {
        const winnerA = state.players[0] ?? null;
        const winnerB = state.players[1] ?? null;
        if (!winnerA || !winnerB) {
          throw new Error('[GameEngine] co-winner fixture requires at least two players.');
        }

        const roundNumber = state.roundNumber + 57;
        const topScore = 7;
        const roundResult: RoundResult = {
          roundNumber,
          playerScores: state.players.map((player, playerIndex) => {
            if (playerIndex < 2) {
              return {
                playerId: player.id,
                escobas: 1,
                mostCards: 1,
                mostOros: 0,
                mostSevens: 0,
                sieteDiVelo: 0,
                total: topScore,
              };
            }

            return {
              playerId: player.id,
              escobas: 0,
              mostCards: 0,
              mostOros: 0,
              mostSevens: 0,
              sieteDiVelo: 0,
              total: 0,
            };
          }),
        };

        const players = state.players.map((player) => ({
          ...player,
          hand: [],
        }));

        const coWinnerState: GameState = {
          ...state,
          deck: [],
          table: [...state.table],
          players,
          turnIndex: 0,
          roundNumber,
          matchScores: players.reduce<Record<string, number>>((scoreMap, player, playerIndex) => {
            scoreMap[player.id] = playerIndex < 2 ? 16 : 8;
            return scoreMap;
          }, {}),
          lastCapturerId: players[0]?.id ?? null,
        };

        this._state.set(freezeGameState(coWinnerState));
        this._roundResult.set(roundResult);
        this._matchWinner.set([winnerA, winnerB]);
        this._turnPhase.set('awaiting-card-play');

        return {
          roundNumber,
          winnerName: `${winnerA.name}, ${winnerB.name}`,
          topScore,
        };
      }

      case 'round-complete-no-winner': {
        const roundNumber = 2;
        const roundCompleteTable: Card[] = [
          { suit: 'Bastos', rank: '6', value: 6 },
          { suit: 'Oros', rank: '2', value: 2 },
        ];
        const playerScores = state.players.map((player, playerIndex) => {
          if (playerIndex === 0) {
            return {
              playerId: player.id,
              escobas: 0,
              mostCards: 0,
              mostOros: 0,
              mostSevens: 1,
              sieteDiVelo: 0,
              total: 1,
            };
          }

          if (playerIndex === 1) {
            return {
              playerId: player.id,
              escobas: 1,
              mostCards: 1,
              mostOros: 1,
              mostSevens: 0,
              sieteDiVelo: 0,
              total: 3,
            };
          }

          return {
            playerId: player.id,
            escobas: 0,
            mostCards: 0,
            mostOros: 0,
            mostSevens: 0,
            sieteDiVelo: 0,
            total: 0,
          };
        });

        const topScore = playerScores.reduce((currentTopScore, score) => {
          return Math.max(currentTopScore, score.total);
        }, 0);

        const roundResult: RoundResult = {
          roundNumber,
          playerScores,
        };

        const players = state.players.map((player) => ({
          ...player,
          hand: [],
        }));

        const fallbackScores = [6, 7, 5, 4];
        const matchScores = players.reduce<Record<string, number>>((scoreMap, player, index) => {
          scoreMap[player.id] = fallbackScores[index] ?? 0;
          return scoreMap;
        }, {});

        const roundCompleteState: GameState = {
          ...state,
          deck: [],
          table: roundCompleteTable,
          players,
          turnIndex: 0,
          roundNumber,
          matchScores,
          lastCapturerId: players[0]?.id ?? null,
        };

        this._state.set(freezeGameState(roundCompleteState));
        this._roundResult.set(roundResult);
        this._matchWinner.set(null);
        this._turnPhase.set('awaiting-card-play');

        return {
          roundNumber,
          topScore,
        };
      }

      case 'pre-final-turn-no-winner': {
        const preFinalTurnTable: Card[] = [
          { suit: 'Espadas', rank: '2', value: 2 },
          { suit: 'Oros', rank: '1', value: 1 },
        ];

        const players: Player[] = state.players.map((player, playerIndex): Player => {
          const capturedPile: Card[] =
            playerIndex === 0 ? [{ suit: 'Copas', rank: '3', value: 3 }] : [];

          return {
            ...player,
            hand: [],
            capturedPile,
            escobaCount: 0,
          };
        });

        const matchScores = players.reduce<Record<string, number>>((scoreMap, player) => {
          scoreMap[player.id] = 0;
          return scoreMap;
        }, {});

        const preFinalTurnState: GameState = {
          ...state,
          deck: [],
          table: preFinalTurnTable,
          players,
          turnIndex: 0,
          roundNumber: 1,
          matchScores,
          lastCapturerId: players[0]?.id ?? null,
        };

        this._state.set(freezeGameState(preFinalTurnState));
        this._roundResult.set(null);
        this._matchWinner.set(null);
        this._turnPhase.set('awaiting-confirmation');

        return {
          roundNumber: preFinalTurnState.roundNumber,
          topScore: 0,
        };
      }

      default:
        throw new Error(`[GameEngine] Unknown E2E fixture: ${fixture}`);
    }
  }

  // ---------------------------------------------------------------------------
  // T-8: initGame
  // ---------------------------------------------------------------------------

  /**
   * Initialises a new match from the provided GameConfiguration.
   * Resets all signals; deals initial table cards and player hands.
   * Covers FR-2.1–FR-2.5, TR-4.4, US-1.
   */
  initGame(config: GameConfiguration): void {
    const players = buildPlayers(config.playerNames);
    const matchScores: Record<string, number> = {};
    for (const player of players) {
      matchScores[player.id] = 0;
    }

    const shuffled = shuffleDeck(createDeck());
    const initialState = dealInitialState(shuffled, players, matchScores, 1);

    this._state.set(freezeGameState(initialState));
    this._turnPhase.set('awaiting-card-play');
    this._roundResult.set(null);
    this._matchWinner.set(null);
  }

  // ---------------------------------------------------------------------------
  // T-9: playCard
  // ---------------------------------------------------------------------------

  /**
   * Executes a card play for the currently active player.
   * Validates the action and applies the state transition (capture or table placement).
   * Transitions turn phase to 'awaiting-confirmation'.
   * Covers FR-5.1–FR-5.8, TR-4.4, TR-4.6, US-3, US-4, US-5.
   */
  playCard(card: Card, captureSubset: Card[]): void {
    const state = this._state();
    if (!state) {
      warn('[GameEngine] playCard called before game was initialised.');
      return;
    }

    // Validate turn phase (AD-1)
    if (this._turnPhase() !== 'awaiting-card-play') {
      warn('[GameEngine] playCard rejected: turn phase is not awaiting-card-play.');
      return;
    }

    const activePlayer = state.players[state.turnIndex];

    // Validate card is in active player's hand (AD-5 — structural equality)
    const cardInHand = activePlayer.hand.find((c) => cardEq(c, card));
    if (!cardInHand) {
      warn('[GameEngine] playCard rejected: card-not-in-active-hand.');
      return;
    }

    // Validate capture subset if non-empty
    if (captureSubset.length > 0) {
      const subsetKeys = new Set<string>();

      // All subset cards must be on the table
      for (const subsetCard of captureSubset) {
        const key = `${subsetCard.suit}-${subsetCard.rank}`;
        if (subsetKeys.has(key)) {
          warn('[GameEngine] playCard rejected: capture-subset-contains-duplicates.');
          return;
        }
        subsetKeys.add(key);

        if (!state.table.some((tc) => cardEq(tc, subsetCard))) {
          warn('[GameEngine] playCard rejected: capture-subset-card-not-on-table.');
          return;
        }
      }
      // Sum must equal 15
      const subsetSum = captureSubset.reduce((sum, c) => sum + c.value, 0);
      if (card.value + subsetSum !== 15) {
        warn('[GameEngine] playCard rejected: invalid-capture-subset-sum.');
        return;
      }
    }

    // Apply the state transition (AD-8 — immutable snapshot)
    let newTable: Card[];
    let newHand: Card[];
    let newCapturedPile: Card[];
    let newEscobaCount: number;
    let newLastCapturerId: string | null = state.lastCapturerId;

    if (captureSubset.length > 0) {
      // Capture play (FR-5.3)
      newHand = activePlayer.hand.filter((c) => !cardEq(c, card));
      newTable = state.table.filter((tc) => !captureSubset.some((sc) => cardEq(tc, sc)));
      newCapturedPile = [...activePlayer.capturedPile, card, ...captureSubset];
      newLastCapturerId = activePlayer.id;
      // Escoba detection (FR-5.4)
      newEscobaCount =
        newTable.length === 0 ? activePlayer.escobaCount + 1 : activePlayer.escobaCount;
    } else {
      // Table placement (FR-5.5)
      newHand = activePlayer.hand.filter((c) => !cardEq(c, card));
      newTable = [...state.table, card];
      newCapturedPile = activePlayer.capturedPile;
      newEscobaCount = activePlayer.escobaCount;
    }

    const updatedPlayer: Player = {
      ...activePlayer,
      hand: newHand,
      capturedPile: newCapturedPile,
      escobaCount: newEscobaCount,
    };

    const updatedPlayers = state.players.map((p, i) => (i === state.turnIndex ? updatedPlayer : p));

    const newState: GameState = {
      ...state,
      table: newTable,
      players: updatedPlayers,
      lastCapturerId: newLastCapturerId,
    };

    this._state.set(freezeGameState(newState));
    this._turnPhase.set('awaiting-confirmation');
  }

  // ---------------------------------------------------------------------------
  // T-10: confirmTurn
  // ---------------------------------------------------------------------------

  /**
   * Called by the active player after reviewing their play.
   * Advances the turn to the next player. May trigger end-of-hand dealing
   * or end-of-round resolution.
   * Covers FR-4.1–FR-4.4, FR-5.8, FR-6.1–FR-6.3, FR-7.1–FR-7.3,
   *        FR-8.1–FR-8.4, FR-9.1–FR-9.5, TR-4.4, TR-4.6.
   */
  confirmTurn(): void {
    const state = this._state();
    if (!state) {
      warn('[GameEngine] confirmTurn called before game was initialised.');
      return;
    }

    if (this._turnPhase() !== 'awaiting-confirmation') {
      warn('[GameEngine] confirmTurn rejected: turn phase is not awaiting-confirmation.');
      return;
    }

    const nextTurnIndex = (state.turnIndex + 1) % state.players.length;
    const allHandsEmpty = state.players.every((p) => p.hand.length === 0);

    if (!allHandsEmpty) {
      // Normal case (FR-4.2)
      const newState: GameState = { ...state, turnIndex: nextTurnIndex };
      this._state.set(freezeGameState(newState));
      this._turnPhase.set('awaiting-card-play');
      return;
    }

    if (state.deck.length > 0) {
      // End-of-hand: deal next batch (FR-6.2, FR-6.3)
      const newState = this.dealNextBatch(state, nextTurnIndex);
      this._state.set(freezeGameState(newState));
      this._turnPhase.set('awaiting-card-play');
      return;
    }

    // End-of-round (FR-7.1–FR-7.3, FR-8.1–FR-8.4, FR-9.1–FR-9.5)
    const stateAfterAward = this.awardRemainingTableCards(state);
    const roundResult = computeRoundResult(
      stateAfterAward.players,
      stateAfterAward.roundNumber,
      stateAfterAward.lastCapturerId,
    );

    // Update accumulated match scores (FR-8.3)
    const updatedMatchScores: Record<string, number> = { ...stateAfterAward.matchScores };
    for (const score of roundResult.playerScores) {
      updatedMatchScores[score.playerId] = (updatedMatchScores[score.playerId] ?? 0) + score.total;
    }

    const stateWithScores: GameState = {
      ...stateAfterAward,
      matchScores: updatedMatchScores,
      turnIndex: nextTurnIndex,
    };

    // Check win condition (FR-9.1–FR-9.5)
    const winner = checkWinCondition(updatedMatchScores, stateWithScores.players);

    this._state.set(freezeGameState(stateWithScores));
    this._roundResult.set(roundResult);
    this._matchWinner.set(winner);
    this._turnPhase.set('awaiting-card-play');
  }

  // ---------------------------------------------------------------------------
  // T-11: startNextRound
  // ---------------------------------------------------------------------------

  /**
   * Starts a new round after the current round has been resolved.
   * Validates that no match winner exists and the round is fully complete.
   * Rotates the dealer, resets per-round state, deals fresh cards.
   * Covers FR-10.1–FR-10.3, US-10.
   */
  startNextRound(): void {
    const state = this._state();
    if (!state) {
      warn('[GameEngine] startNextRound called before game was initialised.');
      return;
    }

    // Validate: round must be complete (deck empty and all hands empty)
    const roundComplete =
      state.deck.length === 0 && state.players.every((p) => p.hand.length === 0);
    if (!roundComplete) {
      warn('[GameEngine] startNextRound rejected: round is not yet complete.');
      return;
    }

    // Validate: no match winner declared
    if (this._matchWinner() !== null) {
      warn('[GameEngine] startNextRound rejected: a match winner has already been declared.');
      return;
    }

    // Rotate dealer: new first player is (current turnIndex + 1) % length (FR-10.2)
    const newDealerIndex = (state.turnIndex + 1) % state.players.length;

    // Reset per-round player state; preserve match scores (FR-10.1, FR-3.2, FR-3.3)
    const resetPlayers: Player[] = state.players.map((p) => ({
      ...p,
      hand: [],
      capturedPile: [],
      escobaCount: 0,
    }));

    // New shuffled deck; deal initial cards starting from new dealer
    const shuffled = shuffleDeck(createDeck());
    const newRoundNumber = state.roundNumber + 1;
    const newState = dealInitialStateFromDealer(
      shuffled,
      resetPlayers,
      state.matchScores,
      newRoundNumber,
      newDealerIndex,
    );

    this._state.set(freezeGameState(newState));
    this._roundResult.set(null);
    this._turnPhase.set('awaiting-card-play');
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /** Deals the next batch of up to 3 cards per player starting from nextTurnIndex order (FR-6.2, FR-6.3). */
  private dealNextBatch(state: GameState, nextTurnIndex: number): GameState {
    const remainingDeck = [...state.deck];
    const playerCount = state.players.length;
    const updatedPlayers = [...state.players];

    // Deal starting from nextTurnIndex in circular order
    for (let i = 0; i < playerCount; i++) {
      const playerIdx = (nextTurnIndex + i) % playerCount;
      const cardsToGive = Math.min(3, remainingDeck.length);
      updatedPlayers[playerIdx] = {
        ...updatedPlayers[playerIdx],
        hand: remainingDeck.splice(0, cardsToGive),
      };
      if (remainingDeck.length === 0) break;
    }

    return {
      ...state,
      deck: remainingDeck,
      players: updatedPlayers,
      turnIndex: nextTurnIndex,
    };
  }

  /** Awards remaining table cards to the last capturer (FR-7.2). Does NOT increment escobaCount (FR-7.3). */
  private awardRemainingTableCards(state: GameState): GameState {
    if (state.table.length === 0) return state;

    // Find the last capturer; fall back to last player in turn order (FR-7.2)
    let recipientIndex: number;
    if (state.lastCapturerId !== null) {
      const idx = state.players.findIndex((p) => p.id === state.lastCapturerId);
      recipientIndex = idx >= 0 ? idx : state.players.length - 1;
    } else {
      recipientIndex = state.players.length - 1;
    }

    const recipient = state.players[recipientIndex];
    const updatedRecipient: Player = {
      ...recipient,
      capturedPile: [...recipient.capturedPile, ...state.table],
      // escobaCount is NOT incremented (FR-7.3)
    };

    const updatedPlayers = state.players.map((p, i) =>
      i === recipientIndex ? updatedRecipient : p,
    );

    return { ...state, table: [], players: updatedPlayers };
  }
}

// ---------------------------------------------------------------------------
// Helper for startNextRound — deals from a specific dealer index
// ---------------------------------------------------------------------------

function dealInitialStateFromDealer(
  shuffled: Card[],
  players: Player[],
  matchScores: Record<string, number>,
  roundNumber: number,
  dealerIndex: number,
): GameState {
  const remaining = [...shuffled];

  // Deal 4 table cards
  const table = remaining.splice(0, 4);

  // Deal 3 cards per player starting from dealerIndex
  const playerCount = players.length;
  const dealtPlayers = [...players];
  for (let i = 0; i < playerCount; i++) {
    const playerIdx = (dealerIndex + i) % playerCount;
    dealtPlayers[playerIdx] = {
      ...dealtPlayers[playerIdx],
      hand: remaining.splice(0, 3),
    };
  }

  return {
    deck: remaining,
    table,
    players: dealtPlayers,
    turnIndex: dealerIndex,
    roundNumber,
    matchScores,
    lastCapturerId: null,
  };
}
