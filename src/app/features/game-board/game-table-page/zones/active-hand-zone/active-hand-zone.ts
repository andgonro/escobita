import { Component, Input, Signal, output, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
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

  protected readonly handCardsSignal: Signal<Card[]> = this.handCardsState.asReadonly();
  protected readonly selectedHandCardSignal: Signal<Card | null> =
    this.selectedHandCardState.asReadonly();
  protected readonly interactionEnabledSignal: Signal<boolean> =
    this.interactionEnabledState.asReadonly();

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

  protected isSelected(card: Card): boolean {
    return this.selectedHandCardSignal() === card;
  }

  protected selectHandCard(card: Card): void {
    if (!this.interactionEnabledSignal()) {
      return;
    }

    this.handCardSelected.emit(card);
  }

  protected handCardLabel(card: Card): string {
    return `${card.rank} de ${card.suit}`;
  }
}
