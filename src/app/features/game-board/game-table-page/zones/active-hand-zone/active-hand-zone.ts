import { Component, Input, Signal, output, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
import {
  type ActiveHandZoneAnimationMetadata,
  type CardAnimationVisualState,
} from '../../../models/animation-contracts';
import { CardVisual } from '../../components/card-visual/card-visual';

@Component({
  selector: 'app-active-hand-zone',
  imports: [CardVisual],
  templateUrl: './active-hand-zone.html',
  styleUrl: './active-hand-zone.scss',
})
export class ActiveHandZone {
  private readonly handCardsState = signal<Card[]>([]);
  private readonly selectedHandCardState = signal<Card | null>(null);
  private readonly interactionEnabledState = signal(true);
  private readonly animationMetadataState = signal<ActiveHandZoneAnimationMetadata | null>(null);

  protected readonly handCardsSignal: Signal<Card[]> = this.handCardsState.asReadonly();
  protected readonly selectedHandCardSignal: Signal<Card | null> =
    this.selectedHandCardState.asReadonly();
  protected readonly interactionEnabledSignal: Signal<boolean> =
    this.interactionEnabledState.asReadonly();
  protected readonly animationMetadataSignal: Signal<ActiveHandZoneAnimationMetadata | null> =
    this.animationMetadataState.asReadonly();

  readonly handCardSelected = output<Card>();

  @Input()
  set handCards(cards: Card[]) {
    this.handCardsState.set(cards ?? []);
  }

  get handCards(): Card[] {
    return this.handCardsState();
  }

  @Input()
  set selectedHandCard(card: Card | null) {
    this.selectedHandCardState.set(card);
  }

  get selectedHandCard(): Card | null {
    return this.selectedHandCardState();
  }

  @Input()
  set interactionEnabled(enabled: boolean) {
    this.interactionEnabledState.set(enabled ?? true);
  }

  get interactionEnabled(): boolean {
    return this.interactionEnabledState();
  }

  @Input()
  set animationMetadata(metadata: ActiveHandZoneAnimationMetadata | null) {
    this.animationMetadataState.set(metadata);
  }

  get animationMetadata(): ActiveHandZoneAnimationMetadata | null {
    return this.animationMetadataState();
  }

  protected isSelected(card: Card): boolean {
    return this.selectedHandCardSignal() === card;
  }

  protected selectHandCard(card: Card): void {
    if (!this.interactionEnabledSignal()) {
      return;
    }

    this.handCardSelected.emit(card);
  }

  protected animationStateForCard(card: Card): CardAnimationVisualState {
    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return null;
    }

    return (
      metadata.hand.find((entry) => entry.card === card || this.areCardsEqual(entry.card, card))
        ?.animationState ?? null
    );
  }

  protected handCardLabel(card: Card): string {
    return `${card.rank} de ${card.suit}`;
  }

  private areCardsEqual(left: Card, right: Card): boolean {
    return left.suit === right.suit && left.rank === right.rank && left.value === right.value;
  }
}
