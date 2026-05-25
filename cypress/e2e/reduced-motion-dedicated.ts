import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-03, SC-06, SC-09, SC-13

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: 'ai-turn-capture') => unknown;
  };
}

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  turnPhase: '[data-testid="turn-phase-indicator"]',
  submitPlay: '[data-testid="submit-play"]',
  confirmTurn: '[data-testid="confirm-turn"]',
  handCards: '[data-testid^="hand-card-"]',
  tableCards: '[data-testid^="table-card-"]',
  aiHandZone: '[data-testid="ai-hand-zone"]',
  nextTurnReveal: '[data-testid="next-turn-reveal"]',
  liveRegion: '[data-testid="a11y-live-region"]',
  playMotion: '.card-visual--animation-play',
  captureMotion: '.card-visual--animation-capture',
  dealMotion: '.card-visual--animation-deal',
  opponentMotion: '.card-visual--animation-opponent',
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

let tableCountBefore = 0;
let handCountBefore = 0;
let reducedMotionCaptureCount = 0;

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

const openSinglePlayerWithReducedMotion = (): void => {
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

const captureCountsBeforeAction = (): void => {
  cy.get(selectors.tableCards)
    .its('length')
    .then((count) => {
      tableCountBefore = Number(count);
    });

  cy.get(selectors.handCards)
    .its('length')
    .then((count) => {
      handCountBefore = Number(count);
    });
};

Given('reduced-motion single-player mode is active for dedicated path checks', () => {
  openSinglePlayerWithReducedMotion();
});

When('a reduced-motion non-capture play action is submitted', () => {
  captureCountsBeforeAction();
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
});

Then('play motion classes are not applied', () => {
  cy.get(selectors.playMotion).should('have.length', 0);
});

Then('placement outcome matches expected game state change', () => {
  cy.get(selectors.tableCards).should('have.length', tableCountBefore + 1);
  cy.get(selectors.handCards).should('have.length', handCountBefore - 1);
});

When('a reduced-motion legal capture action is submitted', () => {
  captureCountsBeforeAction();

  cy.get(selectors.handCards).then(($handCards) => {
    const handIndexedCards = buildIndexedCards($handCards as JQuery<HTMLElement>);

    cy.get(selectors.tableCards).then(($tableCards) => {
      const tableIndexedCards = buildIndexedCards($tableCards as JQuery<HTMLElement>);
      const selection = findLegalCaptureSelection(handIndexedCards, tableIndexedCards);

      if (selection === null) {
        throw new Error(
          'Could not find a legal capture setup for reduced-motion dedicated checks.',
        );
      }

      reducedMotionCaptureCount = selection.tableIndexes.length;
      cy.get(selectors.handCards).eq(selection.handIndex).focus().type('{enter}');
      selection.tableIndexes.forEach((tableIndex) => {
        cy.get(selectors.tableCards).eq(tableIndex).focus().type('{enter}');
      });

      cy.get(selectors.submitPlay).focus().type('{enter}');
      cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
    });
  });
});

Then('capture motion classes are not applied', () => {
  cy.get(selectors.captureMotion).should('have.length', 0);
});

Then('captured cards are removed with correct state outcome', () => {
  cy.get(selectors.tableCards).should('have.length', tableCountBefore - reducedMotionCaptureCount);
  cy.get(selectors.handCards).should('have.length', handCountBefore - 1);
});

When('reduced-motion turn confirmation advances to the next interaction phase', () => {
  cy.get(selectors.handCards).first().focus().type('{enter}');
  cy.get(selectors.submitPlay).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-confirmation');
  cy.get(selectors.confirmTurn).focus().type('{enter}');
  cy.get(selectors.turnPhase).should('contain.text', 'awaiting-card-play');
});

Then('deal motion classes are not applied', () => {
  cy.get(selectors.dealMotion).should('have.length', 0);
});

Then('hand interaction remains available after confirmation', () => {
  cy.get(selectors.handCards).should('have.length.greaterThan', 0);
  cy.get(selectors.handCards).first().should('not.have.attr', 'disabled');
});

When('reduced-motion AI turn fixture is applied', () => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error('Escobita test API is unavailable for reduced-motion AI fixture checks.');
    }

    testApi.applyEngineFixture('ai-turn-capture');
  });
});

Then('opponent motion classes are not applied', () => {
  cy.get(selectors.opponentMotion).should('have.length', 0);
});

Then('AI outcome remains readable for the player', () => {
  cy.get(selectors.aiHandZone).should('be.visible');
  cy.get(selectors.nextTurnReveal).should('be.visible');
  cy.get(selectors.liveRegion)
    .invoke('text')
    .should('match', /Laia|Turn changed to/);
});
