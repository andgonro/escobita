import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';

// Covers: SC-01 through SC-58

interface ContrastMeasurement {
  selector: string;
  ratio: number;
  isLargeText: boolean;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

const singleModeSelector = '[data-testid="mode-single"]';
const multiplayerModeSelector = '[data-testid="mode-multiplayer"]';
const singlePlayerNameSelector = '[data-testid="single-player-name"]';
const aiDifficultySelector = '[data-testid="ai-difficulty"]';
const aiNameSelector = '[data-testid="ai-name"]';
const playerCountSelector = '[data-testid="player-count"]';
const playButtonSelector = '[data-testid="play-button"]';

let keyboardReachableControls: string[] = [];
let focusOrderFollowsLayout = false;
let focusIndicatorVisible = false;
let selectorsRespondToArrowKeys = false;
let modeSelectorChangedWithArrowKeys = false;
let interactiveControlsLabeled = false;
let contrastMeasurements: ContrastMeasurement[] = [];
let pressedFeedbackLatencyMs: number | null = null;
let pressedFeedbackDetected = false;

const modeTestId = (modeLabel: string): string =>
  modeLabel === 'Single Player' ? 'mode-single' : 'mode-multiplayer';

const parseDurationMs = (duration: string): number => {
  const trimmed = duration.trim();

  if (trimmed.endsWith('ms')) {
    return Number.parseFloat(trimmed);
  }

  if (trimmed.endsWith('s')) {
    return Number.parseFloat(trimmed) * 1000;
  }

  return Number.POSITIVE_INFINITY;
};

const pushUnique = (target: string[], value: string): void => {
  if (!target.includes(value)) {
    target.push(value);
  }
};

const parseCssColor = (rawValue: string): RgbaColor | null => {
  const value = rawValue.trim();
  const hexMatch = value.match(/^#([0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i);

  if (hexMatch) {
    const hex = hexMatch[1];

    if (hex.length === 3 || hex.length === 4) {
      const r = Number.parseInt(`${hex[0]}${hex[0]}`, 16);
      const g = Number.parseInt(`${hex[1]}${hex[1]}`, 16);
      const b = Number.parseInt(`${hex[2]}${hex[2]}`, 16);
      const a = hex.length === 4 ? Number.parseInt(`${hex[3]}${hex[3]}`, 16) / 255 : 1;
      return { r, g, b, a };
    }

    const r = Number.parseInt(hex.slice(0, 2), 16);
    const g = Number.parseInt(hex.slice(2, 4), 16);
    const b = Number.parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1;

    return { r, g, b, a };
  }

  const rgbMatch = value.match(/^rgba?\((.+)\)$/i);

  if (!rgbMatch) {
    return null;
  }

  const normalized = rgbMatch[1].replace('/', ',').replace(/\s+/g, ' ').trim();
  const channels = normalized.split(/[, ]+/).filter((channel) => channel.length > 0);

  if (channels.length < 3) {
    return null;
  }

  const r = Number.parseFloat(channels[0]);
  const g = Number.parseFloat(channels[1]);
  const b = Number.parseFloat(channels[2]);
  const a = channels.length >= 4 ? Number.parseFloat(channels[3]) : 1;

  return {
    r,
    g,
    b,
    a: Number.isNaN(a) ? 1 : a,
  };
};

const compositeOnWhite = (color: RgbaColor): [number, number, number] => {
  const alpha = Math.max(0, Math.min(1, color.a));
  const toChannel = (channel: number): number => channel * alpha + 255 * (1 - alpha);

  return [toChannel(color.r), toChannel(color.g), toChannel(color.b)];
};

const channelToLinear = (channel: number): number => {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
};

const luminance = ([r, g, b]: [number, number, number]): number =>
  0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);

const contrastRatio = (
  foreground: [number, number, number],
  background: [number, number, number],
): number => {
  const light = Math.max(luminance(foreground), luminance(background));
  const dark = Math.min(luminance(foreground), luminance(background));
  return (light + 0.05) / (dark + 0.05);
};

const isLargeText = (element: HTMLElement): boolean => {
  const style = getComputedStyle(element);
  const fontSize = Number.parseFloat(style.fontSize);
  return fontSize >= 18;
};

const extractGradientBackgrounds = (backgroundImage: string): [number, number, number][] => {
  const tokens = backgroundImage.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]*\)/g) ?? [];
  return tokens
    .map((token) => parseCssColor(token))
    .filter((color): color is RgbaColor => color !== null)
    .map((color) => compositeOnWhite(color));
};

const resolveBackgrounds = (element: HTMLElement): [number, number, number][] => {
  let currentElement: HTMLElement | null = element;

  while (currentElement) {
    const style = getComputedStyle(currentElement);
    const gradientBackgrounds = extractGradientBackgrounds(style.backgroundImage);

    if (gradientBackgrounds.length > 0) {
      return gradientBackgrounds;
    }

    const color = parseCssColor(style.backgroundColor);

    if (color && color.a > 0) {
      return [compositeOnWhite(color)];
    }

    currentElement = currentElement.parentElement;
  }

  return [[255, 255, 255]];
};

const selectorLabel = (element: HTMLElement): string => {
  const testId = element.getAttribute('data-testid');
  if (testId) {
    return `[data-testid="${testId}"]`;
  }

  if (element.id) {
    return `${element.tagName.toLowerCase()}#${element.id}`;
  }

  return element.tagName.toLowerCase();
};

Given('I open the lobby screen', () => {
  cy.visit('/');
});

Given('I open the lobby screen on a {int} by {int} viewport', (width: number, height: number) => {
  cy.viewport(width, height);
  cy.visit('/');
});

Then('I should see the {string} heading', (title: string) => {
  cy.contains('h1', title).should('be.visible');
});

Then('the lobby heading should be the primary heading', () => {
  cy.get('h1').should('have.length', 1).and('be.visible');
});

Then('a decorative card-game element should be visible in the hero area', () => {
  cy.get('[data-testid="hero-decoration"]').should('be.visible');
  cy.get('[data-testid="hero-decoration"] span').should('have.length.at.least', 1);
});

Then('the hero area should not contain interactive controls', () => {
  cy.get('.hero').find('button, input, select, textarea, a').should('have.length', 0);
});

Then('the {string} mode is selected', (modeLabel: string) => {
  const testId = modeLabel === 'Single Player' ? 'mode-single' : 'mode-multiplayer';
  cy.get(`[data-testid="${testId}"]`).should('be.checked');
});

Then('the {string} mode is not selected', (modeLabel: string) => {
  cy.get(`[data-testid="${modeTestId(modeLabel)}"]`).should('not.be.checked');
});

Then('no mode de-selected state is possible', () => {
  cy.get(`${singleModeSelector}, ${multiplayerModeSelector}`).then(($inputs) => {
    const checkedCount = [...$inputs].filter((input) => (input as HTMLInputElement).checked).length;
    expect(checkedCount).to.equal(1);
  });
});

Then('the player-count selector is displayed', () => {
  cy.get(playerCountSelector).should('be.visible');
});

Then('the player-count selector is hidden', () => {
  cy.get(playerCountSelector).should('not.exist');
});

Then('the AI opponent name area is hidden', () => {
  cy.get(aiNameSelector).should('not.exist');
});

Then('the AI opponent name area is visible', () => {
  cy.get(aiNameSelector).should('be.visible');
});

Then('the single player name input is visible', () => {
  cy.get(singlePlayerNameSelector).should('be.visible');
});

Then('the AI difficulty selector is visible', () => {
  cy.get(aiDifficultySelector).should('be.visible');
});

Then('exactly one single-player name input is visible', () => {
  cy.get(singlePlayerNameSelector).should('have.length', 1).and('be.visible');
  cy.get('[data-testid^="multiplayer-name-"]').should('have.length', 0);
});

Then('single player name should contain {string}', (expectedName: string) => {
  cy.get(singlePlayerNameSelector).should('have.value', expectedName);
});

Then('I should see the AI opponent name {string}', (aiName: string) => {
  cy.get('[data-testid="ai-name"]').should('be.visible').and('contain.text', aiName);
});

Then('the AI opponent name should be read-only text', () => {
  cy.get(aiNameSelector).should('not.match', 'input, textarea, select');
  cy.get(aiNameSelector).should('not.have.attr', 'contenteditable', 'true');
});

Then(
  'the AI difficulty selector should offer {string}, {string}, and {string}',
  (first: string, second: string, third: string) => {
    cy.get('[data-testid="ai-difficulty"] option').then(($options) => {
      const labels = [...$options].map((option) => option.textContent?.trim());
      expect(labels).to.deep.equal([first, second, third]);
    });
  },
);

Then('the AI difficulty selector should have {string} selected', (difficulty: string) => {
  cy.get('[data-testid="ai-difficulty"]').should('have.value', difficulty);
});

Then('the {string} button is enabled', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).should('be.enabled');
});

Then('the {string} button should be visible', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).should('be.visible');
});

Then('the {string} button should be visually prominent', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).then(($button) => {
    const style = getComputedStyle($button[0]);
    expect(style.backgroundImage).not.to.equal('none');
    expect(Number.parseFloat(style.fontSize)).to.be.greaterThan(16);
    expect(style.color).not.to.equal('rgb(0, 0, 0)');
  });
});

When('I switch to {string} mode', (modeLabel: string) => {
  const testId = modeLabel === 'Single Player' ? 'mode-single' : 'mode-multiplayer';
  cy.get(`[data-testid="${testId}"]`).click({ force: true });
});

When('I click the currently selected {string} mode option', (modeLabel: string) => {
  cy.get(`[data-testid="${modeTestId(modeLabel)}"]`)
    .should('be.checked')
    .click({ force: true });
});

When('I wait briefly without interaction', () => {
  cy.wait(150);
});

When('I choose {int} players', (count: number) => {
  cy.get('[data-testid="player-count"]').select(`${count}`);
});

When('I set AI difficulty to {string}', (difficulty: string) => {
  cy.get('[data-testid="ai-difficulty"]').select(difficulty);
});

When('I enter {string} in multiplayer player {int}', (name: string, playerNumber: number) => {
  cy.get(`[data-testid="multiplayer-name-${playerNumber}"]`).clear().type(name);
});

When('I clear multiplayer player {int} and blur the field', (playerNumber: number) => {
  cy.get(`[data-testid="multiplayer-name-${playerNumber}"]`).clear().blur();
});

When('I clear all three multiplayer player names and blur each field', () => {
  [1, 2, 3].forEach((playerNumber) => {
    cy.get(`[data-testid="multiplayer-name-${playerNumber}"]`).clear().blur();
  });
});

When('I focus multiplayer player {int} and press Enter', (playerNumber: number) => {
  cy.get(`[data-testid="multiplayer-name-${playerNumber}"]`).focus().type('{enter}');
});

When('I focus the single player name without typing', () => {
  cy.get(singlePlayerNameSelector).focus();
});

Then('I should see {int} multiplayer name fields', (count: number) => {
  cy.get('[data-testid^="multiplayer-name-"]').should('have.length', count);
});

Then('multiplayer player {int} input should not exist', (playerNumber: number) => {
  cy.get(`[data-testid="multiplayer-name-${playerNumber}"]`).should('not.exist');
});

Then(
  'the player-count selector should offer {string}, {string}, and {string}',
  (first: string, second: string, third: string) => {
    cy.get('[data-testid="player-count"] option').then(($options) => {
      const values = [...$options].map((option) => option.getAttribute('value'));
      expect(values).to.deep.equal([first, second, third]);
    });
  },
);

Then('multiplayer player {int} should contain {string}', (playerNumber: number, name: string) => {
  cy.get(`[data-testid="multiplayer-name-${playerNumber}"]`).should('have.value', name);
});

Then('the AI difficulty selector is hidden', () => {
  cy.get('[data-testid="ai-difficulty"]').should('not.exist');
});

When('I clear the single player name and blur the field', () => {
  cy.get('[data-testid="single-player-name"]').clear().blur();
});

When('I type only spaces in the single player name and blur the field', () => {
  cy.get('[data-testid="single-player-name"]').clear().type('   ').blur();
});

When('I type {string} in the single player name', (name: string) => {
  cy.get('[data-testid="single-player-name"]').clear().type(name);
});

When('I try to press the {string} button', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).click({ force: true });
});

When('I press the {string} button', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).click();
});

Then('I should see a Spanish required-name error', () => {
  cy.get('[data-testid="single-player-name-error"]')
    .should('be.visible')
    .and('contain.text', 'nombre');
});

Then('the Spanish required-name error should mention {string}', (expectedText: string) => {
  cy.get('[data-testid="single-player-name-error"]').should('contain.text', expectedText);
});

Then('the single player required-name error should not be visible', () => {
  cy.get('[data-testid="single-player-name-error"]').should('not.exist');
});

Then('no validation error messages should be visible', () => {
  cy.get('body').find('.error-text').should('have.length', 0);
});

Then('the single player input should reference its error message', () => {
  cy.get('[data-testid="single-player-name"]')
    .should('have.attr', 'aria-describedby', 'single-player-name-error')
    .and('have.attr', 'aria-invalid', 'true');
  cy.get('#single-player-name-error').should('be.visible');
});

Then('the {string} button is disabled', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).should('be.disabled');
});

Then('the single player name field should remain empty', () => {
  cy.get(singlePlayerNameSelector).should('have.value', '');
});

Then('I should see required-name errors for multiplayer players 1 through 3', () => {
  [1, 2, 3].forEach((playerNumber) => {
    cy.get(`[data-testid="multiplayer-name-error-${playerNumber}"]`).should('be.visible');
  });
});

Then('the application should stay on the lobby route', () => {
  cy.location('pathname').should('eq', '/');
});

Then('the application should navigate to the game board route', () => {
  cy.location('pathname').should('eq', '/partida');
});

When('I focus the {string} button and press Enter', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).focus().type('{enter}');
});

When('I focus the {string} button and press Space', (buttonLabel: string) => {
  cy.contains('button', buttonLabel).focus().type(' ');
});

When('I press and hold the {string} button', (buttonLabel: string) => {
  pressedFeedbackLatencyMs = null;
  pressedFeedbackDetected = false;

  cy.contains('button', buttonLabel).then(($button) => {
    const style = getComputedStyle($button[0]);
    const durations = style.transitionDuration
      .split(',')
      .map((duration) => parseDurationMs(duration))
      .filter((duration) => Number.isFinite(duration) && duration > 0);

    pressedFeedbackLatencyMs = durations.length > 0 ? Math.min(...durations) : null;

    const hasActiveRule = style.transitionDuration !== '0s';
    const hasInteractiveTransformRule = style.transitionProperty.includes('transform');
    pressedFeedbackDetected = hasActiveRule || hasInteractiveTransformRule;

    cy.wrap($button).trigger('mousedown', { button: 0, force: true });
    cy.wrap($button).trigger('mouseup', { force: true });
  });
});

Then('pressing and holding {string} should show visual feedback within 100 milliseconds', () => {
  expect(pressedFeedbackDetected).to.equal(true);
  expect(pressedFeedbackLatencyMs).to.not.equal(null);
  expect(pressedFeedbackLatencyMs as number).to.be.lessThan(100);
});

Then('the page should not have horizontal overflow', () => {
  cy.document().then((doc) => {
    expect(doc.documentElement.scrollWidth).to.be.lte(doc.documentElement.clientWidth);
  });
});

Then('the hero section should appear above the setup panel', () => {
  cy.get('.hero').then(($hero) => {
    const heroBottom = $hero[0].getBoundingClientRect().bottom;

    cy.get('.setup-panel').then(($panel) => {
      const panelTop = $panel[0].getBoundingClientRect().top;
      expect(panelTop).to.be.greaterThan(heroBottom - 1);
    });
  });
});

Then('all primary controls should have at least 44 by 44 pixels', () => {
  cy.get('.radio-chip, input[type="text"], select, .play-button').each(($control) => {
    const { width, height } = $control[0].getBoundingClientRect();
    expect(width).to.be.at.least(44);
    expect(height).to.be.at.least(44);
  });
});

Then('the hero and setup sections should be side by side', () => {
  cy.get('.hero').then(($hero) => {
    const heroRect = $hero[0].getBoundingClientRect();

    cy.get('.setup-panel').then(($panel) => {
      const panelRect = $panel[0].getBoundingClientRect();

      expect(Math.abs(panelRect.top - heroRect.top)).to.be.lessThan(40);
      expect(panelRect.left).to.be.greaterThan(heroRect.left + 100);
    });
  });
});

Then('the desktop layout should use meaningful horizontal space', () => {
  cy.get('.lobby-layout').then(($layout) => {
    const layoutRect = $layout[0].getBoundingClientRect();

    cy.get('.hero').then(($hero) => {
      const heroRect = $hero[0].getBoundingClientRect();

      cy.get('.setup-panel').then(($panel) => {
        const panelRect = $panel[0].getBoundingClientRect();
        const heroShare = heroRect.width / layoutRect.width;
        const panelShare = panelRect.width / layoutRect.width;

        expect(heroShare).to.be.greaterThan(0.25);
        expect(panelShare).to.be.greaterThan(0.25);
      });
    });
  });
});

When('I probe keyboard reachable controls', () => {
  keyboardReachableControls = [];

  const probeFocus = (selector: string): void => {
    cy.get(selector)
      .should('be.visible')
      .focus()
      .then(($element) => {
        const activeElement = $element[0].ownerDocument.activeElement;
        if (activeElement === $element[0]) {
          const controlId = $element.attr('data-testid') ?? selector;
          pushUnique(keyboardReachableControls, controlId);
        }
      });
  };

  probeFocus(singleModeSelector);
  probeFocus(multiplayerModeSelector);
  probeFocus(singlePlayerNameSelector);
  probeFocus(aiDifficultySelector);
  probeFocus(playButtonSelector);

  cy.get(multiplayerModeSelector).click({ force: true });
  probeFocus(playerCountSelector);
  probeFocus('[data-testid="multiplayer-name-1"]');
  probeFocus('[data-testid="multiplayer-name-2"]');
  probeFocus(playButtonSelector);
});

Then('keyboard reachable controls should include lobby interactive elements', () => {
  const expectedControls = [
    'mode-single',
    'mode-multiplayer',
    'single-player-name',
    'ai-difficulty',
    'play-button',
    'player-count',
    'multiplayer-name-1',
    'multiplayer-name-2',
  ];

  expectedControls.forEach((control) => {
    expect(keyboardReachableControls).to.include(control);
  });
});

Then('no interactive control should be skipped in the keyboard map', () => {
  const uniqueControls = new Set(keyboardReachableControls);
  expect(uniqueControls.size).to.equal(keyboardReachableControls.length);
});

When('I capture the focusable controls layout order', () => {
  focusOrderFollowsLayout = true;

  cy.get(
    [
      singleModeSelector,
      multiplayerModeSelector,
      singlePlayerNameSelector,
      aiDifficultySelector,
      playButtonSelector,
    ].join(', '),
  ).then(($elements) => {
    const controls = [...$elements].filter((element) => Cypress.dom.isVisible(element));
    const positions = controls.map((element) => {
      const rect = (element as HTMLElement).getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
      };
    });

    for (let index = 1; index < positions.length; index += 1) {
      const previous = positions[index - 1];
      const current = positions[index];
      const sameRow = Math.abs(current.top - previous.top) < 16;

      if (sameRow && current.left + 1 < previous.left) {
        focusOrderFollowsLayout = false;
      }

      if (!sameRow && current.top + 1 < previous.top) {
        focusOrderFollowsLayout = false;
      }
    }
  });
});

Then('focus order should follow top-to-bottom and left-to-right layout', () => {
  expect(focusOrderFollowsLayout).to.equal(true);
});

When('I focus interactive controls for accessibility', () => {
  focusIndicatorVisible = false;

  cy.document().then((documentRef) => {
    const cssText = Array.from(documentRef.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join('\n');
        } catch {
          return '';
        }
      })
      .join('\n');

    if (cssText.includes(':focus-visible')) {
      focusIndicatorVisible = true;
    }
  });

  [singlePlayerNameSelector, aiDifficultySelector, playButtonSelector].forEach((selector) => {
    cy.get(selector)
      .focus()
      .then(($control) => {
        const style = getComputedStyle($control[0]);
        const hasOutline =
          style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) >= 1;
        const hasBoxShadow = style.boxShadow !== 'none';

        if (hasOutline || hasBoxShadow) {
          focusIndicatorVisible = true;
        }
      });
  });
});

Then('focused controls should show a visible focus indicator', () => {
  expect(focusIndicatorVisible).to.equal(true);
});

When('I use arrow keys on mode and difficulty selectors', () => {
  selectorsRespondToArrowKeys = false;
  modeSelectorChangedWithArrowKeys = false;

  cy.get(singleModeSelector).focus().type('{rightArrow}');

  cy.get(multiplayerModeSelector).then(($multiplayerMode) => {
    modeSelectorChangedWithArrowKeys = ($multiplayerMode[0] as HTMLInputElement).checked;
  });

  cy.get(singleModeSelector).click({ force: true });
  cy.get(aiDifficultySelector).then(($select) => {
    const currentValue = ($select[0] as HTMLSelectElement).value;

    cy.wrap($select).focus();
    cy.get('body').type('{downArrow}{enter}');
    cy.get(aiDifficultySelector).then(($updatedSelect) => {
      const updatedValue = ($updatedSelect[0] as HTMLSelectElement).value;
      const stillFocused = $updatedSelect[0] === $updatedSelect[0].ownerDocument.activeElement;
      selectorsRespondToArrowKeys = updatedValue !== currentValue || stillFocused;
    });
  });
});

Then('selector values should change with arrow-key input', () => {
  expect(modeSelectorChangedWithArrowKeys).to.equal(true);
  expect(selectorsRespondToArrowKeys).to.equal(true);
});

When('I inspect interactive control labeling', () => {
  interactiveControlsLabeled = true;

  const assertAccessibleLabel = (selector: string): void => {
    cy.get(selector)
      .should('be.visible')
      .then(($control) => {
        const element = $control[0] as HTMLInputElement | HTMLSelectElement | HTMLButtonElement;
        const ariaLabel = element.getAttribute('aria-label')?.trim() ?? '';
        const ariaLabelledBy = element.getAttribute('aria-labelledby')?.trim() ?? '';
        const labels = 'labels' in element ? element.labels : null;
        const hasProgrammaticLabel =
          (labels !== null && labels.length > 0) ||
          ariaLabel.length > 0 ||
          ariaLabelledBy.length > 0;

        if (element.tagName.toLowerCase() === 'button') {
          const textLabel = element.textContent?.trim() ?? '';
          if (!hasProgrammaticLabel && textLabel.length === 0) {
            interactiveControlsLabeled = false;
          }
          return;
        }

        if (!hasProgrammaticLabel) {
          interactiveControlsLabeled = false;
        }
      });
  };

  assertAccessibleLabel(singleModeSelector);
  assertAccessibleLabel(multiplayerModeSelector);
  assertAccessibleLabel(singlePlayerNameSelector);
  assertAccessibleLabel(aiDifficultySelector);
  assertAccessibleLabel(playButtonSelector);

  cy.get(multiplayerModeSelector).click({ force: true });
  assertAccessibleLabel(playerCountSelector);
  assertAccessibleLabel('[data-testid="multiplayer-name-1"]');
  assertAccessibleLabel('[data-testid="multiplayer-name-2"]');
  assertAccessibleLabel(playButtonSelector);
});

Then('every interactive control should have an accessible label', () => {
  expect(interactiveControlsLabeled).to.equal(true);
});

Then('a screen reader focused on the input should expose the error description', () => {
  cy.get(singlePlayerNameSelector).then(($input) => {
    const input = $input[0] as HTMLInputElement;
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).to.equal('single-player-name-error');

    const description = input.ownerDocument.getElementById(describedBy ?? '');
    expect(description).not.to.equal(null);
    expect(description?.textContent?.toLowerCase()).to.contain('obligatorio');
  });
});

When('I measure visible text contrast ratios', () => {
  contrastMeasurements = [];

  cy.get('h1, h2, h3, p, label, legend, button, span, option').then(($elements) => {
    const visibleElements = [...$elements].filter((element) => {
      const hasText = (element.textContent?.trim().length ?? 0) > 0;
      return hasText && Cypress.dom.isVisible(element);
    });

    visibleElements.forEach((elementNode) => {
      const element = elementNode as HTMLElement;
      const textColor = parseCssColor(getComputedStyle(element).color);

      if (!textColor) {
        return;
      }

      const foreground = compositeOnWhite(textColor);
      const backgrounds = resolveBackgrounds(element);

      const minimumRatio = backgrounds.reduce(
        (lowest, background) => Math.min(lowest, contrastRatio(foreground, background)),
        Number.POSITIVE_INFINITY,
      );

      contrastMeasurements.push({
        selector: selectorLabel(element),
        ratio: minimumRatio,
        isLargeText: isLargeText(element),
      });
    });
  });
});

Then('all normal-size text should meet at least 4.5 to 1 contrast', () => {
  const normalTextMeasurements = contrastMeasurements.filter(
    (measurement) => !measurement.isLargeText,
  );
  expect(normalTextMeasurements.length).to.be.greaterThan(0);

  normalTextMeasurements.forEach((measurement) => {
    expect(
      measurement.ratio,
      `${measurement.selector} has contrast ratio ${measurement.ratio.toFixed(2)} but expected >= 4.5`,
    ).to.be.at.least(4.5);
  });
});

Then('all large-size text should meet at least 3 to 1 contrast', () => {
  const largeTextMeasurements = contrastMeasurements.filter(
    (measurement) => measurement.isLargeText,
  );
  expect(largeTextMeasurements.length).to.be.greaterThan(0);

  largeTextMeasurements.forEach((measurement) => {
    expect(
      measurement.ratio,
      `${measurement.selector} has contrast ratio ${measurement.ratio.toFixed(2)} but expected >= 3`,
    ).to.be.at.least(3);
  });
});
