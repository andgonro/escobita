import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { vi } from 'vitest';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';
import { RoundResult } from '../../../models/round-result';
import { TableInteractionState } from '../services/table-interaction-state';
import { MatchContextHud } from './components/match-context-hud/match-context-hud';

import { GameTablePage } from './game-table-page';

// Covers: FR-1.3, FR-2.1, FR-2.2, FR-2.3, FR-6.4, TR-4.1, TR-4.3, NFR-1.1, US-1, US-6
// BDD Scenarios: SC-07, SC-08, SC-09, SC-10, SC-11, SC-42

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
  roundResult: () => RoundResult | null;
  matchWinner: () => Player[] | null;
  initGame: (configuration: GameConfiguration) => void;
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
  handoffEnabled: () => boolean;
  selectHandCard: (card: Card) => void;
  toggleTableCard: (card: Card) => void;
  resetForNextAction: () => void;
}

interface RouterPort {
  navigate: (commands: string[]) => Promise<boolean>;
}

interface RoundScoreBreakdownEntry {
  playerName: string;
  escobas: number;
  mostCards: number;
  mostOros: number;
  mostSevens: number;
  sieteDiVelo: number;
  total: number;
}

interface Stubs {
  engineStub: GameEnginePort;
  sessionStub: GameSessionPort;
  interactionStub: TableInteractionStatePort;
  routerStub: RouterPort;
  startNextRoundSpy: ReturnType<typeof vi.fn>;
  setRoundResult: (roundResult: RoundResult | null) => void;
  setMatchWinner: (winner: Player[] | null) => void;
}

const handCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const tableCardA: Card = { suit: 'Copas', rank: '5', value: 5 };
const tableCardB: Card = { suit: 'Bastos', rank: '3', value: 3 };

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

function createStubs(): Stubs {
  const stateSignal = signal<GameState | null>(makeState());
  const turnPhaseSignal = signal<TurnPhase>('awaiting-card-play');
  const roundResultSignal = signal<RoundResult | null>(null);
  const matchWinnerSignal = signal<Player[] | null>(null);

  const startNextRoundSpy = vi.fn(() => {
    roundResultSignal.set(null);
    stateSignal.update((state) => {
      if (!state) {
        return state;
      }

      return {
        ...state,
        roundNumber: state.roundNumber + 1,
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
    initGame: vi.fn() as unknown as GameEnginePort['initGame'],
    startNextRound: startNextRoundSpy as unknown as GameEnginePort['startNextRound'],
  };

  const sessionStub: GameSessionPort = {
    configuration: signal<GameConfiguration | null>(sessionConfiguration).asReadonly(),
  };

  const interactionStub: TableInteractionStatePort = {
    selectedHandCard: signal<Card | null>(handCard).asReadonly(),
    selectedTableCards: signal<Card[]>([tableCardA]).asReadonly(),
    canSubmitPlay: signal(true).asReadonly(),
    isCaptureSelectionValid: signal(true).asReadonly(),
    handoffEnabled: signal(false).asReadonly(),
    selectHandCard: vi.fn(),
    toggleTableCard: vi.fn(),
    resetForNextAction: vi.fn(),
  };

  const routerStub: RouterPort = {
    navigate: vi.fn(async () => true) as unknown as RouterPort['navigate'],
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    routerStub,
    startNextRoundSpy,
    setRoundResult: (roundResult: RoundResult | null): void => {
      roundResultSignal.set(roundResult);
    },
    setMatchWinner: (winner: Player[] | null): void => {
      matchWinnerSignal.set(winner);
    },
  };
}

describe('GameTablePage round progression flow', () => {
  let fixture: ComponentFixture<GameTablePage>;
  let component: GameTablePage;
  let stubs: Stubs;

  const readProtectedSignal = <T>(propertyName: string): T | undefined => {
    const candidate = (component as unknown as Record<string, unknown>)[propertyName];
    if (typeof candidate !== 'function') {
      return undefined;
    }

    return (candidate as () => T)();
  };

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const getHudInstance = (): MatchContextHud => {
    const hudDebugElement = fixture.debugElement.query(By.directive(MatchContextHud));
    if (!hudDebugElement) {
      throw new Error('Expected MatchContextHud to be present in GameTablePage template');
    }

    return hudDebugElement.componentInstance as MatchContextHud;
  };

  const configureAndCreate = async (): Promise<void> => {
    stubs = createStubs();

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: stubs.engineStub },
        { provide: GameSession, useValue: stubs.sessionStub },
        { provide: TableInteractionState, useValue: stubs.interactionStub },
        { provide: Router, useValue: stubs.routerStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

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

  it('TR-4.1 / NFR-1.1 - computes showStartNextRoundButton truth table for all round/winner combinations', async () => {
    await configureAndCreate();

    const cases: {
      roundResult: RoundResult | null;
      matchWinner: Player[] | null;
      expected: boolean;
    }[] = [
      { roundResult: null, matchWinner: null, expected: false },
      { roundResult: completedRound, matchWinner: null, expected: true },
      { roundResult: null, matchWinner: winner, expected: false },
      { roundResult: completedRound, matchWinner: winner, expected: false },
    ];

    for (const scenario of cases) {
      stubs.setRoundResult(scenario.roundResult);
      stubs.setMatchWinner(scenario.matchWinner);
      await fixture.whenStable();

      expect(readProtectedSignal<boolean>('showStartNextRoundButton')).toBe(scenario.expected);
    }
  });

  it('TR-4.1 / NFR-1.1 - computes showViewWinnerButton truth table for all round/winner combinations', async () => {
    await configureAndCreate();

    const cases: {
      roundResult: RoundResult | null;
      matchWinner: Player[] | null;
      expected: boolean;
    }[] = [
      { roundResult: null, matchWinner: null, expected: false },
      { roundResult: completedRound, matchWinner: null, expected: false },
      { roundResult: null, matchWinner: winner, expected: false },
      { roundResult: completedRound, matchWinner: winner, expected: true },
    ];

    for (const scenario of cases) {
      stubs.setRoundResult(scenario.roundResult);
      stubs.setMatchWinner(scenario.matchWinner);
      await fixture.whenStable();

      expect(readProtectedSignal<boolean>('showViewWinnerButton')).toBe(scenario.expected);
    }
  });

  it('TR-4.3 / FR-1.3 - resolves roundScoreBreakdown player names from engine state by playerId', async () => {
    await configureAndCreate();

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

  it('SC-07 / SC-11 / FR-2.3 / FR-2.4 - dispatches startNextRound and clears round-complete UI artifacts', async () => {
    await configureAndCreate();

    stubs.setRoundResult(completedRound);
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

    expect(stubs.startNextRoundSpy).toHaveBeenCalledTimes(1);
    expect(startButtonAfter).toBeNull();
    expect(breakdownAfter).toBeNull();
  });

  it('SC-42 / FR-6.4 - announces round completion when roundResult becomes non-null', async () => {
    await configureAndCreate();

    const liveRegionBefore = getByTestId<HTMLElement>('a11y-live-region');
    expect((liveRegionBefore.textContent ?? '').trim()).toBe('');

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
    await fixture.whenStable();

    const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
    expect((liveRegion.textContent ?? '').trim()).toContain('Ronda 3 completada');
  });
});
