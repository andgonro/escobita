import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { TurnHandoffOverlay } from './turn-handoff-overlay';

// Covers: FR-5.3, TR-5.2, US-5
// BDD Scenarios: SC-17

type TurnHandoffOverlayTestState = TurnHandoffOverlay & {
  nextPlayerName: string;
};

describe('TurnHandoffOverlay', () => {
  let fixture: ComponentFixture<TurnHandoffOverlay>;
  let component: TurnHandoffOverlay;
  let testState: TurnHandoffOverlayTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TurnHandoffOverlay],
    }).compileComponents();

    fixture = TestBed.createComponent(TurnHandoffOverlay);
    component = fixture.componentInstance;
    testState = component as TurnHandoffOverlayTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('SC-17 / FR-5.3 - renders a handoff overlay with next-turn reveal context', async () => {
    testState.nextPlayerName = 'Jugador-2';
    await fixture.whenStable();

    const overlay = fixture.nativeElement.querySelector(
      '[data-testid="turn-handoff-overlay"]',
    ) as HTMLElement | null;
    const nextTurnReveal = fixture.nativeElement.querySelector(
      '[data-testid="next-turn-reveal"]',
    ) as HTMLElement | null;

    expect(overlay).not.toBeNull();
    expect(nextTurnReveal).not.toBeNull();
    expect(overlay?.getAttribute('role')).toBe('dialog');
    expect(overlay?.getAttribute('aria-modal')).toBe('true');
    expect(nextTurnReveal?.getAttribute('aria-hidden')).toBe('true');
    expect((nextTurnReveal?.textContent ?? '').trim()).toContain('Jugador-2');
  });

  it('SC-17 / TR-5.2 - emits acknowledge intent to reveal the next turn', async () => {
    testState.nextPlayerName = 'Jugador-2';
    await fixture.whenStable();
    const acknowledgeEmitSpy = vi.spyOn(component.handoffAcknowledged, 'emit');
    const acknowledgeButton = fixture.nativeElement.querySelector(
      '[data-testid="handoff-acknowledge"]',
    ) as HTMLButtonElement | null;

    expect(acknowledgeButton).not.toBeNull();
    acknowledgeButton?.click();
    await fixture.whenStable();

    expect(acknowledgeEmitSpy).toHaveBeenCalledTimes(1);
  });
});
