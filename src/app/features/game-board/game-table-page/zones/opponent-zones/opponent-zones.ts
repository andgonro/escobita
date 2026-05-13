import { Component, Input, Signal, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
import { Player } from '../../../../../models/player';
import { CardVisual } from '../../components/card-visual/card-visual';

type AiTurnAnimationPhase =
  | 'idle'
  | 'deliberating'
  | 'card-selected'
  | 'capture-previewing'
  | 'resolving';

interface AiTurnAnimationState {
  phase: AiTurnAnimationPhase;
  selectedCardIndex: number | null;
  revealedCard: Card | null;
  highlightedTableCards: Card[];
}

const AI_TURN_IDLE: AiTurnAnimationState = {
  phase: 'idle',
  selectedCardIndex: null,
  revealedCard: null,
  highlightedTableCards: [],
};

@Component({
  selector: 'app-opponent-zones',
  imports: [CardVisual],
  templateUrl: './opponent-zones.html',
  styleUrl: './opponent-zones.scss',
})
export class OpponentZones {
  private readonly opponentsState = signal<Player[]>([]);
  private readonly aiHandCardCountState = signal(0);
  private readonly aiTurnAnimationStateState = signal<AiTurnAnimationState>(AI_TURN_IDLE);
  protected readonly opponentsSignal: Signal<Player[]> = this.opponentsState.asReadonly();
  protected readonly aiHandCardCountSignal: Signal<number> = this.aiHandCardCountState.asReadonly();
  protected readonly aiTurnAnimationStateSignal: Signal<AiTurnAnimationState> =
    this.aiTurnAnimationStateState.asReadonly();

  @Input()
  set opponents(players: Player[]) {
    this.opponentsState.set(players ?? []);
  }

  get opponents(): Player[] {
    return this.opponentsState();
  }

  @Input()
  set aiHandCardCount(value: number) {
    this.aiHandCardCountState.set(value > 0 ? value : 0);
  }

  get aiHandCardCount(): number {
    return this.aiHandCardCountState();
  }

  @Input()
  set aiTurnAnimationState(value: AiTurnAnimationState) {
    this.aiTurnAnimationStateState.set(value ?? AI_TURN_IDLE);
  }

  get aiTurnAnimationState(): AiTurnAnimationState {
    return this.aiTurnAnimationStateState();
  }

  protected seatPosition(index: number): 'north' | 'west' | 'east' {
    const opponentCount = this.opponentsSignal().length;

    if (opponentCount <= 1) {
      return 'north';
    }

    if (opponentCount === 2) {
      return index === 0 ? 'west' : 'east';
    }

    if (index === 0) {
      return 'west';
    }

    if (index === 1) {
      return 'north';
    }

    return 'east';
  }

  protected isAiOpponent(opponent: Player): boolean {
    return opponent.name === 'Laia';
  }

  protected aiHandIndexes(): number[] {
    return Array.from({ length: this.aiHandCardCountSignal() }, (_, index) => index);
  }

  protected isAiHandActive(): boolean {
    return this.aiTurnAnimationStateSignal().phase !== 'idle';
  }

  protected isAiCardSelected(index: number): boolean {
    return this.aiTurnAnimationStateSignal().selectedCardIndex === index;
  }

  protected aiCardAt(index: number): Card | null {
    if (!this.isAiCardRevealed(index)) {
      return null;
    }

    return this.aiTurnAnimationStateSignal().revealedCard;
  }

  protected isAiCardFaceDown(index: number): boolean {
    return !this.isAiCardRevealed(index);
  }

  private isAiCardRevealed(index: number): boolean {
    const state = this.aiTurnAnimationStateSignal();
    return state.revealedCard !== null && state.selectedCardIndex === index;
  }
}
