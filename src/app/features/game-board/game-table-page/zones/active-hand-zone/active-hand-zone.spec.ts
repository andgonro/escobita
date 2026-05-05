import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Card } from '../../../../../models/card';

import { ActiveHandZone } from './active-hand-zone';

// Covers: FR-1.2, FR-3.2, FR-3.3, FR-6.2, US-1

const firstCard: Card = { suit: 'Oros', rank: '7', value: 7 };
const secondCard: Card = { suit: 'Copas', rank: '6', value: 6 };

type ActiveHandZoneTestState = ActiveHandZone & {
  handCards: Card[];
  selectedHandCard: Card | null;
  interactionEnabled: boolean;
};

describe('ActiveHandZone', () => {
  let component: ActiveHandZone;
  let fixture: ComponentFixture<ActiveHandZone>;
  let testState: ActiveHandZoneTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveHandZone],
    }).compileComponents();

    fixture = TestBed.createComponent(ActiveHandZone);
    component = fixture.componentInstance;
    testState = component as ActiveHandZoneTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('FR-3.2 - emits hand-card selection intent when an enabled card is activated', async () => {
    testState.handCards = [firstCard];
    await fixture.whenStable();

    const selectionSpy = vi.spyOn(component.handCardSelected, 'emit');
    const handCardButton = fixture.nativeElement.querySelector('[data-testid="hand-card-0"]');

    handCardButton?.click();
    await fixture.whenStable();

    expect(selectionSpy).toHaveBeenCalledWith(firstCard);
  });

  it('renders one card slot per provided active hand card', async () => {
    testState.handCards = [firstCard, secondCard];
    await fixture.whenStable();

    const renderedCardSlots = fixture.nativeElement.querySelectorAll(
      '[data-testid^="active-hand-card-"]',
    );

    expect(renderedCardSlots.length).toBe(2);
  });

  it('marks the selected hand card with pressed semantics', async () => {
    testState.handCards = [firstCard, secondCard];
    testState.selectedHandCard = secondCard;
    await fixture.whenStable();

    const selectedCard = fixture.nativeElement.querySelector('[data-testid="active-hand-card-1"]');

    expect(selectedCard?.getAttribute('aria-pressed')).toBe('true');
  });

  it('SC-07 / FR-3.1 - blocks hand-card interaction controls when interaction is disabled', async () => {
    testState.handCards = [firstCard];
    testState.interactionEnabled = false;
    await fixture.whenStable();

    const selectionSpy = vi.spyOn(component.handCardSelected, 'emit');
    const handCardButton = fixture.nativeElement.querySelector('[data-testid="hand-card-0"]');
    handCardButton?.click();
    await fixture.whenStable();

    expect(handCardButton?.hasAttribute('disabled')).toBe(true);
    expect(selectionSpy).not.toHaveBeenCalled();
  });
});
