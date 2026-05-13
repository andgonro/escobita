import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';
import { Player } from '../../../../../models/player';

import { OpponentZones } from './opponent-zones';

// Covers: FR-1.3, US-1

const makeOpponents = (count: number): Player[] => {
  return Array.from({ length: count }, (_, index) => ({
    id: `p-${index + 2}`,
    name: `Opponent-${index + 1}`,
    hand: [],
    capturedPile: [],
    escobaCount: 0,
  }));
};

type OpponentZonesTestState = OpponentZones & {
  opponents: Player[];
  aiHandCardCount: number;
  aiTurnAnimationState: {
    phase: 'idle' | 'deliberating' | 'card-selected' | 'capture-previewing' | 'resolving';
    selectedCardIndex: number | null;
    revealedCard: Card | null;
    highlightedTableCards: Card[];
  };
};

const defaultAiTurnAnimationState: OpponentZonesTestState['aiTurnAnimationState'] = {
  phase: 'idle',
  selectedCardIndex: null,
  revealedCard: null,
  highlightedTableCards: [],
};

const revealedCard: Card = {
  suit: 'Oros',
  rank: '1',
  value: 1,
};

describe('OpponentZones', () => {
  let component: OpponentZones;
  let fixture: ComponentFixture<OpponentZones>;
  let testState: OpponentZonesTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OpponentZones],
    }).compileComponents();

    fixture = TestBed.createComponent(OpponentZones);
    component = fixture.componentInstance;
    testState = component as OpponentZonesTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('FR-1.3 - renders opponent identity and captured totals in seat content', async () => {
    testState.opponents = [
      {
        id: 'p-2',
        name: 'Opponent-1',
        hand: [],
        capturedPile: [
          { suit: 'Oros', rank: '1', value: 1 },
          { suit: 'Copas', rank: '2', value: 2 },
        ],
        escobaCount: 0,
      },
    ];
    await fixture.whenStable();

    const seat = fixture.nativeElement.querySelector(
      '[data-testid="opponent-seat-0"]',
    ) as HTMLElement | null;

    expect((seat?.textContent ?? '').trim()).toContain('Opponent-1');
    expect((seat?.textContent ?? '').trim()).toContain('Captured: 2');
  });

  it('renders one opponent seat for a two-player match', async () => {
    testState.opponents = makeOpponents(1);
    await fixture.whenStable();

    const opponentSeats = fixture.nativeElement.querySelectorAll('[data-testid^="opponent-seat-"]');

    expect(opponentSeats.length).toBe(1);
    expect(opponentSeats[0].classList.contains('opponent-seat--north')).toBe(true);
  });

  it('renders two opponent seats for a three-player match', async () => {
    testState.opponents = makeOpponents(2);
    await fixture.whenStable();

    const opponentSeats = fixture.nativeElement.querySelectorAll('[data-testid^="opponent-seat-"]');

    expect(opponentSeats.length).toBe(2);
    expect(opponentSeats[0].classList.contains('opponent-seat--west')).toBe(true);
    expect(opponentSeats[1].classList.contains('opponent-seat--east')).toBe(true);
  });

  it('renders three opponent seats for a four-player match', async () => {
    testState.opponents = makeOpponents(3);
    await fixture.whenStable();

    const opponentSeats = fixture.nativeElement.querySelectorAll('[data-testid^="opponent-seat-"]');

    expect(opponentSeats.length).toBe(3);
    expect(opponentSeats[0].classList.contains('opponent-seat--west')).toBe(true);
    expect(opponentSeats[1].classList.contains('opponent-seat--north')).toBe(true);
    expect(opponentSeats[2].classList.contains('opponent-seat--east')).toBe(true);
  });

  it('renders AI hand card backs for Laia using aiHandCardCount', async () => {
    testState.opponents = [
      {
        id: 'p-laia',
        name: 'Laia',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];
    testState.aiHandCardCount = 3;
    testState.aiTurnAnimationState = defaultAiTurnAnimationState;
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector('[data-testid="ai-hand-zone"]');
    const aiCards = fixture.nativeElement.querySelectorAll('[data-testid^="ai-hand-card-"]');

    expect(aiHandZone).not.toBeNull();
    expect(aiCards.length).toBe(3);
    expect(aiCards[0]?.getAttribute('aria-label')).toBe('Carta oculta');
  });

  it('applies active styling when AI turn phase is not idle', async () => {
    testState.opponents = [
      {
        id: 'p-laia',
        name: 'Laia',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];
    testState.aiHandCardCount = 2;
    testState.aiTurnAnimationState = {
      ...defaultAiTurnAnimationState,
      phase: 'deliberating',
    };
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-zone"]',
    ) as HTMLElement | null;

    expect(aiHandZone?.classList.contains('ai-hand-zone--active')).toBe(true);
  });

  it('marks selected AI card index with selected visual state', async () => {
    testState.opponents = [
      {
        id: 'p-laia',
        name: 'Laia',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];
    testState.aiHandCardCount = 3;
    testState.aiTurnAnimationState = {
      ...defaultAiTurnAnimationState,
      phase: 'card-selected',
      selectedCardIndex: 1,
    };
    await fixture.whenStable();

    const selectedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"]',
    ) as HTMLElement | null;
    const unselectedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-0"]',
    ) as HTMLElement | null;

    expect(selectedCard?.classList.contains('card-visual--selected')).toBe(true);
    expect(unselectedCard?.classList.contains('card-visual--selected')).toBe(false);
  });

  it('reveals the selected AI card when revealedCard is provided', async () => {
    testState.opponents = [
      {
        id: 'p-laia',
        name: 'Laia',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];
    testState.aiHandCardCount = 3;
    testState.aiTurnAnimationState = {
      ...defaultAiTurnAnimationState,
      phase: 'capture-previewing',
      selectedCardIndex: 1,
      revealedCard,
    };
    await fixture.whenStable();

    const revealedImage = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"] [data-testid="card-visual-image"]',
    ) as HTMLImageElement | null;
    const hiddenImage = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-0"] [data-testid="card-visual-image"]',
    ) as HTMLImageElement | null;

    expect(revealedImage?.getAttribute('src')).toContain('/cards/Oros_1.png');
    expect(hiddenImage?.getAttribute('src')).toContain('/cards/Card_Back.png');
  });
});
