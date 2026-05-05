import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { TableInteractionState } from '../services/table-interaction-state';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';

import { GameTablePage } from './game-table-page';

// Covers: FR-8.1, FR-8.2, TR-2.1, TR-2.3, US-1, US-2
// BDD Scenarios: SC-01, SC-26

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => GameState['players'][number] | null;
  initGame: (configuration: GameConfiguration) => void;
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
}

const bootstrapConfiguration: GameConfiguration = {
  mode: 'Single Player',
  playerNames: ['Bootstrap Player'],
  playerCount: 2,
  aiDifficulty: 'Easy',
};

function createBootstrappedState(configuration: GameConfiguration): GameState {
  return {
    deck: [],
    table: [{ suit: 'Copas', rank: '5', value: 5 }],
    players: [
      {
        id: 'player-1',
        name: configuration.playerNames[0] ?? 'Player 1',
        hand: [{ suit: 'Oros', rank: '7', value: 7 }],
        capturedPile: [],
        escobaCount: 0,
      },
      {
        id: 'player-2',
        name: 'CPU',
        hand: [{ suit: 'Espadas', rank: '4', value: 4 }],
        capturedPile: [],
        escobaCount: 0,
      },
    ],
    turnIndex: 0,
    roundNumber: 1,
    matchScores: {
      'player-1': 2,
      'player-2': 1,
    },
    lastCapturerId: null,
  };
}

describe('GameTablePage session bootstrap', () => {
  let fixture: ComponentFixture<GameTablePage>;
  let engineStateSignal = signal<GameState | null>(null);
  let initGameSpy = vi.fn<(configuration: GameConfiguration) => void>();

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const configureAndCreate = async (): Promise<void> => {
    engineStateSignal = signal<GameState | null>(null);
    initGameSpy = vi.fn((configuration: GameConfiguration) => {
      engineStateSignal.set(createBootstrappedState(configuration));
    });

    const engineStub: GameEnginePort = {
      state: engineStateSignal.asReadonly(),
      turnPhase: signal<TurnPhase>('awaiting-card-play').asReadonly(),
      activePlayer: () => {
        const state = engineStateSignal();
        if (!state) {
          return null;
        }

        return state.players[state.turnIndex] ?? null;
      },
      initGame: initGameSpy,
      playCard: vi.fn(),
      confirmTurn: vi.fn(),
    };

    const sessionStub: GameSessionPort = {
      configuration: signal<GameConfiguration | null>(bootstrapConfiguration).asReadonly(),
    };

    const interactionStub: TableInteractionStatePort = {
      selectedHandCard: signal<Card | null>(null).asReadonly(),
      selectedTableCards: signal<Card[]>([]).asReadonly(),
      canSubmitPlay: signal(false).asReadonly(),
      isCaptureSelectionValid: signal(false).asReadonly(),
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

  it('SC-01 / FR-8.1 - initializes game engine from session configuration on table entry', async () => {
    await configureAndCreate();

    expect(initGameSpy).toHaveBeenCalledTimes(1);
    expect(initGameSpy).toHaveBeenCalledWith(bootstrapConfiguration);
  });

  it('SC-26 / FR-8.2 - renders engine-authoritative hand, table, and score context after bootstrap', async () => {
    await configureAndCreate();

    const activePlayerIndicator = getByTestId<HTMLElement>('active-player-indicator');
    const renderedHandCards = fixture.nativeElement.querySelectorAll('[data-testid^="hand-card-"]');
    const renderedTableCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="table-card-"]',
    );
    const scoreItems = fixture.nativeElement.querySelectorAll(
      '[data-testid^="score-item-"] .score-value',
    );

    expect(activePlayerIndicator.textContent ?? '').toContain('Bootstrap Player');
    expect(renderedHandCards.length).toBeGreaterThan(0);
    expect(renderedTableCards.length).toBe(1);
    expect(scoreItems[0]?.textContent?.trim()).toBe('2');
    expect(scoreItems[1]?.textContent?.trim()).toBe('1');
  });
});
