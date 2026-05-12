import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-15, SC-16, SC-17, SC-18, SC-19, SC-20, SC-21, SC-22, SC-23, SC-24, SC-25, SC-26, SC-27, SC-28, SC-29, SC-30, SC-31, SC-32, SC-33, SC-34, SC-35, SC-36, SC-37, SC-38, SC-39, SC-40, SC-41

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  multiplayerNameOne: '[data-testid="multiplayer-name-1"]',
  multiplayerNameTwo: '[data-testid="multiplayer-name-2"]',
  aiDifficulty: '[data-testid="ai-difficulty"]',
  playButton: '[data-testid="play-button"]',
  lobbyTitle: '#lobby-title',
  gameTablePage: '[data-testid="game-table-page"]',
  contextHeader: '[data-testid="context-header"]',
  roundScoreBreakdown: '[data-testid="round-score-breakdown"]',
  roundOutcomeIndicator: '[data-testid="round-outcome-indicator"]',
  matchWinnerIndicator: '[data-testid="match-winner-indicator"]',
  startNextRoundButton: '[data-testid="start-next-round-button"]',
  viewWinnerButton: '[data-testid="view-winner-button"]',
  matchOverOverlay: '[data-testid="match-over-overlay"]',
  matchOverTitle: '[data-testid="match-over-title"]',
  winnerNames: '[data-testid^="winner-name-"]',
  matchScoreRows: '[data-testid^="match-score-row-"]',
  returnToLobbyButton: '[data-testid="return-to-lobby-button"]',
  playAgainButton: '[data-testid="play-again-button"]',
  liveRegion: '[data-testid="a11y-live-region"]',
  sessionIndicator: '[data-testid="session-indicator"]',
  tableLayoutShell: '[data-testid="table-layout-shell"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  handCards: '[data-testid^="hand-card-"]',
  playActionBar: '[data-testid="play-action-bar"]',
  turnPhaseIndicator: '[data-testid="turn-phase-indicator"]',
  submitPlay: '[data-testid="submit-play"]',
  scoreboardIndicator: '[data-testid="scoreboard-indicator"]',
  scoreItems: '[data-testid^="score-item-"]',
};

type EngineFixture = 'round-winner-visibility' | 'round-co-winner-visibility';

interface EngineFixtureResult {
  roundNumber?: number;
  topScore?: number;
  winnerName?: string;
}

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

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: EngineFixture) => EngineFixtureResult;
    readEngineStateSummary?: () => EngineStateSummary;
    readSessionConfigurationSummary?: () => SessionConfigurationSummary;
  };
}

let expectedPlayerNames: [string, string] = ['Ana', 'Luis'];
let expectedMode = 'Multiplayer';
let expectedAIDifficulty = 'Hard';
let fixtureRoundNumber = 0;

const readHudScores = (): Cypress.Chainable<Record<string, number>> => {
  return cy.get(selectors.scoreItems).then(($items) => {
    const hudScores: Record<string, number> = {};

    $items.each((_, element) => {
      const entry = element as HTMLElement;
      const name = (entry.querySelector('.score-label')?.textContent ?? '').trim();
      const scoreText = (entry.querySelector('.score-value')?.textContent ?? '').trim();
      const score = Number.parseInt(scoreText, 10);

      if (!name) {
        throw new Error('Unable to parse player name from HUD score item.');
      }

      if (Number.isNaN(score)) {
        throw new Error(`Unable to parse HUD score for ${name}.`);
      }

      hudScores[name] = score;
    });

    return hudScores;
  });
};

const readOverlayScores = (): Cypress.Chainable<Record<string, number>> => {
  return cy.get(selectors.matchScoreRows).then(($rows) => {
    const overlayScores: Record<string, number> = {};

    $rows.each((_, element) => {
      const row = element as HTMLElement;
      const spans = row.querySelectorAll('span');
      const name = (spans[0]?.textContent ?? '').trim();
      const scoreText = (spans[1]?.textContent ?? '').trim();
      const score = Number.parseInt(scoreText, 10);

      if (!name) {
        throw new Error('Unable to parse player name from overlay score row.');
      }

      if (Number.isNaN(score)) {
        throw new Error(`Unable to parse overlay score for ${name}.`);
      }

      overlayScores[name] = score;
    });

    return overlayScores;
  });
};

const startConfiguredMatchFromLobby = (): void => {
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.gameTablePage).should('be.visible');
};

const applyEngineFixture = (fixture: EngineFixture): Cypress.Chainable<EngineFixtureResult> => {
  return cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error('Escobita test API is unavailable for engine fixture setup.');
    }

    return testApi.applyEngineFixture(fixture);
  });
};

const readEngineStateSummary = (): Cypress.Chainable<EngineStateSummary> => {
  return cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi || typeof testApi.readEngineStateSummary !== 'function') {
      throw new Error('readEngineStateSummary test seam is unavailable.');
    }

    return testApi.readEngineStateSummary();
  });
};

const readSessionConfigurationSummary = (): Cypress.Chainable<SessionConfigurationSummary> => {
  return cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi || typeof testApi.readSessionConfigurationSummary !== 'function') {
      throw new Error('readSessionConfigurationSummary test seam is unavailable.');
    }

    return testApi.readSessionConfigurationSummary();
  });
};

const applyWinnerFixtureAndCaptureMetadata = (fixture: EngineFixture): void => {
  applyEngineFixture(fixture).then((fixtureResult) => {
    if (fixtureResult.roundNumber === undefined || fixtureResult.topScore === undefined) {
      throw new Error(`${fixture} fixture metadata is missing.`);
    }

    fixtureRoundNumber = fixtureResult.roundNumber;
  });
};

const openOverlayFromRoundCompleteState = (): void => {
  cy.get(selectors.viewWinnerButton).should('be.visible').click();
  cy.get(selectors.matchOverOverlay).should('be.visible');
};

const ensureOverlayIsVisible = (): void => {
  cy.get('body').then(($body) => {
    if ($body.find(selectors.matchOverOverlay).length > 0) {
      return;
    }

    if ($body.find(selectors.viewWinnerButton).length > 0) {
      openOverlayFromRoundCompleteState();
      return;
    }

    throw new Error('Unable to reach match-over overlay precondition.');
  });

  cy.get(selectors.matchOverOverlay).should('be.visible');
};

Given('the final round has ended with a match winner declared', () => {
  startConfiguredMatchFromLobby();
  applyWinnerFixtureAndCaptureMetadata('round-winner-visibility');
});

Given(
  'the round-complete state is active with the {string} button visible',
  (buttonLabel: string) => {
    if (buttonLabel !== 'View Winner') {
      throw new Error(`Unsupported round-complete button label: ${buttonLabel}`);
    }

    cy.get(selectors.roundScoreBreakdown).should('be.visible');
    cy.get(selectors.viewWinnerButton).should('be.visible');
    cy.get(selectors.matchOverOverlay).should('not.exist');
  },
);

Given('the player has not yet activated the {string} button', (buttonLabel: string) => {
  if (buttonLabel !== 'View Winner') {
    throw new Error(`Unsupported button label in precondition: ${buttonLabel}`);
  }

  cy.get(selectors.viewWinnerButton).should('be.visible');
  cy.get(selectors.matchOverOverlay).should('not.exist');
});

Given('the player has activated the {string} button', (buttonLabel: string) => {
  if (buttonLabel !== 'View Winner') {
    throw new Error(`Unsupported button label for activation precondition: ${buttonLabel}`);
  }

  openOverlayFromRoundCompleteState();
});

Given('{string} is the sole match winner', (winnerName: string) => {
  cy.get(selectors.matchWinnerIndicator).should('contain.text', winnerName);
});

Given(
  '{string} and {string} have both ended the round with the same accumulated score at or above 15 points',
  (winnerA: string, winnerB: string) => {
    applyWinnerFixtureAndCaptureMetadata('round-co-winner-visibility');
    expectedPlayerNames = [winnerA, winnerB];
    cy.get(selectors.viewWinnerButton).should('be.visible');
  },
);

Given('the player is focused on the {string} button', (buttonLabel: string) => {
  if (buttonLabel !== 'View Winner') {
    throw new Error(`Unsupported button label for focus precondition: ${buttonLabel}`);
  }

  cy.get(selectors.viewWinnerButton).focus();
  cy.focused().should('have.attr', 'data-testid', 'view-winner-button');
});

Given(
  'a game session has been configured with player names {string} and {string}, a game mode, and an AI difficulty setting',
  (playerA: string, playerB: string) => {
    expectedPlayerNames = [playerA, playerB];
    expectedMode = 'Multiplayer';
    expectedAIDifficulty = 'Hard';

    cy.visit('/');
    cy.get(selectors.modeSingle).click();
    cy.get(selectors.aiDifficulty).select(expectedAIDifficulty);
    cy.get(selectors.modeMultiplayer).click();
    cy.get(selectors.playerCount).select('2');
    cy.get(selectors.multiplayerNameOne).clear().type(playerA);
    cy.get(selectors.multiplayerNameTwo).clear().type(playerB);
  },
);

Given('a match has concluded with a winner', () => {
  startConfiguredMatchFromLobby();
  applyWinnerFixtureAndCaptureMetadata('round-winner-visibility');
  cy.get(selectors.viewWinnerButton).should('be.visible');
});

Given('the match-over overlay is visible', () => {
  ensureOverlayIsVisible();
});

Given(
  'the player has activated {string} and the new round 1 board is displayed',
  (buttonLabel: string) => {
    if (buttonLabel !== 'Play Again') {
      throw new Error(`Unsupported action label in precondition: ${buttonLabel}`);
    }

    cy.get(selectors.playAgainButton).should('be.visible').click();
    cy.get(selectors.matchOverOverlay).should('not.exist');
    cy.location('pathname').should('eq', '/partida');
    cy.get(selectors.gameTablePage).should('be.visible');
    readEngineStateSummary().then((summary) => {
      expect(summary.roundNumber).to.equal(1);
    });
  },
);

Given('the previous match ended with a non-null engine state', () => {
  readEngineStateSummary().then((summary) => {
    expect(summary.roundNumber).to.be.greaterThan(0);
  });
});

When('the match winner signal becomes non-null at round end', () => {
  applyWinnerFixtureAndCaptureMetadata('round-winner-visibility');
});

When('the player presses the Escape key', () => {
  cy.get('body').type('{esc}');
});

When('the player clicks on the game table content behind the overlay', () => {
  cy.get(selectors.tableLayoutShell).click({ force: true });
});

When('the player attempts to interact with the HUD, board zones, or action bar', () => {
  cy.get(selectors.contextHeader).should('have.attr', 'inert', '');
  cy.get(selectors.tableLayoutShell).should('have.attr', 'inert', '');
  cy.get(selectors.playActionBar).should('have.attr', 'inert', '');
});

When('an assistive technology inspects the match-over overlay', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
});

When(
  'the player activates the {string} button and the match-over overlay appears',
  (buttonLabel: string) => {
    if (buttonLabel !== 'View Winner') {
      throw new Error(`Unsupported button label for combined activation step: ${buttonLabel}`);
    }

    cy.focused().type('{enter}');
    cy.get(selectors.matchOverOverlay).should('be.visible');
  },
);

When('the match-over overlay becomes visible', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
});

When('the player views the match-over overlay', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
});

When(
  'the player activates the {string} button and the Lobby screen appears',
  (buttonLabel: string) => {
    if (buttonLabel !== 'Return to Lobby') {
      throw new Error(`Unsupported button label for lobby transition step: ${buttonLabel}`);
    }

    cy.get(selectors.returnToLobbyButton).click();
    cy.location('pathname').should('eq', '/');
    cy.get(selectors.lobbyTitle).should('be.visible');
  },
);

When(
  'the player activates the {string} button multiple times in rapid succession',
  (buttonLabel: string) => {
    if (buttonLabel !== 'Return to Lobby') {
      throw new Error(`Unsupported rapid-activation button label: ${buttonLabel}`);
    }

    cy.window().then((windowRef) => {
      cy.spy(windowRef.history, 'pushState').as('pushStateSpy');
      cy.spy(windowRef.console, 'error').as('consoleErrorSpy');
    });

    cy.get(selectors.returnToLobbyButton).then(($button) => {
      const button = $button[0] as HTMLButtonElement;
      button.click();
      button.click();
      button.click();
    });
  },
);

When('the player activates {string} and the Lobby screen appears', (buttonLabel: string) => {
  if (buttonLabel !== 'Return to Lobby') {
    throw new Error(`Unsupported action label for focus transition to lobby: ${buttonLabel}`);
  }

  cy.get(selectors.returnToLobbyButton).click();
  cy.location('pathname').should('eq', '/');
  cy.get(selectors.lobbyTitle).should('be.visible');
});

When(
  'the player activates the {string} button and the overlay is dismissed',
  (buttonLabel: string) => {
    if (buttonLabel !== 'Play Again') {
      throw new Error(`Unsupported button label for overlay-dismiss step: ${buttonLabel}`);
    }

    cy.get(selectors.playAgainButton).click();
    cy.get(selectors.matchOverOverlay).should('not.exist');
  },
);

When('the player views the game table', () => {
  cy.get(selectors.gameTablePage).should('be.visible');
});

Then('the match-over overlay appears', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
});

Then('the round-complete state is no longer shown', () => {
  cy.get(selectors.contextHeader).should('have.attr', 'aria-hidden', 'true');
  cy.get(selectors.contextHeader).should('have.attr', 'inert', '');
});

Then('the match-over overlay is not visible', () => {
  cy.get(selectors.matchOverOverlay).should('not.exist');
});

Then(
  'the round-complete state with the {string} button is shown instead',
  (buttonLabel: string) => {
    if (buttonLabel !== 'View Winner') {
      throw new Error(
        `Unsupported round-complete button label in fallback assertion: ${buttonLabel}`,
      );
    }

    cy.get(selectors.roundScoreBreakdown).should('be.visible');
    cy.get(selectors.viewWinnerButton).should('be.visible');
  },
);

Then('the overlay covers the entire game table viewport', () => {
  cy.window().then((windowRef) => {
    const overlay = windowRef.document.querySelector(
      selectors.matchOverOverlay,
    ) as HTMLElement | null;
    const tableShell = windowRef.document.querySelector(
      selectors.tableLayoutShell,
    ) as HTMLElement | null;

    if (!overlay) {
      throw new Error('match-over overlay is not rendered.');
    }

    if (!tableShell) {
      throw new Error('table layout shell is not rendered.');
    }

    const overlayBounds = overlay.getBoundingClientRect();
    const tableBounds = tableShell.getBoundingClientRect();

    expect(overlayBounds.top).to.be.at.most(tableBounds.top + 1);
    expect(overlayBounds.left).to.be.at.most(tableBounds.left + 1);
    expect(overlayBounds.right).to.be.at.least(tableBounds.right - 1);
    expect(overlayBounds.bottom).to.be.at.least(tableBounds.bottom - 1);
  });
});

Then('no game table content is visible above the overlay', () => {
  cy.window().then((windowRef) => {
    const topElement = windowRef.document.elementFromPoint(
      Math.floor(windowRef.innerWidth / 2),
      Math.floor(windowRef.innerHeight / 2),
    );

    const overlayAncestor = topElement?.closest(selectors.matchOverOverlay);
    expect(overlayAncestor).not.to.equal(null);
  });
});

Then("{string}'s name is prominently displayed in the overlay", (winnerName: string) => {
  cy.get(selectors.winnerNames).first().should('contain.text', winnerName);
  cy.get(selectors.winnerNames)
    .first()
    .then(($winner) => {
      const fontWeight = Number.parseInt(getComputedStyle($winner[0]).fontWeight, 10);
      expect(fontWeight).to.be.greaterThan(500);
    });
});

Then(
  "both {string}'s name and {string}'s name are displayed in the overlay",
  (winnerA: string, winnerB: string) => {
    cy.get(selectors.winnerNames).should('have.length.at.least', 2);
    cy.get(selectors.winnerNames).eq(0).should('contain.text', winnerA);
    cy.get(selectors.winnerNames).eq(1).should('contain.text', winnerB);
  },
);

Then('both names are displayed with equal visual prominence', () => {
  cy.get(selectors.winnerNames).then(($winnerNames) => {
    const first = $winnerNames[0] as HTMLElement | undefined;
    const second = $winnerNames[1] as HTMLElement | undefined;

    expect(first).to.not.equal(undefined);
    expect(second).to.not.equal(undefined);
    if (!first || !second) {
      return;
    }

    const firstStyle = getComputedStyle(first);
    const secondStyle = getComputedStyle(second);

    expect(firstStyle.fontSize).to.equal(secondStyle.fontSize);
    expect(firstStyle.fontWeight).to.equal(secondStyle.fontWeight);
  });
});

Then('no additional round is offered or started to break the tie', () => {
  cy.get(selectors.startNextRoundButton).should('not.exist');
  readEngineStateSummary().then((summary) => {
    expect(summary.roundResultPresent).to.equal(true);
    expect(summary.winnerCount).to.equal(2);
    expect(summary.roundNumber).to.equal(fixtureRoundNumber);
  });
});

Then('the accumulated match score for {string} is shown', (playerName: string) => {
  cy.get(selectors.matchScoreRows).contains(playerName).should('be.visible');
});

Then('the scores shown reflect all rounds played in the match, not only the final round', () => {
  readHudScores().then((hudScores) => {
    readOverlayScores().then((overlayScores) => {
      const hudPlayers = Object.keys(hudScores).sort();
      const overlayPlayers = Object.keys(overlayScores).sort();

      expect(overlayPlayers).to.deep.equal(hudPlayers);
      overlayPlayers.forEach((playerName) => {
        expect(overlayScores[playerName]).to.equal(hudScores[playerName]);
      });

      expect(Object.values(overlayScores).length).to.be.greaterThan(0);
    });
  });
});

Then('the overlay remains visible', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
});

Then('those elements do not respond to pointer or keyboard interaction', () => {
  cy.get(selectors.contextHeader).should('have.attr', 'inert', '');
  cy.get(selectors.tableLayoutShell).should('have.attr', 'inert', '');
  cy.get(selectors.playActionBar).should('have.attr', 'inert', '');

  cy.location('pathname').should('eq', '/partida');
  readEngineStateSummary().then((summary) => {
    expect(summary.roundResultPresent).to.equal(true);
    expect(summary.turnPhase).to.equal('awaiting-card-play');
  });
});

Then('those elements are marked as hidden from assistive technology', () => {
  cy.get(selectors.contextHeader).should('have.attr', 'aria-hidden', 'true');
  cy.get(selectors.tableLayoutShell).should('have.attr', 'aria-hidden', 'true');
  cy.get(selectors.playActionBar).should('have.attr', 'aria-hidden', 'true');
});

Then('activating the button by keyboard triggers the match-over overlay to appear', () => {
  cy.focused().type('{enter}');
  cy.get(selectors.matchOverOverlay).should('be.visible');
});

Then('the overlay is identified as a modal dialog', () => {
  cy.get(selectors.matchOverOverlay)
    .should('have.attr', 'role', 'dialog')
    .and('have.attr', 'aria-modal', 'true');
});

Then('the overlay has an accessible name', () => {
  cy.get(selectors.matchOverOverlay)
    .should('have.attr', 'aria-labelledby')
    .then((labelledBy) => {
      expect(labelledBy).to.be.a('string').and.not.equal('');
      cy.get(`#${labelledBy}`).should('be.visible');
      cy.get(`#${labelledBy}`).invoke('text').should('not.equal', '');
    });
});

Then('focus moves to a focusable element inside the overlay', () => {
  cy.focused().then(($focused) => {
    const focusedTestId = $focused.attr('data-testid');
    expect(['return-to-lobby-button', 'play-again-button']).to.include(focusedTestId ?? '');
  });
});

Then('focus is not left on the background game table content', () => {
  cy.focused().then(($focused) => {
    const focusedTestId = $focused.attr('data-testid') ?? '';
    const backgroundTestIds = new Set([
      'view-winner-button',
      'start-next-round-button',
      'submit-play',
      'confirm-turn',
      'context-header',
      'table-layout-shell',
    ]);

    expect(backgroundTestIds.has(focusedTestId)).to.equal(false);
  });
});

Then('a live-region announcement is made identifying the match winner or all co-winners', () => {
  cy.get(selectors.liveRegion)
    .invoke('text')
    .then((text) => {
      const message = text.trim();
      expect(message).to.contain('Partida terminada');
      expect(
        message.includes(expectedPlayerNames[0]) || message.includes(expectedPlayerNames[1]),
      ).to.equal(true);
    });
});

Then('the application navigates to the root route', () => {
  cy.location('pathname').should('eq', '/');
});

Then('the Lobby screen is rendered', () => {
  cy.get(selectors.lobbyTitle).should('be.visible');
});

Then(
  'the lobby form is pre-filled with the player names {string} and {string}',
  (playerA: string, playerB: string) => {
    cy.get(selectors.modeMultiplayer).should('be.checked');
    cy.get(selectors.multiplayerNameOne).should('have.value', playerA);
    cy.get(selectors.multiplayerNameTwo).should('have.value', playerB);
  },
);

Then('the previous game mode is pre-filled', () => {
  if (expectedMode === 'Multiplayer') {
    cy.get(selectors.modeMultiplayer).should('be.checked');
    return;
  }

  cy.get(selectors.modeSingle).should('be.checked');
});

Then('the previous AI difficulty is pre-filled', () => {
  readSessionConfigurationSummary().then((summary) => {
    expect(summary.aiDifficulty).to.equal(expectedAIDifficulty);
  });
});

Then('the application navigates to the Lobby screen only once', () => {
  cy.location('pathname').should('eq', '/');
  cy.get(selectors.lobbyTitle).should('be.visible');
  cy.get('@pushStateSpy').should('have.been.calledOnce');
});

Then('no errors occur', () => {
  cy.get('@consoleErrorSpy').should('not.have.been.called');
});

Then('activating the button by keyboard triggers navigation to the Lobby screen', () => {
  cy.focused().type('{enter}');
  cy.location('pathname').should('eq', '/');
  cy.get(selectors.lobbyTitle).should('be.visible');
});

Then("focus is placed on the lobby's primary interactive control", () => {
  cy.focused().should('have.attr', 'data-testid', 'mode-single');
});

Then('the match-over overlay is dismissed', () => {
  cy.get(selectors.matchOverOverlay).should('not.exist');
});

Then('the game table displays the new round 1 board state', () => {
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.gameTablePage).should('be.visible');
  readEngineStateSummary().then((summary) => {
    expect(summary.roundNumber).to.equal(1);
  });
});

Then('the application has not navigated away from the game table route', () => {
  cy.location('pathname').should('eq', '/partida');
});

Then(
  'the new match uses the player names {string} and {string}',
  (playerA: string, playerB: string) => {
    cy.get(selectors.scoreboardIndicator)
      .should('contain.text', playerA)
      .and('contain.text', playerB);
  },
);

Then('the same game mode is used', () => {
  readSessionConfigurationSummary().then((summary) => {
    expect(summary.mode).to.equal(expectedMode);
  });
});

Then('the same AI difficulty is used', () => {
  readSessionConfigurationSummary().then((summary) => {
    expect(summary.aiDifficulty).to.equal(expectedAIDifficulty);
  });
});

Then("each player's accumulated match score is 0", () => {
  cy.get(selectors.scoreItems).each(($entry) => {
    expect(($entry.text() ?? '').trim()).to.match(/0$/);
  });
});

Then('hand cards are selectable', () => {
  cy.get(selectors.handCards).first().click();
  cy.get(selectors.handCards).first().should('have.attr', 'aria-pressed', 'true');
});

Then('the action bar controls respond correctly to the current turn phase', () => {
  cy.get(selectors.submitPlay).should('not.be.disabled').click();
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-confirmation');
});

Then('a fresh match is started unconditionally, bypassing any initialisation guard', () => {
  readEngineStateSummary().then((summary) => {
    expect(summary.roundNumber).to.equal(1);
    expect(summary.roundResultPresent).to.equal(false);
    expect(summary.winnerCount).to.equal(0);
  });
});

Then('the game table shows the new round 1 board state', () => {
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.gameTablePage).should('be.visible');
  readEngineStateSummary().then((summary) => {
    expect(summary.tableCardCount).to.equal(4);
    summary.handCardCounts.forEach((count) => {
      expect(count).to.equal(3);
    });
  });
});

Then('activating the button by keyboard triggers the new match to begin', () => {
  cy.focused().type('{enter}');
  cy.get(selectors.matchOverOverlay).should('not.exist');
  cy.location('pathname').should('eq', '/partida');
  readEngineStateSummary().then((summary) => {
    expect(summary.roundNumber).to.equal(1);
  });
});

Then(
  'focus moves to the {string} button on the game table after {string}',
  (buttonLabel: string, actionLabel: string) => {
    if (buttonLabel !== 'Submit play' || actionLabel !== 'Play Again') {
      throw new Error(
        `Unsupported focus transition expectation: ${buttonLabel} after ${actionLabel}`,
      );
    }

    cy.focused().should('have.attr', 'data-testid', 'submit-play');
  },
);

Then('focus moves to the {string} button on the game table', (buttonLabel: string) => {
  if (buttonLabel !== 'Submit play') {
    throw new Error(`Unsupported focus transition expectation: ${buttonLabel}`);
  }

  cy.focused().should('have.attr', 'data-testid', 'submit-play');
});
