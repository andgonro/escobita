import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';
import { TableInteractionState } from '../services/table-interaction-state';
import { PlayActionBar } from './components/play-action-bar/play-action-bar';

import { GameTablePage } from './game-table-page';

// Covers: FR-3.6, FR-5.1, FR-5.2, FR-5.3, FR-5.4, FR-5.5, FR-5.6, FR-6.4, TR-5.3, NFR-2.1, US-5, US-6
// BDD Scenarios: SC-16, SC-17, SC-18, SC-19, SC-23, SC-30

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
  playCard: (card: Card, captureSubset: Card[]) => void;
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

interface PlayActionBarPort {
  confirmTurnClicked: { emit: () => void };
}

const handCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const tableCard: Card = { suit: 'Copas', rank: '5', value: 5 };

function makeState(): GameState {
  return {
    deck: [],
    table: [tableCard],
    players: [
      {
        id: 'p1',
        name: 'Jugador-1',
        hand: [handCard],
        capturedPile: [],
        escobaCount: 0,
      },
      {
        id: 'p2',
        name: 'Jugador-2',
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
  confirmTurnSpy: ReturnType<typeof vi.fn>;
  setTurnPhase: (phase: TurnPhase) => void;
}

function createStubs(mode: 'Single Player' | 'Multiplayer', handoffEnabled: boolean): Stubs {
  const stateSignal = signal<GameState | null>(makeState());
  const turnPhaseSignal = signal<TurnPhase>('awaiting-confirmation');
  const handoffEnabledSignal = signal(handoffEnabled);

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
    playCard: vi.fn(),
    confirmTurn: confirmTurnSpy as unknown as GameEnginePort['confirmTurn'],
  };

  const sessionStub: GameSessionPort = {
    configuration: signal<GameConfiguration | null>({
      mode,
      playerNames: mode === 'Single Player' ? ['Jugador-1', 'Laia'] : ['Jugador-1', 'Jugador-2'],
      playerCount: 2,
      aiDifficulty: 'Easy',
    }).asReadonly(),
  };

  const interactionStub: TableInteractionStatePort = {
    selectedHandCard: signal<Card | null>(null).asReadonly(),
    selectedTableCards: signal<Card[]>([]).asReadonly(),
    canSubmitPlay: signal(false).asReadonly(),
    isCaptureSelectionValid: signal(true).asReadonly(),
    handoffEnabled: handoffEnabledSignal.asReadonly(),
    setHandoffEnabled: (enabled: boolean): void => {
      handoffEnabledSignal.set(enabled);
    },
    selectHandCard: vi.fn(),
    toggleTableCard: vi.fn(),
    resetForNextAction: vi.fn(),
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    confirmTurnSpy,
    setTurnPhase: (phase: TurnPhase): void => {
      turnPhaseSignal.set(phase);
    },
  };
}

describe('GameTablePage turn completion and handoff branching', () => {
  let fixture: ComponentFixture<GameTablePage>;
  let stubs: Stubs;

  const getActivePlayerIndicatorText = (): string => {
    const activePlayerIndicator = fixture.nativeElement.querySelector(
      '[data-testid="active-player-indicator"]',
    ) as HTMLElement | null;

    if (!activePlayerIndicator) {
      throw new Error('Expected active-player-indicator to be rendered');
    }

    return (activePlayerIndicator.textContent ?? '').trim();
  };

  const getPlayActionBar = (): PlayActionBarPort => {
    const actionBarDebugElement = fixture.debugElement.query(By.directive(PlayActionBar));
    expect(actionBarDebugElement).not.toBeNull();

    return actionBarDebugElement.componentInstance as PlayActionBarPort;
  };

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

  const configureAndCreate = async (
    mode: 'Single Player' | 'Multiplayer',
    handoffEnabled: boolean,
  ): Promise<void> => {
    stubs = createStubs(mode, handoffEnabled);

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: stubs.engineStub },
        { provide: GameSession, useValue: stubs.sessionStub },
        { provide: TableInteractionState, useValue: stubs.interactionStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  it('SC-17 / FR-5.3 - multiplayer handoff-enabled flow preserves confirm mapping and gates reveal with overlay', async () => {
    await configureAndCreate('Multiplayer', true);

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeConfirm = getActivePlayerIndicatorText();

    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    const activePlayerAfterConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterConfirm).not.toEqual(activePlayerBeforeConfirm);

    const handoffOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    const nextTurnReveal = fixture.nativeElement.querySelector(
      '[data-testid="next-turn-reveal"]',
    ) as HTMLElement | null;

    expect(handoffOverlay).not.toBeNull();
    expect(nextTurnReveal).not.toBeNull();
    expect(nextTurnReveal?.getAttribute('aria-hidden')).toBe('true');
  });

  it('SC-18 / FR-5.4 - multiplayer handoff-disabled flow confirms directly with reveal state', async () => {
    await configureAndCreate('Multiplayer', false);

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeConfirm = getActivePlayerIndicatorText();

    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    const activePlayerAfterConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterConfirm).not.toEqual(activePlayerBeforeConfirm);

    const handoffOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    const nextTurnReveal = fixture.nativeElement.querySelector('[data-testid="next-turn-reveal"]');

    expect(handoffOverlay).toBeNull();
    expect(nextTurnReveal).not.toBeNull();
  });

  it('SC-19 / FR-5.5 - single-player flow bypasses handoff branch even if handoff is enabled', async () => {
    await configureAndCreate('Single Player', true);

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeConfirm = getActivePlayerIndicatorText();

    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    const activePlayerAfterConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterConfirm).not.toEqual(activePlayerBeforeConfirm);

    const handoffOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    const nextTurnReveal = fixture.nativeElement.querySelector('[data-testid="next-turn-reveal"]');

    expect(handoffOverlay).toBeNull();
    expect(nextTurnReveal).not.toBeNull();
  });

  it('SC-30 / FR-5.6 - enabled handoff branch remains consistent across subsequent confirmations', async () => {
    await configureAndCreate('Multiplayer', true);

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeFirstConfirm = getActivePlayerIndicatorText();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    const activePlayerAfterFirstConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterFirstConfirm).not.toEqual(activePlayerBeforeFirstConfirm);

    const handoffOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    expect(handoffOverlay).not.toBeNull();

    const acknowledgeButton = fixture.nativeElement.querySelector(
      '[data-testid="handoff-acknowledge"]',
    ) as HTMLButtonElement | null;
    expect(acknowledgeButton).not.toBeNull();
    acknowledgeButton?.click();
    await fixture.whenStable();

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeSecondConfirm = getActivePlayerIndicatorText();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(2);
    const activePlayerAfterSecondConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterSecondConfirm).not.toEqual(activePlayerBeforeSecondConfirm);

    const secondOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    expect(secondOverlay).not.toBeNull();
  });

  it('SC-30 / FR-5.6 - disabled handoff branch remains consistent across subsequent confirmations', async () => {
    await configureAndCreate('Multiplayer', false);

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeFirstConfirm = getActivePlayerIndicatorText();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    const activePlayerAfterFirstConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterFirstConfirm).not.toEqual(activePlayerBeforeFirstConfirm);

    const firstOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    const firstNextTurnReveal = fixture.nativeElement.querySelector(
      '[data-testid="next-turn-reveal"]',
    );
    expect(firstOverlay).toBeNull();
    expect(firstNextTurnReveal).not.toBeNull();

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeSecondConfirm = getActivePlayerIndicatorText();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(2);
    const activePlayerAfterSecondConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterSecondConfirm).not.toEqual(activePlayerBeforeSecondConfirm);

    const secondOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    const secondNextTurnReveal = fixture.nativeElement.querySelector(
      '[data-testid="next-turn-reveal"]',
    );
    expect(secondOverlay).toBeNull();
    expect(secondNextTurnReveal).not.toBeNull();
  });

  it('SC-23 / FR-6.4 - handoff-enabled confirmation and acknowledgement move focus to deterministic targets', async () => {
    await configureAndCreate('Multiplayer', true);

    stubs.setTurnPhase('awaiting-confirmation');
    const confirmTurnButton = getByTestId<HTMLButtonElement>('confirm-turn');
    confirmTurnButton.focus();
    confirmTurnButton.click();
    await fixture.whenStable();

    expectFocusedTestId('handoff-acknowledge');

    const acknowledgeButton = getByTestId<HTMLButtonElement>('handoff-acknowledge');
    acknowledgeButton.click();
    await fixture.whenStable();

    expectFocusedTestId('submit-play');
  });

  it('SC-23 / FR-6.4 - handoff-disabled confirmation returns focus to submit action for the next turn', async () => {
    await configureAndCreate('Multiplayer', false);

    stubs.setTurnPhase('awaiting-confirmation');
    const confirmTurnButton = getByTestId<HTMLButtonElement>('confirm-turn');
    confirmTurnButton.focus();
    confirmTurnButton.click();
    await fixture.whenStable();

    expectFocusedTestId('submit-play');
  });

  it('TR-5.3 / FR-5.6 - in-session handoff mode change applies to the next completion immediately', async () => {
    await configureAndCreate('Multiplayer', true);

    stubs.setTurnPhase('awaiting-confirmation');
    const activePlayerBeforeFirstConfirm = getActivePlayerIndicatorText();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    const activePlayerAfterFirstConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterFirstConfirm).not.toEqual(activePlayerBeforeFirstConfirm);

    const firstOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    expect(firstOverlay).not.toBeNull();

    stubs.interactionStub.setHandoffEnabled(false);
    stubs.setTurnPhase('awaiting-confirmation');

    const activePlayerBeforeSecondConfirm = getActivePlayerIndicatorText();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(2);
    const activePlayerAfterSecondConfirm = getActivePlayerIndicatorText();
    expect(activePlayerAfterSecondConfirm).not.toEqual(activePlayerBeforeSecondConfirm);

    const secondOverlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    );
    const secondNextTurnReveal = fixture.nativeElement.querySelector(
      '[data-testid="next-turn-reveal"]',
    );
    expect(secondOverlay).toBeNull();
    expect(secondNextTurnReveal).not.toBeNull();
  });
});
