import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-02, SC-03, SC-05, SC-06

const selectors = {
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  playButton: '[data-testid="play-button"]',
  gameTablePage: '[data-testid="game-table-page"]',
  contextHeader: '[data-testid="context-header"]',
  scoreboard: '[data-testid="scoreboard-indicator"]',
  turnPhase: '[data-testid="turn-phase-indicator"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  handCards: '[data-testid^="hand-card-"]',
  handoffToggle: '[data-testid="handoff-toggle"]',
  tableLayoutShell: '[data-testid="table-layout-shell"]',
  layoutOpponents: '[data-testid="layout-opponents"]',
  layoutCenter: '[data-testid="layout-center"]',
  layoutActiveHand: '[data-testid="layout-active-hand"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  centerTableZone: '[data-testid="center-table-zone"]',
  opponentZones: '[data-testid="opponent-zones"]',
  opponentSeat: '[data-testid^="opponent-seat-"]',
  activePlayer: '[data-testid="active-player-indicator"]',
};

let activePlayerBeforeContextTransition = '';
let turnPhaseBeforeContextTransition = '';
let turnPhaseDuringContextTransition = '';

const completeConfirmedMultiplayerTurnTransition = (): void => {
  cy.get(selectors.handoffToggle).should('be.visible').uncheck();
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
  cy.get(selectors.confirmTurn).focus().type('{enter}');
};

Given('I open the game table route in a {int}-player multiplayer setup', (players: number) => {
  cy.visit('/');
  cy.get(selectors.modeMultiplayer).click();
  cy.get(selectors.playerCount).select(`${players}`);
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
});

When('the initial table entry layout is rendered', () => {
  cy.get(selectors.gameTablePage).should('be.visible');
});

Then('the active hand zone is shown at the bottom', () => {
  cy.get(selectors.tableLayoutShell).then(($layoutShell) => {
    const shellRect = $layoutShell[0].getBoundingClientRect();

    cy.get(selectors.layoutCenter).then(($centerRegion) => {
      const centerRect = $centerRegion[0].getBoundingClientRect();

      cy.get(selectors.layoutActiveHand).then(($activeHandRegion) => {
        const activeRegionRect = $activeHandRegion[0].getBoundingClientRect();

        cy.get(selectors.activeHandZone)
          .should('be.visible')
          .then(($zone) => {
            const zoneRect = $zone[0].getBoundingClientRect();

            expect(activeRegionRect.top).to.be.greaterThan(centerRect.bottom - 4);
            expect(zoneRect.top).to.be.greaterThan(shellRect.top + shellRect.height * 0.5);
            expect(zoneRect.bottom).to.be.lessThan(shellRect.bottom + 2);
          });
      });
    });
  });
});

Then('the center table zone is visible', () => {
  cy.get(selectors.tableLayoutShell).then(($layoutShell) => {
    const shellRect = $layoutShell[0].getBoundingClientRect();
    const shellMidY = shellRect.top + shellRect.height / 2;

    cy.get(selectors.layoutCenter).then(($centerRegion) => {
      const centerRegionRect = $centerRegion[0].getBoundingClientRect();
      const centerMidY = centerRegionRect.top + centerRegionRect.height / 2;

      cy.get(selectors.centerTableZone)
        .should('be.visible')
        .then(($centerZone) => {
          const centerZoneRect = $centerZone[0].getBoundingClientRect();
          expect(Math.abs(centerMidY - shellMidY)).to.be.lessThan(shellRect.height * 0.25);
          expect(centerZoneRect.top).to.be.greaterThan(centerRegionRect.top - 2);
          expect(centerZoneRect.bottom).to.be.lessThan(centerRegionRect.bottom + 2);
        });
    });
  });
});

Then('exactly {int} opponent zones are shown', (opponents: number) => {
  cy.get(selectors.opponentSeat).should('have.length', opponents);
});

Then('opponent zones are arranged around the table', () => {
  cy.get(selectors.opponentZones).should('be.visible').and('have.css', 'display', 'grid');

  cy.get(selectors.opponentSeat).then(($seats) => {
    const expectedClassByCount: Record<number, string> = {
      1: 'opponent-zones--one',
      2: 'opponent-zones--two',
      3: 'opponent-zones--three',
    };

    const expectedSeatPositionsByCount: Record<number, string[]> = {
      1: ['opponent-seat--north'],
      2: ['opponent-seat--west', 'opponent-seat--east'],
      3: ['opponent-seat--west', 'opponent-seat--north', 'opponent-seat--east'],
    };

    const expectedClass = expectedClassByCount[$seats.length] ?? 'opponent-zones--three';
    cy.get(selectors.opponentZones).should('have.class', expectedClass);

    const expectedSeatPositions =
      expectedSeatPositionsByCount[$seats.length] ?? expectedSeatPositionsByCount[3];
    expectedSeatPositions.forEach((seatClass, index) => {
      cy.get(`[data-testid="opponent-seat-${index}"]`).should('have.class', seatClass);
    });
  });

  cy.get(selectors.layoutOpponents).then(($opponentRegion) => {
    const opponentRegionRect = $opponentRegion[0].getBoundingClientRect();

    cy.get(selectors.layoutCenter).then(($centerRegion) => {
      const centerRegionRect = $centerRegion[0].getBoundingClientRect();
      expect(opponentRegionRect.bottom).to.be.lessThan(centerRegionRect.top + 8);
    });
  });
});

Then('the table surface uses the textured asset with readability overlay', () => {
  cy.get(selectors.gameTablePage).then(($page) => {
    const pageStyle = window.getComputedStyle($page[0]);
    const overlayStyle = window.getComputedStyle($page[0], '::before');

    expect(pageStyle.backgroundImage).to.contain('tapete.png');
    expect(overlayStyle.backgroundImage).not.to.equal('none');
    expect(overlayStyle.pointerEvents).to.equal('none');
  });
});

Then('text and controls remain readable over the surface', () => {
  cy.get(selectors.contextHeader)
    .should('be.visible')
    .then(($header) => {
      const headerStyle = window.getComputedStyle($header[0]);
      expect(headerStyle.backgroundColor).not.to.equal('rgba(0, 0, 0, 0)');
    });

  cy.get(selectors.activePlayer).should('be.visible');
  cy.get(selectors.scoreboard).should('be.visible');
  cy.get(selectors.turnPhase).should('be.visible');
  cy.get(selectors.submitPlay).should('be.visible');
  cy.get(selectors.confirmTurn).should('be.visible');
});

Then('active player indicator remains visible', () => {
  cy.get(selectors.activePlayer).should('be.visible');
});

Then('match scores remain visible', () => {
  cy.get(selectors.scoreboard)
    .should('be.visible')
    .find('[data-testid^="score-item-"]')
    .should('have.length.greaterThan', 0);
});

Then('turn phase indicator remains visible', () => {
  cy.get(selectors.turnPhase).should('be.visible');
});

When('I complete a confirmed multiplayer turn transition', () => {
  completeConfirmedMultiplayerTurnTransition();
});

When('I submit and confirm a multiplayer turn with handoff disabled', () => {
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      activePlayerBeforeContextTransition = activePlayerText.trim();
    });

  cy.get(selectors.turnPhase)
    .invoke('text')
    .then((turnPhaseText) => {
      turnPhaseBeforeContextTransition = turnPhaseText.trim();
    });

  cy.get(selectors.handoffToggle).should('be.visible').uncheck();
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');

  cy.get(selectors.turnPhase)
    .should('contain.text', 'awaiting-confirmation')
    .invoke('text')
    .then((turnPhaseText) => {
      turnPhaseDuringContextTransition = turnPhaseText.trim();
    });

  cy.get(selectors.confirmTurn).focus().type('{enter}');
});

Then('active player indicator updates after state change', () => {
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      expect(activePlayerText.trim()).not.to.equal(activePlayerBeforeContextTransition);
    });
});

Then('turn phase indicator updates after state change', () => {
  expect(turnPhaseDuringContextTransition).to.contain('awaiting-confirmation');
  expect(turnPhaseDuringContextTransition).not.to.equal(turnPhaseBeforeContextTransition);

  cy.get(selectors.turnPhase)
    .invoke('text')
    .then((turnPhaseText) => {
      expect(turnPhaseText.trim()).to.contain('awaiting-card-play');
    });
});
