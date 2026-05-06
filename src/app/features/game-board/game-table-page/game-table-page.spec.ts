import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { TableInteractionState } from '../services/table-interaction-state';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';
import { RoundResult } from '../../../models/round-result';

import { GameTablePage } from './game-table-page';
import { MatchContextHud } from './components/match-context-hud/match-context-hud';

// Covers: FR-2.4, FR-3.4, FR-3.5, FR-3.6, FR-4.6, FR-6.3, FR-6.4, FR-8.2, FR-8.3, FR-8.4, FR-8.5, TR-6.3, NFR-2.1, NFR-2.2, NFR-3.1, US-2, US-3, US-4, US-6, US-8
// BDD Scenarios: SC-06, SC-09, SC-10, SC-15, SC-22, SC-23, SC-26, SC-27, SC-28, SC-29

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
  roundResult: () => RoundResult | null;
  matchWinner: () => Player[] | null;
  playCard: (card: Card, captureSubset: Card[]) => void;
  confirmTurn: () => void;
  startNextRound: () => void;
}

interface GameSessionPort {
  configuration: () => GameConfiguration | null;
}

interface TableInteractionStatePort {
  selectedHandCard: () => Card | null;
  selectedTableCards: () => Card[];
  canSubmitPlay: () => boolean;
  isCaptureSelectionValid: () => boolean;
}

const handCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const tableCardA: Card = { suit: 'Copas', rank: '5', value: 5 };
const tableCardB: Card = { suit: 'Bastos', rank: '3', value: 3 };
const nextRoundTableCards: Card[] = [
  { suit: 'Espadas', rank: '1', value: 1 },
  { suit: 'Copas', rank: '2', value: 2 },
  { suit: 'Oros', rank: '3', value: 3 },
  { suit: 'Bastos', rank: '4', value: 4 },
];
const nextRoundHandCardsPlayerOne: Card[] = [
  { suit: 'Oros', rank: '6', value: 6 },
  { suit: 'Copas', rank: '7', value: 7 },
  { suit: 'Bastos', rank: '1', value: 1 },
];
const nextRoundHandCardsPlayerTwo: Card[] = [
  { suit: 'Espadas', rank: '7', value: 7 },
  { suit: 'Copas', rank: '3', value: 3 },
  { suit: 'Oros', rank: '1', value: 1 },
];

const sessionConfiguration: GameConfiguration = {
  mode: 'Single Player',
  playerNames: ['Alice'],
  playerCount: 2,
  aiDifficulty: 'Easy',
};

function makeState(): GameState {
  return {
    deck: [],
    table: [tableCardA, tableCardB],
    players: [
      {
        id: 'p1',
        name: 'Alice',
        hand: [handCard],
        capturedPile: [],
        escobaCount: 0,
      },
      {
        id: 'p2',
        name: 'Bob',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ],
    turnIndex: 0,
    roundNumber: 1,
    matchScores: { p1: 0, p2: 0 },
    lastCapturerId: null,
  };
}

interface Stubs {
  engineStub: GameEnginePort;
  sessionStub: GameSessionPort;
  interactionStub: TableInteractionStatePort;
  playCardSpy: ReturnType<typeof vi.fn>;
  confirmTurnSpy: ReturnType<typeof vi.fn>;
  startNextRoundSpy: ReturnType<typeof vi.fn>;
  setTurnPhase: (phase: TurnPhase) => void;
  setTurnIndex: (turnIndex: number) => void;
  setEscobaOutcome: (playerId: string, escobaCount: number) => void;
  setRoundResult: (roundResult: RoundResult | null) => void;
  setMatchWinner: (winner: Player[] | null) => void;
  setMatchScores: (matchScores: Record<string, number>) => void;
  setState: (state: GameState | null) => void;
}

function createStubs(turnPhase: TurnPhase, selectedCard: Card | null): Stubs {
  const stateSignal = signal<GameState | null>(makeState());
  const turnPhaseSignal = signal<TurnPhase>(turnPhase);
  const roundResultSignal = signal<RoundResult | null>(null);
  const matchWinnerSignal = signal<Player[] | null>(null);
  const selectedHandCardSignal = signal<Card | null>(selectedCard);
  const selectedTableCardsSignal = signal<Card[]>([tableCardA, tableCardB]);
  const canSubmitPlaySignal = signal(selectedCard !== null);
  const isCaptureSelectionValidSignal = signal(true);

  const playCardSpy = vi.fn(() => {
    turnPhaseSignal.set('awaiting-confirmation');
  });
  const confirmTurnSpy = vi.fn(() => {
    stateSignal.update((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        turnIndex: (state.turnIndex + 1) % state.players.length,
      };
    });
    turnPhaseSignal.set('awaiting-card-play');
  });
  const startNextRoundSpy = vi.fn(() => {
    roundResultSignal.set(null);
    stateSignal.update((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        table: [...nextRoundTableCards],
        players: state.players.map((player, playerIndex) => ({
          ...player,
          hand:
            playerIndex === 0 ? [...nextRoundHandCardsPlayerOne] : [...nextRoundHandCardsPlayerTwo],
          capturedPile: [],
          escobaCount: 0,
        })),
        roundNumber: state.roundNumber + 1,
        lastCapturerId: null,
      };
    });
  });

  const engineStub: GameEnginePort = {
    state: stateSignal.asReadonly(),
    turnPhase: turnPhaseSignal.asReadonly(),
    activePlayer: () => {
      const state = stateSignal();
      if (!state) {
        return null;
      }

      return state.players[state.turnIndex] ?? null;
    },
    roundResult: roundResultSignal.asReadonly(),
    matchWinner: matchWinnerSignal.asReadonly(),
    playCard: playCardSpy as unknown as GameEnginePort['playCard'],
    confirmTurn: confirmTurnSpy as unknown as GameEnginePort['confirmTurn'],
    startNextRound: startNextRoundSpy as unknown as GameEnginePort['startNextRound'],
  };

  const sessionSignal = signal<GameConfiguration | null>(sessionConfiguration);
  const sessionStub: GameSessionPort = {
    configuration: sessionSignal.asReadonly(),
  };

  const interactionStub: TableInteractionStatePort = {
    selectedHandCard: selectedHandCardSignal.asReadonly(),
    selectedTableCards: selectedTableCardsSignal.asReadonly(),
    canSubmitPlay: canSubmitPlaySignal.asReadonly(),
    isCaptureSelectionValid: isCaptureSelectionValidSignal.asReadonly(),
  };

  const setTurnPhase = (nextPhase: TurnPhase): void => {
    turnPhaseSignal.set(nextPhase);
  };

  const setTurnIndex = (turnIndex: number): void => {
    const current = stateSignal();
    if (!current) {
      return;
    }

    stateSignal.set({ ...current, turnIndex });
  };

  const setEscobaOutcome = (playerId: string, escobaCount: number): void => {
    stateSignal.update((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        table: [],
        lastCapturerId: playerId,
        players: state.players.map((player) => {
          if (player.id !== playerId) {
            return player;
          }

          return {
            ...player,
            escobaCount,
          };
        }),
      };
    });
  };

  const setRoundResult = (roundResult: RoundResult | null): void => {
    roundResultSignal.set(roundResult);
  };

  const setMatchWinner = (winner: Player[] | null): void => {
    matchWinnerSignal.set(winner);
  };

  const setMatchScores = (matchScores: Record<string, number>): void => {
    stateSignal.update((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        matchScores: { ...matchScores },
      };
    });
  };

  const setState = (state: GameState | null): void => {
    stateSignal.set(state);
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    playCardSpy,
    confirmTurnSpy,
    startNextRoundSpy,
    setTurnPhase,
    setTurnIndex,
    setEscobaOutcome,
    setRoundResult,
    setMatchWinner,
    setMatchScores,
    setState,
  };
}

describe('GameTablePage', () => {
  let component: GameTablePage;
  let fixture: ComponentFixture<GameTablePage>;
  let stubs: Stubs;

  interface RoundScoreBreakdownEntry {
    playerName: string;
    escobas: number;
    mostCards: number;
    mostOros: number;
    mostSevens: number;
    sieteDiVelo: number;
    total: number;
  }

  interface MatchScoreEntry {
    playerName: string;
    score: number;
  }

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const expectFocusedTestId = (expectedTestId: string): void => {
    const activeElement = document.activeElement as HTMLElement | null;
    expect(activeElement).not.toBeNull();
    expect(activeElement?.getAttribute('data-testid')).toBe(expectedTestId);
  };

  const readProtectedSignal = <T>(propertyName: string): T | undefined => {
    const candidate = (component as unknown as Record<string, unknown>)[propertyName];
    if (typeof candidate !== 'function') {
      return undefined;
    }

    return (candidate as () => T)();
  };

  const getHudInstance = (): MatchContextHud => {
    const hudDebugElement = fixture.debugElement.query(By.directive(MatchContextHud));
    if (!hudDebugElement) {
      throw new Error('Expected MatchContextHud to be present in GameTablePage template');
    }

    return hudDebugElement.componentInstance as MatchContextHud;
  };

  const configureAndCreate = async (turnPhase: TurnPhase, selectedCard: Card | null) => {
    stubs = createStubs(turnPhase, selectedCard);

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: stubs.engineStub },
        { provide: GameSession, useValue: stubs.sessionStub },
        { provide: TableInteractionState, useValue: stubs.interactionStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  it('SC-26 / FR-8.2 - renders active-player and turn-phase indicators from engine signals', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    expect(component).toBeTruthy();

    const activePlayerIndicator = getByTestId<HTMLElement>('active-player-indicator');
    const phaseIndicator = getByTestId<HTMLElement>('turn-phase-indicator');

    expect(activePlayerIndicator.textContent ?? '').toContain('Alice');
    expect(phaseIndicator.textContent ?? '').toContain('awaiting-card-play');
  });

  it('SC-26 / NFR-3.1 - updates visible context when engine signals change after initial render', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setTurnIndex(1);
    stubs.setTurnPhase('awaiting-confirmation');
    await fixture.whenStable();

    const activePlayerIndicator = getByTestId<HTMLElement>('active-player-indicator');
    const phaseIndicator = getByTestId<HTMLElement>('turn-phase-indicator');

    expect(activePlayerIndicator.textContent ?? '').toContain('Bob');
    expect(phaseIndicator.textContent ?? '').toContain('awaiting-confirmation');
  });

  it('SC-06 / FR-2.4 - propagates context updates through MatchContextHud after extraction', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const hudActivePlayerIndicatorBefore = fixture.nativeElement.querySelector(
      'app-match-context-hud [data-testid="active-player-indicator"]',
    ) as HTMLElement | null;
    const hudPhaseIndicatorBefore = fixture.nativeElement.querySelector(
      'app-match-context-hud [data-testid="turn-phase-indicator"]',
    ) as HTMLElement | null;

    expect(hudActivePlayerIndicatorBefore?.textContent ?? '').toContain('Alice');
    expect(hudPhaseIndicatorBefore?.textContent ?? '').toContain('awaiting-card-play');

    stubs.setTurnIndex(1);
    stubs.setTurnPhase('awaiting-confirmation');
    fixture.detectChanges();

    const hudActivePlayerIndicator = fixture.nativeElement.querySelector(
      'app-match-context-hud [data-testid="active-player-indicator"]',
    ) as HTMLElement | null;
    const hudPhaseIndicator = fixture.nativeElement.querySelector(
      'app-match-context-hud [data-testid="turn-phase-indicator"]',
    ) as HTMLElement | null;
    const activePlayerAfterFirstBoundary = (hudActivePlayerIndicator?.textContent ?? '').trim();
    const phaseAfterFirstBoundary = (hudPhaseIndicator?.textContent ?? '').trim();

    expect(hudActivePlayerIndicator).not.toBeNull();
    expect(hudPhaseIndicator).not.toBeNull();
    expect(activePlayerAfterFirstBoundary).toContain('Bob');
    expect(activePlayerAfterFirstBoundary).not.toContain('Alice');
    expect(phaseAfterFirstBoundary).toContain('awaiting-confirmation');
    expect(phaseAfterFirstBoundary).not.toContain('awaiting-card-play');

    await fixture.whenStable();

    expect((hudActivePlayerIndicator?.textContent ?? '').trim()).toBe(
      activePlayerAfterFirstBoundary,
    );
    expect((hudPhaseIndicator?.textContent ?? '').trim()).toBe(phaseAfterFirstBoundary);
  });

  it('SC-27 / FR-8.3 - submit action dispatches playCard with selected card and capture subset', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(stubs.playCardSpy).toHaveBeenCalledWith(handCard, [tableCardA, tableCardB]);
    expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();
  });

  it('SC-09 / FR-3.5 - submit is blocked when no hand card is selected and validation appears', async () => {
    await configureAndCreate('awaiting-card-play', null);

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(stubs.playCardSpy).not.toHaveBeenCalled();
    const validationMessage = getByTestId<HTMLElement>('play-validation-message');
    expect(validationMessage.textContent ?? '').not.toEqual('');
  });

  it('SC-22 / FR-6.3 - announces invalid submission feedback through a live region', async () => {
    await configureAndCreate('awaiting-card-play', null);

    const submitPlayButton = getByTestId<HTMLButtonElement>('submit-play');
    submitPlayButton.focus();
    submitPlayButton.click();
    await fixture.whenStable();

    const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
    expect(liveRegion.getAttribute('aria-live')).toBe('polite');
    expect((liveRegion.textContent ?? '').trim()).toContain(
      'Select a hand card before submitting play.',
    );
  });

  it('SC-23 / FR-6.4 - moves focus to validation feedback after invalid submission', async () => {
    await configureAndCreate('awaiting-card-play', null);

    const submitPlayButton = getByTestId<HTMLButtonElement>('submit-play');
    submitPlayButton.focus();
    submitPlayButton.click();
    await fixture.whenStable();

    const validationMessage = getByTestId<HTMLElement>('play-validation-message');
    expect(validationMessage.getAttribute('tabindex')).toBe('-1');
    expect(document.activeElement).toBe(validationMessage);
  });

  it('SC-10 / FR-3.6 - turn does not complete on submit and requires explicit confirmation action', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(stubs.playCardSpy).toHaveBeenCalledTimes(1);
    expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();
    const phaseIndicator = getByTestId<HTMLElement>('turn-phase-indicator');
    expect(phaseIndicator.textContent ?? '').toContain('awaiting-confirmation');
  });

  it('SC-23 / FR-6.4 - applies deterministic focus transitions after submit and confirm actions', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const submitPlayButton = getByTestId<HTMLButtonElement>('submit-play');
    submitPlayButton.focus();
    submitPlayButton.click();
    await fixture.whenStable();

    expectFocusedTestId('confirm-turn');

    const confirmTurnButton = getByTestId<HTMLButtonElement>('confirm-turn');
    confirmTurnButton.click();
    await fixture.whenStable();

    expectFocusedTestId('submit-play');
  });

  it('SC-22 / TR-6.3 - announces turn-change outcomes through a live region', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    const confirmTurnButton = getByTestId<HTMLButtonElement>('confirm-turn');
    confirmTurnButton.focus();
    confirmTurnButton.click();
    await fixture.whenStable();

    const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
    expect((liveRegion.textContent ?? '').trim()).toContain('Turn changed to Bob.');
  });

  it('SC-28 / FR-8.4 - confirm action dispatches confirmTurn once phase is awaiting-confirmation', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    getByTestId<HTMLButtonElement>('confirm-turn').click();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-15 / FR-4.6 - renders escoba outcome visibility from engine-authoritative state', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setEscobaOutcome('p1', 1);
    await fixture.whenStable();

    const escobaOutcome = getByTestId<HTMLElement>('escoba-outcome-indicator');

    expect(escobaOutcome.textContent ?? '').toContain('Escoba');
    expect(escobaOutcome.textContent ?? '').toContain('Alice');
    expect(escobaOutcome.textContent ?? '').toContain('1');
  });

  it('SC-29 / FR-8.5 - renders round and winner outcomes from engine signals', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 1,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
        {
          playerId: 'p2',
          escobas: 0,
          mostCards: 0,
          mostOros: 0,
          mostSevens: 1,
          sieteDiVelo: 0,
          total: 1,
        },
      ],
    });
    stubs.setMatchWinner([
      {
        id: 'p2',
        name: 'Bob',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ]);
    await fixture.whenStable();

    const roundOutcome = getByTestId<HTMLElement>('round-outcome-indicator');
    const winnerOutcome = getByTestId<HTMLElement>('match-winner-indicator');

    expect(roundOutcome.textContent ?? '').toContain('Round 1');
    expect(roundOutcome.textContent ?? '').toContain('Top score: 2');
    expect(winnerOutcome.textContent ?? '').toContain('Bob');
  });

  it('T-2 / FR-2.1 / FR-2.2 - computes continuation button visibility from round and winner states', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const completedRound: RoundResult = {
      roundNumber: 2,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
      ],
    };

    const winner: Player[] = [
      {
        id: 'p1',
        name: 'Alice',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];

    stubs.setRoundResult(null);
    stubs.setMatchWinner(null);
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('showStartNextRoundButton')).toBe(false);
    expect(readProtectedSignal<boolean>('showViewWinnerButton')).toBe(false);

    stubs.setRoundResult(completedRound);
    stubs.setMatchWinner(null);
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('showStartNextRoundButton')).toBe(true);
    expect(readProtectedSignal<boolean>('showViewWinnerButton')).toBe(false);

    stubs.setRoundResult(null);
    stubs.setMatchWinner(winner);
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('showStartNextRoundButton')).toBe(false);
    expect(readProtectedSignal<boolean>('showViewWinnerButton')).toBe(false);

    stubs.setRoundResult(completedRound);
    stubs.setMatchWinner(winner);
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('showStartNextRoundButton')).toBe(false);
    expect(readProtectedSignal<boolean>('showViewWinnerButton')).toBe(true);
  });

  it('T-2 / FR-1.3 - builds roundScoreBreakdown entries with resolved player names and all score fields', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    expect(readProtectedSignal<RoundScoreBreakdownEntry[]>('roundScoreBreakdown')).toEqual([]);

    stubs.setRoundResult({
      roundNumber: 1,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 2,
          mostCards: 1,
          mostOros: 1,
          mostSevens: 0,
          sieteDiVelo: 1,
          total: 5,
        },
        {
          playerId: 'p2',
          escobas: 0,
          mostCards: 0,
          mostOros: 0,
          mostSevens: 1,
          sieteDiVelo: 0,
          total: 1,
        },
      ],
    });
    await fixture.whenStable();

    expect(readProtectedSignal<RoundScoreBreakdownEntry[]>('roundScoreBreakdown')).toEqual([
      {
        playerName: 'Alice',
        escobas: 2,
        mostCards: 1,
        mostOros: 1,
        mostSevens: 0,
        sieteDiVelo: 1,
        total: 5,
      },
      {
        playerName: 'Bob',
        escobas: 0,
        mostCards: 0,
        mostOros: 0,
        mostSevens: 1,
        sieteDiVelo: 0,
        total: 1,
      },
    ]);
  });

  it('T-2 / TR-4.3 - resolves roundScoreBreakdown names by playerId even when score rows are out of player order', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 9,
      playerScores: [
        {
          playerId: 'p2',
          escobas: 0,
          mostCards: 0,
          mostOros: 1,
          mostSevens: 1,
          sieteDiVelo: 0,
          total: 2,
        },
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 1,
          total: 3,
        },
      ],
    });
    await fixture.whenStable();

    expect(readProtectedSignal<RoundScoreBreakdownEntry[]>('roundScoreBreakdown')).toEqual([
      {
        playerName: 'Bob',
        escobas: 0,
        mostCards: 0,
        mostOros: 1,
        mostSevens: 1,
        sieteDiVelo: 0,
        total: 2,
      },
      {
        playerName: 'Alice',
        escobas: 1,
        mostCards: 1,
        mostOros: 0,
        mostSevens: 0,
        sieteDiVelo: 1,
        total: 3,
      },
    ]);
  });

  it('T-2 / TR-4.3 - returns empty breakdown and match-score arrays when state is null', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 1,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 1,
          mostSevens: 1,
          sieteDiVelo: 1,
          total: 5,
        },
      ],
    });
    stubs.setState(null);
    await fixture.whenStable();

    expect(readProtectedSignal<RoundScoreBreakdownEntry[]>('roundScoreBreakdown')).toEqual([]);
    expect(readProtectedSignal<MatchScoreEntry[]>('matchScoreEntries')).toEqual([]);
  });

  it('T-2 / TR-4.1 - exposes winnerNames as a pure string array', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    expect(readProtectedSignal<string[]>('winnerNames')).toEqual([]);

    stubs.setMatchWinner([
      { id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 },
      { id: 'p2', name: 'Bob', hand: [], capturedPile: [], escobaCount: 0 },
    ]);
    await fixture.whenStable();

    const winnerNames = readProtectedSignal<string[]>('winnerNames');
    expect(winnerNames).toEqual(['Alice', 'Bob']);
    expect(winnerNames?.every((name) => typeof name === 'string')).toBe(true);
  });

  it('T-2 / TR-4.3 - maps matchScoreEntries from state.matchScores instead of round totals', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setMatchScores({ p1: 11, p2: 7 });
    stubs.setRoundResult({
      roundNumber: 6,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 0,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 1,
        },
        {
          playerId: 'p2',
          escobas: 0,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 1,
        },
      ],
    });
    await fixture.whenStable();

    expect(readProtectedSignal<MatchScoreEntry[]>('matchScoreEntries')).toEqual([
      { playerName: 'Alice', score: 11 },
      { playerName: 'Bob', score: 7 },
    ]);
  });

  it('T-2 / TR-4.1 - initializes showMatchOverOverlay signal to false', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
  });

  it('T-2 / TR-4.1 - keeps showMatchOverOverlay false when only matchWinner changes', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setMatchWinner([{ id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 }]);
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
  });

  it('SC-11 / FR-2.3 - emits start-next-round from MatchContextHud and dispatches gameEngine.startNextRound', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 1,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
      ],
    });
    stubs.setMatchWinner(null);
    await fixture.whenStable();

    getHudInstance().startNextRound.emit();
    await fixture.whenStable();

    expect(stubs.startNextRoundSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-07 / FR-2.4 - hides score breakdown and continuation control after start-next-round activation', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 1,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
      ],
    });
    stubs.setMatchWinner(null);
    await fixture.whenStable();

    const startButtonBefore = fixture.nativeElement.querySelector(
      '[data-testid="start-next-round-button"]',
    ) as HTMLButtonElement | null;
    const breakdownBefore = fixture.nativeElement.querySelector(
      '[data-testid="round-score-breakdown"]',
    ) as HTMLElement | null;

    expect(startButtonBefore).not.toBeNull();
    expect(breakdownBefore).not.toBeNull();

    getHudInstance().startNextRound.emit();
    await fixture.whenStable();

    const startButtonAfter = fixture.nativeElement.querySelector(
      '[data-testid="start-next-round-button"]',
    ) as HTMLButtonElement | null;
    const breakdownAfter = fixture.nativeElement.querySelector(
      '[data-testid="round-score-breakdown"]',
    ) as HTMLElement | null;

    expect(startButtonAfter).toBeNull();
    expect(breakdownAfter).toBeNull();
  });

  it('SC-42 / FR-6.4 - announces round completion when roundResult becomes non-null', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const liveRegionBefore = getByTestId<HTMLElement>('a11y-live-region');
    expect((liveRegionBefore.textContent ?? '').trim()).toBe('');

    stubs.setRoundResult({
      roundNumber: 2,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 1,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 3,
        },
      ],
    });
    await fixture.whenStable();

    const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
    expect((liveRegion.textContent ?? '').trim()).toContain('Ronda 2 completada');
  });

  it('T-4 / FR-2.1 / FR-2.2 - passes continuation visibility and breakdown inputs to MatchContextHud', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 3,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
        {
          playerId: 'p2',
          escobas: 0,
          mostCards: 0,
          mostOros: 0,
          mostSevens: 1,
          sieteDiVelo: 0,
          total: 1,
        },
      ],
    });
    stubs.setMatchWinner(null);
    await fixture.whenStable();

    const hudState = getHudInstance() as MatchContextHud & {
      showStartNextRound: boolean;
      showViewWinner: boolean;
      roundScoreBreakdown: RoundScoreBreakdownEntry[];
    };

    expect(hudState.showStartNextRound).toBe(true);
    expect(hudState.showViewWinner).toBe(false);
    expect(hudState.roundScoreBreakdown.length).toBe(2);

    stubs.setMatchWinner([{ id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 }]);
    await fixture.whenStable();

    expect(hudState.showStartNextRound).toBe(false);
    expect(hudState.showViewWinner).toBe(true);
    expect(hudState.roundScoreBreakdown.length).toBe(2);
  });

  it('T-4 / TR-1.1 - binds MatchContextHud viewWinner output to the parent handler', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 3,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
      ],
    });
    stubs.setMatchWinner([{ id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 }]);
    await fixture.whenStable();

    const onViewWinnerSpy = vi.spyOn(
      component as unknown as { onViewWinner: () => void },
      'onViewWinner',
    );

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    expect(onViewWinnerSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-12 / FR-2.4 - start-next-round activation refreshes table and hand zones for a new round', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setState({
      deck: [],
      table: [],
      players: [
        {
          id: 'p1',
          name: 'Alice',
          hand: [],
          capturedPile: [],
          escobaCount: 0,
        },
        {
          id: 'p2',
          name: 'Bob',
          hand: [],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 4, p2: 3 },
      lastCapturerId: null,
    });
    stubs.setRoundResult({
      roundNumber: 1,
      playerScores: [
        {
          playerId: 'p1',
          escobas: 1,
          mostCards: 1,
          mostOros: 0,
          mostSevens: 0,
          sieteDiVelo: 0,
          total: 2,
        },
        {
          playerId: 'p2',
          escobas: 0,
          mostCards: 0,
          mostOros: 0,
          mostSevens: 1,
          sieteDiVelo: 0,
          total: 1,
        },
      ],
    });
    stubs.setMatchWinner(null);
    await fixture.whenStable();

    getHudInstance().startNextRound.emit();
    await fixture.whenStable();

    const tableCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="table-card-"]',
    ) as NodeListOf<HTMLElement>;
    const activeHandCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="active-hand-card-"]',
    ) as NodeListOf<HTMLElement>;
    const roundOutcomeIndicator = fixture.nativeElement.querySelector(
      '[data-testid="round-outcome-indicator"]',
    ) as HTMLElement | null;

    expect(stubs.startNextRoundSpy).toHaveBeenCalledTimes(1);
    expect(tableCards.length).toBe(4);
    expect(activeHandCards.length).toBe(3);
    expect(stubs.engineStub.state()?.roundNumber).toBe(2);
    expect(roundOutcomeIndicator).toBeNull();
  });
});
