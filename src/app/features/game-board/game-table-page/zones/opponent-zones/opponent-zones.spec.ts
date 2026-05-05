import { ComponentFixture, TestBed } from '@angular/core/testing';
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
});
