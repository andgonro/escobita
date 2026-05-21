import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01, SC-02, SC-04, SC-05

const selectors = {
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  multiplayerNameOne: '[data-testid="multiplayer-name-1"]',
  multiplayerNameTwo: '[data-testid="multiplayer-name-2"]',
  playButton: '[data-testid="play-button"]',
  submitPlay: '[data-testid="submit-play"]',
  handCardZero: '[data-testid="hand-card-0"]',
  tableCardZero: '[data-testid="table-card-0"]',
  tableCardOne: '[data-testid="table-card-1"]',
};

const readStyle = (selector: string, property: string): Cypress.Chainable<string> => {
  return cy.get(selector).then(($element) => {
    const value = getComputedStyle($element[0] as Element)
      .getPropertyValue(property)
      .trim();
    return value;
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

Given('a turn is ready for card play interactions', () => {
  cy.get(selectors.submitPlay).should('be.visible');
  cy.get('[data-testid="turn-phase-indicator"]').should('contain.text', 'awaiting-card-play');
});

Given('the player has selected a valid hand card', () => {
  cy.get(selectors.handCardZero).click();
});

Given('no table cards are selected for capture', () => {
  cy.get(selectors.tableCardZero).should('have.attr', 'aria-selected', 'false');
  cy.get(selectors.tableCardOne).should('have.attr', 'aria-selected', 'false');
});

Given('one or more table cards are selected for a valid capture', () => {
  cy.get(selectors.tableCardZero).click();
});

Given('multiple table cards are selected for capture in one action', () => {
  cy.get(selectors.tableCardZero).click();
  cy.get(selectors.tableCardOne).click();
});

When('the player submits the play action', () => {
  cy.get(selectors.submitPlay).click();
});

Then('the selected card animates from hand to the center table zone', () => {
  cy.get('[data-testid="active-hand-card-0"] [data-testid="card-visual"]').should(
    'have.class',
    'card-visual--animation-play',
  );
});

Then('the movement follows an arc path', () => {
  readStyle(
    '[data-testid="active-hand-card-0"] [data-testid="card-visual"]',
    'animation-name',
  ).then((animationName) => {
    expect(animationName).to.contain('card-play-arc');
  });
});

Then('the card settles into the final table position after animation completes', () => {
  cy.get('[data-testid="turn-phase-indicator"]').should('contain.text', 'awaiting-confirmation');
});

Then('the card animation includes motion effect during travel', () => {
  readStyle('[data-testid="active-hand-card-0"] [data-testid="card-visual"]', 'transform').then(
    (transform) => {
      expect(transform).not.to.equal('none');
    },
  );
});

Then('the animation duration is within 800 to 1200 milliseconds', () => {
  readStyle(
    '[data-testid="active-hand-card-0"] [data-testid="card-visual"]',
    'animation-duration',
  ).then((duration) => {
    const durationMs = duration.endsWith('ms')
      ? Number.parseFloat(duration)
      : Number.parseFloat(duration) * 1000;
    expect(durationMs).to.be.within(800, 1200);
  });
});

Then('the timing uses a natural ease-in-out motion profile', () => {
  readStyle(
    '[data-testid="active-hand-card-0"] [data-testid="card-visual"]',
    'animation-timing-function',
  ).then((timingFunction) => {
    expect(timingFunction).to.contain('cubic-bezier');
  });
});

Then('each captured table card shows a capture glow effect', () => {
  cy.get('[data-testid="table-card-0"] [data-testid="card-visual"]').should(
    'have.class',
    'card-visual--animation-capture',
  );
});

Then('captured table cards fade and scale down out of view', () => {
  readStyle('[data-testid="table-card-0"] [data-testid="card-visual"]', 'opacity').then(
    (opacity) => {
      expect(Number.parseFloat(opacity)).to.be.lessThan(1);
    },
  );
  readStyle('[data-testid="table-card-0"] [data-testid="card-visual"]', 'transform').then(
    (transform) => {
      expect(transform).not.to.equal('none');
    },
  );
});

Then('captured table cards are removed from the table after animation completion', () => {
  cy.get('[data-testid="table-card-0"]').should('not.exist');
});

Then('all captured table cards begin capture animation at the same time', () => {
  cy.get('[data-testid="center-table-zone"]').should(($zone) => {
    const first = $zone.find('[data-testid="table-card-0"] [data-testid="card-visual"]');
    const second = $zone.find('[data-testid="table-card-1"] [data-testid="card-visual"]');

    expect(first.hasClass('card-visual--animation-capture')).to.equal(true);
    expect(second.hasClass('card-visual--animation-capture')).to.equal(true);
  });
});

Then('no captured card animation is staggered after another', () => {
  readStyle('[data-testid="table-card-0"] [data-testid="card-visual"]', 'animation-delay').then(
    (firstDelay) => {
      readStyle('[data-testid="table-card-1"] [data-testid="card-visual"]', 'animation-delay').then(
        (secondDelay) => {
          expect(firstDelay).to.equal(secondDelay);
        },
      );
    },
  );
});
