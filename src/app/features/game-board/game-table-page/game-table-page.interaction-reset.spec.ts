import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { TableInteractionState } from '../services/table-interaction-state';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';

import { GameTablePage } from './game-table-page';

// Covers: FR-3.2, FR-4.1, TR-2.4, NFR-3.1
// BDD Scenarios: SC-08, SC-11

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
  resetForNextAction: () => void;
}

const handCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const tableCardA: Card = { suit: 'Copas', rank: '5', value: 5 };
const tableCardB: Card = { suit: 'Bastos', rank: '3', value: 3 };

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

describe('GameTablePage interaction reset', () => {
  let fixture: ComponentFixture<GameTablePage>;
  let resetForNextActionSpy: ReturnType<typeof vi.fn<() => void>>;
  let playCardSpy: ReturnType<typeof vi.fn>;

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const configureAndCreate = async (): Promise<void> => {
    playCardSpy = vi.fn();
    resetForNextActionSpy = vi.fn<() => void>();

    const stateSignal = signal<GameState | null>(makeState());
    const phaseSignal = signal<TurnPhase>('awaiting-card-play');

    const engineStub: GameEnginePort = {
      state: stateSignal.asReadonly(),
      turnPhase: phaseSignal.asReadonly(),
      activePlayer: () => {
        const state = stateSignal();
        if (!state) {
          return null;
        }

        return state.players[state.turnIndex] ?? null;
      },
      playCard: playCardSpy as unknown as GameEnginePort['playCard'],
      confirmTurn: vi.fn(),
    };

    const sessionStub: GameSessionPort = {
      configuration: signal<GameConfiguration | null>(null).asReadonly(),
    };

    const interactionStub: TableInteractionStatePort = {
      selectedHandCard: signal<Card | null>(handCard).asReadonly(),
      selectedTableCards: signal<Card[]>([tableCardA, tableCardB]).asReadonly(),
      canSubmitPlay: signal(true).asReadonly(),
      isCaptureSelectionValid: signal(true).asReadonly(),
      resetForNextAction: resetForNextActionSpy,
    };

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: engineStub },
        { provide: GameSession, useValue: sessionStub },
        { provide: TableInteractionState, useValue: interactionStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  it('FR-3.2 / TR-2.4 - resets transient interaction state after successful play dispatch', async () => {
    await configureAndCreate();

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(playCardSpy).toHaveBeenCalledWith(handCard, [tableCardA, tableCardB]);
    expect(resetForNextActionSpy).toHaveBeenCalledTimes(1);
  });
});
