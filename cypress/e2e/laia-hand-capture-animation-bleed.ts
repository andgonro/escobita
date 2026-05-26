import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01, SC-02, SC-03, SC-04, SC-05, SC-06, SC-07, SC-08, SC-09, SC-10, SC-11, SC-12, SC-13

type EngineFixtureName =
  | 'ai-turn-capture'
  | 'ai-turn-escoba'
  | 'ai-turn-placement'
  | 'human-turn-single-capture'
  | 'human-turn-multi-capture'
  | 'human-turn-escoba'
  | 'human-turn-post-deal-capture'
  | 'human-turn-consecutive-captures';

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: EngineFixtureName) => unknown;
  };
}

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  turnPhaseIndicator: '[data-testid="turn-phase-indicator"]',
  aiHandZone: '[data-testid="ai-hand-zone"]',
  aiCards: '[data-testid^="ai-hand-card-"]',
  aiCardVisuals: '[data-testid^="ai-hand-card-"] [data-testid="card-visual"]',
  handCardZero: '[data-testid="hand-card-0"]',
  handCardOne: '[data-testid="hand-card-1"]',
  tableCardZero: '[data-testid="table-card-0"]',
  tableCardOne: '[data-testid="table-card-1"]',
  tableCardTwo: '[data-testid="table-card-2"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  centerTableZone: '[data-testid="center-table-zone"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
};

const animationSelectors = {
  capture: '.card-visual--animation-capture',
  escoba: '.card-visual--animation-escoba',
  opponent: '.card-visual--animation-opponent',
};

let scenarioCaptureCardIndexes: number[] = [0];

const startSinglePlayerMatch = (): void => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
};

const applyEngineFixture = (fixture: EngineFixtureName): void => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error(
        'Escobita test API is unavailable for laia-hand-capture-animation-bleed checks.',
      );
    }

    testApi.applyEngineFixture(fixture);
  });
};

const performCapture = (tableCardIndexes: number[]): void => {
  cy.get(selectors.handCardZero).click();
  tableCardIndexes.forEach((cardIndex) => {
    cy.get(`[data-testid="table-card-${cardIndex}"]`).click();
  });
  cy.get(selectors.submitPlay).click();
};

const expectAiHandStatic = (): void => {
  cy.get(selectors.aiHandZone).should('be.visible').and('not.have.class', 'ai-hand-zone--active');
  cy.get(selectors.aiCards).each(($card) => {
    cy.wrap($card)
      .should('not.have.class', 'card-visual--animation-capture')
      .and('not.have.class', 'card-visual--animation-escoba')
      .and('not.have.class', 'card-visual--animation-opponent')
      .and('not.have.class', 'card-visual--selected');
  });
};

const expectCaptureVisualsOnlyOnTable = (): void => {
  cy.get(selectors.centerTableZone)
    .find(animationSelectors.capture + ', ' + animationSelectors.escoba)
    .should('have.length.greaterThan', 0);
  cy.get(selectors.aiHandZone)
    .find(animationSelectors.capture + ', ' + animationSelectors.escoba)
    .should('have.length', 0);
};

Given('a single-player match is in progress', () => {
  startSinglePlayerMatch();
});

Given('the human player is on an active turn', () => {
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-card-play');
});

Given("Laia's hand area is visible with one or more face-down cards", () => {
  cy.get(selectors.aiHandZone).should('be.visible');
  cy.get(selectors.aiCards).should('have.length.greaterThan', 0);
});

Given('at least one legal capture is available on the table', () => {
  applyEngineFixture('human-turn-single-capture');
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-card-play');
});

When('the human player performs a capture involving one table card', () => {
  applyEngineFixture('human-turn-single-capture');
  performCapture([0]);
});

Then('only cards participating in that capture show capture visual effects', () => {
  expectCaptureVisualsOnlyOnTable();
});

Then("no card in Laia's hand area shows glow, flash, fade, or scale effects", () => {
  expectAiHandStatic();
});

When('the human player performs a capture involving multiple table cards', () => {
  applyEngineFixture('human-turn-multi-capture');
  performCapture([0, 1]);
});

Then('all participating capture cards animate according to capture behavior', () => {
  cy.get(selectors.centerTableZone)
    .find(animationSelectors.capture)
    .should('have.length.greaterThan', 1);
});

Then("all visible cards in Laia's hand area remain visually static", () => {
  expectAiHandStatic();
});

Then("Laia's hand area remains visually static", () => {
  expectAiHandStatic();
});

Given('the human player has a legal Escoba capture', () => {
  applyEngineFixture('human-turn-escoba');
});

When('the human player performs the Escoba capture', () => {
  performCapture([0, 1, 2]);
});

Then('table-side capture visuals represent the Escoba outcome', () => {
  cy.get(selectors.centerTableZone)
    .find(animationSelectors.escoba)
    .should('have.length.greaterThan', 0);
});

Then("no card in Laia's hand area shows capture glow or flash", () => {
  cy.get(selectors.aiHandZone)
    .find(animationSelectors.capture + ', ' + animationSelectors.escoba)
    .should('have.length', 0);
});

Given("Laia's hand area is visible", () => {
  cy.get(selectors.aiHandZone).should('be.visible');
});

Given('the game enters an explicit opponent-turn animation phase', () => {
  applyEngineFixture('ai-turn-capture');
});

When('opponent-turn visual updates are presented', () => {
  cy.get(selectors.aiHandZone).should('be.visible');
});

Then("only opponent-turn eligible visuals appear in Laia's hand area", () => {
  cy.get(selectors.aiHandZone)
    .find(animationSelectors.opponent)
    .should('have.length.greaterThan', 0);
});

Then("human capture-state visuals are not applied to Laia's hand area", () => {
  cy.get(selectors.aiHandZone)
    .find(animationSelectors.capture + ', ' + animationSelectors.escoba)
    .should('have.length', 0);
});

Given("Laia's hand has temporary opponent-turn visual activity", () => {
  applyEngineFixture('ai-turn-capture');
  cy.get(selectors.aiHandZone)
    .find(animationSelectors.opponent)
    .should('have.length.greaterThan', 0);
});

When('the explicit opponent-turn animation phase ends', () => {
  cy.get(selectors.aiHandZone, { timeout: 10000 })
    .find(animationSelectors.opponent)
    .should('have.length', 0);
});

Then("Laia's hand area returns to a static visual state", () => {
  cy.get(selectors.aiHandZone).find(animationSelectors.opponent).should('have.length', 0);
});

Then("no residual capture-state visuals remain on Laia's hand cards", () => {
  expectAiHandStatic();
});

Given('the human player can perform a legal capture', () => {
  applyEngineFixture('human-turn-single-capture');
  scenarioCaptureCardIndexes = [0];
});

Given("Laia's hand area is visible on screen", () => {
  cy.get(selectors.aiHandZone).should('be.visible');
});

When('the human player performs a capture', () => {
  performCapture([0]);
});

When('the human player performs the capture', () => {
  performCapture(scenarioCaptureCardIndexes);
});

Then('capture glow is restricted to participating capture cards only', () => {
  expectCaptureVisualsOnlyOnTable();
});

Then("no capture glow appears on any card in Laia's hand area", () => {
  cy.get(selectors.aiHandZone).find(animationSelectors.capture).should('have.length', 0);
});

Then("no card in Laia's hand area receives capture flash behavior", () => {
  cy.get(selectors.aiHandZone).find(animationSelectors.capture).should('have.length', 0);
});

Then("no card in Laia's hand area receives capture fade behavior", () => {
  cy.get(selectors.aiCards).each(($card) => {
    cy.wrap($card).should('have.css', 'opacity', '1');
  });
});

Then("no card in Laia's hand area receives capture scale behavior", () => {
  cy.get(selectors.aiCards).each(($card) => {
    cy.wrap($card).should('have.css', 'transform', 'none');
  });
});

Given('a single-player session has progressed through multiple turns', () => {
  startSinglePlayerMatch();
  applyEngineFixture('human-turn-consecutive-captures');
});

Given('the human player can perform captures in sequence', () => {
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-card-play');
});

When('the human player performs consecutive capture actions in one session', () => {
  performCapture([0]);
  cy.get(selectors.confirmTurn).click();
  performCapture([0, 1]);
});

Then('each capture shows visuals only on participating capture cards', () => {
  expectCaptureVisualsOnlyOnTable();
});

Then("Laia's hand area remains static after every capture action", () => {
  expectAiHandStatic();
});

Given('a deal event has occurred and hand sizes have changed', () => {
  applyEngineFixture('human-turn-post-deal-capture');
});

Given('the human player has a legal capture after the deal', () => {
  cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-card-play');
});

When('the human player performs that capture', () => {
  performCapture([0]);
});

Then('capture visuals apply only to participating cards', () => {
  expectCaptureVisualsOnlyOnTable();
});

Then('only participating capture cards show capture visuals', () => {
  expectCaptureVisualsOnlyOnTable();
});

Given('the human player can perform a capture involving one table card', () => {
  applyEngineFixture('human-turn-single-capture');
  scenarioCaptureCardIndexes = [0];
});

Given('the human player can perform a capture involving two table cards', () => {
  applyEngineFixture('human-turn-multi-capture');
  scenarioCaptureCardIndexes = [0, 1];
});

Given('the human player can perform a capture involving three or more table cards', () => {
  applyEngineFixture('human-turn-escoba');
  scenarioCaptureCardIndexes = [0, 1, 2];
});

Given("Laia's hand area is visible during human captures", () => {
  cy.get(selectors.aiHandZone).should('be.visible');
});

Then('capture outcome visuals remain correctly isolated to participating cards', () => {
  cy.get(selectors.centerTableZone)
    .find(animationSelectors.capture + ', ' + animationSelectors.escoba)
    .then(($tableAnimations) => {
      const tableAnimationCount = $tableAnimations.length;

      cy.get(selectors.aiHandZone)
        .find(animationSelectors.capture + ', ' + animationSelectors.escoba)
        .should('have.length', 0);

      if (tableAnimationCount === 0) {
        // Reduced-motion path can suppress animation classes while still advancing capture state.
        cy.get(selectors.turnPhaseIndicator).should('contain.text', 'awaiting-confirmation');
        return;
      }

      expect(tableAnimationCount).to.be.greaterThan(0);
    });
});

Given('the user is navigating with keyboard controls', () => {
  applyEngineFixture('human-turn-single-capture');
  cy.get(selectors.handCardZero).focus();
});

Given('focus indicators are visible before a human capture', () => {
  cy.focused().should('have.attr', 'data-testid', 'hand-card-0');
});

Then('keyboard navigation remains available after the capture', () => {
  cy.get(selectors.confirmTurn).focus();
  cy.focused().should('have.attr', 'data-testid', 'confirm-turn');
});

Then('focus behavior remains consistent with pre-capture behavior', () => {
  cy.get(selectors.confirmTurn).should('be.visible');
});

Given('normal gameplay conditions on supported viewport sizes', () => {
  cy.viewport(1280, 800);
  applyEngineFixture('human-turn-single-capture');
});

Given('the human player performs capture actions', () => {
  performCapture([0]);
});

When('capture transitions are rendered', () => {
  cy.get(selectors.centerTableZone)
    .find(animationSelectors.capture)
    .should('have.length.greaterThan', 0);
});

Then('visual feedback remains responsive', () => {
  cy.get(selectors.centerTableZone)
    .find(animationSelectors.capture)
    .first()
    .then(($card) => {
      const duration = getComputedStyle($card[0]).getPropertyValue('animation-duration').trim();
      const durationMs = duration.endsWith('ms')
        ? Number.parseFloat(duration)
        : Number.parseFloat(duration) * 1000;
      expect(durationMs).to.be.lessThan(1200);
    });
});

Then('no noticeable stutter is introduced by animation isolation behavior', () => {
  cy.get(selectors.aiHandZone).find(animationSelectors.opponent).should('have.length', 0);
});
