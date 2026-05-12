import { Component, Input, Signal, output, signal } from '@angular/core';

interface MatchScoreEntry {
  playerName: string;
  score: number;
}

@Component({
  selector: 'app-match-over-overlay',
  imports: [],
  templateUrl: './match-over-overlay.html',
  styleUrl: './match-over-overlay.scss',
})
export class MatchOverOverlay {
  private readonly winnerNamesState = signal<string[]>([]);
  private readonly matchScoreEntriesState = signal<MatchScoreEntry[]>([]);

  protected readonly winnerNamesSignal: Signal<string[]> = this.winnerNamesState.asReadonly();
  protected readonly matchScoreEntriesSignal: Signal<MatchScoreEntry[]> =
    this.matchScoreEntriesState.asReadonly();

  readonly returnToLobby = output<void>();
  readonly playAgain = output<void>();

  @Input()
  set winnerNames(value: string[]) {
    this.winnerNamesState.set(value ?? []);
  }

  get winnerNames(): string[] {
    return this.winnerNamesState();
  }

  @Input()
  set matchScoreEntries(value: MatchScoreEntry[]) {
    this.matchScoreEntriesState.set(value ?? []);
  }

  get matchScoreEntries(): MatchScoreEntry[] {
    return this.matchScoreEntriesState();
  }

  protected onReturnToLobbyClick(): void {
    this.returnToLobby.emit();
  }

  protected onPlayAgainClick(): void {
    this.playAgain.emit();
  }
}
