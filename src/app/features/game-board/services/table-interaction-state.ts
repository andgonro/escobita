import { Injectable, Signal, computed, signal } from '@angular/core';
import { Card } from '../../../models/card';

function cardEquals(left: Card, right: Card): boolean {
  return left.suit === right.suit && left.rank === right.rank;
}

@Injectable()
export class TableInteractionState {
  private readonly _selectedHandCard = signal<Card | null>(null);
  private readonly _selectedTableCards = signal<Card[]>([]);
  private readonly _handoffEnabled = signal(false);

  readonly selectedHandCard: Signal<Card | null> = this._selectedHandCard.asReadonly();
  readonly selectedTableCards: Signal<Card[]> = this._selectedTableCards.asReadonly();
  readonly handoffEnabled: Signal<boolean> = this._handoffEnabled.asReadonly();

  readonly isCaptureSelectionValid: Signal<boolean> = computed(() => {
    const handCard = this._selectedHandCard();
    if (handCard === null) {
      return true;
    }

    const tableCards = this._selectedTableCards();
    if (tableCards.length === 0) {
      return true;
    }

    const subsetValue = tableCards.reduce((sum, card) => sum + card.value, 0);
    return handCard.value + subsetValue === 15;
  });

  readonly canSubmitPlay: Signal<boolean> = computed(() => {
    return this._selectedHandCard() !== null && this.isCaptureSelectionValid();
  });

  selectHandCard(card: Card): void {
    this._selectedHandCard.set(card);
  }

  clearSelectedHandCard(): void {
    this._selectedHandCard.set(null);
  }

  toggleTableCard(card: Card): void {
    this._selectedTableCards.update((selectedCards) => {
      const index = selectedCards.findIndex((selectedCard) => cardEquals(selectedCard, card));
      if (index >= 0) {
        return selectedCards.filter((_, selectedIndex) => selectedIndex !== index);
      }

      return [...selectedCards, card];
    });
  }

  clearSelectedTableCards(): void {
    this._selectedTableCards.set([]);
  }

  setHandoffEnabled(enabled: boolean): void {
    this._handoffEnabled.set(enabled);
  }

  resetForNextAction(): void {
    this._selectedHandCard.set(null);
    this._selectedTableCards.set([]);
  }
}
