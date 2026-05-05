import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';

import { ActiveHandZone } from './active-hand-zone';

// Covers: FR-1.5, FR-6.2, TR-3.1, TR-3.4, TR-6.2, US-1

type ActiveHandZoneTestState = ActiveHandZone & {
  handCards: Card[];
  selectedHandCard: Card | null;
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
});
