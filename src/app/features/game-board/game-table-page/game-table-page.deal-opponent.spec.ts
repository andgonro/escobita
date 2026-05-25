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
import { AiPlayDecision } from '../../../models/ai-turn';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';

import { GameTablePage } from './game-table-page';
import { ActiveHandZone } from './zones/active-hand-zone/active-hand-zone';
import { OpponentZones } from './zones/opponent-zones/opponent-zones';

// Covers: FR-3, FR-5, FR-7, FR-8, TR-2, TR-5, TR-8, US-3, US-5, US-8, US-12, US-14
// BDD Scenarios: SC-07, SC-08, SC-12, SC-17, SC-18, SC-21

const handCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const tableCardA: Card = { suit: 'Copas', rank: '5', value: 5 };

const sessionConfiguration: GameConfiguration = {
  mode: 'Single Player',
  playerNames: ['Alice'],
  playerCount: 2,
  aiDifficulty: 'Easy',
};

function makeStateWithHand(hand: Card[]): GameState {
  return {
    deck: [],
    table: [tableCardA],
    players: [
      { id: 'p1', name: 'Alice', hand, capturedPile: [], escobaCount: 0 },
      { id: 'p2', name: 'Laia', hand: [handCard], capturedPile: [], escobaCount: 0 },
    ],
    turnIndex: 0,
    roundNumber: 1,
    matchScores: { p1: 0, p2: 0 },
    lastCapturerId: null,
  };
}

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

interface GameSessionPort {
  configuration: () => GameConfiguration | null;
}

interface TableInteractionStatePort {
  selectedHandCard: () => Card | null;
  selectedTableCards: () => Card[];
  canSubmitPlay: () => boolean;
  isCaptureSelectionValid: () => boolean;
}

interface AiStrategyPort {
  decide: (
    state: GameState,
    player: Player,
    diff: GameConfiguration['aiDifficulty'],
  ) => AiPlayDecision;
}

function createStubs(turnPhase: TurnPhase, dealRecipient: 'player' | 'ai' = 'player') {
  const stateSignal = signal<GameState | null>(makeStateWithHand([handCard]));
  const turnPhaseSignal = signal<TurnPhase>(turnPhase);
  let aiDecision: AiPlayDecision = { cardToPlay: handCard, captureSubset: [] };

  const isSameCard = (l: Card, r: Card) =>
    l.suit === r.suit && l.rank === r.rank && l.value === r.value;

  const playCardSpy = vi.fn((card: Card, captureSubset: Card[]) => {
    stateSignal.update((s) => {
      if (!s || s.turnIndex !== 0) return s;
      const activePlayer = s.players[s.turnIndex];
      if (!activePlayer) return s;
      return {
        ...s,
        table: s.table.filter((t) => !captureSubset.some((c) => isSameCard(t, c))),
        players: s.players.map((p, i) =>
          i !== s.turnIndex ? p : { ...p, hand: p.hand.filter((h) => !isSameCard(h, card)) },
        ),
      };
    });
    turnPhaseSignal.set('awaiting-confirmation');
  });

  const confirmTurnSpy = vi.fn(() => {
    stateSignal.update((s) => {
      if (!s) return s;
      // Simulate deal: give new cards to player hand
      const dealtCards: Card[] = [
        { suit: 'Espadas', rank: '1', value: 1 },
        { suit: 'Oros', rank: '2', value: 2 },
        { suit: 'Bastos', rank: '3', value: 3 },
      ];
      return {
        ...s,
        turnIndex: (s.turnIndex + 1) % s.players.length,
        players: s.players.map((p, i) =>
          dealRecipient === 'player'
            ? i === 0
              ? { ...p, hand: dealtCards }
              : p
            : i === 1
              ? { ...p, hand: dealtCards }
              : p,
        ),
      };
    });
    turnPhaseSignal.set('awaiting-card-play');
  });

  const engineStub: GameEnginePort = {
    state: stateSignal.asReadonly(),
    turnPhase: turnPhaseSignal.asReadonly(),
    activePlayer: () => {
      const s = stateSignal();
      return s ? (s.players[s.turnIndex] ?? null) : null;
    },
    roundResult: () => null,
    matchWinner: () => null,
    initGame: vi.fn(),
    playCard: playCardSpy as unknown as GameEnginePort['playCard'],
    confirmTurn: confirmTurnSpy as unknown as GameEnginePort['confirmTurn'],
    startNextRound: vi.fn(),
  };

  const sessionStub: GameSessionPort = {
    configuration: () => sessionConfiguration,
  };

  const interactionStub: TableInteractionStatePort = {
    selectedHandCard: signal<Card | null>(handCard).asReadonly(),
    selectedTableCards: signal<Card[]>([]).asReadonly(),
    canSubmitPlay: signal(true).asReadonly(),
    isCaptureSelectionValid: signal(true).asReadonly(),
  };

  const decideSpy = vi.fn(() => aiDecision);
  const aiStrategyStub: AiStrategyPort = {
    decide: decideSpy as unknown as AiStrategyPort['decide'],
  };

  const setAiDecision = (d: AiPlayDecision) => {
    aiDecision = d;
  };
  const setTurnPhase = (p: TurnPhase) => turnPhaseSignal.set(p);
  const setState = (s: GameState | null) => stateSignal.set(s);
  const setTurnIndex = (idx: number) => {
    const cur = stateSignal();
    if (cur) stateSignal.set({ ...cur, turnIndex: idx });
  };

  return {
    engineStub,
    sessionStub,
    interactionStub,
    aiStrategyStub,
    playCardSpy,
    confirmTurnSpy,
    decideSpy,
    setAiDecision,
    setTurnPhase,
    setState,
    setTurnIndex,
  };
}

describe('GameTablePage — deal and opponent animation flows (T-8)', () => {
  let component: GameTablePage;
  let fixture: ComponentFixture<GameTablePage>;
  let stubs: ReturnType<typeof createStubs>;

  const runAiTurnDirectly = (): Promise<void> => {
    const runner = (component as unknown as { runAiTurn?: () => Promise<void> }).runAiTurn;
    if (typeof runner !== 'function') {
      throw new Error('Expected private runAiTurn method on GameTablePage');
    }
    return runner.call(component);
  };

  const getActiveHandZoneInstance = (): ActiveHandZone => {
    const dbg = fixture.debugElement.query(By.directive(ActiveHandZone));
    if (!dbg) throw new Error('Expected ActiveHandZone in GameTablePage');
    return dbg.componentInstance as ActiveHandZone;
  };

  const getOpponentZonesInstance = (): OpponentZones => {
    const dbg = fixture.debugElement.query(By.directive(OpponentZones));
    if (!dbg) throw new Error('Expected OpponentZones in GameTablePage');
    return dbg.componentInstance as OpponentZones;
  };

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const el = (fixture.nativeElement as HTMLElement).querySelector(
      `[data-testid="${testId}"]`,
    ) as T | null;
    if (!el) throw new Error(`Expected element with data-testid="${testId}"`);
    return el;
  };

  const configureAndCreate = async (
    turnPhase: TurnPhase,
    dealRecipient: 'player' | 'ai' = 'player',
  ) => {
    stubs = createStubs(turnPhase, dealRecipient);

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: stubs.engineStub },
        { provide: GameSession, useValue: stubs.sessionStub },
        { provide: TableInteractionState, useValue: stubs.interactionStub },
        { provide: Router, useValue: { navigate: vi.fn(async () => true) } },
        { provide: AiStrategyService, useValue: stubs.aiStrategyStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    component = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  const arrangeAiTurn = (captureSubset: Card[] = []) => {
    const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
    stubs.setAiDecision({ cardToPlay: aiCard, captureSubset });
    stubs.setState({
      deck: [],
      table: [tableCardA],
      players: [
        { id: 'p1', name: 'Alice', hand: [handCard], capturedPile: [], escobaCount: 0 },
        { id: 'p2', name: 'Laia', hand: [aiCard], capturedPile: [], escobaCount: 0 },
      ],
      turnIndex: 1,
      roundNumber: 1,
      matchScores: { p1: 0, p2: 0 },
      lastCapturerId: null,
    });
  };

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // --- Deal animation orchestration ---

  it('T-8 / FR-3 / SC-07 - starts a deal animation group covering all newly dealt hand cards after confirm turn', async () => {
    await configureAndCreate('awaiting-confirmation');

    const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

    const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
    pausePolicy.setRuntimeOverrideMs(0);

    getByTestId<HTMLButtonElement>('confirm-turn').click();
    await fixture.whenStable();

    const dealCall = startGroupSpy.mock.calls.find(([req]) => req.actionType === 'deal');
    expect(dealCall).toBeDefined();
    expect(dealCall![0].cardIds.length).toBeGreaterThan(0);
  });

  it('T-8 / FR-3 / SC-08 - deal animation group includes all three dealt cards simultaneously', async () => {
    await configureAndCreate('awaiting-confirmation');

    const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

    const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
    pausePolicy.setRuntimeOverrideMs(0);

    getByTestId<HTMLButtonElement>('confirm-turn').click();
    await fixture.whenStable();

    const dealCall = startGroupSpy.mock.calls.find(([req]) => req.actionType === 'deal');
    expect(dealCall).toBeDefined();
    // All dealt cards should be in a single group (simultaneous)
    expect(dealCall![0].cardIds.length).toBe(3);
  });

  it('T-8 / FR-3 - renders deal animation class on all newly dealt hand cards simultaneously', async () => {
    await configureAndCreate('awaiting-confirmation');

    const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
    pausePolicy.setRuntimeOverrideMs(0);

    getByTestId<HTMLButtonElement>('confirm-turn').click();
    await fixture.whenStable();

    const handZone = getActiveHandZoneInstance();
    const metadata = (handZone as unknown as { animationMetadata: unknown }).animationMetadata as {
      hand: { card: Card; animationState: string | null }[];
    } | null;

    const dealStates = metadata?.hand.filter((e) => e.animationState === 'deal') ?? [];
    // All 3 new cards should carry 'deal' animation state simultaneously
    expect(dealStates.length).toBe(3);
  });

  it('T-8 / FR-3 - deal animation state is cleared after deal animation completes', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-confirmation');

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(0);

      getByTestId<HTMLButtonElement>('confirm-turn').click();
      await vi.advanceTimersByTimeAsync(1100);
      await fixture.whenStable();

      // Verify the group was actually started (fails in RED when deal is not implemented)
      const dealCall = startGroupSpy.mock.calls.find(([req]) => req.actionType === 'deal');
      expect(dealCall).toBeDefined();

      // After deal duration the deal group should be finalized
      const state = orchestrator.animationState();
      const runningDealGroups = state.groups.filter(
        (g) => g.actionType === 'deal' && g.status === 'running',
      );
      expect(runningDealGroups.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  // --- Opponent-play animation orchestration ---

  it('T-8 / FR-8 / SC-12 - starts an opponent-play animation group when AI plays a card', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-card-play');

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({ cardToPlay: aiCard, captureSubset: [] });
      stubs.setState({
        deck: [],
        table: [tableCardA],
        players: [
          { id: 'p1', name: 'Alice', hand: [handCard], capturedPile: [], escobaCount: 0 },
          { id: 'p2', name: 'Laia', hand: [aiCard], capturedPile: [], escobaCount: 0 },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(1);
      const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(10);
      await aiRun;

      const opponentPlayCall = startGroupSpy.mock.calls.find(
        ([req]) => req.actionType === 'opponent-play',
      );
      expect(opponentPlayCall).toBeDefined();
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-8 / FR-8 / SC-12 - opponent-play animation group uses same duration envelope as player play (800–1200ms)', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-card-play');

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({ cardToPlay: aiCard, captureSubset: [] });
      stubs.setState({
        deck: [],
        table: [tableCardA],
        players: [
          { id: 'p1', name: 'Alice', hand: [handCard], capturedPile: [], escobaCount: 0 },
          { id: 'p2', name: 'Laia', hand: [aiCard], capturedPile: [], escobaCount: 0 },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(1);

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(10);
      await aiRun;

      // Verify the group was actually started (fails in RED when opponent-play is not implemented)
      const opponentPlayCall = startGroupSpy.mock.calls.find(
        ([req]) => req.actionType === 'opponent-play',
      );
      expect(opponentPlayCall).toBeDefined();

      // After AI play, the opponent-play group should be finalized within max play duration
      await vi.advanceTimersByTimeAsync(1200);
      await fixture.whenStable();

      const state = orchestrator.animationState();
      const runningOpponentGroups = state.groups.filter(
        (g) => g.actionType === 'opponent-play' && g.status === 'running',
      );
      expect(runningOpponentGroups.length).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-8 / FR-5 - opponent-play group includes the AI played card id', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-card-play');

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({ cardToPlay: aiCard, captureSubset: [] });
      stubs.setState({
        deck: [],
        table: [tableCardA],
        players: [
          { id: 'p1', name: 'Alice', hand: [handCard], capturedPile: [], escobaCount: 0 },
          { id: 'p2', name: 'Laia', hand: [aiCard], capturedPile: [], escobaCount: 0 },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(1);
      const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

      const aiRun = runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(10);
      await aiRun;

      const opponentPlayCall = startGroupSpy.mock.calls.find(
        ([req]) => req.actionType === 'opponent-play',
      );
      expect(opponentPlayCall).toBeDefined();
      expect(opponentPlayCall![0].cardIds).toContain('Oros-1');
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-8 / FR-8 - opponent animation metadata is reflected on OpponentZones during AI play', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-card-play');

      const aiCard: Card = { suit: 'Oros', rank: '1', value: 1 };
      stubs.setAiDecision({ cardToPlay: aiCard, captureSubset: [] });
      stubs.setState({
        deck: [],
        table: [tableCardA],
        players: [
          { id: 'p1', name: 'Alice', hand: [handCard], capturedPile: [], escobaCount: 0 },
          { id: 'p2', name: 'Laia', hand: [aiCard], capturedPile: [], escobaCount: 0 },
        ],
        turnIndex: 1,
        roundNumber: 1,
        matchScores: { p1: 0, p2: 0 },
        lastCapturerId: null,
      });

      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(500);

      // Start the AI run but check state BEFORE it completes
      void runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(5);
      await fixture.whenStable();

      // The opponent zones should receive opponent animation metadata while AI is resolving
      const opponentZones = getOpponentZonesInstance();
      const metadata = (opponentZones as unknown as { animationMetadata: unknown })
        .animationMetadata as {
        opponent: { cardIndex: number; animationState: string | null }[];
      } | null;

      const opponentAnimationActive =
        metadata?.opponent.some((e) => e.animationState === 'opponent') ?? false;

      expect(opponentAnimationActive).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-8 / FR-5 / FR-8 - starts a deal animation group when AI receives replenishment cards after confirm turn', async () => {
    await configureAndCreate('awaiting-confirmation', 'ai');

    const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

    const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
    pausePolicy.setRuntimeOverrideMs(0);

    getByTestId<HTMLButtonElement>('confirm-turn').click();
    await fixture.whenStable();

    const dealCall = startGroupSpy.mock.calls.find(([req]) => req.actionType === 'deal');
    expect(dealCall).toBeDefined();
    expect(dealCall![0].cardIds.length).toBeGreaterThan(0);
  });

  it('T-11 / TR-6 / NFR-3 - reduced-motion path suppresses deal animation metadata while preserving confirm outcome', async () => {
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
      await configureAndCreate('awaiting-confirmation');
      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);

      getByTestId<HTMLButtonElement>('confirm-turn').click();
      await fixture.whenStable();

      const runningDealGroups = orchestrator
        .animationState()
        .groups.filter((group) => group.actionType === 'deal' && group.status === 'running');

      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
      expect(runningDealGroups.length).toBe(0);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
    }
  });

  it('T-11 / TR-6 / NFR-3 - reduced-motion path bypasses extended AI semantic pauses before decision', async () => {
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
      await configureAndCreate('awaiting-card-play');
      arrangeAiTurn();

      void runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(20);
      await fixture.whenStable();

      expect(stubs.decideSpy).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
      vi.useRealTimers();
    }
  });

  it('T-11 / SC-13 / TR-6 - reduced-motion path suppresses opponent-play visual metadata during AI resolution', async () => {
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
      await configureAndCreate('awaiting-card-play');
      arrangeAiTurn();

      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(1);

      void runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(30);
      await fixture.whenStable();

      const opponentZones = getOpponentZonesInstance();
      const metadata = (opponentZones as unknown as { animationMetadata: unknown })
        .animationMetadata as {
        opponent: { cardIndex: number; animationState: string | null }[];
      } | null;

      const opponentAnimationActive =
        metadata?.opponent.some((entry) => entry.animationState === 'opponent') ?? false;

      expect(opponentAnimationActive).toBe(false);
    } finally {
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: originalMatchMedia,
      });
      vi.useRealTimers();
    }
  });

  it('T-10 / FR-8 / TR-8 - AI run waits for opponent-play group completion before confirm', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-card-play');
      arrangeAiTurn();

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(500);

      const startGroupSpy = vi.spyOn(orchestrator, 'startGroup');

      void runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(50);

      const opponentPlayCall = startGroupSpy.mock.calls.find(
        ([request]) => request.actionType === 'opponent-play',
      );
      expect(opponentPlayCall).toBeDefined();

      // Runtime override keeps AI phase pauses tiny, but confirm still must wait for
      // opponent-play completion + post-play handoff pause.
      await vi.advanceTimersByTimeAsync(350);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(700);
      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-10 / FR-8 - AI semantic phase remains resolving while opponent-play animation is still running', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-card-play');
      arrangeAiTurn();

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(700);

      void runAiTurnDirectly();
      await vi.advanceTimersByTimeAsync(200);

      const runningOpponentGroup = orchestrator
        .animationState()
        .groups.find((group) => group.actionType === 'opponent-play' && group.status === 'running');
      expect(runningOpponentGroup).toBeDefined();

      const aiPhase = (
        component as unknown as {
          aiTurnAnimationState: () => { phase: string };
        }
      ).aiTurnAnimationState().phase;

      expect(aiPhase).toBe('resolving');
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-10 / FR-7 / FR-8 - AI handoff applies configured pause after completion before confirm', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-confirmation');

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);

      const groupId = orchestrator.startGroup({
        actionType: 'opponent-play',
        cardIds: ['Oros-1'],
      });
      orchestrator.completeParticipant(groupId, 'Oros-1', 100);
      setTimeout(() => {
        orchestrator.finalizeGroup(groupId);
      }, 1000);

      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(600);

      const sequencingPromise = (
        component as unknown as {
          confirmTurnWithSequencing: (
            stage: 'ai-post-play-confirm' | 'player-post-play-confirm',
            alwaysApplyPause: boolean,
          ) => Promise<void>;
        }
      ).confirmTurnWithSequencing('ai-post-play-confirm', true);

      // Animation completes at 1000ms. With a configured 600ms pause, confirm must not happen before 1600ms.
      await vi.advanceTimersByTimeAsync(1500);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(200);
      await sequencingPromise;
      expect(stubs.confirmTurnSpy).toHaveBeenCalledTimes(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-10 / TR-8 / SC-18 - missing group completion signal does not deadlock confirm sequencing', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-confirmation');

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(0);

      orchestrator.startGroup({
        actionType: 'opponent-play',
        cardIds: ['Oros-1'],
      });

      void (
        component as unknown as {
          confirmTurnWithSequencing: (
            stage: 'ai-post-play-confirm' | 'player-post-play-confirm',
            alwaysApplyPause: boolean,
          ) => Promise<void>;
        }
      ).confirmTurnWithSequencing('ai-post-play-confirm', true);

      await vi.advanceTimersByTimeAsync(1400);
      expect(stubs.confirmTurnSpy).not.toHaveBeenCalled();

      await vi.advanceTimersByTimeAsync(200);
      await vi.runOnlyPendingTimersAsync();
      expect(stubs.confirmTurnSpy.mock.calls.length).toBeGreaterThanOrEqual(1);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-12 / TR-8 / SC-21 - fallback completion clears transient visual cards after timeout recovery', async () => {
    vi.useFakeTimers();
    try {
      await configureAndCreate('awaiting-confirmation');

      const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
      const pausePolicy = fixture.componentRef.injector.get(TurnPausePolicy);
      pausePolicy.setRuntimeOverrideMs(0);

      orchestrator.startGroup({
        actionType: 'opponent-play',
        cardIds: ['Oros-1'],
      });

      const transientPlayedCard: Card = { suit: 'Espadas', rank: '6', value: 6 };
      const transientCapturedCard: Card = { suit: 'Bastos', rank: '4', value: 4 };

      (
        component as unknown as {
          transientPlayedHandCardState: { set: (card: Card | null) => void };
          transientCapturedTableCardsState: { set: (cards: Card[]) => void };
          activeHandCards: () => Card[];
          tableCards: () => Card[];
          confirmTurnWithSequencing: (
            stage: 'ai-post-play-confirm' | 'player-post-play-confirm',
            alwaysApplyPause: boolean,
          ) => Promise<void>;
        }
      ).transientPlayedHandCardState.set(transientPlayedCard);
      (
        component as unknown as {
          transientPlayedHandCardState: { set: (card: Card | null) => void };
          transientCapturedTableCardsState: { set: (cards: Card[]) => void };
          activeHandCards: () => Card[];
          tableCards: () => Card[];
          confirmTurnWithSequencing: (
            stage: 'ai-post-play-confirm' | 'player-post-play-confirm',
            alwaysApplyPause: boolean,
          ) => Promise<void>;
        }
      ).transientCapturedTableCardsState.set([transientCapturedCard]);

      const sequencingPromise = (
        component as unknown as {
          transientPlayedHandCardState: { set: (card: Card | null) => void };
          transientCapturedTableCardsState: { set: (cards: Card[]) => void };
          activeHandCards: () => Card[];
          tableCards: () => Card[];
          confirmTurnWithSequencing: (
            stage: 'ai-post-play-confirm' | 'player-post-play-confirm',
            alwaysApplyPause: boolean,
          ) => Promise<void>;
        }
      ).confirmTurnWithSequencing('ai-post-play-confirm', true);

      await vi.advanceTimersByTimeAsync(1700);
      await sequencingPromise;

      const projectedState = component as unknown as {
        activeHandCards: () => Card[];
        tableCards: () => Card[];
      };

      const activeHandCards = projectedState.activeHandCards();
      const tableCards = projectedState.tableCards();

      expect(activeHandCards.some((card) => card.suit === 'Espadas' && card.rank === '6')).toBe(
        false,
      );
      expect(tableCards.some((card) => card.suit === 'Bastos' && card.rank === '4')).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it('T-12 / TR-8 / SC-21 - component teardown cancels active animation groups to avoid orphaned running state', async () => {
    await configureAndCreate('awaiting-confirmation');

    const orchestrator = fixture.componentRef.injector.get(CardAnimationOrchestrator);
    const groupId = orchestrator.startGroup({
      actionType: 'opponent-play',
      cardIds: ['Oros-1'],
    });

    fixture.destroy();

    const canceledGroup = orchestrator
      .animationState()
      .groups.find((group) => group.id === groupId);
    expect(canceledGroup?.status).toBe('canceled');
    expect(orchestrator.animationState().activeGroupId).toBeNull();
  });
});
