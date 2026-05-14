import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01, SC-15, SC-26, SC-29

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  gameTablePage: '[data-testid="game-table-page"]',
  activePlayerIndicator: '[data-testid="active-player-indicator"]',
  scoreItems: '[data-testid^="score-item-"]',
  handCards: '[data-testid^="hand-card-"]',
  tableCards: '[data-testid^="table-card-"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  turnPhaseIndicator: '[data-testid="turn-phase-indicator"]',
  contextHeader: '[data-testid="context-header"]',
  escobaOutcomeIndicator: '[data-testid="escoba-outcome-indicator"]',
  roundOutcomeIndicator: '[data-testid="round-outcome-indicator"]',
  matchWinnerIndicator: '[data-testid="match-winner-indicator"]',
};

let tableCardCountBeforeAction = 0;
let injectedRoundNumber = 0;
let injectedWinnerName = '';
let injectedTopScore = 0;
let injectedEscobaPlayerName = '';
let injectedEscobaCount = 0;

type EngineFixture =
  | 'escoba-visibility'
  | 'round-winner-visibility'
  | 'ai-turn-escoba'
  | 'ai-turn-capture';

interface EngineFixtureResult {
  escobaPlayerName?: string;
  escobaCount?: number;
  roundNumber?: number;
  winnerName?: string;
  topScore?: number;
}

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: EngineFixture) => EngineFixtureResult;
  };
}

const openSinglePlayerGame = (): void => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
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

Given('a valid game session configuration exists', () => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
});

When('the user navigates to the partida route', () => {
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
});

Then('the game table screen is displayed', () => {
  cy.get(selectors.gameTablePage).should('be.visible');
  cy.get(selectors.handCards).should('have.length.greaterThan', 0);
  cy.get(selectors.scoreItems).should('have.length.greaterThan', 0);
});

Then('the old placeholder view is not displayed', () => {
  cy.get('#placeholder-title').should('not.exist');
});

Given('game-engine signals change after an action', () => {
  openSinglePlayerGame();

  cy.get(selectors.tableCards)
    .its('length')
    .then((count) => {
      tableCardCountBeforeAction = count;
    });

  cy.get(selectors.handCards).first().click();
  cy.get(selectors.submitPlay).click();
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-confirmation');
  cy.get(selectors.confirmTurn).click();
});

When('the table re-renders', () => {
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-card-play');
});

Then('visible state is synchronized with engine outputs', () => {
  cy.get(selectors.activePlayerIndicator)
    .invoke('text')
    .then((activePlayerText) => {
      expect(activePlayerText.trim()).to.contain('Active player:');
    });

  cy.get(selectors.tableCards)
    .its('length')
    .should('eq', tableCardCountBeforeAction + 1);
  cy.get(selectors.scoreItems).should('have.length.greaterThan', 0);
});

Given('engine provides a table-clearing escoba state', () => {
  injectedEscobaPlayerName = '';
  injectedEscobaCount = 0;

  openSinglePlayerGame();

  applyEngineFixture('escoba-visibility').then((fixtureResult) => {
    injectedEscobaPlayerName = fixtureResult.escobaPlayerName ?? '';
    injectedEscobaCount = fixtureResult.escobaCount ?? 0;
  });
});

Given('engine provides round-result or winner state', () => {
  injectedRoundNumber = 0;
  injectedWinnerName = '';
  injectedTopScore = 0;

  openSinglePlayerGame();

  applyEngineFixture('round-winner-visibility').then((fixtureResult) => {
    injectedRoundNumber = fixtureResult.roundNumber ?? 0;
    injectedWinnerName = fixtureResult.winnerName ?? '';
    injectedTopScore = fixtureResult.topScore ?? 0;
  });
});

When('table context is rendered', () => {
  cy.get(selectors.contextHeader).should('be.visible');
});

Then('round and winner outcomes are visible without rule duplication in UI', () => {
  cy.get(selectors.roundOutcomeIndicator)
    .should('be.visible')
    .and('contain.text', `Round ${injectedRoundNumber}`)
    .and('contain.text', `Top score: ${injectedTopScore}`);

  cy.get(selectors.matchWinnerIndicator)
    .should('be.visible')
    .and('contain.text', injectedWinnerName);
});

Then('escoba outcome is visible in game state context', () => {
  cy.get(selectors.escobaOutcomeIndicator)
    .should('be.visible')
    .and('contain.text', 'Escoba')
    .and('contain.text', injectedEscobaPlayerName)
    .and('contain.text', String(injectedEscobaCount));
});
