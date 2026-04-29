# BDD Test Scenarios: Lobby Screen

**Source Spec:** `docs/specs/ui/lobby/`  
**Generated from:** proposal.md, spec.md, user-stories.md

> **Spec notes applied:**
>
> - AI difficulty resets to "Easy" when switching modes and back to Single Player (per US-3 acceptance criteria).
> - Player names are preserved when switching modes back and forth (per user confirmation).
> - Validation errors appear on blur; errors clear live as the user types (per user confirmation).
> - AI opponent fixed display name confirmed as "Laia".

---

## Traceability Matrix

| Scenario ID | Requirement            | User Story | Category         |
| ----------- | ---------------------- | ---------- | ---------------- |
| SC-01       | FR-1.1, FR-1.2         | US-1       | Happy Path       |
| SC-02       | FR-1.3                 | US-1       | Happy Path       |
| SC-03       | FR-1.4, TR-1.2         | US-7       | Happy Path       |
| SC-04       | FR-2.1                 | US-1       | Happy Path       |
| SC-05       | FR-2.2                 | US-1       | Happy Path       |
| SC-06       | FR-2.3                 | US-1       | Happy Path       |
| SC-07       | FR-3.3                 | US-2       | Happy Path       |
| SC-08       | FR-3.1, FR-3.4         | US-2       | Happy Path       |
| SC-09       | FR-3.1, FR-3.4         | US-2       | Alternative Path |
| SC-10       | FR-3.2                 | US-2       | Edge Case        |
| SC-11       | FR-3.4, FR-5.6         | US-2       | Happy Path       |
| SC-12       | FR-3.4, FR-4.6         | US-2       | Happy Path       |
| SC-13       | FR-4.1                 | US-3       | Happy Path       |
| SC-14       | FR-4.2                 | US-3, US-5 | Happy Path       |
| SC-15       | FR-4.3                 | US-3       | Happy Path       |
| SC-16       | FR-4.4                 | US-3       | Happy Path       |
| SC-17       | FR-4.5                 | US-3       | Happy Path       |
| SC-18       | FR-4.5                 | US-3       | Edge Case        |
| SC-19       | FR-4.2                 | US-3       | Edge Case        |
| SC-20       | FR-4.6                 | US-3       | Happy Path       |
| SC-21       | FR-5.1                 | US-4       | Happy Path       |
| SC-22       | FR-5.2                 | US-4       | Happy Path       |
| SC-23       | FR-5.3                 | US-4       | Happy Path       |
| SC-24       | FR-5.4                 | US-4, US-5 | Happy Path       |
| SC-25       | FR-5.3                 | US-4       | Happy Path       |
| SC-26       | FR-5.3                 | US-4       | Alternative Path |
| SC-27       | FR-5.5                 | US-4       | Happy Path       |
| SC-28       | FR-5.4                 | US-4       | Edge Case        |
| SC-29       | FR-5.6                 | US-4       | Happy Path       |
| SC-30       | FR-6.2                 | US-5       | Happy Path       |
| SC-31       | FR-7.3                 | US-5, US-7 | Happy Path       |
| SC-32       | FR-6.3                 | US-6       | Error            |
| SC-33       | FR-6.3, NFR-3.2        | US-6       | Error            |
| SC-34       | FR-6.3                 | US-6       | Happy Path       |
| SC-35       | FR-6.1                 | US-6       | Edge Case        |
| SC-36       | FR-7.2                 | US-6, US-7 | Error            |
| SC-37       | FR-7.3                 | US-6, US-7 | Happy Path       |
| SC-38       | FR-6.2                 | US-5       | Edge Case        |
| SC-39       | FR-6.1                 | US-6       | Error            |
| SC-40       | FR-7.1                 | US-7       | Happy Path       |
| SC-41       | FR-7.1                 | US-7       | Happy Path       |
| SC-42       | FR-7.4, FR-7.5, TR-4.1 | US-7       | Happy Path       |
| SC-43       | FR-7.4, FR-7.5, TR-4.1 | US-7       | Happy Path       |
| SC-44       | FR-7.2                 | US-7       | Error            |
| SC-45       | NFR-1.2                | US-7       | Non-Functional   |
| SC-46       | FR-8.1                 | US-8       | Non-Functional   |
| SC-47       | FR-8.2                 | US-8       | Non-Functional   |
| SC-48       | FR-8.3                 | US-8       | Non-Functional   |
| SC-49       | FR-8.2                 | US-8       | Non-Functional   |
| SC-50       | NFR-2.3                | US-9       | Non-Functional   |
| SC-51       | NFR-2.3                | US-9       | Non-Functional   |
| SC-52       | NFR-2.3                | US-9       | Non-Functional   |
| SC-53       | NFR-2.3                | US-9       | Non-Functional   |
| SC-54       | NFR-2.3                | US-9       | Non-Functional   |
| SC-55       | NFR-2.3                | US-9       | Edge Case        |
| SC-56       | NFR-2.1                | US-9       | Non-Functional   |
| SC-57       | NFR-2.4                | US-6, US-9 | Non-Functional   |
| SC-58       | NFR-2.2                | US-1       | Non-Functional   |

---

## Feature: Screen Entry and Routing

### Scenario: SC-01 — Lobby screen is displayed when the application is opened at the root URL

    Given the user opens the application at the root URL
    When the page finishes loading
    Then the Lobby screen is displayed
    And no redirect, splash screen, or other screen is shown first

### Scenario: SC-02 — Lobby screen remains visible without player interaction

    Given the Lobby screen has loaded
    When no user action is performed
    Then the Lobby screen continues to be displayed
    And the application does not navigate away automatically

### Scenario: SC-03 — A named route for the game board screen exists in the routing configuration

    Given the Lobby screen is open
    And the form is valid
    When the player presses the "Jugar" button
    Then the application navigates to the game board route without a routing error

---

## Feature: Branding and Hero Area

### Scenario: SC-04 — Game title "La Escoba" is displayed as the primary heading

    Given the Lobby screen is open
    When the player views the hero area
    Then the text "La Escoba" is displayed as the prominent primary heading

### Scenario: SC-05 — Hero area includes at least one card-game or broom-themed decorative element

    Given the Lobby screen is open
    When the player views the hero area
    Then at least one visual element related to the card-game or broom theme is visible in the hero area

### Scenario: SC-06 — Hero area contains no interactive controls

    Given the Lobby screen is open
    When the player inspects the hero area
    Then no buttons, inputs, links, or selectable controls are present in the hero area

---

## Feature: Game Mode Selection

### Background:

    Given the Lobby screen is open

### Rule: A mode is always selected

    ### Scenario: SC-07 — "Single Player" is selected by default on first load

      When the Lobby finishes loading
      Then the "Single Player" game mode option is selected
      And the "Multiplayer" game mode option is not selected

    ### Scenario: SC-10 — The game mode selector cannot be left without a selection

      Given "Single Player" is the currently active mode
      When the player attempts to deselect the "Single Player" option without selecting the other
      Then "Single Player" remains selected
      And no empty or de-selected state is possible

### Rule: Switching modes updates the visible setup fields

    ### Scenario: SC-08 — Selecting "Multiplayer" shows multiplayer-specific fields

      Given "Single Player" mode is currently selected
      When the player selects "Multiplayer" mode
      Then the player-count selector is displayed
      And multiple player name fields are displayed
      And the AI difficulty selector is not visible
      And the AI opponent name area is not visible

    ### Scenario: SC-09 — Selecting "Single Player" shows single-player-specific fields

      Given "Multiplayer" mode is currently selected
      When the player selects "Single Player" mode
      Then exactly one human player name field is displayed
      And the AI opponent name area is displayed
      And the AI difficulty selector is displayed
      And the player-count selector is not visible

    ### Scenario: SC-11 — Switching from "Single Player" to "Multiplayer" hides the AI difficulty selector

      Given "Single Player" mode is currently selected
      And the AI difficulty selector is visible
      When the player selects "Multiplayer" mode
      Then the AI difficulty selector is not visible

    ### Scenario: SC-12 — Switching from "Multiplayer" to "Single Player" hides the player-count selector

      Given "Multiplayer" mode is currently selected
      And the player-count selector is visible
      When the player selects "Single Player" mode
      Then the player-count selector is not visible

---

## Feature: Single Player Mode Configuration

### Background:

    Given the Lobby screen is open
    And "Single Player" mode is selected

### Rule: Human player field and read-only AI display

    ### Scenario: SC-13 — Exactly one editable name field is displayed for the human player

      When the setup panel is rendered
      Then exactly one editable name input field is visible in the setup panel

    ### Scenario: SC-14 — Human player name field is pre-filled with "Jugador-1"

      When the setup panel is rendered
      Then the human player name field contains the value "Jugador-1"

    ### Scenario: SC-15 — AI opponent is displayed with the fixed name "Laia" in a read-only area

      When the setup panel is rendered
      Then the text "Laia" is displayed as the AI opponent's name
      And the AI opponent name is not an editable field

    ### Scenario: SC-16 — AI difficulty selector shows exactly three options: Easy, Medium, and Hard

      When the setup panel is rendered
      Then the AI difficulty selector displays exactly three options: "Easy", "Medium", and "Hard"

    ### Scenario: SC-17 — "Easy" is the default selected difficulty when the Lobby first loads

      When the Lobby finishes loading
      Then the AI difficulty selector has "Easy" selected

    ### Scenario: SC-20 — Player-count selector is not visible in Single Player mode

      When the setup panel is rendered
      Then the player-count selector is not visible

### Rule: State management across mode switches

    ### Scenario: SC-18 — AI difficulty resets to "Easy" after switching to Multiplayer and back

      Given the player has changed the AI difficulty to "Hard"
      When the player switches to "Multiplayer" mode
      And the player switches back to "Single Player" mode
      Then the AI difficulty selector has "Easy" selected

    ### Scenario: SC-19 — Human player name is preserved after switching to Multiplayer and back

      Given the player has changed the human player name to "Carlos"
      When the player switches to "Multiplayer" mode
      And the player switches back to "Single Player" mode
      Then the human player name field contains "Carlos"

---

## Feature: Local Multiplayer Mode Configuration

### Background:

    Given the Lobby screen is open
    And "Multiplayer" mode is selected

### Rule: Player count selector and dynamic name fields

    ### Scenario: SC-21 — Player-count selector displays options 2, 3, and 4

      When the setup panel is rendered
      Then the player-count selector shows exactly three options: 2, 3, and 4

    ### Scenario: SC-22 — Default player count is 2 when Multiplayer mode is first activated

      When Multiplayer mode is first activated
      Then the player-count selector has the value 2 selected
      And exactly 2 name fields are visible

    ### Scenario Outline: SC-23 — The number of name fields matches the selected player count

      When the player sets the player count to <count>
      Then exactly <count> name fields are displayed in the setup panel

      Examples:
        | count |
        | 2     |
        | 3     |
        | 4     |

    ### Scenario Outline: SC-24 — Each name field is pre-filled with its "Jugador-N" default value

      Given the player count is set to <count>
      When the name fields are rendered
      Then the name field at position <position> contains the value "<default_name>"

      Examples:
        | count | position | default_name |
        | 2     | 1        | Jugador-1    |
        | 2     | 2        | Jugador-2    |
        | 3     | 3        | Jugador-3    |
        | 4     | 4        | Jugador-4    |

    ### Scenario: SC-25 — Increasing the player count adds a new name field at the end with the appropriate default

      Given the player count is set to 2
      And the player has entered "Ana" in the name field at position 1
      And the player has entered "Luis" in the name field at position 2
      When the player increases the player count to 3
      Then a third name field is added at the end of the list
      And the third name field contains "Jugador-3"
      And the name field at position 1 still contains "Ana"
      And the name field at position 2 still contains "Luis"

    ### Scenario: SC-26 — Decreasing the player count removes the last name field

      Given the player count is set to 3
      When the player decreases the player count to 2
      Then exactly 2 name fields are displayed
      And the third name field is no longer visible

    ### Scenario: SC-27 — Decreasing the player count preserves the names in the remaining fields

      Given the player count is set to 3
      And the player has entered "Ana" in the name field at position 1
      And the player has entered "Luis" in the name field at position 2
      And the player has entered "Marta" in the name field at position 3
      When the player decreases the player count to 2
      Then the name field at position 1 still contains "Ana"
      And the name field at position 2 still contains "Luis"

    ### Scenario: SC-28 — Multiplayer names are preserved when switching to Single Player and back

      Given the player has entered "Ana" in the name field at position 1
      And the player has entered "Luis" in the name field at position 2
      When the player switches to "Single Player" mode
      And the player switches back to "Multiplayer" mode
      Then the name field at position 1 contains "Ana"
      And the name field at position 2 contains "Luis"

    ### Scenario: SC-29 — AI difficulty selector is not visible in Multiplayer mode

      When the setup panel is rendered
      Then the AI difficulty selector is not visible

---

## Feature: Player Name Validation

### Background:

    Given the Lobby screen is open

### Rule: Default values keep the form valid from the start

    ### Scenario: SC-30 — All name fields are pre-filled on load, placing the form in a valid state

      When the Lobby finishes loading
      Then all player name fields contain their default values
      And no validation error messages are displayed

    ### Scenario: SC-31 — The "Jugar" button is enabled immediately on page load

      When the Lobby finishes loading
      Then the "Jugar" button is enabled

    ### Scenario: SC-38 — Clearing a name field and re-focusing it does not restore the default value

      Given "Single Player" mode is selected
      And the human player name field contains "Jugador-1"
      When the player clears the name field
      And the player focuses on the field again without typing
      Then the name field remains empty
      And a validation error is displayed for that field

### Rule: Validation errors appear on blur and clear live as the player types

    ### Scenario: SC-32 — Clearing a name field and removing focus shows a validation error

      Given "Single Player" mode is selected
      When the player clears the human player name field
      And the player moves focus away from the field
      Then a validation error message is displayed beneath that field

    ### Scenario: SC-33 — The validation error message is written in Spanish

      Given "Single Player" mode is selected
      When the player clears the human player name field
      And the player moves focus away from the field
      Then the validation error message is written in Spanish
      And the message clearly states that a name is required

    ### Scenario: SC-34 — The validation error disappears as soon as the player starts typing in the field

      Given "Single Player" mode is selected
      And the human player name field has a visible validation error
      When the player types a character into the name field
      Then the validation error message is no longer visible for that field

    ### Scenario: SC-35 — A name field containing only whitespace is treated as invalid

      Given "Single Player" mode is selected
      When the player enters only whitespace characters into the human player name field
      And the player moves focus away from the field
      Then a validation error message is displayed for that field

    ### Scenario: SC-39 — All empty name fields simultaneously display their validation errors

      Given "Multiplayer" mode is selected
      And the player count is set to 3
      And the player has cleared all three name fields
      When the player moves focus away from the last field
      Then a validation error message is displayed for each of the three name fields

### Rule: Play button state reflects form validity

    ### Scenario: SC-36 — The "Jugar" button is disabled when at least one name field is empty

      Given "Single Player" mode is selected
      When the player clears the human player name field
      And the player moves focus away from the field
      Then the "Jugar" button is disabled

    ### Scenario: SC-37 — The "Jugar" button is re-enabled once all empty name fields are filled

      Given "Single Player" mode is selected
      And the human player name field is empty
      And the "Jugar" button is disabled
      When the player enters a valid name in the human player name field
      Then the "Jugar" button is enabled

---

## Feature: Start Game Session

### Background:

    Given the Lobby screen is open

### Rule: Play button is always visible and prominent

    ### Scenario: SC-40 — The "Jugar" button is visible on the setup panel

      When the setup panel is rendered
      Then a button labelled "Jugar" is visible in the setup panel

    ### Scenario: SC-41 — The "Jugar" button is the most visually prominent call-to-action on the screen

      When the player views the setup panel
      Then the "Jugar" button is visually distinct and stands out as the primary action on the screen

### Rule: Valid form — configuration is stored and navigation is triggered

    ### Scenario: SC-42 — Pressing "Jugar" in Single Player mode stores the full configuration and navigates

      Given "Single Player" mode is selected
      And the human player name field contains "Jugador-1"
      And the AI difficulty is set to "Easy"
      And the form is valid
      When the player presses the "Jugar" button
      Then a game-configuration object containing the game mode "Single Player", the player name "Jugador-1", and the AI difficulty "Easy" is stored in the game-session service
      And the application navigates to the game board screen

    ### Scenario: SC-43 — Pressing "Jugar" in Multiplayer mode stores the full configuration and navigates

      Given "Multiplayer" mode is selected
      And the player count is set to 2
      And the name fields contain "Jugador-1" and "Jugador-2"
      And the form is valid
      When the player presses the "Jugar" button
      Then a game-configuration object containing the game mode "Multiplayer", the player count 2, and both player names is stored in the game-session service
      And the application navigates to the game board screen

### Rule: Invalid form — nothing happens

    ### Scenario: SC-44 — Pressing "Jugar" while the form is invalid does not navigate

      Given "Single Player" mode is selected
      And the human player name field is empty
      And the "Jugar" button is disabled
      When the player attempts to press the "Jugar" button
      Then the application does not navigate away from the Lobby
      And no game-configuration object is stored in the game-session service

### Rule: Performance

    ### Scenario: SC-45 — The "Jugar" button provides visible interaction feedback within 100 milliseconds

      Given "Single Player" mode is selected
      And the form is valid
      When the player presses the "Jugar" button
      Then a visible active or pressed state appears on the button within 100 milliseconds of the press

---

## Feature: Responsive Layout

### Rule: Mobile viewport (320 px and above)

    ### Scenario: SC-46 — The Lobby has no horizontal overflow on a 320 px wide viewport

      Given the browser viewport is set to 320 px wide
      When the Lobby screen is displayed
      Then no horizontal scrollbar is present
      And all content is visible without horizontal scrolling

    ### Scenario: SC-47 — The hero and setup sections stack vertically on narrow viewports

      Given the browser viewport is set to 320 px wide
      When the Lobby screen is displayed
      Then the hero/branding area appears above the setup panel
      And the two sections are arranged in a single vertical column

    ### Scenario: SC-48 — All interactive controls have a touch target of at least 44 × 44 CSS pixels

      Given the Lobby screen is displayed on a mobile viewport
      When the player views the interactive controls
      Then every button, input, and selector has a touch target size of at least 44 × 44 CSS pixels

### Rule: Desktop viewport (1280 px and above)

    ### Scenario: SC-49 — The layout makes meaningful use of the additional space on desktop viewports

      Given the browser viewport is set to 1280 px wide
      When the Lobby screen is displayed
      Then the layout adapts to use the available horizontal space
      And the hero and setup areas are not simply narrow columns centered on a large blank canvas

---

## Feature: Keyboard Navigation

### Background:

    Given the Lobby screen is open
    And no pointer device is used

### Scenario: SC-50 — All interactive controls are reachable by pressing Tab

    When the player presses Tab repeatedly from the start of the page
    Then the game mode selector, player-count selector, all name input fields, the AI difficulty selector, and the "Jugar" button each receive focus in turn
    And no interactive control is skipped

### Scenario: SC-51 — Focus order follows the visual reading order of the page

    When the player navigates through the page using Tab
    Then focus moves in top-to-bottom, left-to-right order matching the visual layout of the screen

### Scenario: SC-52 — Each focused control displays a clearly visible focus indicator

    When the player moves keyboard focus to any interactive control on the Lobby
    Then a clearly visible focus ring or highlight is shown on that control

### Scenario: SC-53 — The game mode selector and difficulty selector are operable with arrow keys

    Given the game mode selector has keyboard focus
    When the player presses an arrow key
    Then the selected mode changes to the adjacent option in the direction pressed

### Scenario: SC-54 — Pressing Enter or Space on the "Jugar" button submits the form when valid

    Given the form is valid
    And the "Jugar" button has keyboard focus
    When the player presses Enter
    Then the game session is configured and the application navigates to the game board screen

### Scenario: SC-55 — Pressing Enter while a name input is focused does not accidentally submit the form

    Given "Multiplayer" mode is selected
    And the player count is set to 2
    And the name field at position 2 is empty
    And the name field at position 1 has keyboard focus
    When the player presses Enter
    Then the form is not submitted
    And the application remains on the Lobby screen

---

## Feature: Screen Reader Accessibility

### Scenario: SC-56 — All interactive controls have associated accessible labels

    Given the Lobby screen is open
    When a screen reader navigates through the interactive controls
    Then each input field, selector, and button has a descriptive label that is announced by the screen reader

### Scenario: SC-57 — Validation error messages are programmatically associated with their input field

    Given "Single Player" mode is selected
    When the player clears the human player name field and moves focus away
    Then the validation error message is programmatically linked to the name input field
    And a screen reader announces the error message when the field receives focus

### Scenario: SC-58 — Foreground text colors meet WCAG 2.1 AA contrast ratio requirements

    Given the Lobby screen is displayed with its full color palette applied
    When the color contrast of foreground text against its background is measured for each text element
    Then every normal-size text element has a contrast ratio of at least 4.5:1
    And every large-size text element has a contrast ratio of at least 3:1
