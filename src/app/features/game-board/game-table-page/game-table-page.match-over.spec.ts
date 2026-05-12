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

// Covers: FR-3.1, FR-3.6, FR-5.3, FR-6.4, TR-2.2, TR-3.1, TR-3.2, NFR-1.2, US-2, US-4
// BDD Scenarios: SC-15, SC-16, SC-23, SC-27, SC-29, SC-39

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
  roundResult: () => RoundResult | null;
  matchWinner: () => Player[] | null;
  initGame: (configuration: GameConfiguration) => void;
  confirmTurn: () => void;
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
  setHandoffEnabled: (enabled: boolean) => void;
  selectHandCard: (card: Card) => void;
  toggleTableCard: (card: Card) => void;
  resetForNextAction: () => void;
}

interface RouterPort {
  navigate: (commands: string[]) => Promise<boolean>;
}

interface Stubs {
  engineStub: GameEnginePort;
  sessionStub: GameSessionPort;
  interactionStub: TableInteractionStatePort;
  routerStub: RouterPort;
  initGameSpy: ReturnType<typeof vi.fn>;
  confirmTurnSpy: ReturnType<typeof vi.fn>;
  navigateSpy: ReturnType<typeof vi.fn>;
  setRoundResult: (roundResult: RoundResult | null) => void;
  setMatchWinner: (winner: Player[] | null) => void;
  setState: (state: GameState | null) => void;
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

function createStubs(options?: {
  mode?: 'Single Player' | 'Multiplayer';
  handoffEnabled?: boolean;
  turnPhase?: TurnPhase;
}): Stubs {
  const mode = options?.mode ?? 'Single Player';
  const handoffEnabled = options?.handoffEnabled ?? false;
  const turnPhase = options?.turnPhase ?? 'awaiting-card-play';

  const stateSignal = signal<GameState | null>(makeState());
  const turnPhaseSignal = signal<TurnPhase>(turnPhase);
  const roundResultSignal = signal<RoundResult | null>(null);
  const matchWinnerSignal = signal<Player[] | null>(null);
  const handoffEnabledSignal = signal(handoffEnabled);

  const initGameSpy = vi.fn((configuration: GameConfiguration) => {
    const playerOneName = configuration.playerNames[0] ?? 'Alice';
    const playerTwoName = configuration.playerNames[1] ?? 'Bob';

    stateSignal.set({
      deck: [],
      table: [
        { suit: 'Espadas', rank: '1', value: 1 },
        { suit: 'Copas', rank: '2', value: 2 },
        { suit: 'Oros', rank: '3', value: 3 },
        { suit: 'Bastos', rank: '4', value: 4 },
      ],
      players: [
        {
          id: 'p1',
          name: playerOneName,
          hand: [
            { suit: 'Oros', rank: '6', value: 6 },
            { suit: 'Copas', rank: '7', value: 7 },
            { suit: 'Bastos', rank: '1', value: 1 },
          ],
          capturedPile: [],
          escobaCount: 0,
        },
        {
          id: 'p2',
          name: playerTwoName,
          hand: [
            { suit: 'Espadas', rank: '7', value: 7 },
            { suit: 'Copas', rank: '3', value: 3 },
            { suit: 'Oros', rank: '1', value: 1 },
          ],
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
    confirmTurn: confirmTurnSpy as unknown as GameEnginePort['confirmTurn'],
  };

  const sessionStub: GameSessionPort = {
    configuration: signal<GameConfiguration | null>({
      ...sessionConfiguration,
      mode,
      playerNames: mode === 'Multiplayer' ? ['Alice', 'Bob'] : ['Alice'],
    }).asReadonly(),
  };

  const interactionStub: TableInteractionStatePort = {
    selectedHandCard: signal<Card | null>(handCard).asReadonly(),
    selectedTableCards: signal<Card[]>([]).asReadonly(),
    canSubmitPlay: signal(true).asReadonly(),
    isCaptureSelectionValid: signal(true).asReadonly(),
    handoffEnabled: handoffEnabledSignal.asReadonly(),
    setHandoffEnabled: (enabled: boolean): void => {
      handoffEnabledSignal.set(enabled);
    },
    selectHandCard: vi.fn(),
    toggleTableCard: vi.fn(),
    resetForNextAction: vi.fn(),
  };

  const navigateSpy = vi.fn(async () => true);
  const routerStub: RouterPort = {
    navigate: navigateSpy as unknown as RouterPort['navigate'],
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    routerStub,
    initGameSpy,
    confirmTurnSpy,
    navigateSpy,
    setRoundResult: (roundResult: RoundResult | null): void => {
      roundResultSignal.set(roundResult);
    },
    setMatchWinner: (winner: Player[] | null): void => {
      matchWinnerSignal.set(winner);
    },
    setState: (state: GameState | null): void => {
      stateSignal.set(state);
    },
  };
}

describe('GameTablePage match-over flow', () => {
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

  const configureAndCreate = async (options?: {
    mode?: 'Single Player' | 'Multiplayer';
    handoffEnabled?: boolean;
    turnPhase?: TurnPhase;
  }): Promise<void> => {
    stubs = createStubs(options);

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

  const openMatchOverOverlay = async (winners?: Player[]): Promise<void> => {
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
    stubs.setMatchWinner(
      winners ?? [{ id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 }],
    );
    await fixture.whenStable();

    getHudInstance().viewWinner.emit();
    await fixture.whenStable();
  };

  it('TR-3.1 - initializes showMatchOverOverlay to false', async () => {
    await configureAndCreate();

    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
  });

  it('SC-15 / SC-27 - sets showMatchOverOverlay to true and announces winners when viewWinner is activated', async () => {
    await configureAndCreate();

    await openMatchOverOverlay([
      { id: 'p1', name: 'Alice', hand: [], capturedPile: [], escobaCount: 0 },
      { id: 'p2', name: 'Bob', hand: [], capturedPile: [], escobaCount: 0 },
    ]);

    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(true);

    const liveRegion = getByTestId<HTMLElement>('a11y-live-region');
    const liveRegionText = (liveRegion.textContent ?? '').trim();
    expect(liveRegionText).toContain('Partida terminada');
    expect(liveRegionText).toContain('Alice');
    expect(liveRegionText).toContain('Bob');
  });

  it('SC-16 / FR-3.1 - keeps match-over overlay hidden until viewWinner is explicitly activated', async () => {
    await configureAndCreate();

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

  it('SC-39 / TR-2.2 - onPlayAgain clears overlay and calls initGame with session configuration when state is non-null', async () => {
    await configureAndCreate();

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
    await fixture.whenStable();

    await openMatchOverOverlay();

    getByTestId<HTMLButtonElement>('play-again-button').click();
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="match-over-overlay"]',
    ) as HTMLElement | null;

    expect(stubs.initGameSpy).toHaveBeenCalledTimes(1);
    expect(stubs.initGameSpy).toHaveBeenCalledWith(sessionConfiguration);
    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);
    expect(overlay).toBeNull();
  });

  it('SC-29 - onReturnToLobby navigates to root route', async () => {
    await configureAndCreate();

    await openMatchOverOverlay();

    getByTestId<HTMLButtonElement>('return-to-lobby-button').click();
    await fixture.whenStable();

    expect(stubs.navigateSpy).toHaveBeenCalledTimes(1);
    expect(stubs.navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('SC-23 / TR-3.2 - sets inert and aria-hidden on background zones when match-over overlay is active', async () => {
    await configureAndCreate();

    await openMatchOverOverlay();

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

  it('TR-3.2 - sets inert and aria-hidden on background zones when turn-handoff overlay is active', async () => {
    await configureAndCreate({
      mode: 'Multiplayer',
      handoffEnabled: true,
      turnPhase: 'awaiting-confirmation',
    });

    (component as unknown as { confirmTurn: () => void }).confirmTurn();
    await fixture.whenStable();

    expect(readProtectedSignal<boolean>('showTurnHandoffOverlay')).toBe(true);
    expect(readProtectedSignal<boolean>('showMatchOverOverlay')).toBe(false);

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
});
