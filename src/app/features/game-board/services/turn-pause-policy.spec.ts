import { TestBed } from '@angular/core/testing';

import { TurnPausePolicy, type TurnPauseStage } from './turn-pause-policy';

// Covers: FR-7, TR-4, TR-6, TR-8, US-7, US-9, US-12, US-14, SC-19, SC-20

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
    ['player-post-play-confirm', 600],
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

  it('normalizes runtime override to a non-negative integer before resolving stage pause', () => {
    service.setRuntimeOverrideMs(-12.6);

    expect(service.resolvePauseMs('ai-deliberation', { reducedMotion: false })).toBe(0);

    service.setRuntimeOverrideMs(432.8);

    expect(service.resolvePauseMs('ai-capture-preview', { reducedMotion: false })).toBe(433);
  });

  it('applies identical normalized override values for reduced-motion and standard timing modes', () => {
    service.setRuntimeOverrideMs(-7.4);

    expect(service.resolvePauseMs('player-post-play-confirm', { reducedMotion: false })).toBe(0);
    expect(service.resolvePauseMs('player-post-play-confirm', { reducedMotion: true })).toBe(0);

    service.setRuntimeOverrideMs(250.2);

    expect(service.resolvePauseMs('ai-post-play-confirm', { reducedMotion: false })).toBe(250);
    expect(service.resolvePauseMs('ai-post-play-confirm', { reducedMotion: true })).toBe(250);
  });

  it('restores stage defaults after runtime override is cleared back to null', () => {
    service.setRuntimeOverrideMs(123);
    expect(service.resolvePauseMs('ai-deliberation', { reducedMotion: false })).toBe(123);

    service.setRuntimeOverrideMs(null);

    expect(service.resolvePauseMs('ai-deliberation', { reducedMotion: false })).toBe(600);
    expect(service.resolvePauseMs('ai-post-play-confirm', { reducedMotion: false })).toBe(300);
  });
});
