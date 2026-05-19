import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01, SC-04, SC-12

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: 'ai-turn-capture') => unknown;
  };
}

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  handCardVisuals: '[data-testid^="hand-card-"] app-card-visual',
  tableCardVisuals: '[data-testid^="table-card-"] app-card-visual',
  aiCardVisuals: '[data-testid^="ai-hand-card-"]',
};

Given('a single player game has been started for zone animation metadata checks', () => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
});

When('the capture fixture is applied for zone animation metadata checks', () => {
  // This scenario validates the full integration chain: engine fixture -> orchestrator metadata -> zone bindings -> DOM classes.
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error('Escobita test API is unavailable for zone animation metadata checks.');
    }

    testApi.applyEngineFixture('ai-turn-capture');
  });
});

Then('hand cards show play or deal animation classes', () => {
  cy.get(selectors.handCardVisuals)
    .filter('.card-visual--animation-play, .card-visual--animation-deal')
    .should('have.length.greaterThan', 0);
});

Then('table cards show capture animation classes', () => {
  cy.get(selectors.tableCardVisuals)
    .filter('.card-visual--animation-capture')
    .should('have.length.greaterThan', 0);
});

Then('opponent cards show opponent animation classes', () => {
  cy.get(selectors.aiCardVisuals)
    .filter('.card-visual--animation-opponent')
    .should('have.length.greaterThan', 0);
});
