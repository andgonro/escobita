import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';

import { CenterTableZone } from './center-table-zone';

// Covers: FR-1.5, FR-6.2, TR-3.1, TR-3.4, TR-6.2, US-1

type CenterTableZoneTestState = CenterTableZone & {
  tableCards: Card[];
  selectedTableCards: Card[];
};

const tableCardA: Card = { suit: 'Bastos', rank: '2', value: 2 };
const tableCardB: Card = { suit: 'Espadas', rank: '3', value: 3 };

describe('CenterTableZone card visual integration', () => {
  let fixture: ComponentFixture<CenterTableZone>;
  let testState: CenterTableZoneTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CenterTableZone],
    }).compileComponents();

    fixture = TestBed.createComponent(CenterTableZone);
    testState = fixture.componentInstance as CenterTableZoneTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders one CardVisual component per table card slot', async () => {
    testState.tableCards = [tableCardA, tableCardB];
    await fixture.whenStable();

    const cardVisuals = fixture.nativeElement.querySelectorAll('app-card-visual');

    expect(cardVisuals.length).toBe(2);
  });

  it('renders semantic card visuals inside table slots', async () => {
    testState.tableCards = [tableCardA];
    await fixture.whenStable();

    const cardVisualImage = fixture.nativeElement.querySelector(
      '[data-testid="table-card-0"] [data-testid="card-visual-image"]',
    );

    expect(cardVisualImage?.getAttribute('alt')).toBe('2 de Bastos');
  });
});
