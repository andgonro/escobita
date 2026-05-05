import { bootstrapApplication } from '@angular/platform-browser';
import {
  GameEngine,
  EngineE2eFixture,
  EngineE2eFixtureResult,
} from './app/core/services/game-engine';
import { appConfig } from './app/app.config';
import { App } from './app/app';

interface EscobitaTestApi {
  applyEngineFixture: (fixture: EngineE2eFixture) => EngineE2eFixtureResult;
}

declare global {
  interface Window {
    Cypress?: unknown;
    __escobitaTestApi?: EscobitaTestApi;
  }
}

bootstrapApplication(App, appConfig)
  .then((appRef) => {
    if (typeof window === 'undefined' || window.Cypress === undefined) {
      return;
    }

    const gameEngine = appRef.injector.get(GameEngine);
    window.__escobitaTestApi = {
      applyEngineFixture: (fixture: EngineE2eFixture): EngineE2eFixtureResult => {
        return gameEngine.applyE2eFixture(fixture);
      },
    };
  })
  .catch((err) => console.error(err));
