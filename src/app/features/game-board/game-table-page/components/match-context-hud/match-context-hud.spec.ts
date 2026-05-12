import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TurnPhase } from '../../../../../models/game-state';
import { RoundResult } from '../../../../../models/round-result';
import { Player } from '../../../../../models/player';

import { MatchContextHud } from './match-context-hud';

// Covers: FR-1.2, FR-1.3, FR-2.1, FR-2.2, FR-2.5, FR-2.6, FR-2.7, NFR-1.1, US-1, US-6
// BDD Scenarios: SC-02, SC-03, SC-04, SC-05, SC-07, SC-08, SC-09, SC-10, SC-11, SC-14, SC-15, SC-24

interface ScoreEntry {
  id: string;
  name: string;
  score: number;
}

interface EscobaOutcome {
  playerName: string;
  escobaCount: number;
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

type MatchContextHudTestState = MatchContextHud & {
  activePlayerName: string;
  scoreEntries: ScoreEntry[];
  turnPhase: TurnPhase;
  handoffActive: boolean;
  escobaOutcome: EscobaOutcome | null;
  roundResult: RoundResult | null;
  matchWinner: Player[] | null;
  showStartNextRound: boolean;
  showViewWinner: boolean;
  roundScoreBreakdown: RoundScoreBreakdownEntry[];
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

const sampleWinners: Player[] = [sampleWinner];

const sampleCoWinners: Player[] = [
  sampleWinner,
  {
    id: 'p2',
    name: 'Luis',
    hand: [],
    capturedPile: [],
    escobaCount: 0,
  },
];

const sampleEscobaOutcome: EscobaOutcome = {
  playerName: 'Ana',
  escobaCount: 1,
};

const sampleRoundScoreBreakdown: RoundScoreBreakdownEntry[] = [
  {
    playerName: 'Ana',
    escobas: 1,
    mostCards: 1,
    mostOros: 0,
    mostSevens: 0,
    sieteDiVelo: 0,
    total: 2,
  },
  {
    playerName: 'Luis',
    escobas: 0,
    mostCards: 0,
    mostOros: 0,
    mostSevens: 1,
    sieteDiVelo: 0,
    total: 1,
  },
];

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

  it('Baseline HUD context - renders an always-visible active-player indicator', async () => {
    testState.activePlayerName = 'Ana';
    await fixture.whenStable();

    const activePlayerIndicator = getByTestId<HTMLElement>('active-player-indicator');

    expect((activePlayerIndicator.textContent ?? '').trim()).toContain('Ana');
  });

  it('Baseline HUD context - renders all score entries in match context', async () => {
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

  it('Baseline HUD context - renders a pending-score fallback when no score entries are available', async () => {
    testState.scoreEntries = [];
    await fixture.whenStable();

    const scoreEmpty = fixture.nativeElement.querySelector('.score-empty') as HTMLElement | null;

    expect(scoreEmpty).not.toBeNull();
    expect((scoreEmpty?.textContent ?? '').trim()).toContain('Scores pending');
  });

  it('Baseline HUD context - renders turn-phase indicator in persistent context', async () => {
    testState.turnPhase = 'awaiting-confirmation';
    await fixture.whenStable();

    const turnPhaseIndicator = getByTestId<HTMLElement>('turn-phase-indicator');

    expect((turnPhaseIndicator.textContent ?? '').trim()).toContain('awaiting-confirmation');
  });

  it('Baseline HUD context - updates visible context immediately when context inputs change', async () => {
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

  it('Baseline HUD privacy - applies masking attributes when handoff privacy mode is active', async () => {
    testState.handoffActive = true;
    await fixture.whenStable();

    const contextHeader = getByTestId<HTMLElement>('context-header');

    expect(contextHeader.getAttribute('aria-hidden')).toBe('true');
    expect(contextHeader.getAttribute('inert')).toBe('');
  });

  it('Baseline HUD context - renders escoba outcome visibility from table-clear context', async () => {
    testState.escobaOutcome = sampleEscobaOutcome;
    await fixture.whenStable();

    const escobaOutcome = getByTestId<HTMLElement>('escoba-outcome-indicator');

    expect((escobaOutcome.textContent ?? '').trim()).toContain('Escoba');
    expect((escobaOutcome.textContent ?? '').trim()).toContain('Ana');
    expect((escobaOutcome.textContent ?? '').trim()).toContain('1');
  });

  it('SC-02 / FR-1.2 - renders round-result outcome with round number and top score', async () => {
    testState.roundResult = sampleRoundResult;
    await fixture.whenStable();

    const roundOutcome = getByTestId<HTMLElement>('round-outcome-indicator');

    expect((roundOutcome.textContent ?? '').trim()).toContain('Round 3');
    expect((roundOutcome.textContent ?? '').trim()).toContain('Top score: 2');
  });

  it('Baseline winner context - renders match-winner outcome from engine-provided context data', async () => {
    fixture.componentRef.setInput('matchWinner', sampleWinners);
    await fixture.whenStable();

    const matchWinner = getByTestId<HTMLElement>('match-winner-indicator');

    expect((matchWinner.textContent ?? '').trim()).toContain('Ana');
  });

  it('Baseline winner context - renders all co-winner names when multiple winners are provided', async () => {
    fixture.componentRef.setInput('matchWinner', sampleCoWinners);
    await fixture.whenStable();

    const matchWinner = getByTestId<HTMLElement>('match-winner-indicator');
    const winnerText = (matchWinner.textContent ?? '').trim();

    expect(winnerText).toContain('Ana');
    expect(winnerText).toContain('Luis');
  });

  it('SC-03 / FR-1.3 - renders round score breakdown rows when breakdown input is provided', async () => {
    fixture.componentRef.setInput('roundScoreBreakdown', sampleRoundScoreBreakdown);
    await fixture.whenStable();

    const breakdownPanel = getByTestId<HTMLElement>('round-score-breakdown');
    const breakdownRows = fixture.nativeElement.querySelectorAll(
      '[data-testid^="round-score-player-"]',
    ) as NodeListOf<HTMLElement>;
    const firstPlayerRowText = (breakdownRows[0]?.textContent ?? '').trim();

    expect(breakdownRows.length).toBe(2);
    expect((breakdownPanel.textContent ?? '').trim()).toContain(
      'Desglose de puntuación de la ronda',
    );
    expect(firstPlayerRowText).toContain('Ana');
    expect(firstPlayerRowText).toContain('Escobas: 1');
    expect(firstPlayerRowText).toContain('Más cartas: 1');
    expect(firstPlayerRowText).toContain('Más oros: 0');
    expect(firstPlayerRowText).toContain('Más sietes: 0');
    expect(firstPlayerRowText).toContain('Siete de Oros: 0');
    expect(firstPlayerRowText).toContain('Total: 2');
  });

  it('SC-04 / FR-1.3 - keeps zero-value scoring categories visible in the breakdown', async () => {
    fixture.componentRef.setInput('roundScoreBreakdown', sampleRoundScoreBreakdown);
    await fixture.whenStable();

    const secondPlayerRow = getByTestId<HTMLElement>('round-score-player-1');
    const rowText = (secondPlayerRow.textContent ?? '').trim();

    expect(rowText).toContain('Escobas: 0');
    expect(rowText).toContain('Más cartas: 0');
    expect(rowText).toContain('Más oros: 0');
    expect(rowText).toContain('Más sietes: 1');
    expect(rowText).toContain('Siete de Oros: 0');
    expect(rowText).toContain('Total: 1');
  });

  it('SC-05 / FR-1.3 - renders only session-configured player names in breakdown rows', async () => {
    fixture.componentRef.setInput('roundScoreBreakdown', sampleRoundScoreBreakdown);
    await fixture.whenStable();

    const breakdownPanel = getByTestId<HTMLElement>('round-score-breakdown');
    const breakdownText = (breakdownPanel.textContent ?? '').trim();

    expect(breakdownText).toContain('Ana');
    expect(breakdownText).toContain('Luis');
    expect(breakdownText).not.toContain('Carlos');
  });

  it('SC-07 - does not render round score breakdown panel when breakdown input is empty', async () => {
    fixture.componentRef.setInput('roundScoreBreakdown', []);
    await fixture.whenStable();

    const breakdownPanel = fixture.nativeElement.querySelector(
      '[data-testid="round-score-breakdown"]',
    ) as HTMLElement | null;

    expect(breakdownPanel).toBeNull();
  });

  it('SC-08 - renders start-next-round button when showStartNextRound is true', async () => {
    fixture.componentRef.setInput('showStartNextRound', true);
    fixture.componentRef.setInput('showViewWinner', false);
    await fixture.whenStable();

    const startButton = getByTestId<HTMLButtonElement>('start-next-round-button');

    expect(startButton).not.toBeNull();
    expect(startButton.textContent ?? '').toContain('Empezar siguiente ronda');
  });

  it('SC-09 - hides start-next-round button when showStartNextRound is false', async () => {
    fixture.componentRef.setInput('showStartNextRound', false);
    await fixture.whenStable();

    const startButton = fixture.nativeElement.querySelector(
      '[data-testid="start-next-round-button"]',
    ) as HTMLButtonElement | null;

    expect(startButton).toBeNull();
  });

  it('SC-10 - renders view-winner button when showViewWinner is true', async () => {
    fixture.componentRef.setInput('showStartNextRound', false);
    fixture.componentRef.setInput('showViewWinner', true);
    await fixture.whenStable();

    const viewWinnerButton = getByTestId<HTMLButtonElement>('view-winner-button');

    expect(viewWinnerButton).not.toBeNull();
    expect(viewWinnerButton.textContent ?? '').toContain('Ver ganador');
  });

  it('SC-10 - hides view-winner button when showViewWinner is false', async () => {
    fixture.componentRef.setInput('showViewWinner', false);
    await fixture.whenStable();

    const viewWinnerButton = fixture.nativeElement.querySelector(
      '[data-testid="view-winner-button"]',
    ) as HTMLButtonElement | null;

    expect(viewWinnerButton).toBeNull();
  });

  it('SC-10 - keeps continuation buttons mutually exclusive when both visibility inputs are true', async () => {
    fixture.componentRef.setInput('showStartNextRound', true);
    fixture.componentRef.setInput('showViewWinner', true);
    await fixture.whenStable();

    const startButton = fixture.nativeElement.querySelector(
      '[data-testid="start-next-round-button"]',
    ) as HTMLButtonElement | null;
    const viewWinnerButton = fixture.nativeElement.querySelector(
      '[data-testid="view-winner-button"]',
    ) as HTMLButtonElement | null;

    expect(startButton).toBeNull();
    expect(viewWinnerButton).not.toBeNull();
  });

  it('SC-13 / FR-2.5 - start-next-round button is keyboard focusable when visible', async () => {
    fixture.componentRef.setInput('showStartNextRound', true);
    fixture.componentRef.setInput('showViewWinner', false);
    await fixture.whenStable();

    const startButton = getByTestId<HTMLButtonElement>('start-next-round-button');

    expect(startButton.tabIndex).toBeGreaterThanOrEqual(0);
    startButton.focus();
    await fixture.whenStable();

    expect(document.activeElement).toBe(startButton);
  });

  it('SC-24 / FR-2.7 - view-winner button is keyboard focusable when visible', async () => {
    fixture.componentRef.setInput('showStartNextRound', false);
    fixture.componentRef.setInput('showViewWinner', true);
    await fixture.whenStable();

    const viewWinnerButton = getByTestId<HTMLButtonElement>('view-winner-button');

    expect(viewWinnerButton.tabIndex).toBeGreaterThanOrEqual(0);
    viewWinnerButton.focus();
    await fixture.whenStable();

    expect(document.activeElement).toBe(viewWinnerButton);
  });

  it('SC-11 - emits startNextRound output when start-next-round button is activated', async () => {
    fixture.componentRef.setInput('showStartNextRound', true);
    fixture.componentRef.setInput('showViewWinner', false);
    await fixture.whenStable();

    const startNextRoundEmitter = (testState as unknown as { startNextRound: { emit: () => void } })
      .startNextRound;
    const emitSpy = vi.spyOn(startNextRoundEmitter, 'emit');
    const startButton = getByTestId<HTMLButtonElement>('start-next-round-button');

    startButton.click();
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-13 / FR-2.5 - emits startNextRound output when start-next-round is activated by Enter key', async () => {
    fixture.componentRef.setInput('showStartNextRound', true);
    fixture.componentRef.setInput('showViewWinner', false);
    await fixture.whenStable();

    const startNextRoundEmitter = (testState as unknown as { startNextRound: { emit: () => void } })
      .startNextRound;
    const emitSpy = vi.spyOn(startNextRoundEmitter, 'emit');
    const startButton = getByTestId<HTMLButtonElement>('start-next-round-button');

    expect(startButton.tabIndex).toBeGreaterThanOrEqual(0);
    startButton.focus();
    expect(document.activeElement).toBe(startButton);

    startButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-15 - emits viewWinner output when view-winner button is activated', async () => {
    fixture.componentRef.setInput('showStartNextRound', false);
    fixture.componentRef.setInput('showViewWinner', true);
    await fixture.whenStable();

    const viewWinnerEmitter = (testState as unknown as { viewWinner: { emit: () => void } })
      .viewWinner;
    const emitSpy = vi.spyOn(viewWinnerEmitter, 'emit');
    const viewWinnerButton = getByTestId<HTMLButtonElement>('view-winner-button');

    viewWinnerButton.click();
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-24 / FR-2.7 - emits viewWinner output when view-winner is activated by Enter key', async () => {
    fixture.componentRef.setInput('showStartNextRound', false);
    fixture.componentRef.setInput('showViewWinner', true);
    await fixture.whenStable();

    const viewWinnerEmitter = (testState as unknown as { viewWinner: { emit: () => void } })
      .viewWinner;
    const emitSpy = vi.spyOn(viewWinnerEmitter, 'emit');
    const viewWinnerButton = getByTestId<HTMLButtonElement>('view-winner-button');

    expect(viewWinnerButton.tabIndex).toBeGreaterThanOrEqual(0);
    viewWinnerButton.focus();
    expect(document.activeElement).toBe(viewWinnerButton);

    viewWinnerButton.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    await fixture.whenStable();

    expect(emitSpy).toHaveBeenCalledTimes(1);
  });

  it('SC-14 / SC-24 - exposes meaningful Spanish aria-labels on continuation buttons', async () => {
    fixture.componentRef.setInput('showStartNextRound', true);
    fixture.componentRef.setInput('showViewWinner', false);
    await fixture.whenStable();

    const startButton = getByTestId<HTMLButtonElement>('start-next-round-button');
    expect(startButton.getAttribute('aria-label')).toBe('Empezar siguiente ronda');

    fixture.componentRef.setInput('showStartNextRound', false);
    fixture.componentRef.setInput('showViewWinner', true);
    await fixture.whenStable();

    const viewWinnerButton = getByTestId<HTMLButtonElement>('view-winner-button');
    expect(viewWinnerButton.getAttribute('aria-label')).toBe('Ver ganador');
  });
});
