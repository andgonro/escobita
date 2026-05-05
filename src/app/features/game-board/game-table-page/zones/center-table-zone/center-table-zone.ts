import { Component, Input, Signal, output, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
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

  protected readonly tableCardsSignal: Signal<Card[]> = this.tableCardsState.asReadonly();
  protected readonly selectedTableCardsSignal: Signal<Card[]> =
    this.selectedTableCardsState.asReadonly();
  protected readonly interactionEnabledSignal: Signal<boolean> =
    this.interactionEnabledState.asReadonly();

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

  protected isSelected(card: Card): boolean {
    return this.selectedTableCardsSignal().includes(card);
  }

  protected toggleTableCard(card: Card): void {
    if (!this.interactionEnabledSignal()) {
      return;
    }

    this.tableCardToggled.emit(card);
  }

  protected tableCardLabel(card: Card): string {
    return `${card.rank} de ${card.suit}`;
  }
}
