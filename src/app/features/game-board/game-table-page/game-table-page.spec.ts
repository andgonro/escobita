import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { AiStrategyService } from '../../../core/services/ai-strategy.service';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { TableInteractionState } from '../services/table-interaction-state';
import { CardAnimationOrchestrator } from '../services/card-animation-orchestrator';
import { TurnPausePolicy } from '../services/turn-pause-policy';
import { Card } from '../../../models/card';
import { AiPlayDecision, AiTurnAnimationState, AI_TURN_IDLE } from '../../../models/ai-turn';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';
import { RoundResult } from '../../../models/round-result';

import { GameTablePage } from './game-table-page';
import { MatchContextHud } from './components/match-context-hud/match-context-hud';
import { ActiveHandZone } from './zones/active-hand-zone/active-hand-zone';
import { CenterTableZone } from './zones/center-table-zone/center-table-zone';
import { OpponentZones } from './zones/opponent-zones/opponent-zones';

// Covers: FR-2.4, FR-3.4, FR-3.5, FR-3.6, FR-4.6, FR-6.1, FR-6.3, FR-6.4, FR-7.1, FR-7.3, FR-8.1, FR-8.2, FR-8.3, FR-8.4, FR-8.5, TR-6.3, NFR-2.1, NFR-2.2, NFR-3.1, US-2, US-3, US-4, US-5, US-6, US-8
// BDD Scenarios: SC-06, SC-09, SC-10, SC-14, SC-15, SC-16, SC-18, SC-19, SC-20, SC-22, SC-23, SC-26, SC-27, SC-28, SC-29, SC-43

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
  roundResult: () => RoundResult | null;
  matchWinner: () => Player[] | null;
  initGame: (configuration: GameConfiguration) => void;
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

interface RouterPort {
  navigate: (commands: string[]) => Promise<boolean>;
}

interface AiStrategyPort {
  decide: (
    state: GameState,
    aiPlayer: Player,
    difficulty: GameConfiguration['aiDifficulty'],
  ) => AiPlayDecision;
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
  routerStub: RouterPort;
  aiStrategyStub: AiStrategyPort;
  initGameSpy: ReturnType<typeof vi.fn>;
  playCardSpy: ReturnType<typeof vi.fn>;
  confirmTurnSpy: ReturnType<typeof vi.fn>;
  startNextRoundSpy: ReturnType<typeof vi.fn>;
  navigateSpy: ReturnType<typeof vi.fn>;
  decideSpy: ReturnType<typeof vi.fn>;
  setTurnPhase: (phase: TurnPhase) => void;
  setTurnIndex: (turnIndex: number) => void;
  setEscobaOutcome: (playerId: string, escobaCount: number) => void;
  setRoundResult: (roundResult: RoundResult | null) => void;
  setMatchWinner: (winner: Player[] | null) => void;
  setMatchScores: (matchScores: Record<string, number>) => void;
  setSessionConfiguration: (configuration: GameConfiguration | null) => void;
  setState: (state: GameState | null) => void;
  setAiDecision: (decision: AiPlayDecision) => void;
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
  let aiDecision: AiPlayDecision = { cardToPlay: handCard, captureSubset: [] };

  const initGameSpy = vi.fn((configuration: GameConfiguration) => {
    const playerOneName = configuration.playerNames[0] ?? 'Alice';
    const playerTwoName = configuration.playerNames[1] ?? 'Bob';

    stateSignal.set({
      deck: [],
      table: [...nextRoundTableCards],
      players: [
        {
          id: 'p1',
          name: playerOneName,
          hand: [...nextRoundHandCardsPlayerOne],
          capturedPile: [],
          escobaCount: 0,
        },
        {
          id: 'p2',
          name: playerTwoName,
          hand: [...nextRoundHandCardsPlayerTwo],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });
    turnPhaseSignal.set('awaiting-card-play');
    roundResultSignal.set(null);
    matchWinnerSignal.set(null);
  });

  const playCardSpy = vi.fn((card: Card, captureSubset: Card[]) => {
    stateSignal.update((state) => {
      if (!state) {
        return state;
      }

      if (state.turnIndex !== 0) {
        return state;
      }

      const activePlayer = state.players[state.turnIndex];
      if (!activePlayer) {
        return state;
      }

      const isSameCard = (left: Card, right: Card): boolean => {
        return left.suit === right.suit && left.rank === right.rank && left.value === right.value;
      };

      const nextHand = activePlayer.hand.filter((handEntry) => !isSameCard(handEntry, card));
      const nextTable = state.table.filter(
        (tableEntry) => !captureSubset.some((capturedCard) => isSameCard(tableEntry, capturedCard)),
      );

      return {
        ...state,
        table: nextTable,
        players: state.players.map((player, playerIndex) => {
          if (playerIndex !== state.turnIndex) {
            return player;
          }

          return {
            ...player,
            hand: nextHand,
          };
        }),
        lastCapturerId: captureSubset.length > 0 ? activePlayer.id : state.lastCapturerId,
      };
    });

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
    initGame: initGameSpy as unknown as GameEnginePort['initGame'],
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

  const navigateSpy = vi.fn(async () => true);
  const routerStub: RouterPort = {
    navigate: navigateSpy as unknown as RouterPort['navigate'],
  };

  const decideSpy = vi.fn(() => aiDecision);
  const aiStrategyStub: AiStrategyPort = {
    decide: decideSpy as unknown as AiStrategyPort['decide'],
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

  const setSessionConfiguration = (configuration: GameConfiguration | null): void => {
    sessionSignal.set(configuration);
  };

  const setState = (state: GameState | null): void => {
    stateSignal.set(state);
  };

  const setAiDecision = (decision: AiPlayDecision): void => {
    aiDecision = decision;
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    routerStub,
    aiStrategyStub,
    initGameSpy,
    playCardSpy,
    confirmTurnSpy,
    startNextRoundSpy,
    navigateSpy,
    decideSpy,
    setTurnPhase,
    setTurnIndex,
    setEscobaOutcome,
    setRoundResult,
    setMatchWinner,
    setMatchScores,
    setSessionConfiguration,
    setState,
    setAiDecision,
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

  const setProtectedWritableSignal = <T>(propertyName: string, value: T): void => {
    const candidate = (component as unknown as Record<string, unknown>)[propertyName] as
      | ({ set?: (next: T) => void } & ((...args: never[]) => unknown))
      | undefined;

    if (!candidate || typeof candidate !== 'function' || typeof candidate.set !== 'function') {
      throw new Error(`Expected writable signal "${propertyName}" on component instance`);
    }

    candidate.set(value);
  };

  const getHudInstance = (): MatchContextHud => {
    const hudDebugElement = fixture.debugElement.query(By.directive(MatchContextHud));
    if (!hudDebugElement) {
      throw new Error('Expected MatchContextHud to be present in GameTablePage template');
    }

    return hudDebugElement.componentInstance as MatchContextHud;
  };

  const getOpponentZonesInstance = (): OpponentZones => {
    const opponentZonesDebugElement = fixture.debugElement.query(By.directive(OpponentZones));
    if (!opponentZonesDebugElement) {
      throw new Error('Expected OpponentZones to be present in GameTablePage template');
    }

    return opponentZonesDebugElement.componentInstance as OpponentZones;
  };

  const getActiveHandZoneInstance = (): ActiveHandZone => {
    const activeHandZoneDebugElement = fixture.debugElement.query(By.directive(ActiveHandZone));
    if (!activeHandZoneDebugElement) {
      throw new Error('Expected ActiveHandZone to be present in GameTablePage template');
    }

    return activeHandZoneDebugElement.componentInstance as ActiveHandZone;
  };

  const getCenterTableZoneInstance = (): CenterTableZone => {
    const centerTableDebugElement = fixture.debugElement.query(By.directive(CenterTableZone));
    if (!centerTableDebugElement) {
      throw new Error('Expected CenterTableZone to be present in GameTablePage template');
    }

    return centerTableDebugElement.componentInstance as CenterTableZone;
  };

  const runAiTurnDirectly = (): Promise<void> => {
    const runner = (component as unknown as { runAiTurn?: () => Promise<void> }).runAiTurn;
    if (typeof runner !== 'function') {
      throw new Error('Expected private runAiTurn method to exist on GameTablePage');
    }

    return runner.call(component);
  };

  const configureAndCreate = async (turnPhase: TurnPhase, selectedCard: Card | null) => {
    stubs = createStubs(turnPhase, selectedCard);

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: stubs.engineStub },
        { provide: GameSession, useValue: stubs.sessionStub },
        { provide: TableInteractionState, useValue: stubs.interactionStub },
        { provide: Router, useValue: stubs.routerStub },
        { provide: AiStrategyService, useValue: stubs.aiStrategyStub },
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

  it('T-6 / SC-17 / FR-7 / TR-8 - waits for animation-group completion before confirming player turn', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
    const resolvePauseSpy = vi.spyOn(pausePolicy, 'resolvePauseMs').mockReturnValue(50);

    animationOrchestrator.startGroup({
      actionType: 'play',
      cardIds: ['Oros-7'],
    });
    await fixture.whenStable();

    getByTestId<HTMLButtonElement>('confirm-turn').click();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();
    expect(resolvePauseSpy).not.toHaveBeenCalled();
  });

  it('T-6 / SC-17 / FR-7 / TR-4 - confirms player turn only after completion and post-completion pause', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-confirmation', handCard);

      const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      const resolvePauseSpy = vi.spyOn(pausePolicy, 'resolvePauseMs').mockReturnValue(25);

      const groupId = animationOrchestrator.startGroup({
        actionType: 'play',
        cardIds: ['Oros-7'],
      });

      const confirmTurnResult = (
        component as unknown as { confirmTurn: () => unknown }
      ).confirmTurn();

      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      animationOrchestrator.finalizeGroup(groupId);
      await vi.advanceTimersByTimeAsync(24);

      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await Promise.resolve(confirmTurnResult);

      expect(resolvePauseSpy).toHaveBeenCalledWith('player-post-play-confirm', {
        reducedMotion: false,
      });
      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-11 / SC-19 / FR-7 - reduced-motion confirm flow still enforces transition pause after completion', async () => {
    vi.useFakeTimers();
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    try {
      await configureAndCreate('awaiting-confirmation', handCard);

      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      const resolvePauseSpy = vi.spyOn(pausePolicy, 'resolvePauseMs').mockReturnValue(700);

      const sequencingPromise = (
        component as unknown as {
          confirmTurnWithSequencing: (
            stage: 'player-post-play-confirm' | 'ai-post-play-confirm',
            alwaysApplyPause: boolean,
          ) => Promise<void>;
        }
      ).confirmTurnWithSequencing('player-post-play-confirm', true);

      await vi.advanceTimersByTimeAsync(699);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await sequencingPromise;

      expect(resolvePauseSpy).toHaveBeenCalledWith('player-post-play-confirm', {
        reducedMotion: true,
      });
      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
      vi.useRealTimers();
    }
  });

  it('T-6 / SC-19 / FR-7 / TR-4 - applies completion-driven sequencing in AI flow before confirmTurn', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(1);

      let aiGroupId: string | null = null;
      stubs.playCardSpy.mockImplementationOnce(() => {
        aiGroupId = animationOrchestrator.startGroup({
          actionType: 'opponent-play',
          cardIds: ['ai-play-card'],
        });
        stubs.setTurnPhase('awaiting-confirmation');
      });

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(2);

      expect(stubs.playCardSpy).toHaveBeenCalledWith(aiCard, []);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(100);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      if (aiGroupId === null) {
        throw new Error('Expected AI animation group id to be initialized before completion.');
      }

      animationOrchestrator.finalizeGroup(aiGroupId);
      await vi.advanceTimersByTimeAsync(1);
      await aiRun;

      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-7 / FR-1 - starts a play animation group when submit play is triggered (SC-01/SC-02 partial)', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(animationOrchestrator, 'startGroup');

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(stubs.playCardSpy).toHaveBeenCalledWith(handCard, [tableCardA, tableCardB]);
    expect(startGroupSpy).toHaveBeenCalledWith({
      actionType: 'play',
      cardIds: ['Oros-7'],
    });
  });

  it('T-7 / FR-2 - starts one capture animation group with all captured table cards (SC-04/SC-05 partial)', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(animationOrchestrator, 'startGroup');

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(startGroupSpy).toHaveBeenCalledWith({
      actionType: 'capture',
      cardIds: ['Copas-5', 'Bastos-3'],
    });
  });

  it('T-7 / SC-05 / FR-2 - renders capture animation state simultaneously on all selected table cards after submit', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    const tableCardZeroVisual = fixture.nativeElement.querySelector(
      '[data-testid="table-card-0"] [data-testid="card-visual"]',
    ) as HTMLElement | null;
    const tableCardOneVisual = fixture.nativeElement.querySelector(
      '[data-testid="table-card-1"] [data-testid="card-visual"]',
    ) as HTMLElement | null;

    expect(tableCardZeroVisual?.classList.contains('card-visual--animation-capture')).toBe(true);
    expect(tableCardOneVisual?.classList.contains('card-visual--animation-capture')).toBe(true);
  });

  it('T-11 / TR-6 / NFR-3 - reduced-motion submit path suppresses play and capture motion classes', async () => {
    const originalMatchMedia = window.matchMedia;
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      getByTestId<HTMLButtonElement>('submit-play').click();
      await fixture.whenStable();

      const playAnimatedCards = fixture.nativeElement.querySelectorAll(
        '.card-visual--animation-play',
      );
      const captureAnimatedCards = fixture.nativeElement.querySelectorAll(
        '.card-visual--animation-capture',
      );

      expect(stubs.playCardSpy).toHaveBeenCalledTimes(1);
      expect(playAnimatedCards.length).toBe(0);
      expect(captureAnimatedCards.length).toBe(0);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    }
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

  it('SC-16 / FR-3.1 - does not display match-over overlay automatically when matchWinner becomes non-null', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="match-over-overlay"]',
    ) as HTMLElement | null;
    const viewWinnerButton = fixture.nativeElement.querySelector(
      '[data-testid="view-winner-button"]',
    ) as HTMLButtonElement | null;

    expect(overlay).toBeNull();
    expect(viewWinnerButton).not.toBeNull();
    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
  });

  it('SC-16 / NFR-1.2 - ignores view-winner activation when match winner is not declared', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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

    const liveRegionBefore = getByTestId<HTMLElement>('a11y-live-region').textContent ?? '';

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="match-over-overlay"]',
    ) as HTMLElement | null;
    const liveRegionAfter = getByTestId<HTMLElement>('a11y-live-region').textContent ?? '';

    expect(overlay).toBeNull();
    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
    expect(liveRegionAfter).toBe(liveRegionBefore);
  });

  it('SC-15 / SC-17 - shows match-over overlay when MatchContextHud emits viewWinner', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    const overlay = getByTestId<HTMLElement>('match-over-overlay');

    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(true);
    expect(overlay.getAttribute('role')).toBe('dialog');
    expect(overlay.getAttribute('aria-modal')).toBe('true');
  });

  it('SC-18 / SC-20 - binds winner names and accumulated match scores from page state into match-over overlay', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setMatchScores({ p1: 17, p2: 13 });
    stubs.setRoundResult({
      roundNumber: 4,
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
    stubs.setMatchWinner([
      { id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 },
      { id: 'p2', name: 'Bob', hand: [], capturedPile: [], escobaCount: 0 },
    ]);
    await fixture.whenStable();

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    const winnerNameA = getByTestId<HTMLElement>('winner-name-0');
    const winnerNameB = getByTestId<HTMLElement>('winner-name-1');
    const matchScoreRowA = getByTestId<HTMLElement>('match-score-row-0');
    const matchScoreRowB = getByTestId<HTMLElement>('match-score-row-1');

    expect((winnerNameA.textContent ?? '').trim()).toContain('Alice');
    expect((winnerNameB.textContent ?? '').trim()).toContain('Bob');
    expect((matchScoreRowA.textContent ?? '').trim()).toContain('Alice');
    expect((matchScoreRowA.textContent ?? '').trim()).toContain('17');
    expect((matchScoreRowB.textContent ?? '').trim()).toContain('Bob');
    expect((matchScoreRowB.textContent ?? '').trim()).toContain('13');
  });

  it('SC-23 / FR-3.6 - applies inert and aria-hidden to background zones while match-over overlay is active', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    const sessionIndicator = getByTestId<HTMLElement>('session-indicator');
    const tableLayoutShell = getByTestId<HTMLElement>('table-layout-shell');
    const actionBar = getByTestId<HTMLElement>('play-action-bar');

    expect(sessionIndicator.getAttribute('aria-hidden')).toBe('true');
    expect(sessionIndicator.getAttribute('inert')).toBe('');
    expect(tableLayoutShell.getAttribute('aria-hidden')).toBe('true');
    expect(tableLayoutShell.getAttribute('inert')).toBe('');
    expect(actionBar.getAttribute('aria-hidden')).toBe('true');
    expect(actionBar.getAttribute('inert')).toBe('');
  });

  it('SC-26 / SC-27 - moves focus into overlay and announces winners when viewWinner is activated', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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
    stubs.setMatchWinner([
      { id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 },
      { id: 'p2', name: 'Bob', hand: [], capturedPile: [], escobaCount: 0 },
    ]);
    await fixture.whenStable();

    const viewWinnerButton = getByTestId<HTMLButtonElement>('view-winner-button');
    viewWinnerButton.focus();

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    expectFocusedTestId('return-to-lobby-button');

    const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
    const liveRegionText = (liveRegion.textContent ?? '').trim();
    expect(liveRegionText).toContain('Partida terminada');
    expect(liveRegionText).toContain('Alice');
    expect(liveRegionText).toContain('Bob');
  });

  it('SC-37 / SC-38 / SC-39 / SC-41 - play-again hides overlay, reinitializes the match, and restores submit focus', async () => {
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
      roundNumber: 9,
      matchScores: { p1: 15, p2: 12 },
      lastCapturerId: null,
    });
    stubs.setRoundResult({
      roundNumber: 9,
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

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    getByTestId<HTMLButtonElement>('play-again-button').click();
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="match-over-overlay"]',
    ) as HTMLElement | null;
    const tableCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="table-card-"]',
    ) as NodeListOf<HTMLElement>;
    const activeHandCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="active-hand-card-"]',
    ) as NodeListOf<HTMLElement>;

    expect(stubs.initGameSpy).toHaveBeenCalledTimes(1);
    expect(stubs.initGameSpy).toHaveBeenCalledWith(sessionConfiguration);
    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
    expect(overlay).toBeNull();
    expect(stubs.engineStub.state()?.roundNumber).toBe(1);
    expect(stubs.engineStub.state()?.matchScores).toEqual({ p1: 0, p2: 0 });
    expect(tableCards.length).toBe(4);
    expect(activeHandCards.length).toBe(3);
    expectFocusedTestId('submit-play');

    const submitPlayButton = getByTestId<HTMLButtonElement>('submit-play');
    submitPlayButton.click();
    await fixture.whenStable();

    expect(stubs.playCardSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-39 / TR-2.2 - play-again falls back to lobby when session configuration is missing', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    stubs.setSessionConfiguration(null);
    getByTestId<HTMLButtonElement>('play-again-button').click();
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="match-over-overlay"]',
    ) as HTMLElement | null;

    expect(stubs.initGameSpy).not.toHaveBeenCalled();
    expect(stubs.navigateSpy).toHaveBeenCalledTimes(1);
    expect(stubs.navigateSpy).toHaveBeenCalledWith(['/']);
    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
    expect(overlay).toBeNull();
  });

  it('SC-29 / SC-30 - return-to-lobby navigates to root and keeps session configuration intact', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setRoundResult({
      roundNumber: 4,
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

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();

    getByTestId<HTMLButtonElement>('return-to-lobby-button').click();
    await fixture.whenStable();

    expect(stubs.navigateSpy).toHaveBeenCalledTimes(1);
    expect(stubs.navigateSpy).toHaveBeenCalledWith(['/']);
    expect(stubs.sessionStub.configuration()).toEqual(sessionConfiguration);
  });

  it('T-8 / FR-7.1 - disables interaction when AI turn is in progress even in awaiting-card-play phase', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    expect(readProtectedSignal<boolean>('interactionEnabled')).toBe(true);

    setProtectedWritableSignal('isAiTurnInProgress', true);
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('interactionEnabled')).toBe(false);
  });

  it('T-8 / AD-2 - resolves aiPlayerId to the second player UUID after initialization', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setState({
      deck: [],
      table: [tableCardA],
      players: [
        {
          id: 'human-id',
          name: 'Alice',
          hand: [handCard],
          capturedPile: [],
          escobaCount: 0,
        },
        {
          id: 'laia-id',
          name: 'Laia',
          hand: [tableCardB],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { 'human-id': 0, 'laia-id': 0 },
      lastCapturerId: null,
    });
    await fixture.whenStable();

    expect(readProtectedSignal<string | null | undefined>('aiPlayerId')).toBe('laia-id');
  });

  it('T-8 / FR-7.3 - tracks aiHandCardCount reactively as AI hand size changes', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setState({
      deck: [],
      table: [tableCardA],
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
          name: 'Laia',
          hand: [tableCardB, tableCardA],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });
    await fixture.whenStable();

    expect(readProtectedSignal<number>('aiHandCardCount')).toBe(2);

    stubs.setState({
      deck: [],
      table: [tableCardA],
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
          name: 'Laia',
          hand: [tableCardB],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });
    await fixture.whenStable();

    expect(readProtectedSignal<number>('aiHandCardCount')).toBe(1);
  });

  it('T-8 / AD-5 - exposes aiHighlightedTableCards derived from aiTurnAnimationState', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    setProtectedWritableSignal('aiTurnAnimationState', {
      phase: 'capture-previewing',
      selectedCardIndex: 0,
      revealedCard: handCard,
      highlightedTableCards: [tableCardA, tableCardB],
    });
    await fixture.whenStable();

    expect(readProtectedSignal<Card[]>('aiHighlightedTableCards')).toEqual([
      tableCardA,
      tableCardB,
    ]);
  });

  it('T-10 / AD-5 - blends AI highlighted cards into the center table selection during capture preview', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setState({
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
          name: 'Laia',
          hand: [tableCardA, tableCardB],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });

    setProtectedWritableSignal('aiTurnAnimationState', {
      phase: 'capture-previewing',
      selectedCardIndex: 1,
      revealedCard: tableCardB,
      highlightedTableCards: [tableCardA],
    });
    await fixture.whenStable();

    const centerTableZone = getCenterTableZoneInstance();
    const opponentZones = getOpponentZonesInstance();

    expect(readProtectedSignal<Card[]>('selectedTableCards')).toEqual([tableCardA]);
    expect(centerTableZone.selectedTableCards).toEqual([tableCardA]);
    expect(opponentZones.aiHandCardCount).toBe(2);
    expect(opponentZones.aiTurnAnimationState.phase).toBe('capture-previewing');
  });

  it('T-1 / TR-1.2 - publishes empty opponent metadata during human single-card capture groups', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    animationOrchestrator.startGroup({
      actionType: 'capture',
      cardIds: ['Oros-7'],
    });
    await fixture.whenStable();

    const opponentMetadata = readProtectedSignal<{ opponent: unknown[] }>(
      'opponentAnimationMetadata',
    );

    expect(Array.isArray(opponentMetadata?.opponent)).toBe(true);
    expect(opponentMetadata?.opponent ?? []).toEqual([]);
  });

  it('T-1 / NFR-1.2 - keeps opponent metadata empty during human multi-card capture groups', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    animationOrchestrator.startGroup({
      actionType: 'capture',
      cardIds: ['Oros-7', 'Copas-5', 'Bastos-3'],
    });
    await fixture.whenStable();

    const opponentMetadata = readProtectedSignal<{ opponent: unknown[] }>(
      'opponentAnimationMetadata',
    );

    expect(Array.isArray(opponentMetadata?.opponent)).toBe(true);
    expect(opponentMetadata?.opponent ?? []).toEqual([]);
  });

  it('T-1 / FR-1.3 - keeps opponent metadata empty during human Escoba animation groups', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    animationOrchestrator.startGroup({
      actionType: 'escoba',
      cardIds: ['Copas-5', 'Bastos-3'],
    });
    await fixture.whenStable();

    const opponentMetadata = readProtectedSignal<{ opponent: unknown[] }>(
      'opponentAnimationMetadata',
    );

    expect(Array.isArray(opponentMetadata?.opponent)).toBe(true);
    expect(opponentMetadata?.opponent ?? []).toEqual([]);
  });

  it('T-2 / TR-1.2 - suppresses opponent metadata in awaiting-card-play despite AI preview phase', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setState({
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
          name: 'Laia',
          hand: [tableCardA, tableCardB],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });

    setProtectedWritableSignal('aiTurnAnimationState', {
      phase: 'capture-previewing',
      selectedCardIndex: 1,
      revealedCard: tableCardB,
      highlightedTableCards: [tableCardA],
    });
    await fixture.whenStable();

    const opponentMetadata = readProtectedSignal<{ opponent: unknown[] }>(
      'opponentAnimationMetadata',
    );

    expect(Array.isArray(opponentMetadata?.opponent)).toBe(true);
    expect(opponentMetadata?.opponent ?? []).toEqual([]);
  });

  it('T-2 / FR-1.2 - keeps opponent metadata empty for capture groups while human suppression is active', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    animationOrchestrator.startGroup({
      actionType: 'capture',
      cardIds: ['Oros-7', 'Copas-5', 'Bastos-3'],
    });
    await fixture.whenStable();

    const opponentMetadata = readProtectedSignal<{ opponent: unknown[] }>(
      'opponentAnimationMetadata',
    );

    expect(Array.isArray(opponentMetadata?.opponent)).toBe(true);
    expect(opponentMetadata?.opponent ?? []).toEqual([]);
  });

  it('T-5 / AD-1 - propagates structured animation metadata to hand, table, and opponent zones', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    const animationOrchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    animationOrchestrator.startGroup({
      actionType: 'capture',
      cardIds: ['Oros-7', 'Copas-5', 'Bastos-3'],
    });
    await fixture.whenStable();

    const activeHandZone = getActiveHandZoneInstance() as ActiveHandZone & {
      animationMetadata?: { hand?: unknown[] } | null;
    };
    const centerTableZone = getCenterTableZoneInstance() as CenterTableZone & {
      animationMetadata?: { table?: unknown[] } | null;
    };
    const opponentZones = getOpponentZonesInstance() as OpponentZones & {
      animationMetadata?: { opponent?: unknown[] } | null;
    };

    expect(Array.isArray(activeHandZone.animationMetadata?.hand)).toBe(true);
    expect(Array.isArray(centerTableZone.animationMetadata?.table)).toBe(true);
    expect(Array.isArray(opponentZones.animationMetadata?.opponent)).toBe(true);

    expect((activeHandZone.animationMetadata?.hand ?? []).length).toBeGreaterThan(0);
    expect((centerTableZone.animationMetadata?.table ?? []).length).toBeGreaterThan(0);
    expect((opponentZones.animationMetadata?.opponent ?? []).length).toBe(0);
  });

  it('T-10 / AD-8 - suppresses AI hand cards in Multiplayer mode', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setSessionConfiguration({
      mode: 'Multiplayer',
      playerNames: ['Alice', 'Bob'],
      playerCount: 2,
      aiDifficulty: 'Easy',
    });
    stubs.setState({
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
          name: 'Laia',
          hand: [tableCardA, tableCardB],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 0,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });
    await fixture.whenStable();

    const opponentZones = getOpponentZonesInstance();

    expect(readProtectedSignal<number>('aiHandCardCount')).toBe(0);
    expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual(AI_TURN_IDLE);
    expect(opponentZones.aiHandCardCount).toBe(0);
    expect(fixture.nativeElement.querySelector('[data-testid="ai-hand-zone"]')).toBeNull();
  });

  it('T-9 / FR-2.1 - automatically triggers AI play and confirm when Laia is active in awaiting-card-play', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA],
      });

      stubs.setState({
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      await vi.advanceTimersByTimeAsync(2200);

      expect(stubs.decideSpy).toHaveBeenCalledTimes(1);
      expect(stubs.playCardSpy).toHaveBeenCalledWith(aiCard, [tableCardA]);
      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
      expect(readProtectedSignal<boolean>('isAiTurnInProgress')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-3 / FR-7 / TR-4 - resolves AI turn pause timing through TurnPausePolicy', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA],
      });

      stubs.setState({
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const pausePolicy = fixture.debugElement.injector.get(TurnPausePolicy);
      const resolvePauseSpy = vi.spyOn(pausePolicy, 'resolvePauseMs').mockReturnValue(50);

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(199);

      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(1);
      await aiRun;

      expect(resolvePauseSpy).toHaveBeenCalled();
      expect(stubs.playCardSpy).toHaveBeenCalledWith(aiCard, [tableCardA]);
      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / FR-6.3 - sets revealedCard before playCard for capture decisions', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Espadas', rank: '7', value: 7 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA],
      });

      stubs.playCardSpy.mockImplementationOnce(() => {
        const animation = readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState');
        expect(animation?.revealedCard).toEqual(aiCard);
        expect(animation?.phase).toBe('resolving');
        expect(animation?.highlightedTableCards).toEqual([tableCardA]);
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(2200);
      await aiRun;

      expect(stubs.playCardSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / FR-8.3 - never sets revealedCard for placement decisions', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Bastos', rank: '2', value: 2 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.playCardSpy.mockImplementationOnce(() => {
        const animation = readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState');
        expect(animation?.revealedCard).toBeNull();
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(1500);
      await aiRun;

      expect(stubs.playCardSpy).toHaveBeenCalledWith(aiCard, []);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / TR-2.4 - resets AI in-progress lock and animation state to idle when playCard throws', async () => {
    vi.useFakeTimers();
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Copas', rank: '4', value: 4 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.playCardSpy.mockImplementationOnce(() => {
        stubs.setTurnPhase('awaiting-confirmation');
        throw new Error('playCard failure');
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });
      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(1200);
      await aiRun;

      expect(warnSpy).toHaveBeenCalledWith(
        'AI turn orchestration failed',
        expect.objectContaining({
          aiPlayerId: 'p2',
          difficulty: 'Easy',
          errorName: 'Error',
        }),
      );
      expect(readProtectedSignal<boolean>('isAiTurnInProgress')).toBe(false);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual(
        AI_TURN_IDLE,
      );
    } finally {
      warnSpy.mockRestore();
      vi.useRealTimers();
    }
  });

  it('T-9 / NFR-2.2 - short-circuits runAiTurn when AI has no hand cards', async () => {
    await configureAndCreate('awaiting-card-play', handCard);

    stubs.setState({
      deck: [],
      table: [tableCardA],
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
          name: 'Laia',
          hand: [],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 1,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });

    await fixture.whenStable();

    await runAiTurnDirectly();

    expect(stubs.decideSpy).not.toHaveBeenCalled();
    expect(stubs.playCardSpy).not.toHaveBeenCalled();
    expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();
    expect(readProtectedSignal<boolean>('isAiTurnInProgress')).toBe(false);
    expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual(AI_TURN_IDLE);
  });

  it('T-9 / FR-6.1-FR-6.5 - progresses animation phases through card-selected and capture-previewing before resolving', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Oros', rank: '4', value: 4 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();
      await vi.runAllTicks();
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')?.phase).toBe(
        'deliberating',
      );

      await vi.advanceTimersByTimeAsync(600);
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')?.phase).toBe(
        'card-selected',
      );

      await vi.advanceTimersByTimeAsync(600);
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual({
        phase: 'capture-previewing',
        selectedCardIndex: 0,
        revealedCard: aiCard,
        highlightedTableCards: [tableCardA],
      });

      await vi.advanceTimersByTimeAsync(1000);
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual(
        AI_TURN_IDLE,
      );
      await aiRun;
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / FR-2.3 - does not auto-run AI turn when phase is not awaiting-card-play', async () => {
    await configureAndCreate('awaiting-confirmation', handCard);

    const aiCard: Card = { suit: 'Bastos', rank: '5', value: 5 };
    stubs.setAiDecision({
      cardToPlay: aiCard,
      captureSubset: [],
    });

    stubs.setState({
      deck: [],
      table: [tableCardA],
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
          name: 'Laia',
          hand: [aiCard],
          capturedPile: [],
          escobaCount: 0,
        },
      ],
      turnIndex: 1,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });
    await fixture.whenStable();

    expect(stubs.decideSpy).not.toHaveBeenCalled();
    expect(stubs.playCardSpy).not.toHaveBeenCalled();
  });

  it('T-9 / FR-7.2 - prevents double-trigger while AI turn is already in progress', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Espadas', rank: '3', value: 3 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const firstRun = runAiTurnDirectly();
      const secondRun = runAiTurnDirectly();
      await vi.runAllTicks();

      expect(readProtectedSignal<boolean>('isAiTurnInProgress')).toBe(true);
      expect(stubs.decideSpy).toHaveBeenCalledTimes(0);

      await vi.advanceTimersByTimeAsync(600);
      expect(stubs.decideSpy).toHaveBeenCalledTimes(1);

      await vi.advanceTimersByTimeAsync(1600);
      await firstRun;
      await secondRun;
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / FR-2.2 - re-triggers AI turn when it remains active after automatic confirm', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Copas', rank: '6', value: 6 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.confirmTurnSpy.mockImplementationOnce(() => {
        stubs.setTurnPhase('awaiting-card-play');
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      await vi.advanceTimersByTimeAsync(3200);

      expect(stubs.decideSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / FR-6.7 - keeps placement animation duration within 1.5 to 3 seconds', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Oros', rank: '2', value: 2 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')?.phase).toBe(
        'deliberating',
      );

      await vi.advanceTimersByTimeAsync(1499);
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).not.toEqual(
        AI_TURN_IDLE,
      );

      await vi.advanceTimersByTimeAsync(1);
      await aiRun;
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual(
        AI_TURN_IDLE,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-9 / SC-12 - keeps capture animation duration within 1.5 to 3 seconds', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Bastos', rank: '7', value: 7 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(2199);
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).not.toEqual(
        AI_TURN_IDLE,
      );

      await vi.advanceTimersByTimeAsync(1);
      await aiRun;
      expect(readProtectedSignal<AiTurnAnimationState>('aiTurnAnimationState')).toEqual(
        AI_TURN_IDLE,
      );
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-11 / FR-9.1 - announces AI placement through the live region after confirmTurn resolves', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Copas', rank: '6', value: 6 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();

      await vi.advanceTimersByTimeAsync(1499);
      const liveRegionBeforeConfirm = getByTestId<HTMLElement>('a11y-live-region');
      expect((liveRegionBeforeConfirm.textContent ?? '').trim()).toBe('');

      await vi.advanceTimersByTimeAsync(1);
      await aiRun;

      const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
      expect((liveRegion.textContent ?? '').trim()).toContain('Laia colocó una carta en la mesa');
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-11 / FR-9.2 - announces AI capture count without revealing card identity', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Bastos', rank: '7', value: 7 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA, tableCardB],
      });

      stubs.setState({
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(2200);
      await aiRun;

      const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
      const announcement = (liveRegion.textContent ?? '').trim();

      expect(announcement).toContain('Laia capturó 2 cartas de la mesa');
      expect(announcement).not.toContain('Bastos');
      expect(announcement).not.toContain('7');
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-11 / FR-9.3 - announces escoba instead of generic capture message', async () => {
    vi.useFakeTimers();

    try {
      await configureAndCreate('awaiting-card-play', handCard);

      const aiCard: Card = { suit: 'Oros', rank: '3', value: 3 };
      stubs.setAiDecision({
        cardToPlay: aiCard,
        captureSubset: [tableCardA],
      });

      stubs.setState({
        deck: [],
        table: [tableCardA],
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
            name: 'Laia',
            hand: [aiCard],
            capturedPile: [],
            escobaCount: 0,
          },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      stubs.playCardSpy.mockImplementationOnce(() => {
        const currentState = stubs.engineStub.state();
        if (currentState !== null) {
          stubs.setState({
            ...currentState,
            players: currentState.players.map((player) => {
              if (player.id !== 'p2') {
                return player;
              }

              return {
                ...player,
                escobaCount: 1,
              };
            }),
          });
        }

        stubs.setTurnPhase('awaiting-confirmation');
      });

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(2200);
      await aiRun;

      const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
      const announcement = (liveRegion.textContent ?? '').trim();

      expect(announcement).toContain('¡Escoba! Laia limpió la mesa');
      expect(announcement).not.toContain('capturó');
    } finally {
      vi.useRealTimers();
    }
  });
});
