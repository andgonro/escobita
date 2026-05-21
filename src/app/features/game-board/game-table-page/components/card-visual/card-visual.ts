import { Component, Input, Signal, computed, signal } from '@angular/core';
import { Card } from '../../../../../models/card';
import { mapCardToVisual } from '../../../utils/card-asset-mapper';

export type CardVisualAnimationState =
  | 'idle'
  | 'play'
  | 'capture'
  | 'deal'
  | 'opponent'
  | 'escoba'
  | null;

@Component({
  selector: 'app-card-visual',
  imports: [],
  templateUrl: './card-visual.html',
  styleUrl: './card-visual.scss',
  host: {
    '[attr.data-testid]': 'resolvedTestId()',
    '[attr.aria-label]': 'semanticLabel()',
    '[class.card-visual--focus-visible]': 'true',
    '[class.card-visual--selected]': 'selectedSignal()',
    '[class.card-visual--animation-play]': 'isPlayAnimation()',
    '[class.card-visual--animation-capture]': 'isCaptureAnimation()',
    '[class.card-visual--animation-deal]': 'isDealAnimation()',
    '[class.card-visual--animation-opponent]': 'isOpponentAnimation()',
    '[class.card-visual--animation-escoba]': 'isEscobaAnimation()',
  },
})
export class CardVisual {
  private readonly cardState = signal<Card | null>(null);
  private readonly selectedState = signal(false);
  private readonly faceDownState = signal(false);
  private readonly testIdState = signal<string | null>(null);
  private readonly mirrorStateToFigureState = signal(true);
  private readonly animationStateStore = signal<CardVisualAnimationState>(null);

  protected readonly cardSignal: Signal<Card | null> = this.cardState.asReadonly();
  protected readonly selectedSignal: Signal<boolean> = this.selectedState.asReadonly();
  protected readonly faceDownSignal: Signal<boolean> = this.faceDownState.asReadonly();
  protected readonly testIdSignal: Signal<string | null> = this.testIdState.asReadonly();
  protected readonly mirrorStateToFigureSignal: Signal<boolean> =
    this.mirrorStateToFigureState.asReadonly();
  protected readonly animationStateSignal: Signal<CardVisualAnimationState> =
    this.animationStateStore.asReadonly();
  protected readonly resolvedTestId = computed(() => this.testIdSignal() ?? 'card-visual');

  protected readonly mappedAsset = computed(() => {
    if (this.faceDownSignal()) {
      return {
        assetPath: '/cards/Card_Back.png',
        semanticLabel: 'Carta oculta',
      };
    }

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
  protected readonly isPlayAnimation = computed(() => this.animationStateSignal() === 'play');
  protected readonly isCaptureAnimation = computed(() => this.animationStateSignal() === 'capture');
  protected readonly isDealAnimation = computed(() => this.animationStateSignal() === 'deal');
  protected readonly isOpponentAnimation = computed(
    () => this.animationStateSignal() === 'opponent',
  );
  protected readonly isEscobaAnimation = computed(() => this.animationStateSignal() === 'escoba');

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

  @Input()
  set faceDown(value: boolean) {
    this.faceDownState.set(value);
  }

  get faceDown(): boolean {
    return this.faceDownState();
  }

  @Input()
  set testId(value: string | null) {
    this.testIdState.set(value ?? null);
  }

  get testId(): string | null {
    return this.testIdState();
  }

  @Input()
  set mirrorStateToFigure(value: boolean) {
    this.mirrorStateToFigureState.set(value);
  }

  get mirrorStateToFigure(): boolean {
    return this.mirrorStateToFigureState();
  }

  @Input()
  set animationState(value: CardVisualAnimationState) {
    this.animationStateStore.set(value);
  }

  get animationState(): CardVisualAnimationState {
    return this.animationStateStore();
  }
}
