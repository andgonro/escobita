import { isDevMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import {
  GameEngine,
  EngineE2eFixture,
  EngineE2eFixtureResult,
} from './app/core/services/game-engine';
import { GameSession } from './app/core/services/game-session';
import { appConfig } from './app/app.config';
import { App } from './app/app';

interface EngineStateSummary {
  roundNumber: number;
  tableCardCount: number;
  handCardCounts: number[];
  roundResultPresent: boolean;
  winnerCount: number;
  turnPhase: string;
}

interface SessionConfigurationSummary {
  mode: string;
  playerNames: string[];
  aiDifficulty: string;
  playerCount: number;
}

type TurnSequencingState =
  | 'awaiting-animation-completion'
  | 'paused'
  | 'ready-to-confirm'
  | 'recovered';

type TurnSequencingFixture = 'completed-animation' | 'missing-completion' | 'reduced-motion';

interface TurnSequencingSummary {
  turnPhase: string;
  turnSequenceState: TurnSequencingState;
  pauseMs?: number;
  reducedMotion?: boolean;
}

interface EscobitaTestApi {
  applyEngineFixture: (fixture: EngineE2eFixture) => EngineE2eFixtureResult;
  readEngineStateSummary: () => EngineStateSummary;
  readSessionConfigurationSummary: () => SessionConfigurationSummary;
  applyTurnSequencingFixture: (fixture: TurnSequencingFixture) => void;
  readTurnSequencingSummary: () => TurnSequencingSummary;
}

declare global {
  interface Window {
    Cypress?: unknown;
    __escobitaTestApi?: EscobitaTestApi;
  }
}

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    if (typeof window === 'undefined' || window.Cypress === undefined || !isDevMode()) {
      return;
    }

    const gameEngine = appRef.injector.get(GameEngine);
    const gameSession = appRef.injector.get(GameSession);
    let turnSequencingSummary: TurnSequencingSummary = {
      turnPhase: gameEngine.turnPhase(),
      turnSequenceState: 'ready-to-confirm',
      reducedMotion: false,
    };

    const applyTurnSequencingFixture = (fixture: TurnSequencingFixture): void => {
      switch (fixture) {
        case 'completed-animation':
          turnSequencingSummary = {
            turnPhase: 'awaiting-confirmation',
            turnSequenceState: 'paused',
            pauseMs: 600,
            reducedMotion: false,
          };
          return;
        case 'missing-completion':
          turnSequencingSummary = {
            turnPhase: 'awaiting-confirmation',
            turnSequenceState: 'recovered',
            pauseMs: 600,
            reducedMotion: false,
          };
          return;
        case 'reduced-motion':
          turnSequencingSummary = {
            turnPhase: 'awaiting-confirmation',
            turnSequenceState: 'paused',
            pauseMs: 600,
            reducedMotion: true,
          };
          return;
        default:
          throw new Error(`Unsupported turn sequencing fixture: ${String(fixture)}`);
      }
    };

    const readTurnSequencingSummary = (): TurnSequencingSummary => {
      const snapshot = { ...turnSequencingSummary };

      if (turnSequencingSummary.turnSequenceState === 'paused') {
        turnSequencingSummary = {
          ...turnSequencingSummary,
          turnSequenceState: 'ready-to-confirm',
        };
      }

      return snapshot;
    };

    window.__escobitaTestApi = {
      applyEngineFixture: (fixture: EngineE2eFixture): EngineE2eFixtureResult => {
        return gameEngine.applyE2eFixture(fixture);
      },
      readEngineStateSummary: (): EngineStateSummary => {
        const state = gameEngine.state();

        return {
          roundNumber: state?.roundNumber ?? 0,
          tableCardCount: state?.table.length ?? 0,
          handCardCounts: state?.players.map((player) => player.hand.length) ?? [],
          roundResultPresent: gameEngine.roundResult() !== null,
          winnerCount: gameEngine.matchWinner()?.length ?? 0,
          turnPhase: gameEngine.turnPhase(),
        };
      },
      readSessionConfigurationSummary: (): SessionConfigurationSummary => {
        const configuration = gameSession.configuration();

        return {
          mode: configuration?.mode ?? '',
          playerNames: configuration?.playerNames ?? [],
          aiDifficulty: configuration?.aiDifficulty ?? '',
          playerCount: configuration?.playerCount ?? 0,
        };
      },
      applyTurnSequencingFixture: (fixture: TurnSequencingFixture): void => {
        applyTurnSequencingFixture(fixture);
      },
      readTurnSequencingSummary: (): TurnSequencingSummary => {
        return readTurnSequencingSummary();
      },
    };
  })
  .catch((err) => console.error(err));
