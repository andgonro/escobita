import { Component, Input, Signal, output, signal } from '@angular/core';
import { TurnPhase } from '../../../../../models/game-state';

@Component({
  selector: 'app-play-action-bar',
  imports: [],
  templateUrl: './play-action-bar.html',
  styleUrl: './play-action-bar.scss',
})
export class PlayActionBar {
  private readonly canSubmitPlayState = signal(false);
  private readonly isCaptureSelectionValidState = signal(true);
  private readonly turnPhaseState = signal<TurnPhase>('awaiting-card-play');
  private readonly validationMessageState = signal('');
  private readonly multiplayerState = signal(false);
  private readonly handoffEnabledState = signal(false);
  private readonly overlayBlockedState = signal(false);

  protected readonly canSubmitPlaySignal: Signal<boolean> = this.canSubmitPlayState.asReadonly();
  protected readonly isCaptureSelectionValidSignal: Signal<boolean> =
    this.isCaptureSelectionValidState.asReadonly();
  protected readonly turnPhaseSignal: Signal<TurnPhase> = this.turnPhaseState.asReadonly();
  protected readonly validationMessageSignal: Signal<string> =
    this.validationMessageState.asReadonly();
  protected readonly multiplayerSignal: Signal<boolean> = this.multiplayerState.asReadonly();
  protected readonly handoffEnabledSignal: Signal<boolean> = this.handoffEnabledState.asReadonly();
  protected readonly overlayBlockedSignal: Signal<boolean> = this.overlayBlockedState.asReadonly();

  readonly submitPlayClicked = output<void>();
  readonly confirmTurnClicked = output<void>();
  readonly handoffToggleChanged = output<boolean>();

  @Input()
  set canSubmitPlay(value: boolean) {
    this.canSubmitPlayState.set(value ?? false);
  }

  get canSubmitPlay(): boolean {
    return this.canSubmitPlayState();
  }

  @Input()
  set isCaptureSelectionValid(value: boolean) {
    this.isCaptureSelectionValidState.set(value ?? true);
  }

  get isCaptureSelectionValid(): boolean {
    return this.isCaptureSelectionValidState();
  }

  @Input()
  set turnPhase(value: TurnPhase) {
    this.turnPhaseState.set(value ?? 'awaiting-card-play');
  }

  get turnPhase(): TurnPhase {
    return this.turnPhaseState();
  }

  @Input()
  set validationMessage(value: string) {
    this.validationMessageState.set(value ?? '');
  }

  get validationMessage(): string {
    return this.validationMessageState();
  }

  @Input()
  set multiplayer(value: boolean) {
    this.multiplayerState.set(value ?? false);
  }

  get multiplayer(): boolean {
    return this.multiplayerState();
  }

  @Input()
  set handoffEnabled(value: boolean) {
    this.handoffEnabledState.set(value ?? false);
  }

  get handoffEnabled(): boolean {
    return this.handoffEnabledState();
  }

  @Input()
  set overlayBlocked(value: boolean) {
    this.overlayBlockedState.set(value ?? false);
  }

  get overlayBlocked(): boolean {
    return this.overlayBlockedState();
  }

  protected onSubmitPlay(): void {
    if (this.submitPlayDisabled() || this.turnPhaseSignal() !== 'awaiting-card-play') {
      return;
    }

    this.submitPlayClicked.emit();
  }

  protected onConfirmTurn(): void {
    if (this.confirmTurnDisabled()) {
      return;
    }

    this.confirmTurnClicked.emit();
  }

  protected onHandoffToggleChanged(event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) {
      return;
    }

    this.handoffToggleChanged.emit(target.checked);
  }

  protected submitPlayDisabled(): boolean {
    return !this.canSubmitPlaySignal() || !this.isCaptureSelectionValidSignal();
  }

  protected confirmTurnDisabled(): boolean {
    return this.turnPhaseSignal() !== 'awaiting-confirmation';
  }
}
