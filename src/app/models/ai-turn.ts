import { Card } from './card';

export type AiTurnAnimationPhase =
  | 'idle'
  | 'deliberating'
  | 'card-selected'
  | 'capture-previewing'
  | 'resolving';

export interface AiTurnAnimationState {
  phase: AiTurnAnimationPhase;
  selectedCardIndex: number | null;
  revealedCard: Card | null;
  highlightedTableCards: Card[];
}

export interface AiPlayDecision {
  cardToPlay: Card;
  captureSubset: Card[];
}

export const AI_TURN_IDLE: AiTurnAnimationState = {
  phase: 'idle',
  selectedCardIndex: null,
  revealedCard: null,
  highlightedTableCards: [],
};
