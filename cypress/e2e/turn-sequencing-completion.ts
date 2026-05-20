import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-17, SC-18, SC-19

interface TurnSequencingSummary {
  turnPhase: string;
  turnSequenceState: 'awaiting-animation-completion' | 'paused' | 'ready-to-confirm' | 'recovered';
  pauseMs?: number;
  reducedMotion?: boolean;
}

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    readTurnSequencingSummary?: () => TurnSequencingSummary;
    applyTurnSequencingFixture?: (
      fixture: 'completed-animation' | 'missing-completion' | 'reduced-motion',
    ) => void;
  };
}

const selectors = {
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  multiplayerNameOne: '[data-testid="multiplayer-name-1"]',
  multiplayerNameTwo: '[data-testid="multiplayer-name-2"]',
  playButton: '[data-testid="play-button"]',
};

const getTurnSequencingSummary = (): Cypress.Chainable<TurnSequencingSummary> => {
  return cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi || typeof testApi.readTurnSequencingSummary !== 'function') {
      throw new Error('readTurnSequencingSummary test seam is unavailable.');
    }

    return testApi.readTurnSequencingSummary();
  });
};

const applyFixture = (
  fixture: 'completed-animation' | 'missing-completion' | 'reduced-motion',
): void => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi || typeof testApi.applyTurnSequencingFixture !== 'function') {
      throw new Error('applyTurnSequencingFixture test seam is unavailable.');
    }

    testApi.applyTurnSequencingFixture(fixture);
  });
};

Given(
  'a game session has been configured with two players {string} and {string}',
  (playerA: string, playerB: string) => {
    cy.visit('/');
    cy.get(selectors.modeMultiplayer).click();
    cy.get(selectors.playerCount).select('2');
    cy.get(selectors.multiplayerNameOne).clear().type(playerA);
    cy.get(selectors.multiplayerNameTwo).clear().type(playerB);
  },
);

Given('the game has been started from the lobby', () => {
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
});

Given('an action animation has just completed', () => {
  applyFixture('completed-animation');
});

Given('the next turn phase has not started yet', () => {
  getTurnSequencingSummary().its('turnSequenceState').should('eq', 'paused');
});

When('the transition pause is evaluated', () => {
  getTurnSequencingSummary().its('pauseMs').should('be.a', 'number');
});

Then('the game waits for a pause within 500 to 800 milliseconds', () => {
  getTurnSequencingSummary().its('pauseMs').should('be.within', 500, 800);
});

Then('the next phase starts only after the pause completes', () => {
  getTurnSequencingSummary().its('turnSequenceState').should('eq', 'ready-to-confirm');
});

Given('an action animation fails to emit a completion signal', () => {
  applyFixture('missing-completion');
});

When('transition orchestration evaluates timeout or fallback handling', () => {
  getTurnSequencingSummary().then(() => undefined);
});

Then('the game does not remain permanently blocked in the transition state', () => {
  getTurnSequencingSummary()
    .its('turnSequenceState')
    .should('not.eq', 'awaiting-animation-completion');
});

Then('progression recovers to a valid next phase behavior', () => {
  getTurnSequencingSummary().its('turnSequenceState').should('eq', 'recovered');
});

Given('reduced-motion preference is enabled', () => {
  applyFixture('reduced-motion');
});

Given('an action has resolved with instant visual updates', () => {
  getTurnSequencingSummary().its('reducedMotion').should('eq', true);
});

When('transition orchestration runs', () => {
  getTurnSequencingSummary()
    .its('turnSequenceState')
    .should('not.eq', 'awaiting-animation-completion');
});

Then('the game still enforces a pause within 500 to 800 milliseconds', () => {
  getTurnSequencingSummary().its('pauseMs').should('be.within', 500, 800);
});

Then('the next phase starts only after pause completion', () => {
  getTurnSequencingSummary().its('turnSequenceState').should('eq', 'ready-to-confirm');
});
