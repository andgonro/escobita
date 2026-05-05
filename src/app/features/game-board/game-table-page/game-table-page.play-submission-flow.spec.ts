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

// Covers: FR-3.4, FR-3.5, FR-4.3, FR-4.4, FR-4.5, FR-4.7, FR-8.3, US-8
// BDD Scenarios: SC-09, SC-13, SC-14, SC-27

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
  selectHandCard: (card: Card) => void;
  toggleTableCard: (card: Card) => void;
  resetForNextAction: () => void;
}

interface PlayActionBarPort {
  submitPlayClicked: { emit: () => void };
  confirmTurnClicked: { emit: () => void };
}

const placementCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const captureCard: Card = { suit: 'Copas', rank: '7', value: 7 };
const captureSubsetCard: Card = { suit: 'Bastos', rank: 'Sota', value: 8 };
const tableExtraCard: Card = { suit: 'Espadas', rank: '4', value: 4 };

function makeState(): GameState {
  return {
    deck: [],
    table: [captureSubsetCard, tableExtraCard],
    players: [
      {
        id: 'p1',
        name: 'Alice',
        hand: [placementCard, captureCard],
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
  resetForNextActionSpy: ReturnType<typeof vi.fn<() => void>>;
  setSelectedHandCard: (card: Card | null) => void;
  setSelectedTableCards: (cards: Card[]) => void;
  setCanSubmitPlay: (canSubmit: boolean) => void;
  setCaptureSelectionValid: (isValid: boolean) => void;
  setTurnPhase: (phase: TurnPhase) => void;
}

function createStubs(): Stubs {
  const stateSignal = signal<GameState | null>(makeState());
  const turnPhaseSignal = signal<TurnPhase>('awaiting-card-play');

  const selectedHandCardSignal = signal<Card | null>(null);
  const selectedTableCardsSignal = signal<Card[]>([]);
  const canSubmitPlaySignal = signal(false);
  const isCaptureSelectionValidSignal = signal(true);

  const playCardSpy = vi.fn();
  const confirmTurnSpy = vi.fn();
  const resetForNextActionSpy = vi.fn<() => void>();

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
    playCard: playCardSpy as unknown as GameEnginePort['playCard'],
    confirmTurn: confirmTurnSpy as unknown as GameEnginePort['confirmTurn'],
  };

  const sessionStub: GameSessionPort = {
    configuration: signal<GameConfiguration | null>(null).asReadonly(),
  };

  const interactionStub: TableInteractionStatePort = {
    selectedHandCard: selectedHandCardSignal.asReadonly(),
    selectedTableCards: selectedTableCardsSignal.asReadonly(),
    canSubmitPlay: canSubmitPlaySignal.asReadonly(),
    isCaptureSelectionValid: isCaptureSelectionValidSignal.asReadonly(),
    selectHandCard: vi.fn(),
    toggleTableCard: vi.fn(),
    resetForNextAction: resetForNextActionSpy,
  };

  const setSelectedHandCard = (card: Card | null): void => {
    selectedHandCardSignal.set(card);
  };

  const setSelectedTableCards = (cards: Card[]): void => {
    selectedTableCardsSignal.set(cards);
  };

  const setCanSubmitPlay = (canSubmit: boolean): void => {
    canSubmitPlaySignal.set(canSubmit);
  };

  const setCaptureSelectionValid = (isValid: boolean): void => {
    isCaptureSelectionValidSignal.set(isValid);
  };

  const setTurnPhase = (phase: TurnPhase): void => {
    turnPhaseSignal.set(phase);
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    playCardSpy,
    confirmTurnSpy,
    resetForNextActionSpy,
    setSelectedHandCard,
    setSelectedTableCards,
    setCanSubmitPlay,
    setCaptureSelectionValid,
    setTurnPhase,
  };
}

describe('GameTablePage play submission flow', () => {
  let fixture: ComponentFixture<GameTablePage>;
  let stubs: Stubs;

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const getPlayActionBar = (): PlayActionBarPort => {
    const actionBarDebugElement = fixture.debugElement.query(By.directive(PlayActionBar));
    expect(actionBarDebugElement).not.toBeNull();

    return actionBarDebugElement.componentInstance as PlayActionBarPort;
  };

  const configureAndCreate = async (): Promise<void> => {
    stubs = createStubs();

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

  it('FR-3.4 / FR-8.3 - projects orchestrated phase and readiness state into PlayActionBar controls', async () => {
    await configureAndCreate();
    stubs.setSelectedHandCard(null);
    stubs.setCanSubmitPlay(false);
    stubs.setCaptureSelectionValid(true);
    stubs.setTurnPhase('awaiting-card-play');
    await fixture.whenStable();

    const actionBarDebugElement = fixture.debugElement.query(By.directive(PlayActionBar));
    const submitButton = getByTestId<HTMLButtonElement>('submit-play');
    const confirmButton = getByTestId<HTMLButtonElement>('confirm-turn');

    expect(actionBarDebugElement).not.toBeNull();
    expect(submitButton.disabled).toBe(false);
    expect(confirmButton.disabled).toBe(true);

    stubs.setTurnPhase('awaiting-confirmation');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(getByTestId<HTMLButtonElement>('confirm-turn').disabled).toBe(false);
  });

  it('SC-09 / FR-3.5 - blocks submit intent when no hand card is selected and surfaces feedback', async () => {
    await configureAndCreate();
    stubs.setSelectedHandCard(null);
    stubs.setSelectedTableCards([]);
    stubs.setCanSubmitPlay(false);
    stubs.setCaptureSelectionValid(true);
    await fixture.whenStable();

    getPlayActionBar().submitPlayClicked.emit();
    await fixture.whenStable();

    expect(stubs.playCardSpy).not.toHaveBeenCalled();
    const validationMessage = getByTestId<HTMLElement>('play-validation-message');
    expect((validationMessage.textContent ?? '').trim()).toContain('Select a hand card');
  });

  it('SC-13 / FR-4.3 / FR-4.7 - dispatches placement with empty subset and no auto-correction', async () => {
    await configureAndCreate();
    stubs.setSelectedHandCard(placementCard);
    stubs.setSelectedTableCards([]);
    stubs.setCanSubmitPlay(true);
    stubs.setCaptureSelectionValid(true);
    await fixture.whenStable();

    getPlayActionBar().submitPlayClicked.emit();
    await fixture.whenStable();

    expect(stubs.playCardSpy).toHaveBeenCalledWith(placementCard, []);
    expect(stubs.resetForNextActionSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-14 / FR-4.5 / SC-27 - dispatches valid capture subset and clears transient selection', async () => {
    await configureAndCreate();
    stubs.setSelectedHandCard(captureCard);
    stubs.setSelectedTableCards([captureSubsetCard]);
    stubs.setCanSubmitPlay(true);
    stubs.setCaptureSelectionValid(true);
    await fixture.whenStable();

    getPlayActionBar().submitPlayClicked.emit();
    await fixture.whenStable();

    expect(stubs.playCardSpy).toHaveBeenCalledWith(captureCard, [captureSubsetCard]);
    expect(stubs.resetForNextActionSpy).toHaveBeenCalledTimes(1);
  });

  it('FR-3.4 - only dispatches confirm-turn intent during awaiting-confirmation phase', async () => {
    await configureAndCreate();

    stubs.setTurnPhase('awaiting-card-play');
    await fixture.whenStable();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

    stubs.setTurnPhase('awaiting-confirmation');
    await fixture.whenStable();
    getPlayActionBar().confirmTurnClicked.emit();
    await fixture.whenStable();

    expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
  });
});
