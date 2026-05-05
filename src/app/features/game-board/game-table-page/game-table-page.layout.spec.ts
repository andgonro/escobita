import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { TableInteractionState } from '../services/table-interaction-state';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';

import { GameTablePage } from './game-table-page';

// Covers: FR-1.2, FR-1.3, FR-1.4, FR-2.1, FR-2.2, FR-2.3, US-1, US-2
// BDD Scenarios: SC-02, SC-03, SC-05

interface GameEnginePort {
  state: () => GameState | null;
  turnPhase: () => TurnPhase;
  activePlayer: () => Player | null;
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

const makeState = (playerNames: string[]): GameState => {
  const players: Player[] = playerNames.map((name, index) => ({
    id: `p-${index + 1}`,
    name,
    hand: [{ suit: 'Oros', rank: '7', value: 7 }],
    capturedPile: [],
    escobaCount: 0,
  }));

  return {
    deck: [],
    table: [
      { suit: 'Copas', rank: '4', value: 4 },
      { suit: 'Bastos', rank: '3', value: 3 },
    ],
    players,
    turnIndex: 0,
    roundNumber: 1,
    matchScores: players.reduce<Record<string, number>>((scores, player) => {
      scores[player.id] = 0;
      return scores;
    }, {}),
    lastCapturerId: null,
  };
};

const sessionConfiguration: GameConfiguration = {
  mode: 'Multiplayer',
  playerNames: ['Ana', 'Luis', 'Marta', 'Pablo'],
  playerCount: 4,
  aiDifficulty: 'Easy',
};

describe('GameTablePage layout shell', () => {
  let fixture: ComponentFixture<GameTablePage>;

  const createComponent = async (playerNames: string[]) => {
    const stateSignal = signal<GameState | null>(makeState(playerNames));
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
    };

    const sessionSignal = signal<GameConfiguration | null>(sessionConfiguration);
    const sessionStub: GameSessionPort = {
      configuration: sessionSignal.asReadonly(),
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

  it('SC-02 / FR-1.2 - renders an active hand zone at the bottom layout shell', async () => {
    await createComponent(['Ana', 'Luis']);

    const layoutShell = fixture.nativeElement.querySelector('[data-testid="table-layout-shell"]');
    const activeHandRegion = fixture.nativeElement.querySelector(
      '[data-testid="layout-active-hand"]',
    );
    const centerRegion = fixture.nativeElement.querySelector('[data-testid="layout-center"]');
    const activeHandZone = fixture.nativeElement.querySelector('[data-testid="active-hand-zone"]');

    const regionOrder = Array.from(layoutShell?.children ?? []).map((child) => {
      return (child as HTMLElement).getAttribute('data-testid');
    });

    expect(layoutShell).not.toBeNull();
    expect(centerRegion).not.toBeNull();
    expect(activeHandRegion).not.toBeNull();
    expect(activeHandZone).not.toBeNull();
    expect(activeHandRegion?.contains(activeHandZone as Node)).toBe(true);
    expect(regionOrder).toEqual(['layout-opponents', 'layout-center', 'layout-active-hand']);
  });

  it('SC-02 / FR-1.4 - renders the center table zone in the central play area', async () => {
    await createComponent(['Ana', 'Luis']);

    const layoutShell = fixture.nativeElement.querySelector('[data-testid="table-layout-shell"]');
    const centerRegion = fixture.nativeElement.querySelector('[data-testid="layout-center"]');
    const activeHandRegion = fixture.nativeElement.querySelector(
      '[data-testid="layout-active-hand"]',
    );
    const opponentRegion = fixture.nativeElement.querySelector('[data-testid="layout-opponents"]');
    const centerTableZone = fixture.nativeElement.querySelector(
      '[data-testid="center-table-zone"]',
    );

    const regionOrder = Array.from(layoutShell?.children ?? []).map((child) => {
      return (child as HTMLElement).getAttribute('data-testid');
    });

    expect(opponentRegion).not.toBeNull();
    expect(centerRegion).not.toBeNull();
    expect(activeHandRegion).not.toBeNull();
    expect(centerTableZone).not.toBeNull();
    expect(centerRegion?.contains(centerTableZone as Node)).toBe(true);
    expect(regionOrder[1]).toBe('layout-center');
  });

  it('SC-03 / FR-1.3 - renders one opponent seat per non-active player for four players', async () => {
    await createComponent(['Ana', 'Luis', 'Marta', 'Pablo']);

    const opponentZones = fixture.nativeElement.querySelector('[data-testid="opponent-zones"]');
    const opponentSeats = fixture.nativeElement.querySelectorAll('[data-testid^="opponent-seat-"]');

    expect(opponentSeats.length).toBe(3);
    expect(opponentZones?.classList.contains('opponent-zones--three')).toBe(true);
  });

  it('SC-05 / FR-2.2 - renders always-visible score entries for all players', async () => {
    await createComponent(['Ana', 'Luis', 'Marta', 'Pablo']);

    const scoreboard = fixture.nativeElement.querySelector('[data-testid="scoreboard-indicator"]');
    const scoreItems = fixture.nativeElement.querySelectorAll(
      '[data-testid^="score-item-"]',
    ) as NodeListOf<HTMLElement>;

    expect(scoreboard).not.toBeNull();
    expect(scoreItems.length).toBe(4);
    expect(scoreItems[0]?.textContent ?? '').toContain('Ana');
    expect(scoreItems[0]?.textContent ?? '').toContain('0');
    expect(scoreItems[1]?.textContent ?? '').toContain('Luis');
    expect(scoreItems[1]?.textContent ?? '').toContain('0');
    expect(scoreItems[2]?.textContent ?? '').toContain('Marta');
    expect(scoreItems[2]?.textContent ?? '').toContain('0');
    expect(scoreItems[3]?.textContent ?? '').toContain('Pablo');
    expect(scoreItems[3]?.textContent ?? '').toContain('0');
  });

  it('SC-05 / FR-2.1 / FR-2.3 - renders match context through the MatchContextHud boundary', async () => {
    await createComponent(['Ana', 'Luis']);

    const matchContextHud = fixture.nativeElement.querySelector('app-match-context-hud');
    const activePlayerIndicator = fixture.nativeElement.querySelector(
      'app-match-context-hud [data-testid="active-player-indicator"]',
    ) as HTMLElement | null;
    const turnPhaseIndicator = fixture.nativeElement.querySelector(
      'app-match-context-hud [data-testid="turn-phase-indicator"]',
    ) as HTMLElement | null;
    const legacyContextHeader = fixture.nativeElement.querySelector(
      '[data-testid="context-header"]',
    );

    expect(matchContextHud).not.toBeNull();
    expect(activePlayerIndicator).not.toBeNull();
    expect(turnPhaseIndicator).not.toBeNull();
    expect(activePlayerIndicator?.textContent ?? '').toContain('Ana');
    expect(turnPhaseIndicator?.textContent ?? '').toContain('awaiting-card-play');
    expect(legacyContextHeader).toBeNull();
  });
});
