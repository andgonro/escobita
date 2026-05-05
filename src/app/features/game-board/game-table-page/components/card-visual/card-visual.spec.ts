import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';

import { CardVisual } from './card-visual';

// Covers: FR-1.5, FR-6.2, TR-3.1, TR-3.2, TR-6.2, US-1

type CardVisualTestState = CardVisual & {
  card: Card | null;
  selected: boolean;
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
});
