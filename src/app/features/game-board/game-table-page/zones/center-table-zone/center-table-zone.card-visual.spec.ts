import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from '../../../../../models/card';

import { CenterTableZone } from './center-table-zone';

// Covers: FR-1, FR-2, TR-3.1, TR-3.4, TR-6.2, US-1, US-2, US-12

type CenterTableZoneTestState = CenterTableZone & {
  tableCards: Card[];
  selectedTableCards: Card[];
  animationMetadata: {
    table: {
      card: Card;
      animationState: 'idle' | 'play' | 'capture' | 'deal' | 'opponent' | 'escoba' | null;
    }[];
  } | null;
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

  it('T-5 / FR-2 - applies capture animation metadata to matching table cards', async () => {
    testState.tableCards = [tableCardA, tableCardB];
    testState.animationMetadata = {
      table: [
        { card: tableCardA, animationState: 'capture' },
        { card: tableCardB, animationState: null },
      ],
    };
    await fixture.whenStable();

    const firstTableCardVisual = fixture.nativeElement.querySelector(
      '[data-testid="table-card-0"] app-card-visual',
    ) as HTMLElement | null;
    const secondTableCardVisual = fixture.nativeElement.querySelector(
      '[data-testid="table-card-1"] app-card-visual',
    ) as HTMLElement | null;

    expect(firstTableCardVisual?.classList.contains('card-visual--animation-capture')).toBe(true);
    expect(secondTableCardVisual?.classList.contains('card-visual--animation-capture')).toBe(false);
  });

  it('T-5 / FR-2 - renders simultaneous capture metadata for multi-card table captures', async () => {
    testState.tableCards = [tableCardA, tableCardB];
    testState.animationMetadata = {
      table: [
        { card: tableCardA, animationState: 'capture' },
        { card: tableCardB, animationState: 'capture' },
      ],
    };
    await fixture.whenStable();

    const captureAnimatedCards = fixture.nativeElement.querySelectorAll(
      '.card-visual--animation-capture',
    );

    expect(captureAnimatedCards.length).toBe(2);
  });

  it('T-5 / US-12 - applying animation metadata does not mutate center table game state', async () => {
    testState.tableCards = [tableCardA, tableCardB];
    testState.selectedTableCards = [tableCardB];
    await fixture.whenStable();

    const tableCardsBeforeMetadata = [...testState.tableCards];
    const selectedCardsBeforeMetadata = [...testState.selectedTableCards];

    testState.animationMetadata = {
      table: [
        { card: tableCardA, animationState: 'capture' },
        { card: tableCardB, animationState: 'escoba' },
      ],
    };
    await fixture.whenStable();

    expect(testState.tableCards).toEqual(tableCardsBeforeMetadata);
    expect(testState.selectedTableCards).toEqual(selectedCardsBeforeMetadata);
  });
});
