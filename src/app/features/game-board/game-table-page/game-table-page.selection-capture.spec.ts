import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { vi } from 'vitest';
import { GameEngine } from '../../../core/services/game-engine';
import { GameSession } from '../../../core/services/game-session';
import { Card } from '../../../models/card';
import { GameConfiguration } from '../../../models/game-configuration';
import { GameState, TurnPhase } from '../../../models/game-state';
import { Player } from '../../../models/player';

import { GameTablePage } from './game-table-page';

// Covers: FR-3.1, FR-4.1, FR-4.2, FR-6.2, US-3, US-4
// BDD Scenarios: SC-07, SC-11, SC-12

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

describe('GameTablePage selection and capture UX', () => {
  let fixture: ComponentFixture<GameTablePage>;
  let playCardSpy: ReturnType<typeof vi.fn>;

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  const configureAndCreate = async (turnPhase: TurnPhase = 'awaiting-card-play'): Promise<void> => {
    const stateSignal = signal<GameState | null>(makeState());
    const phaseSignal = signal<TurnPhase>(turnPhase);

    playCardSpy = vi.fn();

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
      confirmTurn: vi.fn() as unknown as GameEnginePort['confirmTurn'],
    };

    const sessionStub: GameSessionPort = {
      configuration: signal<GameConfiguration | null>(null).asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [GameTablePage],
      providers: [
        { provide: GameEngine, useValue: engineStub },
        { provide: GameSession, useValue: sessionStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameTablePage);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  };

  it('SC-07 / FR-3.1 - blocks card interactions when the turn is not awaiting-card-play', async () => {
    await configureAndCreate('awaiting-confirmation');

    const handCardButton = getByTestId<HTMLButtonElement>('hand-card-0');
    const tableCardButton = getByTestId<HTMLButtonElement>('table-card-0');

    expect(handCardButton.hasAttribute('disabled')).toBe(true);
    expect(tableCardButton.hasAttribute('disabled')).toBe(true);

    handCardButton.click();
    tableCardButton.click();
    await fixture.whenStable();

    expect(handCardButton.getAttribute('aria-pressed')).toBe('false');
    expect(tableCardButton.getAttribute('aria-selected')).toBe('false');
  });

  it('SC-11 / FR-4.1 - toggles subset selection state when table cards are toggled', async () => {
    await configureAndCreate();

    const handCardButton = getByTestId<HTMLButtonElement>('hand-card-0');
    const firstTableCardButton = getByTestId<HTMLButtonElement>('table-card-0');
    const secondTableCardButton = getByTestId<HTMLButtonElement>('table-card-1');

    handCardButton.click();
    await fixture.whenStable();

    expect(handCardButton.getAttribute('aria-pressed')).toBe('true');
    const selectedHandVisual = handCardButton.querySelector('[data-testid="card-visual"]');
    expect(selectedHandVisual?.classList.contains('card-visual--selected')).toBe(true);

    firstTableCardButton.click();
    secondTableCardButton.click();
    await fixture.whenStable();
    expect(firstTableCardButton.getAttribute('aria-selected')).toBe('true');
    expect(secondTableCardButton.getAttribute('aria-selected')).toBe('true');

    const firstSelectedVisual = firstTableCardButton.querySelector('[data-testid="card-visual"]');
    const secondSelectedVisual = secondTableCardButton.querySelector('[data-testid="card-visual"]');
    expect(firstSelectedVisual?.classList.contains('card-visual--selected')).toBe(true);
    expect(secondSelectedVisual?.classList.contains('card-visual--selected')).toBe(true);

    firstTableCardButton.click();
    await fixture.whenStable();
    expect(firstTableCardButton.getAttribute('aria-selected')).toBe('false');
    expect(secondTableCardButton.getAttribute('aria-selected')).toBe('true');
  });

  it('SC-12 / FR-4.2 - surfaces invalid-capture feedback before submit and blocks submission', async () => {
    await configureAndCreate();

    const handCardButton = getByTestId<HTMLButtonElement>('hand-card-0');
    const tableCardButton = getByTestId<HTMLButtonElement>('table-card-0');

    handCardButton.click();
    tableCardButton.click();
    await fixture.whenStable();

    const validationMessage = getByTestId<HTMLElement>('play-validation-message');
    expect((validationMessage.textContent ?? '').trim()).toContain('not valid');

    getByTestId<HTMLButtonElement>('submit-play').click();
    await fixture.whenStable();

    expect(playCardSpy).not.toHaveBeenCalled();
    expect((validationMessage.textContent ?? '').trim()).toContain('not valid');
  });
});
