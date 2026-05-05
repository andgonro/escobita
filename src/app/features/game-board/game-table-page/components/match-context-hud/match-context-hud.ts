import { Component, Input, Signal, computed, signal } from '@angular/core';
import { TurnPhase } from '../../../../../models/game-state';
import { RoundResult } from '../../../../../models/round-result';
import { Player } from '../../../../../models/player';

interface ScoreEntry {
  id: string;
  name: string;
  score: number;
}

interface EscobaOutcome {
  playerName: string;
  escobaCount: number;
}

@Component({
  selector: 'app-match-context-hud',
  imports: [],
  templateUrl: './match-context-hud.html',
  styleUrl: './match-context-hud.scss',
})
export class MatchContextHud {
  private readonly activePlayerNameState = signal('No active player');
  private readonly scoreEntriesState = signal<ScoreEntry[]>([]);
  private readonly turnPhaseState = signal<TurnPhase>('awaiting-card-play');
  private readonly escobaOutcomeState = signal<EscobaOutcome | null>(null);
  private readonly roundResultState = signal<RoundResult | null>(null);
  private readonly matchWinnerState = signal<Player | null>(null);
  private readonly handoffActiveState = signal(false);
  private readonly contextHeaderTestIdState = signal<string | null>('context-header');

  protected readonly activePlayerNameSignal: Signal<string> =
    this.activePlayerNameState.asReadonly();
  protected readonly scoreEntriesSignal: Signal<ScoreEntry[]> = this.scoreEntriesState.asReadonly();
  protected readonly turnPhaseSignal: Signal<TurnPhase> = this.turnPhaseState.asReadonly();
  protected readonly escobaOutcomeSignal: Signal<EscobaOutcome | null> =
    this.escobaOutcomeState.asReadonly();
  protected readonly roundResultSignal: Signal<RoundResult | null> =
    this.roundResultState.asReadonly();
  protected readonly matchWinnerSignal: Signal<Player | null> = this.matchWinnerState.asReadonly();
  protected readonly roundTopScoreSignal = computed(() => {
    const roundResult = this.roundResultSignal();
    if (!roundResult || roundResult.playerScores.length === 0) {
      return 0;
    }

    return roundResult.playerScores.reduce((maxScore, entry) => {
      return Math.max(maxScore, entry.total);
    }, 0);
  });
  protected readonly handoffActiveSignal: Signal<boolean> = this.handoffActiveState.asReadonly();
  protected readonly contextHeaderTestIdSignal: Signal<string | null> =
    this.contextHeaderTestIdState.asReadonly();

  @Input()
  set activePlayerName(value: string) {
    this.activePlayerNameState.set(value ?? 'No active player');
  }

  get activePlayerName(): string {
    return this.activePlayerNameState();
  }

  @Input()
  set scoreEntries(value: ScoreEntry[]) {
    this.scoreEntriesState.set(value ?? []);
  }

  get scoreEntries(): ScoreEntry[] {
    return this.scoreEntriesState();
  }

  @Input()
  set turnPhase(value: TurnPhase) {
    this.turnPhaseState.set(value ?? 'awaiting-card-play');
  }

  get turnPhase(): TurnPhase {
    return this.turnPhaseState();
  }

  @Input()
  set escobaOutcome(value: EscobaOutcome | null) {
    this.escobaOutcomeState.set(value ?? null);
  }

  get escobaOutcome(): EscobaOutcome | null {
    return this.escobaOutcomeState();
  }

  @Input()
  set roundResult(value: RoundResult | null) {
    this.roundResultState.set(value ?? null);
  }

  get roundResult(): RoundResult | null {
    return this.roundResultState();
  }

  @Input()
  set matchWinner(value: Player | null) {
    this.matchWinnerState.set(value ?? null);
  }

  get matchWinner(): Player | null {
    return this.matchWinnerState();
  }

  @Input()
  set handoffActive(value: boolean) {
    this.handoffActiveState.set(value ?? false);
  }

  get handoffActive(): boolean {
    return this.handoffActiveState();
  }

  @Input()
  set contextHeaderTestId(value: string | null | undefined) {
    this.contextHeaderTestIdState.set(value ?? null);
  }

  get contextHeaderTestId(): string | null {
    return this.contextHeaderTestIdState();
  }
}
