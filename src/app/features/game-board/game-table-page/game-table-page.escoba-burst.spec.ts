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
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';

import { GameTablePage } from './game-table-page';
import { CenterTableZone } from './zones/center-table-zone/center-table-zone';

// Covers: FR-6, TR-2, NFR-7, US-6

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
  roundResult: () => null;
  matchWinner: () => null;
  initGame: (cfg: GameConfiguration) => void;
  playCard: (card: Card, subset: Card[]) => void;
  confirmTurn: () => void;
  startNextRound: () => void;
}

const playedCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const tableCardA: Card = { suit: 'Copas', rank: '6', value: 6 };
const tableCardB: Card = { suit: 'Bastos', rank: '7', value: 7 };

const sessionConfiguration: GameConfiguration = {
  mode: 'Single Player',
  playerNames: ['Ana'],
  playerCount: 2,
  aiDifficulty: 'Easy',
};

const createState = (): GameState => ({
  deck: [],
  table: [tableCardA, tableCardB],
  players: [
    { id: 'p1', name: 'Ana', hand: [playedCard], capturedPile: [], escobaCount: 0 },
    { id: 'p2', name: 'Laia', hand: [], capturedPile: [], escobaCount: 0 },
  ],
  turnIndex: 0,
  roundNumber: 1,
  matchScores: { p1: 0, p2: 0 },
  lastCapturerId: null,
});

describe('GameTablePage Escoba burst emphasis (T-9)', () => {
  let fixture: ComponentFixture<GameTablePage>;

  const configureAndCreate = async () => {
    const stateSignal = signal<GameState | null>(createState());
    const turnPhaseSignal = signal<TurnPhase>('awaiting-card-play');
    const selectedHandCardSignal = signal<Card | null>(playedCard);
    const selectedTableCardsSignal = signal<Card[]>([tableCardA, tableCardB]);

    const engineStub: GameEnginePort = {
      state: stateSignal.asReadonly(),
      turnPhase: turnPhaseSignal.asReadonly(),
      activePlayer: () => stateSignal()?.players[0] ?? null,
      roundResult: () => null,
      matchWinner: () => null,
      initGame: vi.fn(),
      playCard: vi.fn((card: Card, captureSubset: Card[]) => {
        stateSignal.update((state) => {
          if (!state) {
            return state;
          }

          const isSameCard = (left: Card, right: Card) => {
            return (
              left.suit === right.suit && left.rank === right.rank && left.value === right.value
            );
          };

          return {
            ...state,
            table: state.table.filter(
              (entry) => !captureSubset.some((captured) => isSameCard(entry, captured)),
            ),
            players: state.players.map((player, index) => {
              if (index !== 0) {
                return player;
              }

              return {
                ...player,
                hand: player.hand.filter((entry) => !isSameCard(entry, card)),
                escobaCount: player.escobaCount + 1,
              };
            }),
            lastCapturerId: 'p1',
          };
        });

        turnPhaseSignal.set('awaiting-confirmation');
      }) as unknown as GameEnginePort['playCard'],
      confirmTurn: vi.fn(),
      startNextRound: vi.fn(),
    };

    const interactionStub = {
      selectedHandCard: selectedHandCardSignal.asReadonly(),
      selectedTableCards: selectedTableCardsSignal.asReadonly(),
      canSubmitPlay: signal(true).asReadonly(),
      isCaptureSelectionValid: signal(true).asReadonly(),
      resetForNextAction: vi.fn(),
      selectHandCard: vi.fn(),
      toggleTableCard: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: engineStub },
        { provide: GameSession, useValue: { configuration: () => sessionConfiguration } },
        { provide: TableInteractionState, useValue: interactionStub },
        { provide: Router, useValue: { navigate: vi.fn(async () => true) } },
        { provide: AiStrategyService, useValue: { decide: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  it('SC-14 / FR-6 - starts an escoba animation group when capture clears the full table', async () => {
    await configureAndCreate();

    const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

    const submitButton = fixture.nativeElement.querySelector(
      '[data-testid="submit-play"]',
    ) as HTMLButtonElement | null;
    submitButton?.click();
    await fixture.whenStable();

    const escobaCall = startGroupSpy.mock.calls.find(
      ([request]) => request.actionType === 'escoba',
    );
    expect(escobaCall).toBeDefined();
  });

  it('SC-15 / FR-6 - escoba animation completes within the 600-800ms envelope', async () => {
    vi.useFakeTimers();
    await configureAndCreate();

    const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');
    const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
    pausePolicy.setRuntimeOverrideMs(0);

    const submitButton = fixture.nativeElement.querySelector(
      '[data-testid="submit-play"]',
    ) as HTMLButtonElement | null;
    submitButton?.click();

    const escobaCall = startGroupSpy.mock.calls.find(
      ([request]) => request.actionType === 'escoba',
    );
    expect(escobaCall).toBeDefined();

    await vi.advanceTimersByTimeAsync(801);
    await fixture.whenStable();

    const runningEscobaGroups = orchestrator
      .animationState()
      .groups.filter((group) => group.actionType === 'escoba' && group.status === 'running');

    expect(runningEscobaGroups.length).toBe(0);
  });

  it('FR-6 - escoba completion reconciles a visually cleared center table', async () => {
    vi.useFakeTimers();
    await configureAndCreate();

    const submitButton = fixture.nativeElement.querySelector(
      '[data-testid="submit-play"]',
    ) as HTMLButtonElement | null;
    submitButton?.click();

    await vi.advanceTimersByTimeAsync(801);
    await fixture.whenStable();

    const renderedTableCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="table-card-"]',
    );
    expect(renderedTableCards.length).toBe(0);
  });

  it('SC-16 / FR-6 - reduced-motion escoba path still starts an escoba group for completion handling', async () => {
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
      await configureAndCreate();

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(0);

      const submitButton = fixture.nativeElement.querySelector(
        '[data-testid="submit-play"]',
      ) as HTMLButtonElement | null;
      submitButton?.click();
      await fixture.whenStable();

      const escobaCall = startGroupSpy.mock.calls.find(
        ([request]) => request.actionType === 'escoba',
      );
      expect(escobaCall).toBeDefined();

      const escobaOutcome = fixture.nativeElement.querySelector(
        '[data-testid="escoba-outcome-indicator"]',
      ) as HTMLElement | null;
      expect(escobaOutcome?.textContent).toContain('Ana');
      expect(escobaOutcome?.textContent).toContain('(1)');

      const escobaVisualCards = fixture.nativeElement.querySelectorAll(
        '.card-visual--animation-escoba',
      );
      expect(escobaVisualCards.length).toBe(0);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    }
  });

  it('FR-6 / NFR-7 - center table zone renders escoba animation state for clearing cards', async () => {
    await configureAndCreate();

    const submitButton = fixture.nativeElement.querySelector(
      '[data-testid="submit-play"]',
    ) as HTMLButtonElement | null;
    submitButton?.click();
    await fixture.whenStable();

    const centerZoneDebug = fixture.debugElement.query(By.directive(CenterTableZone));
    const centerZone = centerZoneDebug.componentInstance as CenterTableZone & {
      animationMetadata: { table: { card: Card; animationState: string | null }[] } | null;
    };

    const escobaStates = centerZone.animationMetadata?.table.filter(
      (entry) => entry.animationState === 'escoba',
    );

    expect(escobaStates?.length).toBeGreaterThan(0);
  });
});
