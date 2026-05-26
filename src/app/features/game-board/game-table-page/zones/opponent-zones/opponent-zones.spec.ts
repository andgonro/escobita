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
  suppressAiAnimations: boolean;
  animationMetadata: {
    opponent: {
      cardIndex: number;
      animationState: 'idle' | 'play' | 'capture' | 'deal' | 'opponent' | 'escoba' | null;
    }[];
  } | null;
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
    const aiCardShells = fixture.nativeElement.querySelectorAll('[data-testid^="ai-hand-shell-"]');
    const aiCards = fixture.nativeElement.querySelectorAll('[data-testid^="ai-hand-card-"]');

    expect(aiHandZone).not.toBeNull();
    expect(aiCardShells.length).toBe(3);
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

  it('keeps AI hand shell sizing stable when hand count decreases', async () => {
    testState.opponents = [
      {
        id: 'p-laia',
        name: 'Laia',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];
    testState.aiTurnAnimationState = defaultAiTurnAnimationState;
    testState.aiHandCardCount = 3;
    await fixture.whenStable();

    const initialShells = fixture.nativeElement.querySelectorAll(
      '[data-testid^="ai-hand-shell-"]',
    ) as NodeListOf<HTMLElement>;
    const initialFirstShellStyle = getComputedStyle(initialShells[0]);
    const initialWidth = initialFirstShellStyle.width;
    const initialHeight = initialFirstShellStyle.height;
    const initialFlex = initialFirstShellStyle.flex;

    testState.aiHandCardCount = 2;
    await fixture.whenStable();

    const reducedShells = fixture.nativeElement.querySelectorAll(
      '[data-testid^="ai-hand-shell-"]',
    ) as NodeListOf<HTMLElement>;
    const reducedFirstShellStyle = getComputedStyle(reducedShells[0]);

    expect(reducedShells.length).toBe(2);
    expect(reducedFirstShellStyle.width).toBe(initialWidth);
    expect(reducedFirstShellStyle.height).toBe(initialHeight);
    expect(reducedFirstShellStyle.flex).toBe(initialFlex);
  });

  it('does not render AI hand zone when aiHandCardCount is zero', async () => {
    testState.opponents = [
      {
        id: 'p-laia',
        name: 'Laia',
        hand: [],
        capturedPile: [],
        escobaCount: 0,
      },
    ];
    testState.aiHandCardCount = 0;
    testState.aiTurnAnimationState = defaultAiTurnAnimationState;
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector('[data-testid="ai-hand-zone"]');
    const aiCards = fixture.nativeElement.querySelectorAll('[data-testid^="ai-hand-card-"]');

    expect(aiHandZone).toBeNull();
    expect(aiCards.length).toBe(0);
  });

  it('does not apply active styling when AI turn phase is idle', async () => {
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
    testState.aiTurnAnimationState = defaultAiTurnAnimationState;
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-zone"]',
    ) as HTMLElement | null;

    expect(aiHandZone?.classList.contains('ai-hand-zone--active')).toBe(false);
  });

  it('keeps selected AI card face-down in placement scenario when revealedCard is null', async () => {
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
      revealedCard: null,
    };
    await fixture.whenStable();

    const selectedImage = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"] [data-testid="card-visual-image"]',
    ) as HTMLImageElement | null;
    const selectedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"]',
    ) as HTMLElement | null;

    expect(selectedCard?.classList.contains('card-visual--selected')).toBe(true);
    expect(selectedImage?.getAttribute('src')).toContain('/cards/Card_Back.png');
    expect(selectedImage?.getAttribute('alt')).toBe('Carta oculta');
  });

  it('T-5 / FR-5 - applies opponent animation metadata to selected AI hand card shell', async () => {
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
    testState.animationMetadata = {
      opponent: [
        { cardIndex: 1, animationState: 'opponent' },
        { cardIndex: 0, animationState: null },
      ],
    };
    await fixture.whenStable();

    const animatedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"]',
    ) as HTMLElement | null;
    const nonAnimatedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-0"]',
    ) as HTMLElement | null;

    expect(animatedCard?.classList.contains('card-visual--animation-opponent')).toBe(true);
    expect(nonAnimatedCard?.classList.contains('card-visual--animation-opponent')).toBe(false);
  });

  it('T-5 / FR-8 - renders simultaneous opponent metadata states for multiple AI cards', async () => {
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
    testState.animationMetadata = {
      opponent: [
        { cardIndex: 0, animationState: 'opponent' },
        { cardIndex: 1, animationState: 'opponent' },
      ],
    };
    await fixture.whenStable();

    const opponentAnimatedCards = fixture.nativeElement.querySelectorAll(
      '.card-visual--animation-opponent',
    );

    expect(opponentAnimatedCards.length).toBe(2);
  });

  it('does not animate AI cards when suppression is active', async () => {
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
    testState.animationMetadata = {
      opponent: [
        { cardIndex: 0, animationState: 'opponent' },
        { cardIndex: 1, animationState: 'opponent' },
      ],
    };
    testState.suppressAiAnimations = true;
    await fixture.whenStable();

    const opponentAnimatedCards = fixture.nativeElement.querySelectorAll(
      '.card-visual--animation-opponent',
    );

    expect(opponentAnimatedCards.length).toBe(0);
  });

  it('T-5 / US-12 - applying opponent animation metadata does not mutate opponent game state', async () => {
    const laiaOpponent: Player = {
      id: 'p-laia',
      name: 'Laia',
      hand: [],
      capturedPile: [],
      escobaCount: 0,
    };

    testState.opponents = [laiaOpponent];
    testState.aiHandCardCount = 3;
    testState.aiTurnAnimationState = defaultAiTurnAnimationState;
    await fixture.whenStable();

    const opponentsBeforeMetadata = [...testState.opponents];
    const aiHandCountBeforeMetadata = testState.aiHandCardCount;
    const aiTurnStateBeforeMetadata = testState.aiTurnAnimationState;

    testState.animationMetadata = {
      opponent: [
        { cardIndex: 0, animationState: 'opponent' },
        { cardIndex: 1, animationState: 'opponent' },
      ],
    };
    await fixture.whenStable();

    expect(testState.opponents).toEqual(opponentsBeforeMetadata);
    expect(testState.aiHandCardCount).toBe(aiHandCountBeforeMetadata);
    expect(testState.aiTurnAnimationState).toEqual(aiTurnStateBeforeMetadata);
  });

  it('T-5 / FR-1.2 - renders static AI hand visuals when metadata is null during human capture handoff', async () => {
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
    testState.animationMetadata = null;
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-zone"]',
    ) as HTMLElement | null;
    const selectedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"]',
    ) as HTMLElement | null;
    const animatedCards = fixture.nativeElement.querySelectorAll(
      '.card-visual--animation-opponent',
    );

    expect(aiHandZone?.classList.contains('ai-hand-zone--active')).toBe(false);
    expect(selectedCard?.classList.contains('card-visual--selected')).toBe(false);
    expect(animatedCards.length).toBe(0);
  });

  it('T-5 / NFR-1.2 - renders static AI hand visuals when metadata publishes empty opponent list', async () => {
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
    testState.animationMetadata = {
      opponent: [],
    };
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-zone"]',
    ) as HTMLElement | null;
    const selectedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"]',
    ) as HTMLElement | null;
    const animatedCards = fixture.nativeElement.querySelectorAll(
      '.card-visual--animation-opponent',
    );

    expect(aiHandZone?.classList.contains('ai-hand-zone--active')).toBe(false);
    expect(selectedCard?.classList.contains('card-visual--selected')).toBe(false);
    expect(animatedCards.length).toBe(0);
  });

  it('T-5 / FR-1.4 - preserves eligible opponent-turn visuals when opponent metadata is present', async () => {
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
      revealedCard,
    };
    testState.animationMetadata = {
      opponent: [{ cardIndex: 1, animationState: 'opponent' }],
    };
    await fixture.whenStable();

    const aiHandZone = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-zone"]',
    ) as HTMLElement | null;
    const selectedCard = fixture.nativeElement.querySelector(
      '[data-testid="ai-hand-card-1"]',
    ) as HTMLElement | null;

    expect(aiHandZone?.classList.contains('ai-hand-zone--active')).toBe(true);
    expect(selectedCard?.classList.contains('card-visual--selected')).toBe(true);
    expect(selectedCard?.classList.contains('card-visual--animation-opponent')).toBe(true);
  });
});
