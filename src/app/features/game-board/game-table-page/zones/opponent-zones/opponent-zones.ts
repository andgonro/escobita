import { Component, Input, Signal, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
import { Player } from '../../../../../models/player';
import {
  type CardAnimationVisualState,
  type OpponentZonesAnimationMetadata,
} from '../../../models/animation-contracts';
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
  private readonly animationMetadataState = signal<OpponentZonesAnimationMetadata | null>(null);
  private readonly suppressAiAnimationsState = signal(false);
  protected readonly opponentsSignal: Signal<Player[]> = this.opponentsState.asReadonly();
  protected readonly aiHandCardCountSignal: Signal<number> = this.aiHandCardCountState.asReadonly();
  protected readonly aiTurnAnimationStateSignal: Signal<AiTurnAnimationState> =
    this.aiTurnAnimationStateState.asReadonly();
  protected readonly animationMetadataSignal: Signal<OpponentZonesAnimationMetadata | null> =
    this.animationMetadataState.asReadonly();
  protected readonly suppressAiAnimationsSignal: Signal<boolean> =
    this.suppressAiAnimationsState.asReadonly();

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

  @Input()
  set animationMetadata(metadata: OpponentZonesAnimationMetadata | null) {
    this.animationMetadataState.set(metadata);
  }

  get animationMetadata(): OpponentZonesAnimationMetadata | null {
    return this.animationMetadataState();
  }

  @Input()
  set suppressAiAnimations(value: boolean) {
    this.suppressAiAnimationsState.set(Boolean(value));
  }

  get suppressAiAnimations(): boolean {
    return this.suppressAiAnimationsState();
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

  protected aiCardAnimationState(index: number): CardAnimationVisualState {
    if (this.suppressAiAnimationsSignal()) {
      return null;
    }

    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return null;
    }

    return metadata.opponent.find((entry) => entry.cardIndex === index)?.animationState ?? null;
  }

  private isAiCardRevealed(index: number): boolean {
    const state = this.aiTurnAnimationStateSignal();
    return state.revealedCard !== null && state.selectedCardIndex === index;
  }
}
