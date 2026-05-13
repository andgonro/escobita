import { Card } from './card';
import { AI_TURN_IDLE, AiPlayDecision, AiTurnAnimationState } from './ai-turn';

// Covers: TR-1.2, TR-1.3, AD-10

describe('ai-turn model', () => {
  it('exports AI_TURN_IDLE with the expected idle values', () => {
    expect(AI_TURN_IDLE).toEqual({
      phase: 'idle',
      selectedCardIndex: null,
      revealedCard: null,
      highlightedTableCards: [],
    });
  });

  it('supports a strongly typed animation state shape', () => {
    const revealedCard: Card = { suit: 'Oros', rank: '1', value: 1 };
    const state: AiTurnAnimationState = {
      phase: 'capture-previewing',
      selectedCardIndex: 0,
      revealedCard,
      highlightedTableCards: [revealedCard],
    };

    expect(state.phase).toBe('capture-previewing');
    expect(state.highlightedTableCards.length).toBe(1);
  });

  it('supports all remaining animation phase literals', () => {
    const base: Omit<AiTurnAnimationState, 'phase'> = {
      selectedCardIndex: null,
      revealedCard: null,
      highlightedTableCards: [],
    };

    const deliberating: AiTurnAnimationState = { ...base, phase: 'deliberating' };
    const cardSelected: AiTurnAnimationState = { ...base, phase: 'card-selected' };
    const resolving: AiTurnAnimationState = { ...base, phase: 'resolving' };

    expect(deliberating.phase).toBe('deliberating');
    expect(cardSelected.phase).toBe('card-selected');
    expect(resolving.phase).toBe('resolving');
  });

  it('defines an AiPlayDecision with cardToPlay and captureSubset fields', () => {
    const cardToPlay: Card = { suit: 'Oros', rank: '1', value: 1 };
    const decision: AiPlayDecision = {
      cardToPlay,
      captureSubset: [],
    };

    expect(decision.cardToPlay).toEqual(cardToPlay);
    expect(decision.captureSubset).toEqual([]);
  });
});
