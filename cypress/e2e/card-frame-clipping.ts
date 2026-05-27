import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01, SC-04, SC-05, SC-08
// FR-1, FR-2, TR-1, US-1, US-2

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  handCards: '[data-testid^="hand-card-"]',
  tableCards: '[data-testid^="table-card-"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  centerTableZone: '[data-testid="center-table-zone"]',
};

/** 44 px = 2.75 rem at 16 px/rem — the declared min-inline-size / min-block-size */
const MIN_TOUCH_TARGET_PX = 44;

Given('a single-player game is active on the game table', () => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.activeHandZone).should('be.visible');
  cy.get(selectors.handCards).should('have.length.greaterThan', 0);
});

/**
 * RV-02: Set a representative mobile portrait viewport so SC-01 and SC-05
 * formally match the "mobile viewport in portrait orientation" context from bdd-test.md.
 * 390×844 is a common representative size (iPhone 14-class portrait).
 */
Given('the viewport is set to a representative mobile portrait size', () => {
  cy.viewport(390, 844);
});

When('the active hand zone is displayed in the idle state', () => {
  cy.get(selectors.activeHandZone).should('be.visible');
});

When('the center table zone is displayed in the idle state', () => {
  cy.get(selectors.centerTableZone).should('be.visible');
});

Then('the hand card button computed overflow is not hidden', () => {
  cy.get(selectors.handCards).each(($btn) => {
    cy.wrap($btn).then(($el) => {
      const style = window.getComputedStyle($el[0]);
      expect(style.overflow, 'hand-card-button overflow must not be hidden').not.to.equal('hidden');
      expect(style.overflowX, 'hand-card-button overflowX must not be hidden').not.to.equal(
        'hidden',
      );
      expect(style.overflowY, 'hand-card-button overflowY must not be hidden').not.to.equal(
        'hidden',
      );
    });
  });
});

Then('each hand card button meets the minimum touch target size', () => {
  cy.get(selectors.handCards).each(($btn) => {
    cy.wrap($btn).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width, 'hand-card-button width must meet minimum touch target').to.be.gte(
        MIN_TOUCH_TARGET_PX,
      );
      expect(rect.height, 'hand-card-button height must meet minimum touch target').to.be.gte(
        MIN_TOUCH_TARGET_PX,
      );
    });
  });
});

Then('the table card button computed overflow is not hidden', () => {
  cy.get(selectors.tableCards).each(($btn) => {
    cy.wrap($btn).then(($el) => {
      const style = window.getComputedStyle($el[0]);
      expect(style.overflow, 'table-card button overflow must not be hidden').not.to.equal(
        'hidden',
      );
      expect(style.overflowX, 'table-card button overflowX must not be hidden').not.to.equal(
        'hidden',
      );
      expect(style.overflowY, 'table-card button overflowY must not be hidden').not.to.equal(
        'hidden',
      );
    });
  });
});

Then('each table card button meets the minimum touch target size', () => {
  cy.get(selectors.tableCards).each(($btn) => {
    cy.wrap($btn).then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.width, 'table-card button width must meet minimum touch target').to.be.gte(
        MIN_TOUCH_TARGET_PX,
      );
      expect(rect.height, 'table-card button height must meet minimum touch target').to.be.gte(
        MIN_TOUCH_TARGET_PX,
      );
    });
  });
});
