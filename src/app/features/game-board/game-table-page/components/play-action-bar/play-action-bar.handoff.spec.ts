import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { PlayActionBar } from './play-action-bar';

// Covers: FR-5.2, FR-5.5, TR-5.1, US-5
// BDD Scenarios: SC-16, SC-19

type PlayActionBarHandoffTestState = PlayActionBar & {
  multiplayer: boolean;
  handoffEnabled: boolean;
};

describe('PlayActionBar handoff controls', () => {
  let fixture: ComponentFixture<PlayActionBar>;
  let component: PlayActionBar;
  let testState: PlayActionBarHandoffTestState;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayActionBar],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayActionBar);
    component = fixture.componentInstance;
    testState = component as PlayActionBarHandoffTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('SC-16 / FR-5.2 - renders a multiplayer handoff toggle control', async () => {
    testState.multiplayer = true;
    testState.handoffEnabled = false;
    await fixture.whenStable();

    const handoffToggle = fixture.nativeElement.querySelector(
      '[data-testid="handoff-toggle"]',
    ) as HTMLInputElement | null;
    const handoffLabel = fixture.nativeElement.querySelector(
      'label[for="handoff-toggle-input"]',
    ) as HTMLLabelElement | null;

    expect(handoffToggle).not.toBeNull();
    expect(handoffToggle?.type).toBe('checkbox');
    expect(handoffToggle?.checked).toBe(false);
    expect(handoffToggle?.getAttribute('aria-label')).toBe('Enable turn handoff');
    expect((handoffLabel?.textContent ?? '').trim()).toContain('Enable turn handoff');
  });

  it('SC-16 / TR-5.1 - emits handoff-toggle intent when the toggle value changes', async () => {
    testState.multiplayer = true;
    testState.handoffEnabled = false;
    await fixture.whenStable();
    const toggleEmitSpy = vi.spyOn(component.handoffToggleChanged, 'emit');
    const handoffToggle = fixture.nativeElement.querySelector(
      '[data-testid="handoff-toggle"]',
    ) as HTMLInputElement | null;

    expect(handoffToggle).not.toBeNull();
    handoffToggle?.click();
    await fixture.whenStable();

    expect(toggleEmitSpy).toHaveBeenCalledWith(true);
  });

  it('SC-19 / FR-5.5 - does not render handoff toggle controls in single-player mode', async () => {
    testState.multiplayer = false;
    await fixture.whenStable();

    const handoffToggle = fixture.nativeElement.querySelector('[data-testid="handoff-toggle"]');

    expect(handoffToggle).toBeNull();
  });
});
