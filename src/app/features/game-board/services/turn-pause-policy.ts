import { Injectable } from '@angular/core';

export type TurnPauseStage =
  | 'ai-deliberation'
  | 'ai-selection-preview'
  | 'ai-capture-preview'
  | 'ai-post-play-confirm';

interface ResolvePauseOptions {
  reducedMotion: boolean;
}

const DEFAULT_STAGE_PAUSE_MS: Record<TurnPauseStage, number> = {
  'ai-deliberation': 600,
  'ai-selection-preview': 600,
  'ai-capture-preview': 700,
  'ai-post-play-confirm': 300,
};

@Injectable()
export class TurnPausePolicy {
  private runtimeOverrideMs: number | null = null;

  resolvePauseMs(stage: TurnPauseStage, options: ResolvePauseOptions): number {
    const configuredPause = this.runtimeOverrideMs ?? DEFAULT_STAGE_PAUSE_MS[stage];

    if (options.reducedMotion) {
      return configuredPause;
    }

    return configuredPause;
  }

  setRuntimeOverrideMs(overrideMs: number | null): void {
    this.runtimeOverrideMs = overrideMs;
  }
}
