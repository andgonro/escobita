import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';

import { ActiveHandZone } from './active-hand-zone';

// Covers: FR-1, FR-3, TR-3.1, TR-3.4, TR-6.2, US-1, US-3, US-12

type ActiveHandZoneTestState = ActiveHandZone & {
  handCards: Card[];
  selectedHandCard: Card | null;
  animationMetadata: {
    hand: {
      card: Card;
      animationState: 'idle' | 'play' | 'capture' | 'deal' | 'opponent' | 'escoba' | null;
    }[];
  } | null;
};

const firstCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const secondCard: Card = { suit: 'Copas', rank: '6', value: 6 };

describe('ActiveHandZone card visual integration', () => {
  let fixture: ComponentFixture<ActiveHandZone>;
  let testState: ActiveHandZoneTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveHandZone],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveHandZone);
    testState = fixture.componentInstance as ActiveHandZoneTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders one CardVisual component per active hand card slot', async () => {
    testState.handCards = [firstCard, secondCard];
    await fixture.whenStable();

    const cardVisuals = fixture.nativeElement.querySelectorAll('app-card-visual');

    expect(cardVisuals.length).toBe(2);
  });

  it('renders semantic card visuals inside active hand slots', async () => {
    testState.handCards = [firstCard];
    await fixture.whenStable();

    const cardVisualImage = fixture.nativeElement.querySelector(
      '[data-testid="active-hand-card-0"] [data-testid="card-visual-image"]',
    );

    expect(cardVisualImage?.getAttribute('alt')).toBe('7 de Oros');
  });

  it('T-5 / FR-3 - applies deal animation metadata for the matching hand card visual', async () => {
    testState.handCards = [firstCard, secondCard];
    testState.animationMetadata = {
      hand: [
        { card: firstCard, animationState: 'deal' },
        { card: secondCard, animationState: null },
      ],
    };
    await fixture.whenStable();

    const firstHandCardVisual = fixture.nativeElement.querySelector(
      '[data-testid="hand-card-0"] app-card-visual',
    ) as HTMLElement | null;
    const secondHandCardVisual = fixture.nativeElement.querySelector(
      '[data-testid="hand-card-1"] app-card-visual',
    ) as HTMLElement | null;

    expect(firstHandCardVisual?.classList.contains('card-visual--animation-deal')).toBe(true);
    expect(secondHandCardVisual?.classList.contains('card-visual--animation-deal')).toBe(false);
  });

  it('T-5 / FR-1 - renders simultaneous play animation metadata across multiple hand cards', async () => {
    testState.handCards = [firstCard, secondCard];
    testState.animationMetadata = {
      hand: [
        { card: firstCard, animationState: 'play' },
        { card: secondCard, animationState: 'play' },
      ],
    };
    await fixture.whenStable();

    const animatedHandCards = fixture.nativeElement.querySelectorAll(
      '.card-visual--animation-play',
    );

    expect(animatedHandCards.length).toBe(2);
  });

  it('T-5 / US-12 - applying animation metadata does not mutate active hand game state', async () => {
    testState.handCards = [firstCard, secondCard];
    testState.selectedHandCard = secondCard;
    await fixture.whenStable();

    const handCardsBeforeMetadata = [...testState.handCards];
    const selectedHandCardBeforeMetadata = testState.selectedHandCard;

    testState.animationMetadata = {
      hand: [
        { card: firstCard, animationState: 'play' },
        { card: secondCard, animationState: 'deal' },
      ],
    };
    await fixture.whenStable();

    expect(testState.handCards).toEqual(handCardsBeforeMetadata);
    expect(testState.selectedHandCard).toBe(selectedHandCardBeforeMetadata);
  });
});
