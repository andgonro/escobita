import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07, SC-08, SC-09, SC-10, SC-11, SC-12, SC-13, SC-14, SC-42

const selectors = {
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  multiplayerNameOne: '[data-testid="multiplayer-name-1"]',
  multiplayerNameTwo: '[data-testid="multiplayer-name-2"]',
  playButton: '[data-testid="play-button"]',
  gameTablePage: '[data-testid="game-table-page"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  currentRoundIndicator: '[data-testid="current-round-indicator"]',
  scoreboardIndicator: '[data-testid="scoreboard-indicator"]',
  roundOutcomeIndicator: '[data-testid="round-outcome-indicator"]',
  roundScoreBreakdown: '[data-testid="round-score-breakdown"]',
  roundScorePlayerRows: '[data-testid^="round-score-player-"]',
  startNextRoundButton: '[data-testid="start-next-round-button"]',
  viewWinnerButton: '[data-testid="view-winner-button"]',
  returnToLobbyButton: '[data-testid="return-to-lobby-button"]',
  playAgainButton: '[data-testid="play-again-button"]',
  centerTableZone: '[data-testid="center-table-zone"]',
  opponentZones: '[data-testid="opponent-zones"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  tableCards: '[data-testid^="table-card-"]',
  handCards: '[data-testid^="hand-card-"]',
  tableLayoutShell: '[data-testid="table-layout-shell"]',
  contextHeader: '[data-testid="context-header"]',
  liveRegion: '[data-testid="a11y-live-region"]',
};

type EngineFixture =
  | 'pre-final-turn-no-winner'
  | 'round-complete-no-winner'
  | 'round-winner-visibility';

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

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: EngineFixture) => EngineFixtureResult;
    readEngineStateSummary?: () => EngineStateSummary;
  };
}

let configuredPlayerNames: string[] = [];
let fixtureTopScore = 0;
let liveMessageBeforeRoundCompletion = '';
let expectedFocusedButtonTestId = 'start-next-round-button';

const buttonSelectorByLabel = (buttonLabel: string): string => {
  if (buttonLabel === 'Start Next Round') {
    return selectors.startNextRoundButton;
  }

  if (buttonLabel === 'View Winner') {
    return selectors.viewWinnerButton;
  }

  if (buttonLabel === 'Return to Lobby') {
    return selectors.returnToLobbyButton;
  }

  if (buttonLabel === 'Play Again') {
    return selectors.playAgainButton;
  }

  throw new Error(`Unsupported button label: ${buttonLabel}`);
};

const buttonTestIdByLabel = (buttonLabel: string): string => {
  if (buttonLabel === 'Start Next Round') {
    return 'start-next-round-button';
  }

  if (buttonLabel === 'View Winner') {
    return 'view-winner-button';
  }

  if (buttonLabel === 'Return to Lobby') {
    return 'return-to-lobby-button';
  }

  if (buttonLabel === 'Play Again') {
    return 'play-again-button';
  }

  throw new Error(`Unsupported button label: ${buttonLabel}`);
};

const tabUntilFocus = (targetTestId: string, remainingTabs = 30): void => {
  if (remainingTabs <= 0) {
    throw new Error(`Unable to focus ${targetTestId} via keyboard navigation.`);
  }

  cy.focused().then(($element) => {
    const focusedTestId = $element.attr('data-testid');
    if (focusedTestId === targetTestId) {
      return;
    }

    cy.press(Cypress.Keyboard.Keys.TAB);
    tabUntilFocus(targetTestId, remainingTabs - 1);
  });
};

const roundScorePlayerRowByIndex = (index: number): string => {
  return `[data-testid="round-score-player-${index}"]`;
};

const configureLobbyForTwoPlayers = (playerOne: string, playerTwo: string): void => {
  cy.visit('/');
  cy.get(selectors.modeMultiplayer).click();
  cy.get(selectors.playerCount).select('2');
  cy.get(selectors.multiplayerNameOne).clear().type(playerOne);
  cy.get(selectors.multiplayerNameTwo).clear().type(playerTwo);
  configuredPlayerNames = [playerOne, playerTwo];
};

const startGameFromLobby = (): void => {
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

const applyRoundCompleteNoWinnerFixture = (): void => {
  applyEngineFixture('round-complete-no-winner').then((fixtureResult) => {
    if (fixtureResult.roundNumber === undefined || fixtureResult.topScore === undefined) {
      throw new Error('round-complete-no-winner fixture metadata is missing.');
    }

    fixtureTopScore = fixtureResult.topScore;
  });
};

const applyRoundWinnerFixture = (): void => {
  applyEngineFixture('round-winner-visibility').then((fixtureResult) => {
    if (fixtureResult.roundNumber === undefined || fixtureResult.topScore === undefined) {
      throw new Error('round-winner-visibility fixture metadata is missing.');
    }

    fixtureTopScore = fixtureResult.topScore;
  });
};

const applyPreFinalTurnNoWinnerFixture = (): void => {
  applyEngineFixture('pre-final-turn-no-winner').then((fixtureResult) => {
    if (fixtureResult.roundNumber === undefined || fixtureResult.topScore === undefined) {
      throw new Error('pre-final-turn-no-winner fixture metadata is missing.');
    }

    fixtureTopScore = fixtureResult.topScore;
  });
};

Given(
  'a game session has been configured with two players {string} and {string}',
  (playerA: string, playerB: string) => {
    configureLobbyForTwoPlayers(playerA, playerB);
  },
);

Given('the game has been started from the lobby', () => {
  startGameFromLobby();
});

Given("it is the last turn of round 1 with no cards remaining in either player's hand", () => {
  applyPreFinalTurnNoWinnerFixture();
  cy.get(selectors.roundOutcomeIndicator).should('not.exist');
});

Given('the game table has entered the round-complete state after round 2', () => {
  applyRoundCompleteNoWinnerFixture();
});

Given('the game table has entered the round-complete state', () => {
  applyRoundCompleteNoWinnerFixture();
});

Given('the game table is in the round-complete state', () => {
  applyRoundCompleteNoWinnerFixture();
});

Given('a round has ended where {string} earned 0 points in the escobas category', () => {
  applyRoundCompleteNoWinnerFixture();
});

Given(
  'the session was configured with player names {string} and {string}',
  (playerA: string, playerB: string) => {
    cy.get(selectors.scoreboardIndicator)
      .should('contain.text', playerA)
      .and('contain.text', playerB);
  },
);

Given('the game table is in the round-complete state with the score breakdown visible', () => {
  applyRoundCompleteNoWinnerFixture();
  cy.get(selectors.roundScoreBreakdown).should('be.visible');
});

Given('no match winner has been declared', () => {
  cy.get(selectors.viewWinnerButton).should('not.exist');
});

Given('the game table is in an active round', () => {
  applyPreFinalTurnNoWinnerFixture();
  cy.get(selectors.contextHeader).should('be.visible');
  cy.get(selectors.roundOutcomeIndicator).should('not.exist');
  cy.get(selectors.liveRegion)
    .invoke('text')
    .then((text) => {
      liveMessageBeforeRoundCompletion = text.trim();
    });
});

Given('a round has ended with the round result available', () => {
  applyRoundCompleteNoWinnerFixture();
});

Given('a match winner has been declared', () => {
  applyRoundWinnerFixture();
});

Given('the {string} button is visible in the round result area', (buttonLabel: string) => {
  if (buttonLabel === 'Start Next Round') {
    applyRoundCompleteNoWinnerFixture();
    cy.get(selectors.startNextRoundButton).should('be.visible');
    return;
  }

  throw new Error(`Unsupported button label in Given step: ${buttonLabel}`);
});

Given('the player is in the round-complete state at the end of round 1', () => {
  applyPreFinalTurnNoWinnerFixture();
  cy.get(selectors.confirmTurn).should('be.visible').click();
  cy.get(selectors.roundOutcomeIndicator).should('contain.text', 'Round 1');
});

Given(
  'the game table is in the round-complete state with the {string} button visible',
  (buttonLabel: string) => {
    if (buttonLabel !== 'Start Next Round') {
      throw new Error(`Unsupported button label in Given step: ${buttonLabel}`);
    }

    applyRoundCompleteNoWinnerFixture();
    cy.get(selectors.startNextRoundButton).should('be.visible');
  },
);

When('the active player confirms their final turn', () => {
  cy.get(selectors.confirmTurn).should('be.visible').click();
});

When('the player views the HUD', () => {
  cy.get(selectors.contextHeader).should('be.visible');
});

When('the player views the round result area', () => {
  cy.get(selectors.roundOutcomeIndicator).should('be.visible');
});

When('the round-complete state is active and the player views the score breakdown', () => {
  applyRoundCompleteNoWinnerFixture();
  cy.get(selectors.roundScoreBreakdown).should('be.visible');
});

When('the player views the game board', () => {
  cy.get(selectors.tableLayoutShell).should('be.visible');
});

When('the player activates the {string} button', (buttonLabel: string) => {
  cy.get(buttonSelectorByLabel(buttonLabel)).click();
});

When('the active player confirms the final turn of the round', () => {
  cy.get(selectors.confirmTurn).should('be.visible').click();
});

When('the player navigates to the {string} button using the keyboard', (buttonLabel: string) => {
  expectedFocusedButtonTestId = buttonTestIdByLabel(buttonLabel);
  cy.get('body').click('topLeft');
  cy.press(Cypress.Keyboard.Keys.TAB);
  tabUntilFocus(expectedFocusedButtonTestId);
});

When('an assistive technology reads the {string} button', (buttonLabel: string) => {
  if (buttonLabel !== 'Start Next Round') {
    throw new Error(`Unsupported button label in accessibility-read step: ${buttonLabel}`);
  }

  cy.get(selectors.startNextRoundButton).should('exist');
});

Then('the game table enters a visually distinct round-complete state', () => {
  cy.get(selectors.roundOutcomeIndicator).should('be.visible');
  cy.get(selectors.roundScoreBreakdown).should('be.visible');
});

Then('the round result area displays the per-player score breakdown', () => {
  cy.get(selectors.roundScoreBreakdown).should('be.visible');
  cy.get(selectors.roundScorePlayerRows).its('length').should('be.greaterThan', 0);
});

Then('a continuation action button is visible', () => {
  cy.get('body').then(($body) => {
    const startVisible = $body.find(selectors.startNextRoundButton).length > 0;
    const viewVisible = $body.find(selectors.viewWinnerButton).length > 0;
    expect(startVisible || viewVisible).to.equal(true);
  });
});

Then('the round number {string} is visible', (roundNumber: string) => {
  cy.get(selectors.roundOutcomeIndicator).should('contain.text', `Round ${roundNumber}`);
});

Then('the highest individual score earned in that round is visible', () => {
  cy.get(selectors.roundOutcomeIndicator).should('contain.text', `Top score: ${fixtureTopScore}`);
});

Then(
  'for each player the following scoring categories are displayed: escobas, most cards, most Oros, most sevens, Siete de Oros, and total',
  () => {
    cy.get(selectors.roundScorePlayerRows).each(($row) => {
      const rowText = ($row.text() ?? '').trim();
      expect(rowText).to.contain('Escobas:');
      expect(rowText).to.contain('Más cartas:');
      expect(rowText).to.contain('Más oros:');
      expect(rowText).to.contain('Más sietes:');
      expect(rowText).to.contain('Siete de Oros:');
      expect(rowText).to.contain('Total:');
    });
  },
);

Then("each player's name is displayed alongside their score entries", () => {
  cy.get(selectors.roundScorePlayerRows).its('length').should('be.greaterThan', 0);
  cy.get(selectors.roundScorePlayerRows).each(($row) => {
    const lines = ($row.text() ?? '')
      .trim()
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    expect(lines[0]).not.to.equal('');
  });
});

Then("{string}'s escobas score is shown as 0", (playerName: string) => {
  const playerIndex = configuredPlayerNames.indexOf(playerName);
  expect(playerIndex).to.be.greaterThan(-1);

  cy.get(roundScorePlayerRowByIndex(playerIndex)).should('contain.text', 'Escobas: 0');
});

Then("the escobas row is not hidden or omitted from {string}'s breakdown", (playerName: string) => {
  const playerIndex = configuredPlayerNames.indexOf(playerName);
  expect(playerIndex).to.be.greaterThan(-1);

  cy.get(roundScorePlayerRowByIndex(playerIndex)).should('contain.text', 'Escobas:');
});

Then('the name {string} appears in the breakdown', (playerName: string) => {
  cy.get(selectors.roundScoreBreakdown).should('contain.text', playerName);
});

Then('no other player names appear in the breakdown', () => {
  cy.get(selectors.roundScorePlayerRows).then(($rows) => {
    const names = $rows
      .toArray()
      .map((element) => {
        const rowText = (element.textContent ?? '').trim();
        const nameMatch = rowText.match(/^(.*?)(?=Escobas:)/);
        return (nameMatch?.[1] ?? '').trim();
      })
      .filter((name) => name.length > 0);

    expect(names).to.deep.equal(configuredPlayerNames);
  });
});

Then('the table-card zone is rendered and visible', () => {
  cy.get(selectors.centerTableZone).should('be.visible');
});

Then('the opponent zone is rendered and visible', () => {
  cy.get(selectors.opponentZones).should('be.visible');
});

Then('the active hand zone is rendered and visible', () => {
  cy.get(selectors.activeHandZone).should('be.visible');
});

Then('no zones are hidden, collapsed, or artificially disabled', () => {
  cy.get(selectors.tableLayoutShell).should('not.have.attr', 'inert');
  cy.get(selectors.tableLayoutShell).should('not.have.attr', 'aria-hidden', 'true');
});

Then('the round score breakdown is no longer visible', () => {
  cy.get(selectors.roundScoreBreakdown).should('not.exist');
});

Then('the {string} button is no longer visible', (buttonLabel: string) => {
  if (buttonLabel !== 'Start Next Round') {
    throw new Error(`Unsupported button label in not-visible assertion: ${buttonLabel}`);
  }

  cy.get(selectors.startNextRoundButton).should('not.exist');
});

Then('the {string} button is visible', (buttonLabel: string) => {
  cy.get(buttonSelectorByLabel(buttonLabel)).should('be.visible');
});

Then('the {string} button is not visible', (buttonLabel: string) => {
  cy.get(buttonSelectorByLabel(buttonLabel)).should('not.exist');
});

Then('only one of the two continuation buttons is shown at any time', () => {
  cy.get('body').then(($body) => {
    const startCount = $body.find(selectors.startNextRoundButton).length;
    const viewCount = $body.find(selectors.viewWinnerButton).length;
    expect(startCount + viewCount).to.equal(1);
  });
});

Then("the game engine's startNextRound action is triggered", () => {
  readEngineStateSummary().then((summary) => {
    expect(summary.roundResultPresent).to.equal(false);
    expect(summary.turnPhase).to.equal('awaiting-card-play');
  });
});

Then('the round score breakdown disappears', () => {
  cy.get(selectors.roundScoreBreakdown).should('not.exist');
});

Then('the {string} button disappears', (buttonLabel: string) => {
  if (buttonLabel !== 'Start Next Round') {
    throw new Error(`Unsupported button label in disappear assertion: ${buttonLabel}`);
  }

  cy.get(selectors.startNextRoundButton).should('not.exist');
});

Then('{int} fresh cards are visible on the table', (count: number) => {
  cy.get(selectors.tableCards).should('have.length', count);
});

Then('each player has {int} hand cards', (count: number) => {
  readEngineStateSummary().then((summary) => {
    expect(summary.handCardCounts.length).to.be.greaterThan(0);
    summary.handCardCounts.forEach((handCount) => {
      expect(handCount).to.equal(count);
    });
  });
});

Then('the round number shown in the HUD is {int}', (roundNumber: number) => {
  cy.get(selectors.currentRoundIndicator).should('contain.text', `Round: ${roundNumber}`);
});

Then('the button receives keyboard focus', () => {
  cy.focused().should('have.attr', 'data-testid', expectedFocusedButtonTestId);
});

Then('activating the button by keyboard triggers the start-next-round action', () => {
  cy.focused().type('{enter}');

  readEngineStateSummary().then((summary) => {
    expect(summary.roundResultPresent).to.equal(false);
  });
});

Then('the button exposes an accessible label written in Spanish', () => {
  cy.get(selectors.startNextRoundButton)
    .should('have.attr', 'aria-label')
    .and('equal', 'Empezar siguiente ronda');
});

Then('a live-region announcement is made indicating that the round has been completed', () => {
  cy.get(selectors.liveRegion)
    .invoke('text')
    .then((text) => {
      const message = text.trim();
      expect(message).not.to.equal(liveMessageBeforeRoundCompletion);
      expect(message).to.contain('Ronda');
      expect(message).to.contain('completada');
    });
});
