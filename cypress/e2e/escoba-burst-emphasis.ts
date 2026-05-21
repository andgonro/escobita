import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-14, SC-15, SC-16

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: 'ai-turn-escoba') => unknown;
    applyTurnSequencingFixture?: (fixture: 'reduced-motion') => void;
  };
}

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  escobaAnimatedCards: '.card-visual--animation-escoba',
};

const applyEscobaFixture = (): void => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error('Escobita test API is unavailable for escoba fixture setup.');
    }

    testApi.applyEngineFixture('ai-turn-escoba');
  });
};

Given('a single player game has been started for escoba burst checks', () => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
});

Given('reduced-motion preference is enabled for escoba burst checks', () => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi || typeof testApi.applyTurnSequencingFixture !== 'function') {
      throw new Error('Reduced-motion fixture seam is unavailable.');
    }

    testApi.applyTurnSequencingFixture('reduced-motion');
  });
});

When('the {string} fixture is applied for escoba burst checks', (fixture: string) => {
  if (fixture !== 'ai-turn-escoba') {
    throw new Error(`Unsupported escoba burst fixture: ${fixture}`);
  }

  applyEscobaFixture();
});

Then('an escoba burst animation is visible on clearing table cards', () => {
  cy.get(selectors.escobaAnimatedCards).should('have.length.greaterThan', 0);
});

Then('escoba animation duration is within 600 to 800 milliseconds', () => {
  cy.get(selectors.escobaAnimatedCards)
    .first()
    .then(($card) => {
      const durationValue = getComputedStyle($card[0])
        .getPropertyValue('animation-duration')
        .trim();
      const durationMs = durationValue.endsWith('ms')
        ? Number.parseFloat(durationValue)
        : Number.parseFloat(durationValue) * 1000;

      expect(durationMs).to.be.within(600, 800);
    });
});

Then('escoba special motion is disabled', () => {
  cy.get(selectors.escobaAnimatedCards).should('have.length', 0);
});
