# BDD Test Scenarios: Single Player Mode — AI Opponent (Laia)

**Source Spec:** `docs/specs/single-player/ai-opponent/`
**Generated from:** proposal.md, spec.md, user-stories.md

---

## Traceability Matrix

| Scenario ID | Requirement                            | User Story | Category       |
| ----------- | -------------------------------------- | ---------- | -------------- |
| SC-01       | FR-1.1, FR-1.2                         | US-1       | Happy Path     |
| SC-02       | FR-1.1                                 | US-1       | Error          |
| SC-03       | FR-1.3                                 | US-1       | Edge Case      |
| SC-04       | FR-1.1                                 | US-1       | Happy Path     |
| SC-05       | FR-1.1                                 | US-1       | Happy Path     |
| SC-06       | FR-2.1                                 | US-2       | Happy Path     |
| SC-07       | FR-2.2                                 | US-2       | Edge Case      |
| SC-08       | FR-2.3                                 | US-2       | Edge Case      |
| SC-09       | NFR-2.1, NFR-2.2                       | US-2       | Edge Case      |
| SC-10       | FR-6.1, FR-6.2, FR-6.3, FR-6.4, FR-6.5 | US-3       | Happy Path     |
| SC-11       | FR-6.1, FR-6.2, FR-6.5                 | US-3       | Happy Path     |
| SC-12       | FR-6.7                                 | US-3       | Non-Functional |
| SC-13       | FR-6.6                                 | US-3       | Happy Path     |
| SC-14       | FR-7.1                                 | US-4       | Happy Path     |
| SC-15       | FR-7.1, FR-7.2                         | US-4       | Happy Path     |
| SC-16       | FR-7.3                                 | US-4       | Happy Path     |
| SC-17       | FR-7.1                                 | US-4       | Error          |
| SC-18       | FR-8.1, FR-8.2                         | US-5       | Happy Path     |
| SC-19       | FR-8.4, FR-6.3                         | US-5       | Happy Path     |
| SC-20       | FR-8.3                                 | US-5       | Happy Path     |
| SC-21       | FR-8.1                                 | US-5       | Edge Case      |
| SC-22       | FR-8.1                                 | US-5       | Edge Case      |
| SC-23       | FR-3.2                                 | US-6       | Happy Path     |
| SC-24       | FR-3.3                                 | US-6       | Happy Path     |
| SC-25       | FR-3.4                                 | US-6       | Happy Path     |
| SC-26       | FR-3.2                                 | US-6       | Edge Case      |
| SC-27       | FR-3.1, FR-3.5                         | US-6       | Edge Case      |
| SC-28       | FR-4.4                                 | US-7       | Happy Path     |
| SC-29       | FR-4.3, FR-4.5                         | US-7       | Happy Path     |
| SC-30       | FR-4.6                                 | US-7       | Happy Path     |
| SC-31       | FR-4.5                                 | US-7       | Edge Case      |
| SC-32       | FR-4.7, FR-10.1, FR-10.2               | US-7, US-9 | Edge Case      |
| SC-33       | FR-5.5                                 | US-8       | Happy Path     |
| SC-34       | FR-5.3, FR-5.4                         | US-8       | Happy Path     |
| SC-35       | FR-5.2                                 | US-8       | Edge Case      |
| SC-36       | FR-5.6, FR-10.1, FR-10.2               | US-8, US-9 | Edge Case      |
| SC-37       | NFR-1.1, NFR-1.2                       | US-8       | Non-Functional |
| SC-38       | FR-9.1                                 | US-10      | Happy Path     |
| SC-39       | FR-9.2                                 | US-10      | Happy Path     |
| SC-40       | FR-9.3                                 | US-10      | Happy Path     |
| SC-41       | FR-9.1, FR-9.2                         | US-10      | Edge Case      |
| SC-42       | FR-9.4                                 | US-10      | Edge Case      |
| SC-43       | FR-1.1                                 | US-11      | Happy Path     |
| SC-44       | FR-1.1                                 | US-11      | Happy Path     |
| SC-45       | FR-1.1                                 | US-11      | Happy Path     |
| SC-46       | FR-7.1                                 | US-11      | Happy Path     |
| SC-47       | FR-1.1                                 | US-11      | Happy Path     |

---

## Feature: Lobby — Single Player Configuration

### Background:

Given the application has loaded and the Lobby screen is visible

### Scenario: SC-01 — Player successfully starts a single player match with a valid name and difficulty

Given the player selects "Un Jugador" mode in the Lobby
And the player enters "Carlos" as their name
And the player selects "Intermedio" as the difficulty
When the player clicks "Jugar"
Then the game table screen is displayed
And two players are present: "Carlos" in the human zone and "Laia" in the opponent zone
And the selected difficulty "Intermedio" is active for the match

### Scenario: SC-02 — Player cannot start without entering a name

Given the player selects "Un Jugador" mode in the Lobby
And the player has not entered a name
When the player clicks "Jugar"
Then a validation error is displayed indicating the name field is required
And the game table screen is not navigated to

### Scenario: SC-03 — Player who navigates directly to the game route is redirected to the Lobby

Given the player has not completed Lobby setup for any session
When the player navigates directly to the game route
Then the player is redirected to the Lobby screen

### Scenario: SC-04 — Laia's name is displayed in the Lobby but is not editable

Given the player selects "Un Jugador" mode in the Lobby
Then the AI opponent name "Laia" is visible in the Lobby
And the "Laia" name field is read-only and cannot be modified by the player

### Scenario Outline: SC-05 — Each difficulty level can be selected and starts a valid single player match

Given the player selects "Un Jugador" mode in the Lobby
And the player enters "Ana" as their name
And the player selects "<difficulty>" as the difficulty
When the player clicks "Jugar"
Then the game table screen is displayed
And the active difficulty for the match is "<difficulty>"

Examples:
| difficulty |
| Fácil |
| Intermedio |
| Difícil |

---

## Feature: AI Turn Automation

### Background:

Given a Single Player match has been started with the player named "Carlos" against Laia
And the match is in progress with the engine in "awaiting-card-play" phase

### Scenario: SC-06 — Laia's turn begins automatically without any human action

Given it is Laia's turn
When the game engine designates Laia as the active player
Then Laia's turn begins automatically
And no click or interaction from the human player is required to advance Laia's turn

### Scenario: SC-07 — Laia's turn triggers again after a new hand of cards is dealt mid-round

Given it is Laia's turn and both players' hands were just refilled from the deck
When the engine enters "awaiting-card-play" with Laia as the active player
Then Laia's turn begins automatically with her new hand of cards
And the turn resolves without human intervention

### Scenario: SC-08 — AI turn does not fire while the engine is mid-transition

Given a round has just completed and the engine is processing round results
When the engine is not yet in "awaiting-card-play" phase
Then Laia's automated turn does not begin
And the AI turn trigger only fires once the engine has fully settled into "awaiting-card-play"

### Scenario: SC-09 — Laia always produces a play that the engine accepts without error

Given it is Laia's turn at any point during a match on any difficulty level
When Laia's automated turn executes
Then the play Laia submits is accepted by the engine without a validation error
And the play consists of exactly one card from Laia's hand
And if a capture is included, the captured cards sum to exactly 15 with Laia's played card

---

## Feature: AI Turn Animation

### Background:

Given a Single Player match is in progress
And it is Laia's turn

### Scenario: SC-10 — Full animation sequence is shown when Laia makes a capture

Given Laia has decided to capture cards from the table
When Laia's animated turn begins
Then Laia's hand zone enters an active visual state
And after a deliberation pause, one card in Laia's hand zone is visually highlighted or elevated
And that card is flipped face-up revealing its suit and rank
And the table cards that will be captured are visually highlighted
And only after both the hand card and the capture subset are highlighted does the play resolve

### Scenario: SC-11 — Animation sequence is shown when Laia places a card on the table

Given Laia has no valid capture and places a card on the table
When Laia's animated turn begins
Then Laia's hand zone enters an active visual state
And after a deliberation pause, one card in Laia's hand zone is visually highlighted or elevated
And the card remains face-down throughout the animation
And the card is placed on the table without a capture resolution

### Scenario: SC-12 — Total animated duration of Laia's turn is within acceptable bounds

Given Laia's turn animation starts
When the animation runs from the initial trigger to the final resolution
Then the total visible animation duration is no less than 1.5 seconds
And the total visible animation duration is no more than 3 seconds

### Scenario: SC-13 — Laia's turn is confirmed automatically with no human action required

Given Laia has played a card and the play has resolved
When the play resolution is complete
Then Laia's turn confirmation is submitted automatically by the system
And the engine advances to the next turn without the human clicking any "Confirm" button

---

## Feature: Human Interaction Locking

### Background:

Given a Single Player match is in progress
And Laia's animated turn has just been triggered

### Scenario: SC-14 — Human hand cards are not selectable during Laia's turn

Given Laia's turn animation is in progress
When the human attempts to select a card from their hand
Then the hand cards are not selectable
And no card in the human's hand becomes selected

### Scenario: SC-15 — Submit Play and Confirm Turn buttons are disabled and visually non-interactive during Laia's turn

Given Laia's turn animation is in progress
Then the "Submit Play" button is visually disabled
And the "Confirm Turn" button is visually disabled
And neither button can be activated by the human

### Scenario: SC-16 — All interaction is re-enabled as soon as the human becomes the active player

Given Laia's turn has just finished and the engine transitions to "awaiting-card-play" with the human as active
Then the human's hand cards become selectable
And the table cards become selectable
And the "Submit Play" button returns to its enabled state

### Scenario: SC-17 — Interacting with disabled controls during Laia's turn produces no game state change

Given Laia's turn animation is in progress
When the human clicks the disabled "Submit Play" button
And the human attempts to select a table card
Then the game state remains unchanged
And Laia's turn continues without interruption

---

## Feature: AI Hand Card Visibility

### Background:

Given a Single Player match is in progress

### Scenario: SC-18 — All of Laia's hand cards are rendered face-down throughout the match

Given the match has started and Laia holds cards in her hand
Then all cards in Laia's hand zone show the card back
And no suit or rank is visible on any of Laia's hand cards
And this applies at all difficulty levels

### Scenario: SC-19 — The card Laia plays for a capture is revealed face-up during the animation

Given it is Laia's turn and Laia's decision is a capture
When the animation highlights Laia's selected hand card
Then the selected card is flipped face-up, revealing its suit and rank
And the card remains visible face-up as it moves to Laia's capture pile after the capture resolves

### Scenario: SC-20 — The card Laia plays as a placement remains face-down throughout

Given it is Laia's turn and Laia's decision is to place a card on the table
When the animation highlights Laia's selected hand card
Then the selected card remains face-down throughout the entire animation
And the card is placed on the table without its identity being revealed

### Scenario: SC-21 — Cards newly dealt to Laia's hand are also rendered face-down

Given a new sub-hand has been dealt mid-round and Laia has received three new cards
Then all three new cards in Laia's hand zone are rendered face-down from the moment they appear

### Scenario: SC-22 — Multiplayer mode is unaffected by face-down rendering rules

Given a Multiplayer match has been started (not Single Player)
Then all player hand zones render cards face-up using the existing behaviour
And no face-down rendering is applied to any hand zone

---

## Feature: Fácil Strategy — Decision Logic

### Background:

Given a Single Player match is in progress with difficulty set to "Fácil"
And it is Laia's turn

### Scenario: SC-23 — Laia always takes an escoba when one is available in Fácil mode

Given Laia holds a card that, combined with all table cards, sums to exactly 15
When Laia makes her decision
Then Laia's play captures all table cards
And the table is cleared, scoring an escoba

### Scenario: SC-24 — Laia selects a random capture when no escoba is available in Fácil mode

Given one or more valid captures are available but none of them clears the table entirely
When Laia makes her decision
Then Laia selects one of the available captures
And the selection is not biased towards high-value cards such as Oros or rank-7s

### Scenario: SC-25 — Laia places a random card on the table when no capture is available in Fácil mode

Given no valid capture exists for any card in Laia's hand against the current table cards
When Laia makes her decision
Then Laia places one card from her hand on the table
And the selection is random with no strategic preference

### Scenario: SC-26 — When multiple escoba-yielding captures exist in Fácil mode, one is selected

Given Laia holds two different cards, each of which independently clears the entire table
When Laia makes her decision
Then Laia selects exactly one of the escoba-yielding plays
And the table is cleared after the play resolves

### Scenario: SC-27 — Fácil decisions are stateless across turns in the same round

Given Laia has already taken several turns in the current round
And high-value cards including the 7 of Oros have been captured in previous turns
When Laia makes her current decision
Then Laia's decision is made solely on the current hand and current table state
And no previous play history within the round influences the outcome

---

## Feature: Intermedio Strategy — Decision Logic

### Background:

Given a Single Player match is in progress with difficulty set to "Intermedio"
And it is Laia's turn

### Scenario: SC-28 — Laia takes an escoba in Intermedio even when another capture has more high-value cards

Given a capture exists that includes two Oros cards but does not clear the table
And a second capture exists that clears the table (escoba) but includes only one Oros card
When Laia makes her decision
Then Laia selects the escoba-yielding capture
And the table is cleared

### Scenario: SC-29 — Laia selects the capture with the most high-value cards in Intermedio when no escoba is available

Given multiple valid captures exist and none of them clears the table
And one capture includes two Oros cards and one rank-7 card
And another capture includes only one Oros card
When Laia makes her decision
Then Laia selects the capture that includes the two Oros cards and the rank-7 card

### Scenario: SC-30 — Laia places a random card on the table when no capture is available in Intermedio

Given no valid capture exists for any card in Laia's hand against the current table cards
When Laia makes her decision
Then Laia places one card from her hand on the table

### Scenario: SC-31 — Laia breaks ties randomly when multiple captures have the same high-value card count in Intermedio

Given two valid captures exist, each containing exactly two high-value cards
And no escoba is available
When Laia makes her decision
Then Laia selects exactly one of the two tied captures
And either tied capture is a valid outcome

### Scenario: SC-32 — Intermedio memory is cleared at the start of a new round

Given a round has just ended and a new round is beginning
And Laia had tracked several Oros and rank-7 cards as seen during the previous round
When the new round begins and Laia takes her first turn
Then Laia's seen high-value cards list is empty
And the first decision of the new round is made with no carry-over from the previous round

---

## Feature: Difícil Strategy — Decision Logic

### Background:

Given a Single Player match is in progress with difficulty set to "Difícil"
And it is Laia's turn

### Scenario: SC-33 — Laia always takes an escoba in Difícil mode when one is available

Given a play exists that would clear the entire table
And other plays exist with higher theoretical probability-weighted scores
When Laia makes her decision
Then Laia selects the escoba-yielding play
And the table is cleared

### Scenario: SC-34 — Laia selects the play with the highest expected score contribution in Difícil

Given no escoba is available
And Laia has tracked that several Oros and rank-7 cards have already been played this round
And Laia evaluates all possible plays against the inferred probability distribution of unseen cards
When Laia makes her decision
Then Laia selects the play that yields the highest calculated expected score contribution
And that play is a legal move accepted by the engine

### Scenario: SC-35 — Difícil reasoning is based on elimination only, not on the human's actual hand

Given Laia has tracked all cards played so far this round
When Laia infers which cards are unseen
Then the unseen set is computed as the full 40-card deck minus Laia's hand, the table cards, and all tracked played or captured cards
And Laia does not use the human player's actual hand array as an input to her decision

### Scenario: SC-36 — Difícil memory is cleared at the start of a new round

Given a round has just ended and a new round is beginning
And Laia had a full record of all cards played during the previous round
When the new round begins and Laia takes her first turn
Then Laia's played-card record is empty
And the first decision of the new round treats all non-visible cards as unseen

### Scenario: SC-37 — Difícil decision calculation completes within 100 milliseconds

Given a Difícil match is in progress with a complex table state and partial round history
When Laia's turn begins and the probability calculation runs
Then the calculation completes in under 100 milliseconds
And no visible frame drops or UI jank occur during or after the calculation

---

## Feature: Accessibility Announcements for Laia's Actions

### Background:

Given a Single Player match is in progress
And the accessibility live region is active

### Scenario: SC-38 — Placement by Laia is announced in the live region

Given it is Laia's turn and Laia places a card on the table without capturing
When the play resolves and the game state updates
Then the accessibility live region announces that Laia placed a card on the table
And the announcement is human-readable and does not reveal which card was played

### Scenario: SC-39 — Capture by Laia is announced in the live region

Given it is Laia's turn and Laia captures cards from the table
When the play resolves and the game state updates
Then the accessibility live region announces that Laia made a capture
And the announcement includes the number of cards captured

### Scenario: SC-40 — Escoba by Laia is announced in the live region

Given it is Laia's turn and Laia's capture clears the entire table
When the play resolves and the game state updates
Then the accessibility live region announces that Laia scored an escoba
And the announcement clearly distinguishes this from a regular capture

### Scenario: SC-41 — Laia's card identity is not revealed in accessibility text before the play resolves

Given it is Laia's turn
When the live region announcement is made for a placement
Then the announcement does not name the specific suit or rank of the card Laia placed
And when the announcement is made for a capture, the played card's identity is only mentioned after the capture resolves

### Scenario: SC-42 — Accessibility announcements fire after the animation resolves, not before

Given it is Laia's turn and the animation sequence is running
When the animation for Laia's play is in progress but has not yet resolved
Then no accessibility live region announcement has been emitted yet
And the announcement fires only after the engine state has been updated with the completed play

---

## Feature: Full Match Progression in Single Player Mode

### Background:

Given a Single Player match has been started between "Carlos" and Laia

### Scenario: SC-43 — Round scoring is calculated equally for the human player and Laia

Given a round has just ended
Then the round result overlay displays a score breakdown for both "Carlos" and Laia
And scoring categories (most cards, most Oros, most rank-7s, Siete de Oros, escobas) are evaluated for both players
And both players' accumulated match scores are updated correctly

### Scenario: SC-44 — The match-over overlay declares Laia as winner when she reaches 15 points

Given Laia's accumulated match score has reached or exceeded 15 points
When the current round result is applied
Then the match-over overlay is displayed
And the overlay declares "Laia" as the winner of the match

### Scenario: SC-45 — The match-over overlay declares the human player as winner when they reach 15 points

Given the human player's accumulated match score has reached or exceeded 15 points
When the current round result is applied
Then the match-over overlay is displayed
And the overlay declares "Carlos" as the winner of the match

### Scenario: SC-46 — The handoff overlay is never shown during a Single Player match

Given a Single Player match is in progress across multiple turns and round transitions
Then the handoff overlay is never displayed at any point during the match
And turns advance directly from the human's turn to Laia's turn and back without any overlay interruption

### Scenario: SC-47 — The player can return to the Lobby from the match-over overlay

Given the match-over overlay is displayed
When the player clicks the option to start a new match or return to the Lobby
Then the Lobby screen is displayed
And the player can configure and start a new Single Player or Multiplayer match
