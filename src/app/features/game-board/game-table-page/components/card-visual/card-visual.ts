import { Component, Input, Signal, computed, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
import { mapCardToVisual } from '../../../utils/card-asset-mapper';

@Component({
  selector: 'app-card-visual',
  imports: [],
  templateUrl: './card-visual.html',
  styleUrl: './card-visual.scss',
})
export class CardVisual {
  private readonly cardState = signal<Card | null>(null);
  private readonly selectedState = signal(false);

  protected readonly cardSignal: Signal<Card | null> = this.cardState.asReadonly();
  protected readonly selectedSignal: Signal<boolean> = this.selectedState.asReadonly();

  protected readonly mappedAsset = computed(() => {
    const card = this.cardSignal();

    if (!card) {
      return {
        assetPath: '/cards/Card_Back.png',
        semanticLabel: 'Carta no disponible',
      };
    }

    return mapCardToVisual(card);
  });

  protected readonly imagePath = computed(() => this.mappedAsset().assetPath);
  protected readonly semanticLabel = computed(() => this.mappedAsset().semanticLabel);

  @Input()
  set card(value: Card | null) {
    this.cardState.set(value);
  }

  get card(): Card | null {
    return this.cardState();
  }

  @Input()
  set selected(value: boolean) {
    this.selectedState.set(value);
  }

  get selected(): boolean {
    return this.selectedState();
  }
}
