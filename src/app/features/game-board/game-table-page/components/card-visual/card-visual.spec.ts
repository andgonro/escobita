import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';

import { CardVisual } from './card-visual';

// Covers: FR-1.5, FR-4, FR-6.2, TR-2, TR-3.1, TR-3.2, TR-6.2, TR-7, NFR-1, NFR-2, NFR-7, US-1, US-4, US-6, US-10

type CardVisualTestState = CardVisual & {
  card: Card | null;
  selected: boolean;
  faceDown: boolean;
  animationState?: 'idle' | 'play' | 'capture' | 'deal' | 'opponent' | 'escoba' | null;
};

const sampleCard: Card = { suit: 'Oros', rank: '1', value: 1 };

describe('CardVisual', () => {
  let fixture: ComponentFixture<CardVisual>;
  let testState: CardVisualTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardVisual],
    }).compileComponents();

    fixture = TestBed.createComponent(CardVisual);
    testState = fixture.componentInstance as CardVisualTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders fallback visual semantics when no card is provided', async () => {
    testState.card = null;
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;
    const cardImage = fixture.nativeElement.querySelector(
      '[data-testid="card-visual-image"]',
    ) as HTMLImageElement | null;

    expect(visual).not.toBeNull();
    expect(visual?.getAttribute('aria-label')).toBe('Carta no disponible');
    expect(cardImage?.getAttribute('src')).toContain('/cards/Card_Back.png');
    expect(cardImage?.getAttribute('alt')).toBe('Carta no disponible');
  });

  it('renders the mapped card asset image for the provided card', async () => {
    testState.card = sampleCard;
    await fixture.whenStable();

    const cardImage = fixture.nativeElement.querySelector('[data-testid="card-visual-image"]');

    expect(cardImage?.getAttribute('src')).toContain('/cards/Oros_1.png');
  });

  it('exposes a semantic label for assistive technology', async () => {
    testState.card = sampleCard;
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector('[data-testid="card-visual"]');

    expect(visual?.getAttribute('aria-label')).toBe('1 de Oros');
  });

  it('marks selected visuals with selected-state styling', async () => {
    testState.card = sampleCard;
    testState.selected = true;
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector('[data-testid="card-visual"]');

    expect(visual?.classList.contains('card-visual--selected')).toBe(true);
  });

  it('renders face-down semantics when faceDown is enabled', async () => {
    testState.card = sampleCard;
    testState.faceDown = true;
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;
    const cardImage = fixture.nativeElement.querySelector(
      '[data-testid="card-visual-image"]',
    ) as HTMLImageElement | null;

    expect(visual?.getAttribute('aria-label')).toBe('Carta oculta');
    expect(cardImage?.getAttribute('src')).toContain('/cards/Card_Back.png');
    expect(cardImage?.getAttribute('alt')).toBe('Carta oculta');
  });

  it('prioritizes faceDown rendering over provided card mapping', async () => {
    testState.card = sampleCard;
    testState.faceDown = true;
    await fixture.whenStable();

    const cardImage = fixture.nativeElement.querySelector(
      '[data-testid="card-visual-image"]',
    ) as HTMLImageElement | null;

    expect(cardImage?.getAttribute('src')).toContain('/cards/Card_Back.png');
    expect(cardImage?.getAttribute('src')).not.toContain('/cards/Oros_1.png');
  });

  it('keeps selected styling when faceDown is enabled', async () => {
    testState.card = sampleCard;
    testState.faceDown = true;
    testState.selected = true;
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    expect(visual?.classList.contains('card-visual--selected')).toBe(true);
    expect(visual?.getAttribute('aria-label')).toBe('Carta oculta');
  });

  it.each<NonNullable<CardVisualTestState['animationState']>>([
    'play',
    'capture',
    'deal',
    'opponent',
    'escoba',
  ])('applies the visual animation class for %s state', async (animationState) => {
    testState.card = sampleCard;
    testState.animationState = animationState;
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    expect(visual?.classList.contains(`card-visual--animation-${animationState}`)).toBe(true);
  });

  it('keeps selected style visually distinct when capture animation state is active', async () => {
    testState.card = sampleCard;
    testState.selected = true;
    testState.animationState = 'capture';
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    expect(visual?.classList.contains('card-visual--selected')).toBe(true);
    expect(visual?.classList.contains('card-visual--animation-capture')).toBe(true);
  });

  it('keeps selected style visually distinct when escoba animation emphasis is active', async () => {
    testState.card = sampleCard;
    testState.selected = true;
    testState.animationState = 'escoba';
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    expect(visual?.classList.contains('card-visual--selected')).toBe(true);
    expect(visual?.classList.contains('card-visual--animation-escoba')).toBe(true);
  });

  it('keeps focus visibility class hook while escoba animation emphasis is active', async () => {
    testState.card = sampleCard;
    testState.animationState = 'escoba';
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    expect(visual?.classList.contains('card-visual--focus-visible')).toBe(true);
    expect(visual?.classList.contains('card-visual--animation-escoba')).toBe(true);
  });

  it('SC-15 / FR-6 - applies burst keyframe timing for escoba emphasis within 600-800ms', async () => {
    testState.card = sampleCard;
    testState.animationState = 'escoba';
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    const computedStyle = getComputedStyle(visual as HTMLElement);
    const animationName = computedStyle.getPropertyValue('animation-name').trim();
    const animationDuration = computedStyle.getPropertyValue('animation-duration').trim();
    const durationMs = animationDuration.endsWith('ms')
      ? Number.parseFloat(animationDuration)
      : Number.parseFloat(animationDuration) * 1000;

    expect(animationName).toContain('card-escoba-burst');
    expect(durationMs).toBeGreaterThanOrEqual(600);
    expect(durationMs).toBeLessThanOrEqual(800);
  });

  it('T-14 / TR-7 / NFR-1 - isolates card visual paint work with strict containment', async () => {
    testState.card = sampleCard;
    testState.animationState = 'play';
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    const computedStyle = getComputedStyle(visual as HTMLElement);
    const contain = computedStyle.getPropertyValue('contain').trim();

    expect(contain).toBe('strict');
  });

  it('T-14 / TR-7 / NFR-1 - advertises transform and opacity via will-change during animated states', async () => {
    testState.card = sampleCard;
    testState.animationState = 'capture';
    await fixture.whenStable();

    const visual = fixture.nativeElement.querySelector(
      '[data-testid="card-visual"]',
    ) as HTMLElement | null;

    const computedStyle = getComputedStyle(visual as HTMLElement);
    const willChange = computedStyle.getPropertyValue('will-change').replace(/\s+/g, ' ').trim();

    expect(willChange).toContain('transform');
    expect(willChange).toContain('opacity');
  });
});
