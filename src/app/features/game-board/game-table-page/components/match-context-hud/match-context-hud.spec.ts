import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TurnPhase } from '../../../../../models/game-state';
import { RoundResult } from '../../../../../models/round-result';
import { Player } from '../../../../../models/player';

import { MatchContextHud } from './match-context-hud';

// Covers: FR-2.1, FR-2.2, FR-2.3, FR-2.4, FR-4.6, FR-8.5, TR-1.2, US-2, US-4, US-8
// BDD Scenarios: SC-05, SC-06, SC-15, SC-29

interface ScoreEntry {
  id: string;
  name: string;
  score: number;
}

interface EscobaOutcome {
  playerName: string;
  escobaCount: number;
}

type MatchContextHudTestState = MatchContextHud & {
  activePlayerName: string;
  scoreEntries: ScoreEntry[];
  turnPhase: TurnPhase;
  handoffActive: boolean;
  escobaOutcome: EscobaOutcome | null;
  roundResult: RoundResult | null;
  matchWinner: Player | null;
};

const sampleScores: ScoreEntry[] = [
  { id: 'p1', name: 'Ana', score: 2 },
  { id: 'p2', name: 'Luis', score: 1 },
];

const sampleRoundResult: RoundResult = {
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
};

const sampleWinner: Player = {
  id: 'p1',
  name: 'Ana',
  hand: [],
  capturedPile: [],
  escobaCount: 0,
};

const sampleEscobaOutcome: EscobaOutcome = {
  playerName: 'Ana',
  escobaCount: 1,
};

describe('MatchContextHud', () => {
  let fixture: ComponentFixture<MatchContextHud>;
  let testState: MatchContextHudTestState;

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatchContextHud],
    }).compileComponents();

    fixture = TestBed.createComponent(MatchContextHud);
    testState = fixture.componentInstance as MatchContextHudTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('SC-05 / FR-2.1 - renders an always-visible active-player indicator', async () => {
    testState.activePlayerName = 'Ana';
    await fixture.whenStable();

    const activePlayerIndicator = getByTestId<HTMLElement>('active-player-indicator');

    expect((activePlayerIndicator.textContent ?? '').trim()).toContain('Ana');
  });

  it('SC-05 / FR-2.2 - renders all score entries in match context', async () => {
    testState.scoreEntries = sampleScores;
    await fixture.whenStable();

    const scoreboard = getByTestId<HTMLElement>('scoreboard-indicator');
    const scoreItems = fixture.nativeElement.querySelectorAll(
      '[data-testid^="score-item-"]',
    ) as NodeListOf<HTMLElement>;

    expect(scoreboard).not.toBeNull();
    expect(scoreItems.length).toBe(2);
    expect(scoreItems[0]?.textContent ?? '').toContain('Ana');
    expect(scoreItems[0]?.textContent ?? '').toContain('2');
    expect(scoreItems[1]?.textContent ?? '').toContain('Luis');
    expect(scoreItems[1]?.textContent ?? '').toContain('1');
  });

  it('SC-05 / FR-2.2 - renders a pending-score fallback when no score entries are available', async () => {
    testState.scoreEntries = [];
    await fixture.whenStable();

    const scoreEmpty = fixture.nativeElement.querySelector('.score-empty') as HTMLElement | null;

    expect(scoreEmpty).not.toBeNull();
    expect((scoreEmpty?.textContent ?? '').trim()).toContain('Scores pending');
  });

  it('SC-05 / FR-2.3 - renders turn-phase indicator in persistent context', async () => {
    testState.turnPhase = 'awaiting-confirmation';
    await fixture.whenStable();

    const turnPhaseIndicator = getByTestId<HTMLElement>('turn-phase-indicator');

    expect((turnPhaseIndicator.textContent ?? '').trim()).toContain('awaiting-confirmation');
  });

  it('SC-06 / FR-2.4 - updates visible context immediately when context inputs change', async () => {
    testState.activePlayerName = 'Ana';
    testState.turnPhase = 'awaiting-card-play';
    await fixture.whenStable();

    const activePlayerIndicatorBefore = getByTestId<HTMLElement>('active-player-indicator');
    const turnPhaseIndicatorBefore = getByTestId<HTMLElement>('turn-phase-indicator');

    expect((activePlayerIndicatorBefore.textContent ?? '').trim()).toContain('Ana');
    expect((turnPhaseIndicatorBefore.textContent ?? '').trim()).toContain('awaiting-card-play');

    testState.activePlayerName = 'Luis';
    testState.turnPhase = 'awaiting-confirmation';
    fixture.detectChanges();

    const activePlayerIndicator = getByTestId<HTMLElement>('active-player-indicator');
    const turnPhaseIndicator = getByTestId<HTMLElement>('turn-phase-indicator');
    const activePlayerAfterFirstBoundary = (activePlayerIndicator.textContent ?? '').trim();
    const phaseAfterFirstBoundary = (turnPhaseIndicator.textContent ?? '').trim();

    expect(activePlayerAfterFirstBoundary).toContain('Luis');
    expect(activePlayerAfterFirstBoundary).not.toContain('Ana');
    expect(phaseAfterFirstBoundary).toContain('awaiting-confirmation');
    expect(phaseAfterFirstBoundary).not.toContain('awaiting-card-play');

    await fixture.whenStable();

    expect((activePlayerIndicator.textContent ?? '').trim()).toBe(activePlayerAfterFirstBoundary);
    expect((turnPhaseIndicator.textContent ?? '').trim()).toBe(phaseAfterFirstBoundary);
  });

  it('FR-2.4 - applies masking attributes when handoff privacy mode is active', async () => {
    testState.handoffActive = true;
    await fixture.whenStable();

    const contextHeader = getByTestId<HTMLElement>('context-header');

    expect(contextHeader.getAttribute('aria-hidden')).toBe('true');
    expect(contextHeader.getAttribute('inert')).toBe('');
  });

  it('SC-15 / FR-4.6 - renders escoba outcome visibility from table-clear context', async () => {
    testState.escobaOutcome = sampleEscobaOutcome;
    await fixture.whenStable();

    const escobaOutcome = getByTestId<HTMLElement>('escoba-outcome-indicator');

    expect((escobaOutcome.textContent ?? '').trim()).toContain('Escoba');
    expect((escobaOutcome.textContent ?? '').trim()).toContain('Ana');
    expect((escobaOutcome.textContent ?? '').trim()).toContain('1');
  });

  it('SC-29 / FR-8.5 - renders round-result outcome from engine-provided context data', async () => {
    testState.roundResult = sampleRoundResult;
    await fixture.whenStable();

    const roundOutcome = getByTestId<HTMLElement>('round-outcome-indicator');

    expect((roundOutcome.textContent ?? '').trim()).toContain('Round 3');
    expect((roundOutcome.textContent ?? '').trim()).toContain('Top score: 2');
  });

  it('SC-29 / FR-8.5 - renders match-winner outcome from engine-provided context data', async () => {
    testState.matchWinner = sampleWinner;
    await fixture.whenStable();

    const matchWinner = getByTestId<HTMLElement>('match-winner-indicator');

    expect((matchWinner.textContent ?? '').trim()).toContain('Ana');
  });
});
