import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-07, SC-09, SC-10, SC-11, SC-12, SC-13, SC-14, SC-16, SC-17, SC-18, SC-19, SC-20, SC-21, SC-22, SC-23, SC-24, SC-25, SC-27

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  modeMultiplayer: '[data-testid="mode-multiplayer"]',
  playerCount: '[data-testid="player-count"]',
  playButton: '[data-testid="play-button"]',
  page: '[data-testid="game-table-page"]',
  contextHeader: '[data-testid="context-header"]',
  activePlayer: '[data-testid="active-player-indicator"]',
  scoreboard: '[data-testid="scoreboard-indicator"]',
  turnPhase: '[data-testid="turn-phase-indicator"]',
  playActionBar: '[data-testid="play-action-bar"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  validationMessage: '[data-testid="play-validation-message"]',
  handoffToggle: '[data-testid="handoff-toggle"]',
  handoffOverlay: '[data-testid="turn-handoff-overlay"]',
  handoffAcknowledge: '[data-testid="handoff-acknowledge"]',
  nextTurnReveal: '[data-testid="next-turn-reveal"]',
  liveRegion: '[data-testid="a11y-live-region"]',
  activeHandZone: '[data-testid="active-hand-zone"]',
  centerTableZone: '[data-testid="center-table-zone"]',
  handCards: '[data-testid^="hand-card-"]',
  tableCards: '[data-testid^="table-card-"]',
};

let activePlayerBeforeTurnCompletion = '';
let keyboardFlowPhaseBefore = '';
let singlePlayerCoreActivePlayerBefore = '';
let animationLoadFocusTargetBefore = '';

const openSinglePlayerGameWithReducedMotion = (): void => {
  cy.visit('/', {
    onBeforeLoad(win) {
      Object.defineProperty(win, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: () => undefined,
          removeListener: () => undefined,
          addEventListener: () => undefined,
          removeEventListener: () => undefined,
          dispatchEvent: () => false,
        }),
      });
    },
  });

  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
};

interface IndexedCard {
  index: number;
  value: number;
}

const rankValueMap: Record<string, number> = {
  As: 1,
  '1': 1,
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  Sota: 8,
  Caballo: 9,
  Rey: 10,
};

const parseCardValueFromAriaLabel = (ariaLabel: string): number => {
  const rankToken = ariaLabel.split(' de ')[0]?.trim() ?? '';
  const mappedValue = rankValueMap[rankToken];
  if (mappedValue !== undefined) {
    return mappedValue;
  }

  const numericValue = Number(rankToken);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  return 0;
};

const buildIndexedCards = ($elements: JQuery<HTMLElement>): IndexedCard[] => {
  return $elements.toArray().map((element, index) => {
    const ariaLabel = element.getAttribute('aria-label') ?? '';
    return {
      index,
      value: parseCardValueFromAriaLabel(ariaLabel),
    };
  });
};

const findSubsetIndexesForTarget = (cards: IndexedCard[], target: number): number[] | null => {
  const cardCount = cards.length;
  const maxMask = 1 << cardCount;

  for (let mask = 1; mask < maxMask; mask += 1) {
    const subsetIndexes: number[] = [];
    let subsetSum = 0;

    for (let bit = 0; bit < cardCount; bit += 1) {
      if ((mask & (1 << bit)) !== 0) {
        subsetIndexes.push(cards[bit].index);
        subsetSum += cards[bit].value;
      }
    }

    if (subsetSum === target) {
      return subsetIndexes;
    }
  }

  return null;
};

const findLegalCaptureSelection = (
  handCards: IndexedCard[],
  tableCards: IndexedCard[],
): { handIndex: number; tableIndexes: number[] } | null => {
  for (const handCard of handCards) {
    const target = 15 - handCard.value;
    if (target <= 0) {
      continue;
    }

    const subsetIndexes = findSubsetIndexesForTarget(tableCards, target);
    if (subsetIndexes !== null) {
      return { handIndex: handCard.index, tableIndexes: subsetIndexes };
    }
  }

  return null;
};

const withLegalCaptureSelection = (
  onSelection: (selection: { handIndex: number; tableIndexes: number[] }) => void,
  attemptsRemaining = 4,
): void => {
  openSinglePlayerGame();
  captureCountsBeforeSubmit();

  cy.get(selectors.handCards).then(($handCards) => {
    const handIndexedCards = buildIndexedCards($handCards as JQuery<HTMLElement>);

    cy.get(selectors.tableCards).then(($tableCards) => {
      const tableIndexedCards = buildIndexedCards($tableCards as JQuery<HTMLElement>);
      const selection = findLegalCaptureSelection(handIndexedCards, tableIndexedCards);

      if (selection !== null) {
        onSelection(selection);
        return;
      }

      if (attemptsRemaining <= 1) {
        throw new Error('Could not find a legal capture setup after multiple attempts.');
      }

      withLegalCaptureSelection(onSelection, attemptsRemaining - 1);
    });
  });
};

const withLegalCaptureSelectionOnCurrentBoard = (
  onSelection: (selection: { handIndex: number; tableIndexes: number[] }) => void,
): void => {
  cy.get(selectors.handCards).then(($handCards) => {
    const handIndexedCards = buildIndexedCards($handCards as JQuery<HTMLElement>);

    cy.get(selectors.tableCards).then(($tableCards) => {
      const tableIndexedCards = buildIndexedCards($tableCards as JQuery<HTMLElement>);
      const selection = findLegalCaptureSelection(handIndexedCards, tableIndexedCards);

      if (selection === null) {
        throw new Error('Could not find a legal capture setup on the current board.');
      }

      onSelection(selection);
    });
  });
};

const captureCountsBeforeSubmit = (): void => {
  cy.get(selectors.tableCards)
    .its('length')
    .then((tableCount) => {
      cy.wrap(Number(tableCount)).as('tableCountBeforeSubmit');
    });

  cy.get(selectors.handCards)
    .its('length')
    .then((handCount) => {
      cy.wrap(Number(handCount)).as('handCountBeforeSubmit');
    });
};

const openSinglePlayerGame = (): void => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
};

const openMultiplayerGame = (): void => {
  cy.visit('/');
  cy.get(selectors.modeMultiplayer).click();
  cy.get(selectors.playerCount).select('2');
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
};

Given('the match mode is multiplayer', () => {
  openMultiplayerGame();
});

Given('handoff toggle is enabled in multiplayer', () => {
  openMultiplayerGame();
  cy.get(selectors.handoffToggle).should('be.visible').check();
});

Given('handoff toggle is disabled in multiplayer', () => {
  openMultiplayerGame();
  cy.get(selectors.handoffToggle).should('be.visible').uncheck();
});

Given('the match mode is single-player', () => {
  openSinglePlayerGame();
});

Given('it is player A turn', () => {
  openMultiplayerGame();
  cy.get(selectors.activePlayer).should('contain.text', 'Jugador-1');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');
});

Given('a hand card is selected', () => {
  openSinglePlayerGame();
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.handCards).first().should('have.attr', 'aria-pressed', 'true');
});

Given('no hand card is selected', () => {
  openSinglePlayerGame();
  cy.get(selectors.handCards).each(($handCard) => {
    cy.wrap($handCard).should('have.attr', 'aria-pressed', 'false');
  });
});

Given('a hand card is selected and no table cards are selected', () => {
  withLegalCaptureSelection((selection) => {
    cy.wrap(selection.tableIndexes.length).as('potentialCaptureSubsetSize');
    cy.wrap(0).as('selectedCaptureTableCount');
    cy.get(selectors.handCards).eq(selection.handIndex).focus().type('{enter}');
    cy.get(selectors.handCards).eq(selection.handIndex).should('have.attr', 'aria-pressed', 'true');
    cy.get(selectors.tableCards).each(($tableCard) => {
      cy.wrap($tableCard).should('have.attr', 'aria-selected', 'false');
    });
  });
});

Given('a legal capture subset is selected', () => {
  withLegalCaptureSelection((selection) => {
    cy.wrap(selection.tableIndexes.length).as('selectedCaptureTableCount');
    cy.get(selectors.handCards).eq(selection.handIndex).focus().type('{enter}');
    selection.tableIndexes.forEach((tableIndex) => {
      cy.get(selectors.tableCards).eq(tableIndex).focus().type('{enter}');
    });
  });
});

Given('selected hand card and selected table subset do not form a legal capture', () => {
  openSinglePlayerGame();
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.tableCards).first().focus().type('{enter}');
  cy.get(selectors.validationMessage).should('contain.text', 'not valid');
});

Given('keyboard-only navigation is used', () => {
  openMultiplayerGame();
  cy.get(selectors.handoffToggle).should('be.visible').check();
});

Given('assistive technology is active', () => {
  openSinglePlayerGame();
});

Given('viewport width is 320 pixels', () => {
  cy.viewport(320, 720);
  openMultiplayerGame();
});

Given('viewport width is {word} range', (viewportRange: string) => {
  if (viewportRange === 'tablet') {
    cy.viewport(768, 1024);
  } else if (viewportRange === 'desktop') {
    cy.viewport(1280, 800);
  } else {
    throw new Error(`Unsupported viewport range: ${viewportRange}`);
  }

  openSinglePlayerGame();
});

When('game table controls are displayed', () => {
  cy.get(selectors.submitPlay).should('be.visible');
  cy.get(selectors.confirmTurn).should('be.visible');
});

When('turn completion occurs', () => {
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      activePlayerBeforeTurnCompletion = activePlayerText.trim();
    });

  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
  cy.get(selectors.confirmTurn).focus().type('{enter}');
});

When('the user performs select submit and confirm actions', () => {
  cy.get(selectors.turnPhase)
    .invoke('text')
    .then((turnPhaseText) => {
      keyboardFlowPhaseBefore = turnPhaseText.trim();
    });

  cy.get(selectors.handCards).last().focus().type('{enter}');
  cy.get(selectors.handCards)
    .last()
    .then(($handCardButton) => {
      cy.get(selectors.submitPlay).then(($submitButton) => {
        const relation = $handCardButton[0].compareDocumentPosition($submitButton[0]);
        expect((relation & Node.DOCUMENT_POSITION_FOLLOWING) !== 0).to.equal(true);
      });
    });

  cy.get(selectors.submitPlay).should('not.be.disabled').focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
  cy.get(selectors.confirmTurn).should('not.be.disabled').focus().type('{enter}');
});

When('focus moves through interactive cards and controls', () => {
  cy.get(selectors.handCards).first().focus();
  cy.focused()
    .should('have.attr', 'data-testid')
    .and('match', /^hand-card-/);
  cy.get(selectors.submitPlay).focus();
  cy.focused().should('have.attr', 'data-testid', 'submit-play');
});

When('player B attempts to interact with hand cards', () => {
  cy.get('[data-testid^="opponent-seat-"]').first().as('nonActiveSeat');
  cy.get('@nonActiveSeat').find('[data-testid^="hand-card-"]').should('have.length', 0);
  cy.get('@nonActiveSeat').find('button').should('have.length', 0);
});

When('the player toggles table cards', () => {
  cy.get(selectors.tableCards).eq(0).focus().type('{enter}');
  cy.get(selectors.tableCards).eq(0).should('have.attr', 'aria-selected', 'true');
  cy.get(selectors.tableCards).eq(1).focus().type('{enter}');
  cy.get(selectors.tableCards).eq(1).should('have.attr', 'aria-selected', 'true');
  cy.get(selectors.tableCards).eq(0).focus().type('{enter}');
});

When('the player attempts to submit play', () => {
  cy.get(selectors.submitPlay).then(($submitButton) => {
    const isDisabled = $submitButton.is(':disabled');

    if (isDisabled) {
      cy.wrap($submitButton).should('be.disabled');
      return;
    }

    cy.wrap($submitButton).should('not.be.disabled').click();
  });
});

When('the player submits play from the action bar', () => {
  cy.get(selectors.playActionBar).should('be.visible');
  cy.get(selectors.submitPlay).should('not.be.disabled').click();
});

When('invalid submission occurs or turn changes', () => {
  cy.get(selectors.liveRegion)
    .invoke('text')
    .then((announcementText) => {
      cy.wrap(announcementText.trim()).as('announcementBeforeActions');
    });

  cy.get(selectors.submitPlay).focus().type('{enter}');

  cy.get(selectors.liveRegion)
    .invoke('text')
    .then((announcementText) => {
      cy.wrap(announcementText.trim()).as('invalidAnnouncement');
    });

  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
  cy.get(selectors.confirmTurn).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');

  cy.get(selectors.liveRegion)
    .invoke('text')
    .then((announcementText) => {
      cy.wrap(announcementText.trim()).as('turnChangeAnnouncement');
    });
});

When('submit confirm or handoff acknowledgement occurs', () => {
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.focused().should('have.attr', 'data-testid', 'play-validation-message');
  cy.focused()
    .invoke('attr', 'data-testid')
    .then((testId) => {
      cy.wrap(testId ?? '').as('focusAfterInvalidSubmission');
    });

  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.focused().should('have.attr', 'data-testid', 'confirm-turn');
  cy.focused()
    .invoke('attr', 'data-testid')
    .then((testId) => {
      cy.wrap(testId ?? '').as('focusAfterSubmit');
    });

  cy.get(selectors.confirmTurn).focus().type('{enter}');

  cy.focused().should('have.attr', 'data-testid', 'handoff-acknowledge');
  cy.focused()
    .invoke('attr', 'data-testid')
    .then((testId) => {
      cy.wrap(testId ?? '').as('focusAfterConfirm');
    });

  cy.get(selectors.handoffAcknowledge).type('{enter}');
  cy.focused().should('have.attr', 'data-testid', 'submit-play');
  cy.focused()
    .invoke('attr', 'data-testid')
    .then((testId) => {
      cy.wrap(testId ?? '').as('focusAfterConfirmOrAcknowledge');
    });
});

When('the game table is rendered', () => {
  cy.get(selectors.page).should('be.visible');
});

Then('handoff toggle is visible and operable', () => {
  cy.get(selectors.handoffToggle).should('be.visible');
  cy.get(selectors.handoffToggle).check();
  cy.get(selectors.handoffToggle).uncheck();
});

Then('handoff overlay is displayed before next-turn reveal', () => {
  cy.get(selectors.handoffOverlay).should('be.visible');
  cy.get(selectors.nextTurnReveal).should('not.be.visible');
});

Then('next-turn view appears without handoff overlay', () => {
  cy.get(selectors.handoffOverlay).should('not.exist');
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      expect(activePlayerText.trim()).not.to.equal(activePlayerBeforeTurnCompletion);
    });
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');
});

Then('handoff overlay is not shown', () => {
  cy.get(selectors.handoffOverlay).should('not.exist');
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      expect(activePlayerText.trim()).not.to.equal(activePlayerBeforeTurnCompletion);
    });
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');
});

Then('all core actions are operable without pointer input', () => {
  cy.get(selectors.turnPhase)
    .invoke('text')
    .then((turnPhaseText) => {
      expect(turnPhaseText.trim()).to.contain('awaiting-card-play');
      expect(keyboardFlowPhaseBefore).to.contain('awaiting-card-play');
    });
});

When('a single-player play is submitted', () => {
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      singlePlayerCoreActivePlayerBefore = activePlayerText.trim();
    });

  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
});

Then('turn phase reflects pending confirmation', () => {
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
});

When('the single-player turn completion is confirmed', () => {
  cy.get(selectors.confirmTurn).focus().type('{enter}');
});

Then('turn advances after confirmation in single-player mode', () => {
  cy.get(selectors.activePlayer)
    .invoke('text')
    .then((activePlayerText) => {
      expect(activePlayerText.trim()).not.to.equal(singlePlayerCoreActivePlayerBefore);
    });
});

Then('turn phase returns to awaiting-card-play state', () => {
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');
});

Then('interaction is blocked for non-active players', () => {
  cy.get('[data-testid^="opponent-seat-"]')
    .first()
    .find('[data-testid^="hand-card-"]')
    .should('have.length', 0);
  cy.get('[data-testid^="opponent-seat-"]').first().find('button').should('have.length', 0);
  cy.get(selectors.activeHandZone).find(selectors.handCards).should('have.length.greaterThan', 0);
});

Then('subset selection state updates for each card', () => {
  cy.get(selectors.tableCards).eq(0).should('have.attr', 'aria-selected', 'false');
  cy.get(selectors.tableCards).eq(1).should('have.attr', 'aria-selected', 'true');
});

Then('submission is blocked', () => {
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');
});

Then('validity feedback is shown', () => {
  cy.get(selectors.validationMessage).should('contain.text', 'not valid');
});

Then('clear feedback is shown', () => {
  cy.get(selectors.validationMessage)
    .invoke('text')
    .then((validationText) => {
      expect(validationText.trim().length).to.be.greaterThan(0);
    });
});

Then('the action is treated as table placement', () => {
  cy.get('@tableCountBeforeSubmit').then((tableCountBefore) => {
    cy.get(selectors.tableCards).should('have.length', Number(tableCountBefore) + 1);
  });

  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
});

Then('missed-capture auto-correction is not applied', () => {
  cy.get('@potentialCaptureSubsetSize').then((potentialCaptureSubsetSize) => {
    const captureSubsetSize = Number(potentialCaptureSubsetSize);
    expect(captureSubsetSize).to.be.greaterThan(0);

    cy.get('@tableCountBeforeSubmit').then((tableCountBefore) => {
      const beforeCount = Number(tableCountBefore);

      cy.get(selectors.tableCards)
        .its('length')
        .then((tableCountAfter) => {
          const afterCount = Number(tableCountAfter);
          expect(afterCount).to.equal(beforeCount + 1);
          expect(afterCount).not.to.equal(beforeCount - captureSubsetSize);
        });
    });
  });
});

Then('resulting table state reflects captured cards removed', () => {
  cy.get('@tableCountBeforeSubmit').then((tableCountBefore) => {
    cy.get('@selectedCaptureTableCount').then((selectedCaptureTableCount) => {
      cy.get(selectors.tableCards).should(
        'have.length',
        Number(tableCountBefore) - Number(selectedCaptureTableCount),
      );
    });
  });

  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
});

Then('hand state reflects played card removal', () => {
  cy.get('@handCountBeforeSubmit').then((handCountBefore) => {
    cy.get(selectors.handCards).should('have.length', Number(handCountBefore) - 1);
  });
});

Then('each interactive element has a meaningful label', () => {
  cy.get(
    `${selectors.handCards}, ${selectors.tableCards}, ${selectors.submitPlay}, ${selectors.confirmTurn}`,
  ).each(($element) => {
    const ariaLabel = $element.attr('aria-label')?.trim() ?? '';
    const ariaLabelledBy = $element.attr('aria-labelledby')?.trim() ?? '';
    expect(ariaLabel.length > 0 || ariaLabelledBy.length > 0).to.equal(true);
  });
});

Then('selected-state is programmatically exposed', () => {
  cy.get(selectors.handCards).should('have.length.greaterThan', 0);
  cy.get(selectors.handCards).each(($handCard) => {
    const pressedState = $handCard.attr('aria-pressed');
    expect(['true', 'false']).to.include(pressedState ?? '');
  });

  cy.get(selectors.tableCards).should('have.length.greaterThan', 0);
  cy.get(selectors.tableCards).each(($tableCard) => {
    const selectedState = $tableCard.attr('aria-selected');
    expect(['true', 'false']).to.include(selectedState ?? '');
  });

  cy.get(selectors.handCards).first().should('have.attr', 'aria-pressed', 'false');
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.handCards)
    .first()
    .should(($handCard) => {
      expect($handCard.attr('aria-pressed')).to.equal('true');
    });
});

Then('announcement messages are exposed through live regions', () => {
  cy.get(selectors.liveRegion).should('have.attr', 'aria-live', 'polite');
  cy.get(selectors.liveRegion).should('have.attr', 'aria-atomic', 'true');

  cy.get('@invalidAnnouncement').then((invalidAnnouncement) => {
    expect(String(invalidAnnouncement).trim()).to.contain(
      'Select a hand card before submitting play.',
    );
  });

  cy.get('@turnChangeAnnouncement').then((turnChangeAnnouncement) => {
    expect(String(turnChangeAnnouncement).trim()).to.contain('Turn changed to');
  });

  cy.get('@announcementBeforeActions').then((announcementBeforeActions) => {
    cy.get('@turnChangeAnnouncement').then((turnChangeAnnouncement) => {
      expect(String(turnChangeAnnouncement).trim()).not.to.equal(
        String(announcementBeforeActions).trim(),
      );
    });
  });
});

Then('focus moves to the expected next control without ambiguity', () => {
  cy.get('@focusAfterInvalidSubmission').then((focusAfterInvalidSubmission) => {
    expect(String(focusAfterInvalidSubmission)).to.equal('play-validation-message');
  });

  cy.get('@focusAfterSubmit').then((focusAfterSubmit) => {
    expect(String(focusAfterSubmit)).to.equal('confirm-turn');
  });

  cy.get('@focusAfterConfirm').then((focusAfterConfirm) => {
    expect(String(focusAfterConfirm)).to.equal('handoff-acknowledge');
  });

  cy.get('@focusAfterConfirmOrAcknowledge').then((focusAfterConfirmOrAcknowledge) => {
    expect(String(focusAfterConfirmOrAcknowledge)).to.equal('submit-play');
  });
});

When('action animations are active during turn sequencing', () => {
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');

  cy.focused()
    .invoke('attr', 'data-testid')
    .then((testId) => {
      animationLoadFocusTargetBefore = (testId ?? '').trim();
    });
});

Then('keyboard focus remains on operable controls', () => {
  cy.get(selectors.submitPlay).focus();
  cy.focused().should('have.attr', 'data-testid', 'submit-play');

  cy.get(selectors.confirmTurn).focus();
  cy.focused().should('have.attr', 'data-testid', 'confirm-turn');

  expect(animationLoadFocusTargetBefore.length).to.be.greaterThan(0);
});

Then('card controls expose disabled semantics without leaving focus order', () => {
  cy.get(selectors.handCards).first().should('have.attr', 'aria-disabled', 'true');
  cy.get(selectors.tableCards).first().should('have.attr', 'aria-disabled', 'true');

  cy.get(selectors.handCards).first().should('not.have.attr', 'disabled');
  cy.get(selectors.tableCards).first().should('not.have.attr', 'disabled');
});

Then('focused controls remain visibly focusable during animation load', () => {
  cy.get(selectors.confirmTurn).focus();
  cy.focused().should('have.attr', 'data-testid', 'confirm-turn');
  cy.focused().should('match', ':focus-visible');
});

Given('reduced-motion accessibility mode is enabled', () => {
  openSinglePlayerGameWithReducedMotion();
});

When('selection and capture feedback is exercised without motion', () => {
  withLegalCaptureSelectionOnCurrentBoard((selection) => {
    cy.wrap(selection.tableIndexes.length).as('reducedMotionCaptureCount');

    cy.get(selectors.handCards).eq(selection.handIndex).focus().type('{enter}');
    selection.tableIndexes.forEach((tableIndex) => {
      cy.get(selectors.tableCards).eq(tableIndex).focus().type('{enter}');
    });

    captureCountsBeforeSubmit();
    cy.get(selectors.submitPlay).focus().type('{enter}');
  });
});

Then('selection state and capture outcome remain distinguishable without motion', () => {
  cy.get(selectors.handCards).filter('[aria-pressed="true"]').should('have.length', 0);

  cy.get('@reducedMotionCaptureCount').then((captureCount) => {
    cy.get('@tableCountBeforeSubmit').then((beforeCount) => {
      cy.get(selectors.tableCards).should(
        'have.length',
        Number(beforeCount) - Number(captureCount),
      );
    });
  });
});

Then('core zones remain usable', () => {
  cy.get(selectors.activeHandZone).should('be.visible');
  cy.get(selectors.centerTableZone).should('be.visible');

  cy.document().then((documentRef) => {
    const rootElement = documentRef.documentElement;
    expect(rootElement.scrollWidth).to.be.lte(rootElement.clientWidth);
  });
});

Then('primary actions remain reachable', () => {
  const assertTouchTarget = (selector: string): void => {
    cy.get(selector)
      .should('be.visible')
      .then(($target) => {
        const rect = $target[0].getBoundingClientRect();
        expect(rect.height).to.be.gte(44);
        expect(rect.width).to.be.gte(44);
      });
  };

  assertTouchTarget(selectors.submitPlay);
  assertTouchTarget(selectors.confirmTurn);
  assertTouchTarget(selectors.handoffToggle);
  assertTouchTarget(selectors.handCards);
  assertTouchTarget(selectors.tableCards);
});

Then('information hierarchy remains clear', () => {
  cy.get(selectors.activePlayer).should('be.visible');
  cy.get(selectors.scoreboard).should('be.visible');
  cy.get(selectors.turnPhase).should('be.visible');
});

Then('card zones do not overlap critical context', () => {
  cy.get(selectors.contextHeader).then(($header) => {
    const headerBottom = $header[0].getBoundingClientRect().bottom;

    cy.get(selectors.centerTableZone).then(($centerTable) => {
      const tableTop = $centerTable[0].getBoundingClientRect().top;
      expect(tableTop).to.be.gte(headerBottom);
    });
  });
});
