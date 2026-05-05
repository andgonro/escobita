# BDD Test Scenarios: Round Progression and Match Over

**Source Spec:** `docs/specs/ui/round-progression/`
**Generated from:** proposal.md, spec.md, user-stories.md

---

## Traceability Matrix

| Scenario ID | Requirement             | User Story | Category       |
| ----------- | ----------------------- | ---------- | -------------- |
| SC-01       | FR-1.1                  | US-1       | Happy Path     |
| SC-02       | FR-1.2                  | US-1, US-5 | Happy Path     |
| SC-03       | FR-1.3                  | US-6       | Happy Path     |
| SC-04       | FR-1.3                  | US-6       | Edge Case      |
| SC-05       | FR-1.3                  | US-6       | Happy Path     |
| SC-06       | FR-1.4                  | US-5       | Happy Path     |
| SC-07       | FR-2.4                  | US-1, US-6 | Happy Path     |
| SC-08       | FR-2.1                  | US-1       | Happy Path     |
| SC-09       | FR-2.2, NFR-1.1         | US-1       | Error/Negative |
| SC-10       | FR-2.2, NFR-1.1         | US-1       | Happy Path     |
| SC-11       | FR-2.3, FR-2.4          | US-1       | Happy Path     |
| SC-12       | FR-2.4                  | US-1       | Happy Path     |
| SC-13       | FR-2.5, NFR-2.1         | US-1       | Accessibility  |
| SC-14       | FR-2.6, FR-6.5          | US-1       | Accessibility  |
| SC-15       | FR-2.7                  | US-2       | Happy Path     |
| SC-16       | FR-3.1, NFR-1.2         | US-2       | Error/Negative |
| SC-17       | FR-3.2                  | US-2       | Happy Path     |
| SC-18       | FR-3.3                  | US-2       | Happy Path     |
| SC-19       | FR-3.1, FR-3.3, NFR-1.2 | US-2       | Edge Case      |
| SC-20       | FR-3.4                  | US-2       | Happy Path     |
| SC-21       | FR-3.5                  | US-2       | Error/Negative |
| SC-22       | FR-3.5                  | US-2       | Error/Negative |
| SC-23       | FR-3.6                  | US-2       | Happy Path     |
| SC-24       | FR-2.7, NFR-2.1         | US-2       | Accessibility  |
| SC-25       | FR-6.2                  | US-2       | Accessibility  |
| SC-26       | FR-6.1                  | US-2       | Accessibility  |
| SC-27       | FR-6.4, NFR-2.2         | US-2       | Accessibility  |
| SC-28       | FR-4.1                  | US-3       | Happy Path     |
| SC-29       | FR-4.2                  | US-3       | Happy Path     |
| SC-30       | FR-4.3                  | US-3       | Happy Path     |
| SC-31       | FR-4.2                  | US-3       | Edge Case      |
| SC-32       | FR-4.4, NFR-2.1         | US-3       | Accessibility  |
| SC-33       | FR-6.3                  | US-3       | Accessibility  |
| SC-34       | FR-5.1                  | US-4       | Happy Path     |
| SC-35       | FR-5.3, FR-5.4          | US-4       | Happy Path     |
| SC-36       | FR-5.2                  | US-4       | Happy Path     |
| SC-37       | FR-5.3, NFR-1.3         | US-4       | Happy Path     |
| SC-38       | FR-5.4                  | US-4       | Happy Path     |
| SC-39       | FR-5.3, TR-2.2          | US-4       | Edge Case      |
| SC-40       | FR-5.5, NFR-2.1         | US-4       | Accessibility  |
| SC-41       | FR-6.3                  | US-4       | Accessibility  |
| SC-42       | FR-6.4, NFR-2.2         | US-1       | Accessibility  |

---

## Feature: Round-Complete State

### Background:

    Given a game session has been configured with two players "Ana" and "Luis"
    And the game has been started from the lobby

### Scenario: SC-01 — Game table enters round-complete state when the final turn of a round is confirmed

    Given it is the last turn of round 1 with no cards remaining in either player's hand
    When the active player confirms their final turn
    Then the game table enters a visually distinct round-complete state
    And the round result area displays the per-player score breakdown
    And a continuation action button is visible

### Scenario: SC-02 — Round number and top score remain visible in the round-complete state

    Given the game table has entered the round-complete state after round 2
    When the player views the HUD
    Then the round number "2" is visible
    And the highest individual score earned in that round is visible

### Scenario: SC-03 — Per-player score breakdown shows all six scoring categories for each player

    Given the game table has entered the round-complete state
    When the player views the round result area
    Then for each player the following scoring categories are displayed: escobas, most cards, most Oros, most sevens, Siete de Oros, and total
    And each player's name is displayed alongside their score entries

### Scenario: SC-04 — Zero-point categories are shown and not omitted from the round score breakdown

    Given a round has ended where "Ana" earned 0 points in the escobas category
    When the player views the round result area
    Then "Ana"'s escobas score is shown as 0
    And the escobas row is not hidden or omitted from "Ana"'s breakdown

### Scenario: SC-05 — Player names in the score breakdown match the session-configured names

    Given the session was configured with player names "Ana" and "Luis"
    When the round-complete state is active and the player views the score breakdown
    Then the name "Ana" appears in the breakdown
    And the name "Luis" appears in the breakdown
    And no other player names appear in the breakdown

### Scenario: SC-06 — Board zones remain rendered and inspectable during the round-complete state

    Given the game table has entered the round-complete state
    When the player views the game board
    Then the table-card zone is rendered and visible
    And the opponent zone is rendered and visible
    And the active hand zone is rendered and visible
    And no zones are hidden, collapsed, or artificially disabled

### Scenario: SC-07 — Score breakdown is no longer visible after a continuation action is activated

    Given the game table is in the round-complete state with the score breakdown visible
    And no match winner has been declared
    When the player activates the "Start Next Round" button
    Then the round score breakdown is no longer visible
    And the "Start Next Round" button is no longer visible

### Scenario: SC-42 — A live-region announcement is made when a round ends

    Given the game table is in an active round
    When the active player confirms the final turn of the round
    Then a live-region announcement is made indicating that the round has been completed

---

## Feature: Start Next Round

### Background:

    Given a game session has been configured with two players "Ana" and "Luis"
    And a round has ended with the round result available
    And no match winner has been declared

### Scenario: SC-08 — "Start Next Round" button is visible when round is complete and no winner is declared

    When the player views the round result area
    Then the "Start Next Round" button is visible

### Scenario: SC-09 — "Start Next Round" button is not visible when a match winner has been declared

    Given a match winner has been declared
    When the player views the round result area
    Then the "Start Next Round" button is not visible

### Scenario: SC-10 — "View Winner" button appears in place of "Start Next Round" when a match winner is declared

    Given a match winner has been declared
    When the player views the round result area
    Then the "View Winner" button is visible
    And the "Start Next Round" button is not visible
    But only one of the two continuation buttons is shown at any time

### Scenario: SC-11 — Activating "Start Next Round" calls startNextRound and clears the round result

    Given the "Start Next Round" button is visible in the round result area
    When the player activates the "Start Next Round" button
    Then the game engine's startNextRound action is triggered
    And the round score breakdown disappears
    And the "Start Next Round" button disappears

### Scenario: SC-12 — Board reflects the new initial deal after "Start Next Round" is activated

    Given the player is in the round-complete state at the end of round 1
    When the player activates the "Start Next Round" button
    Then 4 fresh cards are visible on the table
    And each player has 3 hand cards
    And the round number shown in the HUD is 2

### Scenario: SC-13 — "Start Next Round" button is reachable and operable by keyboard navigation

    Given the game table is in the round-complete state with the "Start Next Round" button visible
    When the player navigates to the "Start Next Round" button using the keyboard
    Then the button receives keyboard focus
    And activating the button by keyboard triggers the start-next-round action

### Scenario: SC-14 — "Start Next Round" button carries a meaningful accessible label in Spanish

    Given the game table is in the round-complete state
    When an assistive technology reads the "Start Next Round" button
    Then the button exposes an accessible label written in Spanish

---

## Feature: Match-Over Overlay

### Background:

    Given a game session has been configured with two players "Ana" and "Luis"
    And the final round has ended with a match winner declared
    And the round-complete state is active with the "View Winner" button visible

### Scenario: SC-15 — Activating "View Winner" transitions to the match-over state

    When the player activates the "View Winner" button
    Then the match-over overlay appears
    And the round-complete state is no longer shown

### Scenario: SC-16 — Match-over overlay does not appear automatically when a match winner is declared

    Given the player has not yet activated the "View Winner" button
    When the match winner signal becomes non-null at round end
    Then the match-over overlay is not visible
    And the round-complete state with the "View Winner" button is shown instead

### Scenario: SC-17 — Match-over overlay appears as a full-screen layer on top of all game table content

    Given the player has activated the "View Winner" button
    When the match-over overlay is visible
    Then the overlay covers the entire game table viewport
    And no game table content is visible above the overlay

### Scenario: SC-18 — Overlay displays the sole winner's name prominently

    Given "Ana" is the sole match winner
    And the player has activated the "View Winner" button
    When the match-over overlay is visible
    Then "Ana"'s name is prominently displayed in the overlay

### Scenario: SC-19 — Overlay displays all co-winners' names with equal prominence when players tie

    Given "Ana" and "Luis" have both ended the round with the same accumulated score at or above 15 points
    And the player has activated the "View Winner" button
    When the match-over overlay is visible
    Then both "Ana"'s name and "Luis"'s name are displayed in the overlay
    And both names are displayed with equal visual prominence
    And no additional round is offered or started to break the tie

### Scenario: SC-20 — Overlay displays final accumulated match scores, not round scores

    Given the player has activated the "View Winner" button
    When the match-over overlay is visible
    Then the accumulated match score for "Ana" is shown
    And the accumulated match score for "Luis" is shown
    And the scores shown reflect all rounds played in the match, not only the final round

### Scenario: SC-21 — Overlay is not dismissed by pressing Escape

    Given the match-over overlay is visible
    When the player presses the Escape key
    Then the overlay remains visible

### Scenario: SC-22 — Overlay is not dismissed by clicking outside it

    Given the match-over overlay is visible
    When the player clicks on the game table content behind the overlay
    Then the overlay remains visible

### Scenario: SC-23 — Background game table content is inert and hidden from assistive technology while overlay is active

    Given the match-over overlay is visible
    When the player attempts to interact with the HUD, board zones, or action bar
    Then those elements do not respond to pointer or keyboard interaction
    And those elements are marked as hidden from assistive technology

### Scenario: SC-24 — "View Winner" button is reachable and operable by keyboard navigation

    Given the round-complete state is active with the "View Winner" button visible
    When the player navigates to the "View Winner" button using the keyboard
    Then the button receives keyboard focus
    And activating the button by keyboard triggers the match-over overlay to appear

### Scenario: SC-25 — Match-over overlay has an accessible role and name identifying it as a modal dialog

    Given the player has activated the "View Winner" button
    When an assistive technology inspects the match-over overlay
    Then the overlay is identified as a modal dialog
    And the overlay has an accessible name

### Scenario: SC-26 — Focus moves into the match-over overlay when it appears

    Given the player is focused on the "View Winner" button
    When the player activates the "View Winner" button and the match-over overlay appears
    Then focus moves to a focusable element inside the overlay
    And focus is not left on the background game table content

### Scenario: SC-27 — Live-region announces the match winner or co-winners when the overlay appears

    Given the player has activated the "View Winner" button
    When the match-over overlay becomes visible
    Then a live-region announcement is made identifying the match winner or all co-winners

---

## Feature: Return to Lobby

### Background:

    Given a game session has been configured with player names "Ana" and "Luis", a game mode, and an AI difficulty setting
    And a match has concluded with a winner
    And the player has activated the "View Winner" button
    And the match-over overlay is visible

### Scenario: SC-28 — "Return to Lobby" button is present on the match-over overlay

    When the player views the match-over overlay
    Then the "Return to Lobby" button is visible

### Scenario: SC-29 — Activating "Return to Lobby" navigates to the Lobby screen

    When the player activates the "Return to Lobby" button
    Then the application navigates to the root route
    And the Lobby screen is rendered

### Scenario: SC-30 — Lobby form opens pre-filled with the previous session settings after returning

    When the player activates the "Return to Lobby" button and the Lobby screen appears
    Then the lobby form is pre-filled with the player names "Ana" and "Luis"
    And the previous game mode is pre-filled
    And the previous AI difficulty is pre-filled

### Scenario: SC-31 — Rapid repeated activations of "Return to Lobby" do not cause multiple navigations

    When the player activates the "Return to Lobby" button multiple times in rapid succession
    Then the application navigates to the Lobby screen only once
    And no errors occur

### Scenario: SC-32 — "Return to Lobby" button is reachable and operable by keyboard navigation

    When the player navigates to the "Return to Lobby" button using the keyboard
    Then the button receives keyboard focus
    And activating the button by keyboard triggers navigation to the Lobby screen

### Scenario: SC-33 — Focus reaches the lobby's primary control after navigating to the lobby

    When the player activates "Return to Lobby" and the Lobby screen appears
    Then focus is placed on the lobby's primary interactive control

---

## Feature: Play Again

### Background:

    Given a game session has been configured with player names "Ana" and "Luis", a game mode, and an AI difficulty setting
    And a match has concluded with a winner
    And the player has activated the "View Winner" button
    And the match-over overlay is visible

### Scenario: SC-34 — "Play Again" button is present on the match-over overlay

    When the player views the match-over overlay
    Then the "Play Again" button is visible

### Scenario: SC-35 — Activating "Play Again" dismisses the overlay and starts a new round 1 board

    When the player activates the "Play Again" button
    Then the match-over overlay is dismissed
    And the game table displays the new round 1 board state
    And the application has not navigated away from the game table route

### Scenario: SC-36 — New match uses the same session configuration as the previous match

    When the player activates the "Play Again" button
    Then the new match uses the player names "Ana" and "Luis"
    And the same game mode is used
    And the same AI difficulty is used

### Scenario: SC-37 — New match starts at round 1 with all accumulated scores reset to zero and a fresh deal

    When the player activates the "Play Again" button
    Then the round number shown in the HUD is 1
    And each player's accumulated match score is 0
    And 4 fresh cards are visible on the table
    And each player has 3 hand cards

### Scenario: SC-38 — Game table is fully interactive after "Play Again"

    Given the player has activated "Play Again" and the new round 1 board is displayed
    When the player views the game table
    Then hand cards are selectable
    And the action bar controls respond correctly to the current turn phase

### Scenario: SC-39 — "Play Again" works correctly even when the previous engine state was non-null

    Given the previous match ended with a non-null engine state
    When the player activates the "Play Again" button
    Then a fresh match is started unconditionally, bypassing any initialisation guard
    And the game table shows the new round 1 board state

### Scenario: SC-40 — "Play Again" button is reachable and operable by keyboard navigation

    When the player navigates to the "Play Again" button using the keyboard
    Then the button receives keyboard focus
    And activating the button by keyboard triggers the new match to begin

### Scenario: SC-41 — Focus moves to the "Submit play" button on the game table after "Play Again"

    When the player activates the "Play Again" button and the overlay is dismissed
    Then focus moves to the "Submit play" button on the game table
