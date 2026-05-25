import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-20, SC-21

type EngineFixture = 'ai-turn-capture';
type TurnSequencingFixture = 'missing-completion';

interface EngineStateSummary {
  roundNumber: number;
  tableCardCount: number;
  handCardCounts: number[];
  roundResultPresent: boolean;
  winnerCount: number;
  turnPhase: string;
}

interface TurnSequencingSummary {
  turnPhase: string;
  turnSequenceState: 'awaiting-animation-completion' | 'paused' | 'ready-to-confirm' | 'recovered';
  pauseMs?: number;
  reducedMotion?: boolean;
}

interface EscobitaTestApiWindow extends Window {
  __escobitaTestApi?: {
    applyEngineFixture: (fixture: EngineFixture) => unknown;
    readEngineStateSummary: () => EngineStateSummary;
    applyTurnSequencingFixture: (fixture: TurnSequencingFixture) => void;
    readTurnSequencingSummary: () => TurnSequencingSummary;
  };
}

const selectors = {
  modeSingle: '[data-testid="mode-single"]',
  playButton: '[data-testid="play-button"]',
  handCards: '[data-testid^="hand-card-"]',
  tableCards: '[data-testid^="table-card-"]',
  playMotion: '.card-visual--animation-play',
  captureMotion: '.card-visual--animation-capture',
  opponentMotion: '.card-visual--animation-opponent',
};

let baselineEngineSummary: EngineStateSummary | null = null;
let latestEngineSummary: EngineStateSummary | null = null;
let latestTurnSequencingSummary: TurnSequencingSummary | null = null;

const openSinglePlayerGame = (): void => {
  cy.visit('/');
  cy.get(selectors.modeSingle).click();
  cy.get(selectors.playButton).click();
  cy.location('pathname').should('eq', '/partida');
};

const withTestApi = (
  callback: (testApi: NonNullable<EscobitaTestApiWindow['__escobitaTestApi']>) => void,
): void => {
  cy.window().then((windowRef) => {
    const testApi = (windowRef as EscobitaTestApiWindow).__escobitaTestApi;
    if (!testApi) {
      throw new Error('Escobita test API is unavailable for animation isolation checks.');
    }

    callback(testApi);
  });
};

Given('a single-player game is ready for animation isolation checks', () => {
  baselineEngineSummary = null;
  latestEngineSummary = null;
  latestTurnSequencingSummary = null;
  openSinglePlayerGame();
});

When('an animation-heavy fixture is applied for isolation checks', () => {
  withTestApi((testApi) => {
    testApi.applyEngineFixture('ai-turn-capture');
    baselineEngineSummary = testApi.readEngineStateSummary();
  });
});

Then('engine state summary remains stable while animation metadata is present', () => {
  cy.wait(300);

  withTestApi((testApi) => {
    latestEngineSummary = testApi.readEngineStateSummary();
  });

  cy.then(() => {
    expect(baselineEngineSummary).to.not.equal(null);
    expect(latestEngineSummary).to.not.equal(null);
    expect(latestEngineSummary).to.deep.equal(baselineEngineSummary);
  });
});

Then('animation metadata is visible without changing rule outcomes', () => {
  cy.get(`${selectors.playMotion}, ${selectors.captureMotion}, ${selectors.opponentMotion}`).should(
    'have.length.greaterThan',
    0,
  );

  cy.then(() => {
    expect(latestEngineSummary?.roundResultPresent).to.equal(false);
    expect(latestEngineSummary?.winnerCount).to.equal(0);
  });
});

When('interruption recovery is triggered for completion handling', () => {
  withTestApi((testApi) => {
    testApi.applyTurnSequencingFixture('missing-completion');
    latestTurnSequencingSummary = testApi.readTurnSequencingSummary();
    latestEngineSummary = testApi.readEngineStateSummary();
  });
});

Then('turn sequencing reports recovered state', () => {
  cy.then(() => {
    expect(latestTurnSequencingSummary).to.not.equal(null);
    expect(latestTurnSequencingSummary?.turnSequenceState).to.equal('recovered');
  });
});

Then('engine state remains legal with no orphaned visible card identities', () => {
  cy.then(() => {
    expect(latestEngineSummary).to.not.equal(null);
    expect(latestEngineSummary?.tableCardCount ?? -1).to.be.greaterThan(-1);
    (latestEngineSummary?.handCardCounts ?? []).forEach((count) => {
      expect(count).to.be.greaterThan(-1);
    });
    expect(['awaiting-card-play', 'awaiting-confirmation']).to.include(
      latestEngineSummary?.turnPhase ?? '',
    );
  });

  cy.get(selectors.handCards).then(($handCards) => {
    const handIds = $handCards.toArray().map((el) => el.getAttribute('data-testid') ?? '');
    expect(new Set(handIds).size).to.equal(handIds.length);
  });

  cy.get(selectors.tableCards).then(($tableCards) => {
    const tableIds = $tableCards.toArray().map((el) => el.getAttribute('data-testid') ?? '');
    expect(new Set(tableIds).size).to.equal(tableIds.length);
  });
});
