# BDD Test Scenarios: Game Table MVP

**Source Spec:** `docs/specs/ui/game-table-mvp/`
**Generated from:** proposal.md, spec.md, user-stories.md

---

## Traceability Matrix

| Scenario ID | Requirement            | User Story | Category      |
| ----------- | ---------------------- | ---------- | ------------- |
| SC-01       | FR-1.1, FR-8.1         | US-1       | Happy Path    |
| SC-02       | FR-1.2, FR-1.4         | US-1       | Happy Path    |
| SC-03       | FR-1.3                 | US-1       | Happy Path    |
| SC-04       | FR-1.5, TR-3.2, TR-3.3 | US-1       | Visual        |
| SC-05       | FR-2.1, FR-2.2, FR-2.3 | US-2       | Happy Path    |
| SC-06       | FR-2.4                 | US-2       | Happy Path    |
| SC-07       | FR-3.1                 | US-3       | Validation    |
| SC-08       | FR-3.2, FR-3.3         | US-3       | Happy Path    |
| SC-09       | FR-3.4, FR-3.5         | US-3       | Validation    |
| SC-10       | FR-3.6, FR-5.1         | US-3       | Happy Path    |
| SC-11       | FR-4.1                 | US-4       | Happy Path    |
| SC-12       | FR-4.2, FR-4.4         | US-4       | Validation    |
| SC-13       | FR-4.3, FR-4.7         | US-4       | Edge Case     |
| SC-14       | FR-4.5                 | US-4       | Happy Path    |
| SC-15       | FR-4.6                 | US-4       | Happy Path    |
| SC-16       | FR-5.2                 | US-5       | Happy Path    |
| SC-17       | FR-5.3                 | US-5       | Happy Path    |
| SC-18       | FR-5.4                 | US-5       | Happy Path    |
| SC-19       | FR-5.5                 | US-5       | Edge Case     |
| SC-30       | FR-5.6, TR-5.3         | US-5       | Reliability   |
| SC-20       | FR-6.1, TR-6.1         | US-6       | Accessibility |
| SC-21       | FR-6.2, TR-6.2         | US-6       | Accessibility |
| SC-22       | FR-6.3, TR-6.3         | US-6       | Accessibility |
| SC-23       | FR-6.4                 | US-6       | Accessibility |
| SC-24       | FR-7.1, FR-7.2         | US-7       | Responsive    |
| SC-25       | FR-7.3                 | US-7       | Responsive    |
| SC-26       | FR-8.2                 | US-2       | Integration   |
| SC-27       | FR-8.3                 | US-3, US-4 | Integration   |
| SC-28       | FR-8.4                 | US-3       | Integration   |
| SC-29       | FR-8.5, FR-8.6         | US-8       | Integration   |

---

## Feature: Route and Table Entry

Scenario: SC-01 - partida route opens a playable table view
Given a valid game session configuration exists
When the user navigates to the partida route
Then the game table screen is displayed
And the old placeholder view is not displayed

Scenario: SC-02 - active hand and center table zones are visible
Given the game table screen is displayed
When initial game state is rendered
Then the active player hand zone is shown at the bottom
And the center table zone is visible

Scenario: SC-03 - opponent zones adapt to player count
Given the game table screen is displayed
When the match has N players
Then exactly N minus one opponent zones are shown
And opponent zones are arranged around the table

Scenario: SC-04 - textured table surface preserves readability
Given the game table screen is displayed
When text and controls are rendered over the textured surface
Then readability remains clear
And overlay treatment does not obscure interactive elements

---

## Feature: Always-visible Match Context

Scenario: SC-05 - active player scores and turn phase are always visible
Given the game table screen is displayed
When gameplay actions occur
Then active player indicator remains visible
And match scores remain visible
And turn phase indicator remains visible

Scenario: SC-06 - context indicators update after state changes
Given the game table screen is displayed
When the active player changes or phase changes
Then the context header updates immediately

---

## Feature: Hand and Submission Flow

Scenario: SC-07 - only active player hand cards are interactive
Given it is player A turn
When player B attempts to interact with hand cards
Then interaction is blocked for non-active players

Scenario: SC-08 - selected hand card remains selected until changed canceled or submitted
Given the active player selects a hand card
When no submission occurs
Then selected-state feedback remains visible

Scenario: SC-09 - submit is blocked without selected hand card
Given no hand card is selected
When the player attempts to submit play
Then submission is blocked
And clear feedback is shown

Scenario: SC-10 - play submission and turn completion are separate actions
Given a play has been submitted
When the player has not yet confirmed turn completion
Then turn does not advance
And turn phase reflects pending confirmation

---

## Feature: Capture Subset Selection

Scenario: SC-11 - player can select one or more table cards for capture subset
Given a hand card is selected
When the player toggles table cards
Then subset selection state updates for each card

Scenario: SC-12 - invalid capture subset is blocked before execution
Given selected hand card and selected table subset do not form a legal capture
When the player attempts to submit play
Then submission is blocked
And validity feedback is shown

Scenario: SC-13 - empty subset results in placement behavior
Given a hand card is selected and no table cards are selected
When the player submits play
Then action is treated as table placement
And missed-capture auto-correction is not applied

Scenario: SC-14 - valid capture updates resulting table state
Given a legal capture subset is selected
When the player submits play
Then resulting table state reflects captured cards removed
And hand state reflects played card removal

Scenario: SC-15 - table clear capture reflects escoba outcome
Given selected capture clears all cards from table
When the player submits play
Then resulting state reflects escoba outcome visibility

---

## Feature: Turn Completion and Handoff

Scenario: SC-16 - handoff toggle is available in multiplayer
Given the match mode is multiplayer
When game table controls are displayed
Then handoff toggle is visible and operable

Scenario: SC-17 - handoff overlay appears when enabled
Given handoff toggle is enabled in multiplayer
When turn completion occurs
Then handoff overlay is displayed before next-turn reveal

Scenario: SC-18 - direct transition occurs when handoff is disabled
Given handoff toggle is disabled in multiplayer
When turn completion occurs
Then next-turn view appears without handoff overlay

Scenario: SC-19 - handoff behavior is bypassed in single-player
Given the match mode is single-player
When turn completion occurs
Then handoff overlay is not shown

Scenario: SC-30 - handoff toggle state remains consistent across subsequent turns
Given the match mode is multiplayer
And handoff toggle has been set by the current user
When multiple turn completions occur in the same match session
Then handoff behavior follows the configured toggle consistently on each subsequent turn

---

## Feature: Accessibility Baseline

Scenario: SC-20 - full keyboard flow supports core actions
Given keyboard-only navigation is used
When the user performs select submit and confirm actions
Then all core actions are operable without pointer input

Scenario: SC-21 - cards and controls expose accessible labels and selected state
Given assistive technology is active
When focus moves through interactive cards and controls
Then each interactive element has a meaningful label
And selected-state is programmatically exposed

Scenario: SC-22 - invalid action and turn-change announcements are available
Given assistive technology is active
When invalid submission occurs or turn changes
Then announcement messages are exposed through live regions

Scenario: SC-23 - focus transitions are deterministic after key actions
Given keyboard interaction is active
When submit confirm or handoff acknowledgement occurs
Then focus moves to the expected next control without ambiguity

---

## Feature: Responsive Usability

Scenario: SC-24 - table is usable from mobile baseline width
Given viewport width is 320 pixels
When the game table is rendered
Then core zones remain usable
And primary actions remain reachable

Scenario: SC-25 - tablet and desktop preserve readability and balance
Given viewport width is tablet or desktop range
When the game table is rendered
Then information hierarchy remains clear
And card zones do not overlap critical context

---

## Feature: Engine Integration

Scenario: SC-26 - UI reflects engine signal updates
Given game-engine signals change after an action
When the table re-renders
Then visible state is synchronized with engine outputs

Scenario: SC-27 - play submission maps to engine play action
Given the player submits a valid action
When submission is processed
Then engine play action is invoked with selected card and selected subset

Scenario: SC-28 - turn completion maps to engine confirm action
Given play submission has occurred
When player confirms turn completion
Then engine turn-confirm action is invoked

Scenario: SC-29 - round and winner states are displayed from engine outcomes
Given engine provides round-result or winner state
When table context is rendered
Then round and winner outcomes are visible without rule duplication in UI
