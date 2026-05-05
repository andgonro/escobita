import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { TurnPhase } from '../../../../../models/game-state';

import { PlayActionBar } from './play-action-bar';

// Covers: FR-3.4, FR-3.5, FR-4.4, FR-8.3, US-3, US-8
// BDD Scenarios: SC-09, SC-10, SC-12, SC-27

type PlayActionBarTestState = PlayActionBar & {
  canSubmitPlay: boolean;
  isCaptureSelectionValid: boolean;
  turnPhase: TurnPhase;
  validationMessage: string;
};

describe('PlayActionBar', () => {
  let component: PlayActionBar;
  let fixture: ComponentFixture<PlayActionBar>;
  let testState: PlayActionBarTestState;

  const getByTestId = <T extends HTMLElement>(testId: string): T => {
    const element = fixture.nativeElement.querySelector(`[data-testid="${testId}"]`) as T | null;
    if (!element) {
      throw new Error(`Expected element with data-testid="${testId}"`);
    }

    return element;
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlayActionBar],
    }).compileComponents();

    fixture = TestBed.createComponent(PlayActionBar);
    component = fixture.componentInstance;
    testState = component as PlayActionBarTestState;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('SC-09 / FR-3.5 - keeps submit action disabled when no hand card is selected', async () => {
    testState.canSubmitPlay = false;
    testState.isCaptureSelectionValid = true;
    testState.turnPhase = 'awaiting-card-play';
    await fixture.whenStable();

    const submitButton = getByTestId<HTMLButtonElement>('submit-play');

    expect(submitButton.disabled).toBe(true);
  });

  it('SC-12 / FR-4.4 - blocks submit action when capture selection is invalid', async () => {
    testState.canSubmitPlay = true;
    testState.isCaptureSelectionValid = false;
    testState.validationMessage = 'Selected capture subset is not valid.';
    await fixture.whenStable();

    const submitButton = getByTestId<HTMLButtonElement>('submit-play');
    const validationMessage = getByTestId<HTMLElement>('play-validation-message');

    expect(submitButton.disabled).toBe(true);
    expect((validationMessage.textContent ?? '').trim()).toContain('not valid');
  });

  it('SC-27 / FR-8.3 - emits submit-play intent when submit action is activated', async () => {
    testState.canSubmitPlay = true;
    testState.isCaptureSelectionValid = true;
    testState.turnPhase = 'awaiting-card-play';
    await fixture.whenStable();

    const submitEmitSpy = vi.spyOn(component.submitPlayClicked, 'emit');
    const submitButton = getByTestId<HTMLButtonElement>('submit-play');

    submitButton.click();
    await fixture.whenStable();

    expect(submitEmitSpy).toHaveBeenCalledTimes(1);
  });

  it('FR-3.5 - does not emit submit intent when submit action is disabled', async () => {
    testState.canSubmitPlay = false;
    testState.isCaptureSelectionValid = true;
    testState.turnPhase = 'awaiting-card-play';
    await fixture.whenStable();

    const submitEmitSpy = vi.spyOn(component.submitPlayClicked, 'emit');
    const submitButton = getByTestId<HTMLButtonElement>('submit-play');

    submitButton.click();
    await fixture.whenStable();

    expect(submitEmitSpy).not.toHaveBeenCalled();
  });

  it('SC-10 / FR-3.4 - keeps confirm action disabled outside awaiting-confirmation phase', async () => {
    testState.turnPhase = 'awaiting-card-play';
    await fixture.whenStable();

    const confirmEmitSpy = vi.spyOn(component.confirmTurnClicked, 'emit');
    const confirmButton = getByTestId<HTMLButtonElement>('confirm-turn');

    confirmButton.click();
    await fixture.whenStable();

    expect(confirmButton.disabled).toBe(true);
    expect(confirmEmitSpy).not.toHaveBeenCalled();
  });

  it('FR-3.4 - emits confirm-turn intent during awaiting-confirmation phase', async () => {
    testState.turnPhase = 'awaiting-confirmation';
    await fixture.whenStable();

    const confirmEmitSpy = vi.spyOn(component.confirmTurnClicked, 'emit');
    const confirmButton = getByTestId<HTMLButtonElement>('confirm-turn');

    confirmButton.click();
    await fixture.whenStable();

    expect(confirmEmitSpy).toHaveBeenCalledTimes(1);
  });
});
