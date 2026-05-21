import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-07, SC-08, SC-12

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  gameTablePage: '[data-testid="game-table-page"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  handCardZero: '[data-testid="hand-card-0"]',
  aiHandZone: '[data-testid="ai-hand-zone"]',
  turnPhaseIndicator: '[data-testid="turn-phase-indicator"]',
};

// ─── Background steps ────────────────────────────────────────────────────────

Given('a single-player game session has been configured', () => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.gameTablePage).should('be.visible');
});

Given('the game has been started and the player has taken a turn', () => {
  // Wait until it is the player turn and submit a card play to reach confirm state
  cy.get(selectors.submitPlay, { timeout: 12000 }).should('be.visible');
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-card-play');
  cy.get(selectors.handCardZero).click();
  cy.get(selectors.submitPlay).click();
  cy.get(selectors.confirmTurn, { timeout: 8000 }).should('be.visible');
});

// ─── SC-07 ────────────────────────────────────────────────────────────────────

Given('the player hand is ready to receive new cards after a turn', () => {
  cy.get(selectors.confirmTurn).should('be.visible');
});

When('the turn is confirmed and deal resolves', () => {
  cy.get(selectors.confirmTurn).click();
  // Brief window after confirm where deal animation is active
  cy.get(selectors.activeHandZone).should('exist');
});

Then('each new hand card carries the deal animation class', () => {
  cy.get(`${selectors.activeHandZone} [data-testid="card-visual"]`, { timeout: 6000 }).then(
    ($cards) => {
      const dealCards = $cards.toArray().filter((el) => {
        return (el as HTMLElement).classList.contains('card-visual--animation-deal');
      });
      expect(dealCards.length).to.be.greaterThan(0);
    },
  );
});

Then('dealt cards are interactable after animation completes', () => {
  cy.get(selectors.turnPhaseIndicator, { timeout: 10000 }).should(
    'contain.text',
    'awaiting-card-play',
  );
  cy.get(`${selectors.activeHandZone} [data-testid^="hand-card-"]`).first().should('be.visible');
});

// ─── SC-08 ────────────────────────────────────────────────────────────────────

Given('three cards are being dealt to the player hand', () => {
  cy.get(selectors.confirmTurn).should('be.visible');
});

When('the deal action resolves', () => {
  cy.get(selectors.confirmTurn).click();
  cy.get(selectors.activeHandZone).should('exist');
});

Then('all three newly dealt hand cards show the deal animation simultaneously', () => {
  cy.get(`${selectors.activeHandZone} [data-testid="card-visual"]`, { timeout: 6000 }).then(
    ($cards) => {
      const dealCards = $cards
        .toArray()
        .filter((el) => (el as HTMLElement).classList.contains('card-visual--animation-deal'));
      expect(dealCards.length).to.equal(3);
    },
  );
});

Then('no dealt card animation delay differs from another', () => {
  cy.get(`${selectors.activeHandZone} .card-visual--animation-deal`, { timeout: 6000 }).then(
    ($cards) => {
      const delays = $cards
        .toArray()
        .map((el) => getComputedStyle(el).getPropertyValue('animation-delay').trim());
      const uniqueDelays = new Set(delays);
      expect(uniqueDelays.size).to.equal(1);
    },
  );
});

// ─── SC-12 ────────────────────────────────────────────────────────────────────

Given('it is the AI opponent turn in single-player mode', () => {
  // After player confirms, AI turn begins automatically
  cy.get(selectors.confirmTurn).click();
  // Wait until AI has played and it is the player turn again; capture the brief AI animation window
  // by checking within the AI hand zone during the AI resolving phase
  cy.get(selectors.aiHandZone, { timeout: 8000 }).should('exist');
});

When('the AI performs a play action', () => {
  // Wait for AI resolving phase — animation window is brief, checked in the Then steps
  cy.get(selectors.aiHandZone).should('be.visible');
});

Then('the AI played card carries the opponent animation class', () => {
  cy.get(`${selectors.aiHandZone} [data-testid="card-visual"]`, { timeout: 8000 }).then(
    ($cards) => {
      const opponentCards = $cards
        .toArray()
        .filter((el) => (el as HTMLElement).classList.contains('card-visual--animation-opponent'));
      expect(opponentCards.length).to.be.greaterThan(0);
    },
  );
});

Then('the opponent animation duration is within 800 to 1200 milliseconds', () => {
  cy.get(`${selectors.aiHandZone} .card-visual--animation-opponent`, { timeout: 8000 })
    .first()
    .then(($el) => {
      const duration = getComputedStyle($el[0] as Element)
        .getPropertyValue('animation-duration')
        .trim();
      const ms = duration.endsWith('ms')
        ? Number.parseFloat(duration)
        : Number.parseFloat(duration) * 1000;
      expect(ms).to.be.within(800, 1200);
    });
});

Then('the opponent animation timing uses a natural ease-in-out motion profile', () => {
  cy.get(`${selectors.aiHandZone} .card-visual--animation-opponent`, { timeout: 8000 })
    .first()
    .then(($el) => {
      const timing = getComputedStyle($el[0] as Element)
        .getPropertyValue('animation-timing-function')
        .trim();
      expect(timing).to.contain('cubic-bezier');
    });
});
