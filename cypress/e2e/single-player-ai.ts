import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-06, SC-10, SC-11, SC-14, SC-15, SC-16, SC-18, SC-19, SC-23, SC-28, SC-33, SC-43, SC-44, SC-45, SC-46, SC-47

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  aiDifficulty: '[data-testid="ai-difficulty"]',
  gameTablePage: '[data-testid="game-table-page"]',
  opponentZones: '[data-testid="opponent-zones"]',
  aiHandZone: '[data-testid="ai-hand-zone"]',
  aiHandCards: '[data-testid^="ai-hand-card-"]',
  handCards: '[data-testid^="hand-card-"]',
  tableCards: '[data-testid^="table-card-"]',
  centerTableZone: '[data-testid="center-table-zone"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  liveRegion: '[data-testid="a11y-live-region"]',
  roundOutcomeIndicator: '[data-testid="round-outcome-indicator"]',
  matchOverOverlay: '[data-testid="match-over-overlay"]',
  winnerTitle: '[data-testid="match-over-title"]',
  scoreboard: '[data-testid="scoreboard-indicator"]',
  turnHandoffOverlay: '[data-testid="turn-handoff-overlay"]',
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  selectedCardVisual: '.card-visual--selected',
};

type EngineFixture =
  | 'ai-turn-escoba'
  | 'ai-turn-capture'
  | 'ai-turn-placement'
  | 'round-winner-visibility-ai'
  | 'round-complete-no-winner'
  | 'round-winner-visibility';

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: EngineFixture) => unknown;
  };
}

let lastEngineFixtureResult: EngineFixture | null = null;

const openSinglePlayerGame = (): void => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.gameTablePage).should('be.visible');
};

const openSinglePlayerGameWithDifficulty = (difficulty: string): void => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get('[data-testid="single-player-name"]').should('be.visible');
  cy.get(selectors.aiDifficulty).should('be.visible').select(difficulty);
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
  cy.get(selectors.gameTablePage).should('be.visible');
};

const applyEngineFixture = (fixture: EngineFixture): void => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error('Escobita test API is unavailable for engine fixture setup.');
    }

    testApi.applyEngineFixture(fixture);
    lastEngineFixtureResult = fixture;
  });
};

const applyFixtureWithVirtualTime = (fixture: EngineFixture, ticksMs: number): void => {
  let installedClock: Cypress.Clock | null = null;

  cy.clock().then((clock) => {
    installedClock = clock;
  });

  applyEngineFixture(fixture);
  cy.then(() => {
    cy.tick(ticksMs);
  });
  cy.then(() => {
    installedClock?.restore();
  });
};

const waitForAiAnimation = (): void => {
  cy.get(selectors.activeHandZone).should('be.visible');
  cy.get(selectors.aiHandZone).should('have.class', 'ai-hand-zone--active');
};

Given('a single player game has been started', () => {
  openSinglePlayerGame();
  cy.get(selectors.opponentZones).should('be.visible');
});

Given('a single player game has been started on {word} difficulty', (difficulty: string) => {
  openSinglePlayerGameWithDifficulty(difficulty);
  cy.get(selectors.opponentZones).should('be.visible');
});

When('the capture fixture is applied', () => {
  applyEngineFixture('ai-turn-capture');
});

When('the placement fixture is applied', () => {
  applyEngineFixture('ai-turn-placement');
});

When('the {string} fixture is applied', (fixture: string) => {
  if (fixture === 'ai-turn-escoba') {
    applyFixtureWithVirtualTime('ai-turn-escoba', 3000);
    return;
  }

  applyEngineFixture(fixture as EngineFixture);
});

When('the AI animation completes', () => {
  cy.get(selectors.liveRegion)
    .invoke('text')
    .should('match', /Laia\s+/);
  cy.get('[data-testid="next-turn-reveal"]').should('contain.text', 'Next turn:');
});

When('the round-complete fixture is applied', () => {
  applyEngineFixture('round-complete-no-winner');
});

When('the Laia winner fixture is applied', () => {
  applyEngineFixture('round-winner-visibility-ai');
  cy.get('[data-testid="view-winner-button"]').should('be.visible').click();
});

When('the human winner fixture is applied', () => {
  applyEngineFixture('round-winner-visibility');
  cy.get('[data-testid="view-winner-button"]').should('be.visible').click();
});

When('the player returns to the lobby from the match over overlay', () => {
  cy.get('[data-testid="return-to-lobby-button"]').should('be.visible').click();
});

Then("Laia's turn begins automatically", () => {
  cy.get(selectors.aiHandZone).should('be.visible');
  cy.get(selectors.aiHandZone).should('have.class', 'ai-hand-zone--active');
  cy.get(selectors.liveRegion).should('contain.text', 'Laia');
});

Then("Laia's hand zone becomes active", () => {
  waitForAiAnimation();
});

Then('one AI hand card is highlighted', () => {
  cy.get(selectors.aiHandZone).should('have.class', 'ai-hand-zone--active');
  cy.get(selectors.aiHandCards).should('have.length.greaterThan', 0);
});

Then('the selected card is revealed face up', () => {
  cy.get(selectors.aiHandCards).first().should('not.have.attr', 'aria-label', 'Carta oculta');
});

Then('the selected card remains face down', () => {
  cy.get(selectors.aiHandCards).should('have.length.greaterThan', 0);
  cy.get(selectors.aiHandCards).first().should('have.attr', 'aria-label', 'Carta oculta');
});

Then('the table capture subset is highlighted', () => {
  cy.get(`${selectors.tableCards}[aria-selected="true"]`).should('have.length.greaterThan', 0);
  cy.get(selectors.centerTableZone)
    .find(selectors.selectedCardVisual)
    .should('have.length.greaterThan', 0);
});

Then('the human controls are disabled', () => {
  waitForAiAnimation();
  cy.get(selectors.handCards).first().should('be.disabled');
  cy.get(selectors.submitPlay).should('be.disabled');
  cy.get(selectors.confirmTurn).should('be.disabled');
});

Then('the {string} button is visually disabled', (buttonLabel: string) => {
  const selector = buttonLabel === 'Submit Play' ? selectors.submitPlay : selectors.confirmTurn;
  cy.get(selector).should('be.disabled');
});

Then('neither button can be activated by the human', () => {
  cy.get(selectors.submitPlay).click({ force: true });
  cy.get(selectors.confirmTurn).click({ force: true });
  cy.get(selectors.submitPlay).should('be.disabled');
  cy.get(selectors.confirmTurn).should('be.disabled');
});

Then('the human controls are re-enabled', () => {
  cy.get(selectors.handCards).first().should('not.be.disabled').click();
  cy.get('[data-testid="active-hand-card-0"]').should('have.attr', 'aria-pressed', 'true');

  cy.get(selectors.tableCards).first().should('not.be.disabled').click();
  cy.get(selectors.tableCards).first().should('have.attr', 'aria-selected', 'true');

  cy.get(selectors.tableCards).first().click();
  cy.get(selectors.submitPlay).should('not.be.disabled');
});

Then('all AI hand cards are face down', () => {
  cy.get(selectors.aiHandCards).should('have.length.greaterThan', 0);
  cy.get(selectors.aiHandCards).each(($card) => {
    cy.wrap($card).should('have.attr', 'aria-label', 'Carta oculta');
  });
});

Then('the selected AI card is face up', () => {
  cy.get(selectors.aiHandCards).first().should('not.have.attr', 'aria-label', 'Carta oculta');
});

Then('no table cards are revealed', () => {
  cy.get(selectors.tableCards).should('have.length.greaterThan', 0);
  cy.get(`${selectors.tableCards}[aria-selected="true"]`).should('have.length', 0);
  cy.get(selectors.centerTableZone).find(selectors.selectedCardVisual).should('have.length', 0);
});

Then("Laia's decision is an escoba", () => {
  cy.get(selectors.liveRegion).should('contain.text', '¡Escoba!');
});

Then('the round result is visible for both players', () => {
  cy.get(selectors.roundOutcomeIndicator).should('be.visible');
  cy.get(selectors.scoreboard).should('be.visible');
  cy.get(selectors.scoreboard).should('contain.text', 'Jugador-1');
  cy.get(selectors.scoreboard).should('contain.text', 'Laia');
  cy.get('[data-testid^="score-item-"] .score-value').should('have.length.greaterThan', 1);
});

Then('the match over overlay shows the winner name', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
  cy.get(selectors.winnerTitle).should('contain.text', 'Partida terminada');
  cy.get('[data-testid="winner-name-0"]').should('contain.text', 'Laia');
});

Then('the winner appears in the match over overlay', () => {
  cy.get(selectors.matchOverOverlay).should('be.visible');
  const expectedWinnerName =
    lastEngineFixtureResult === 'round-winner-visibility' ? 'Jugador-1' : 'Laia';
  cy.get('[data-testid="winner-name-0"]').should('contain.text', expectedWinnerName);
});

Then('the handoff overlay is never displayed', () => {
  cy.get(selectors.turnHandoffOverlay).should('not.exist');
});

Then('turns advance without handoff interruption', () => {
  cy.get('[data-testid="next-turn-reveal"]').should('be.visible');
  cy.get(selectors.turnHandoffOverlay).should('not.exist');
});

Then('the Lobby screen is displayed', () => {
  cy.location('pathname').should('eq', '/');
  cy.get(selectors.modeSingle).should('be.visible');
  cy.get(selectors.modeMultiplayer).should('be.visible');
});
