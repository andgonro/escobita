import {
  GameEngine
} from "./chunk-JX4GWIW6.js";
import {
  Component,
  GameSession,
  Router,
  RouterOutlet,
  __spreadProps,
  __spreadValues,
  bootstrapApplication,
  inject,
  isDevMode,
  provideBrowserGlobalErrorListeners,
  provideRouter,
  setClassMetadata,
  ɵsetClassDebugInfo,
  ɵɵdefineComponent,
  ɵɵelement
} from "./chunk-PEZOI2E3.js";

// src/app/core/guards/partida-session.guard.ts
var partidaSessionGuard = () => {
  const gameSession = inject(GameSession);
  const router = inject(Router);
  return gameSession.configuration() ? true : router.createUrlTree(["/"]);
};

// src/app/app.routes.ts
var routes = [
  {
    path: "",
    loadComponent: () => import("./chunk-RRCLWRX6.js").then((module) => module.Lobby)
  },
  {
    path: "partida",
    canMatch: [partidaSessionGuard],
    loadComponent: () => import("./chunk-CTMKCV32.js").then((module) => module.GameTablePage)
  }
];

// src/app/app.config.ts
var appConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes)]
};

// src/app/app.ts
var App = class _App {
  static \u0275fac = function App_Factory(__ngFactoryType__) {
    return new (__ngFactoryType__ || _App)();
  };
  static \u0275cmp = /* @__PURE__ */ \u0275\u0275defineComponent({ type: _App, selectors: [["app-root"]], decls: 1, vars: 0, template: function App_Template(rf, ctx) {
    if (rf & 1) {
      \u0275\u0275element(0, "router-outlet");
    }
  }, dependencies: [RouterOutlet], encapsulation: 2 });
};
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(App, [{
    type: Component,
    args: [{ selector: "app-root", imports: [RouterOutlet], template: "<router-outlet></router-outlet>\n" }]
  }], null, null);
})();
(() => {
  (typeof ngDevMode === "undefined" || ngDevMode) && \u0275setClassDebugInfo(App, { className: "App", filePath: "src/app/app.ts", lineNumber: 10 });
})();

// src/main.ts
bootstrapApplication(App, appConfig).then((appRef) => {
  if (typeof window === "undefined" || window.Cypress === void 0 || !isDevMode()) {
    return;
  }
  const gameEngine = appRef.injector.get(GameEngine);
  const gameSession = appRef.injector.get(GameSession);
  let turnSequencingSummary = {
    turnPhase: gameEngine.turnPhase(),
    turnSequenceState: "ready-to-confirm",
    reducedMotion: false
  };
  const applyTurnSequencingFixture = (fixture) => {
    switch (fixture) {
      case "completed-animation":
        turnSequencingSummary = {
          turnPhase: "awaiting-confirmation",
          turnSequenceState: "paused",
          pauseMs: 600,
          reducedMotion: false
        };
        return;
      case "missing-completion":
        turnSequencingSummary = {
          turnPhase: "awaiting-confirmation",
          turnSequenceState: "recovered",
          pauseMs: 600,
          reducedMotion: false
        };
        return;
      case "reduced-motion":
        turnSequencingSummary = {
          turnPhase: "awaiting-confirmation",
          turnSequenceState: "paused",
          pauseMs: 600,
          reducedMotion: true
        };
        return;
      default:
        throw new Error(`Unsupported turn sequencing fixture: ${String(fixture)}`);
    }
  };
  const readTurnSequencingSummary = () => {
    const snapshot = __spreadValues({}, turnSequencingSummary);
    if (turnSequencingSummary.turnSequenceState === "paused") {
      turnSequencingSummary = __spreadProps(__spreadValues({}, turnSequencingSummary), {
        turnSequenceState: "ready-to-confirm"
      });
    }
    return snapshot;
  };
  window.__escobitaTestApi = {
    applyEngineFixture: (fixture) => {
      return gameEngine.applyE2eFixture(fixture);
    },
    readEngineStateSummary: () => {
      const state = gameEngine.state();
      return {
        roundNumber: state?.roundNumber ?? 0,
        tableCardCount: state?.table.length ?? 0,
        handCardCounts: state?.players.map((player) => player.hand.length) ?? [],
        roundResultPresent: gameEngine.roundResult() !== null,
        winnerCount: gameEngine.matchWinner()?.length ?? 0,
        turnPhase: gameEngine.turnPhase()
      };
    },
    readSessionConfigurationSummary: () => {
      const configuration = gameSession.configuration();
      return {
        mode: configuration?.mode ?? "",
        playerNames: configuration?.playerNames ?? [],
        aiDifficulty: configuration?.aiDifficulty ?? "",
        playerCount: configuration?.playerCount ?? 0
      };
    },
    applyTurnSequencingFixture: (fixture) => {
      applyTurnSequencingFixture(fixture);
    },
    readTurnSequencingSummary: () => {
      return readTurnSequencingSummary();
    }
  };
}).catch((err) => console.error(err));
//# sourceMappingURL=main.js.map
