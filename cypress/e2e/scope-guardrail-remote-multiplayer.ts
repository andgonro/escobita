import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-28

const selectors = {
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  playButton: '[data-testid="play-button"]',
  handCards: '[data-testid^="hand-card-"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  handoffOverlay: '[data-testid="turn-handoff-overlay"]',
  handoffAcknowledge: '[data-testid="handoff-acknowledge"]',
  opponentZones: '[data-testid="opponent-zones"]',
};

Given('a multiplayer game is in progress for scope guardrail verification', () => {
  cy.visit('/');
  cy.get(selectors.modeMultiplayer).click();
  cy.get(selectors.playerCount).select('2');
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.opponentZones).should('be.visible');
});

When('a local multiplayer turn is completed', () => {
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.confirmTurn).focus().type('{enter}');

  cy.get('body').then(($body) => {
    if ($body.find(selectors.handoffOverlay).length > 0) {
      cy.get(selectors.handoffAcknowledge).focus().type('{enter}');
    }
  });
});

Then('opponent animation scope is explicitly marked as single-player AI only', () => {
  cy.get(selectors.opponentZones).should(
    'have.attr',
    'data-opponent-animation-scope',
    'single-player-ai-only',
  );
});

Then('the scope guardrail marker remains explicit after multiplayer turn completion', () => {
  cy.get(selectors.opponentZones).should(
    'have.attr',
    'data-opponent-animation-scope',
    'single-player-ai-only',
  );
});
