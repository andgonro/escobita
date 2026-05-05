import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { Card } from '../../../../../models/card';

import { CenterTableZone } from './center-table-zone';

// Covers: FR-1.4, FR-4.1, FR-6.2, US-1

const tableCardA: Card = { suit: 'Bastos', rank: '2', value: 2 };
const tableCardB: Card = { suit: 'Espadas', rank: '3', value: 3 };

type CenterTableZoneTestState = CenterTableZone & {
  tableCards: Card[];
  selectedTableCards: Card[];
  interactionEnabled: boolean;
};

describe('CenterTableZone', () => {
  let component: CenterTableZone;
  let fixture: ComponentFixture<CenterTableZone>;
  let testState: CenterTableZoneTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterTableZone],
    }).compileComponents();

    fixture = TestBed.createComponent(CenterTableZone);
    component = fixture.componentInstance;
    testState = component as CenterTableZoneTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('FR-4.1 - emits table-card toggle intent when interaction is enabled', async () => {
    testState.tableCards = [tableCardA];
    await fixture.whenStable();

    const toggleSpy = vi.spyOn(component.tableCardToggled, 'emit');
    const tableCardButton = fixture.nativeElement.querySelector('[data-testid="table-card-0"]');

    tableCardButton?.click();
    await fixture.whenStable();

    expect(toggleSpy).toHaveBeenCalledWith(tableCardA);
  });

  it('renders one table card slot per provided table card', async () => {
    testState.tableCards = [tableCardA, tableCardB];
    await fixture.whenStable();

    const renderedTableCards = fixture.nativeElement.querySelectorAll(
      '[data-testid^="table-card-"]',
    );

    expect(renderedTableCards.length).toBe(2);
  });

  it('marks selected table cards with selected semantics', async () => {
    testState.tableCards = [tableCardA, tableCardB];
    testState.selectedTableCards = [tableCardB];
    await fixture.whenStable();

    const selectedCard = fixture.nativeElement.querySelector('[data-testid="table-card-1"]');

    expect(selectedCard?.getAttribute('aria-selected')).toBe('true');
  });

  it('SC-07 / FR-3.1 - blocks subset controls when interaction is disabled', async () => {
    testState.tableCards = [tableCardA];
    testState.interactionEnabled = false;
    await fixture.whenStable();

    const toggleSpy = vi.spyOn(component.tableCardToggled, 'emit');
    const tableCardButton = fixture.nativeElement.querySelector('[data-testid="table-card-0"]');
    tableCardButton?.click();
    await fixture.whenStable();

    expect(tableCardButton?.hasAttribute('disabled')).toBe(true);
    expect(toggleSpy).not.toHaveBeenCalled();
  });
});
