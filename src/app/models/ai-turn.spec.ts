import { AI_TURN_IDLE } from './ai-turn';

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
});
