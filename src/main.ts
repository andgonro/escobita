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

interface EscobitaTestApi {
  applyEngineFixture: (fixture: EngineE2eFixture) => EngineE2eFixtureResult;
  readEngineStateSummary: () => EngineStateSummary;
  readSessionConfigurationSummary: () => SessionConfigurationSummary;
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
    };
  })
  .catch((err) => console.error(err));
