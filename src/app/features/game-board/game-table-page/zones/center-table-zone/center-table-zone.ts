import { Component, Input, Signal, output, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
import {
  type CardAnimationVisualState,
  type CenterTableZoneAnimationMetadata,
} from '../../../models/animation-contracts';
import { CardVisual } from '../../components/card-visual/card-visual';

@Component({
  selector: 'app-center-table-zone',
  imports: [CardVisual],
  templateUrl: './center-table-zone.html',
  styleUrl: './center-table-zone.scss',
})
export class CenterTableZone {
  private readonly tableCardsState = signal<Card[]>([]);
  private readonly selectedTableCardsState = signal<Card[]>([]);
  private readonly interactionEnabledState = signal(true);
  private readonly animationMetadataState = signal<CenterTableZoneAnimationMetadata | null>(null);

  protected readonly tableCardsSignal: Signal<Card[]> = this.tableCardsState.asReadonly();
  protected readonly selectedTableCardsSignal: Signal<Card[]> =
    this.selectedTableCardsState.asReadonly();
  protected readonly interactionEnabledSignal: Signal<boolean> =
    this.interactionEnabledState.asReadonly();
  protected readonly animationMetadataSignal: Signal<CenterTableZoneAnimationMetadata | null> =
    this.animationMetadataState.asReadonly();

  readonly tableCardToggled = output<Card>();

  @Input()
  set tableCards(cards: Card[]) {
    this.tableCardsState.set(cards ?? []);
  }

  get tableCards(): Card[] {
    return this.tableCardsState();
  }

  @Input()
  set selectedTableCards(cards: Card[]) {
    this.selectedTableCardsState.set(cards ?? []);
  }

  get selectedTableCards(): Card[] {
    return this.selectedTableCardsState();
  }

  @Input()
  set interactionEnabled(enabled: boolean) {
    this.interactionEnabledState.set(enabled ?? true);
  }

  get interactionEnabled(): boolean {
    return this.interactionEnabledState();
  }

  @Input()
  set animationMetadata(metadata: CenterTableZoneAnimationMetadata | null) {
    this.animationMetadataState.set(metadata);
  }

  get animationMetadata(): CenterTableZoneAnimationMetadata | null {
    return this.animationMetadataState();
  }

  protected isSelected(card: Card): boolean {
    return this.selectedTableCardsSignal().includes(card);
  }

  protected toggleTableCard(card: Card): void {
    if (!this.interactionEnabledSignal()) {
      return;
    }

    this.tableCardToggled.emit(card);
  }

  protected animationStateForCard(card: Card): CardAnimationVisualState {
    const metadata = this.animationMetadataSignal();
    if (metadata === null) {
      return null;
    }

    return (
      metadata.table.find((entry) => entry.card === card || this.areCardsEqual(entry.card, card))
        ?.animationState ?? null
    );
  }

  protected tableCardLabel(card: Card): string {
    return `${card.rank} de ${card.suit}`;
  }

  private areCardsEqual(left: Card, right: Card): boolean {
    return left.suit === right.suit && left.rank === right.rank && left.value === right.value;
  }
}
