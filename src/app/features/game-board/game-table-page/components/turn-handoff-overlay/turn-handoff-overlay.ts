import { Component, Input, Signal, output, signal } from '@angular/core';

@Component({
  selector: 'app-turn-handoff-overlay',
  imports: [],
  templateUrl: './turn-handoff-overlay.html',
  styleUrl: './turn-handoff-overlay.scss',
})
export class TurnHandoffOverlay {
  private readonly nextPlayerNameState = signal('');

  protected readonly nextPlayerNameSignal: Signal<string> = this.nextPlayerNameState.asReadonly();

  readonly handoffAcknowledged = output<void>();

  @Input()
  set nextPlayerName(value: string) {
    this.nextPlayerNameState.set(value ?? '');
  }

  get nextPlayerName(): string {
    return this.nextPlayerNameState();
  }

  protected acknowledgeHandoff(): void {
    this.handoffAcknowledged.emit();
  }
}
