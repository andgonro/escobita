import { TestBed } from '@angular/core/testing';

import { TurnPausePolicy, type TurnPauseStage } from './turn-pause-policy';

// Covers: FR-7, TR-4, TR-6, US-7, US-9, US-14

describe('TurnPausePolicy', () => {
  let service: TurnPausePolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TurnPausePolicy],
    });

    service = TestBed.inject(TurnPausePolicy);
  });

  it.each<[TurnPauseStage, number]>([
    ['ai-deliberation', 600],
    ['ai-selection-preview', 600],
    ['ai-capture-preview', 700],
    ['ai-post-play-confirm', 300],
  ])('resolves %s pause to %dms in normal mode', (stage, expectedMs) => {
    expect(service.resolvePauseMs(stage, { reducedMotion: false })).toBe(expectedMs);
  });

  it('keeps pause behavior deterministic for reduced-motion mode', () => {
    expect(service.resolvePauseMs('ai-deliberation', { reducedMotion: true })).toBe(600);
    expect(service.resolvePauseMs('ai-capture-preview', { reducedMotion: true })).toBe(700);
  });

  it('supports deterministic runtime override for automated test mode', () => {
    service.setRuntimeOverrideMs(0);

    expect(service.resolvePauseMs('ai-deliberation', { reducedMotion: false })).toBe(0);
    expect(service.resolvePauseMs('ai-capture-preview', { reducedMotion: true })).toBe(0);
  });
});
