import { Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-30

const selectors = {
  activePlayer: '[data-testid="active-player-indicator"]',
  handCards: '[data-testid^="hand-card-"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  handoffToggle: '[data-testid="handoff-toggle"]',
  handoffOverlay: '[data-testid="turn-handoff-overlay"]',
  handoffAcknowledge: '[data-testid="handoff-acknowledge"]',
  nextTurnReveal: '[data-testid="next-turn-reveal"]',
};

const activePlayersBeforeConfirm: string[] = [];
const activePlayersAfterConfirm: string[] = [];
const overlayPresenceByCycle: boolean[] = [];

const runTurnCompletionCycle = (): void => {
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      activePlayersBeforeConfirm.push(activePlayerText.trim());
    });

  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.confirmTurn).focus().type('{enter}');

  cy.get('body').then(($body) => {
    const hasHandoffOverlay = $body.find(selectors.handoffOverlay).length > 0;
    overlayPresenceByCycle.push(hasHandoffOverlay);

    if (hasHandoffOverlay) {
      cy.get(selectors.handoffAcknowledge).focus().type('{enter}');
    }
  });

  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      activePlayersAfterConfirm.push(activePlayerText.trim());
    });
};

When('turn completion occurs twice in the same match', () => {
  activePlayersBeforeConfirm.length = 0;
  activePlayersAfterConfirm.length = 0;
  overlayPresenceByCycle.length = 0;

  for (let cycle = 0; cycle < 2; cycle += 1) {
    runTurnCompletionCycle();
  }
});

When('one turn completion occurs with handoff enabled', () => {
  activePlayersBeforeConfirm.length = 0;
  activePlayersAfterConfirm.length = 0;
  overlayPresenceByCycle.length = 0;

  runTurnCompletionCycle();
});

When('handoff mode is switched to disabled in the same match', () => {
  cy.get(selectors.handoffToggle).should('be.visible').uncheck();
});

When('the next turn completion occurs', () => {
  runTurnCompletionCycle();
});

Then('active player advances on each completion', () => {
  cy.then(() => {
    expect(activePlayersBeforeConfirm).to.have.length(2);
    expect(activePlayersAfterConfirm).to.have.length(2);

    for (let cycle = 0; cycle < 2; cycle += 1) {
      expect(activePlayersAfterConfirm[cycle]).not.to.equal(activePlayersBeforeConfirm[cycle]);
    }
  });
});

Then('handoff branch behavior remains enabled across both completions', () => {
  cy.then(() => {
    expect(overlayPresenceByCycle).to.deep.equal([true, true]);
  });
});

Then('handoff branch behavior remains disabled across both completions', () => {
  cy.then(() => {
    expect(overlayPresenceByCycle).to.deep.equal([false, false]);
  });

  cy.get(selectors.nextTurnReveal).should('be.visible');
});

Then('first completion uses enabled handoff branch', () => {
  cy.then(() => {
    expect(overlayPresenceByCycle.length).to.be.greaterThan(0);
    expect(overlayPresenceByCycle[0]).to.equal(true);
  });
});

Then('second completion uses disabled handoff branch', () => {
  cy.then(() => {
    expect(overlayPresenceByCycle.length).to.be.greaterThan(1);
    expect(overlayPresenceByCycle[1]).to.equal(false);
  });

  cy.get(selectors.nextTurnReveal).should('be.visible');
});
