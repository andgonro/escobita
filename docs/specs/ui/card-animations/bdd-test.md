# BDD Test Scenarios: Card Animation System

**Source Spec:** docs/specs/ui/card-animations/
**Generated from:** proposal.md, spec.md, user-stories.md

## Traceability Matrix

| Scenario ID | Requirement           | User Story       | Category               |
| ----------- | --------------------- | ---------------- | ---------------------- |
| SC-01       | FR-1, TR-5            | US-1             | Happy Path             |
| SC-02       | FR-1, TR-2, NFR-7     | US-1             | Happy Path             |
| SC-03       | FR-1, TR-6, NFR-3     | US-1, US-9       | Alternative Path       |
| SC-04       | FR-2, TR-2            | US-2             | Happy Path             |
| SC-05       | FR-2, TR-2            | US-2             | Edge Case              |
| SC-06       | FR-2, TR-6, NFR-3     | US-2, US-9       | Alternative Path       |
| SC-07       | FR-3, TR-5            | US-3             | Happy Path             |
| SC-08       | FR-3, TR-2, NFR-4     | US-3, US-11      | Edge Case              |
| SC-09       | FR-3, TR-6, NFR-3     | US-3, US-9       | Alternative Path       |
| SC-10       | FR-4, NFR-2           | US-4             | Happy Path             |
| SC-11       | FR-4, NFR-2           | US-4             | Alternative Path       |
| SC-12       | FR-5, FR-8            | US-5, US-8       | Happy Path             |
| SC-13       | FR-5, FR-8, TR-6      | US-5, US-8, US-9 | Alternative Path       |
| SC-14       | FR-6, TR-2, NFR-7     | US-6             | Happy Path             |
| SC-15       | FR-6, TR-2            | US-6             | Edge Case              |
| SC-16       | FR-6, TR-6, NFR-3     | US-6, US-9       | Alternative Path       |
| SC-17       | FR-7, TR-4            | US-7             | Happy Path             |
| SC-18       | FR-7, TR-4, TR-8      | US-7, US-14      | Error/Negative         |
| SC-19       | FR-7, TR-6            | US-7, US-9       | Alternative Path       |
| SC-20       | TR-1, TR-8            | US-12            | Happy Path             |
| SC-21       | TR-1, TR-8            | US-12            | Error/Negative         |
| SC-22       | TR-5, NFR-4           | US-11            | Edge Case              |
| SC-23       | TR-5                  | US-11            | Error/Negative         |
| SC-24       | TR-7, NFR-1           | US-10            | Non-Functional         |
| SC-25       | NFR-2                 | US-4, US-14      | Non-Functional         |
| SC-26       | NFR-5                 | US-14            | Non-Functional         |
| SC-27       | NFR-6                 | US-13            | Non-Functional         |
| SC-28       | FR-5 scope constraint | US-5, US-8       | Out-of-Scope Guardrail |

---

## Feature: Player Card Play And Capture Motion

### Background: Active gameplay turn is ready

Given a game is in the awaiting card play phase
And the active player has selectable cards in hand
And table cards are visible in the center table zone

### Scenario: SC-01 — Player played card travels from hand to table with arc motion

Given the player has selected a valid hand card
And no table cards are selected for capture
When the player submits the play action
Then the selected card animates from hand to the center table zone
And the movement follows an arc path
And the card settles into the final table position after animation completes

### Scenario: SC-02 — Player played card applies required rotation and timing envelope

Given the player has selected a valid hand card
And no table cards are selected for capture
When the player submits the play action
Then the card animation includes a flip or rotation effect during travel
And the animation duration is within 800 to 1200 milliseconds
And the timing uses a natural ease-in-out motion profile

### Scenario: SC-03 — Reduced-motion mode removes play motion but preserves outcome

Given reduced-motion preference is enabled
And the player has selected a valid hand card
When the player submits the play action
Then the card appears directly in its final destination without motion
And the game state outcome matches a normal play result

### Scenario: SC-04 — Captured table cards glow then disappear

Given the player has selected a valid hand card
And one or more table cards are selected for a valid capture
When the player submits the play action
Then each captured table card shows a capture glow effect
And captured table cards fade and scale down out of view
And captured table cards are removed from the table after animation completion

### Scenario: SC-05 — Multi-card capture animates simultaneously

Given the player has selected a valid hand card
And multiple table cards are selected for capture in one action
When the player submits the play action
Then all captured table cards begin capture animation at the same time
And no captured card animation is staggered after another

### Scenario: SC-06 — Reduced-motion mode removes capture glow and fade timing

Given reduced-motion preference is enabled
And the player performs a valid capture action
When the capture resolves
Then captured cards are removed instantly from the table view
And no timed glow or fade sequence is required

---

## Feature: Dealing Motion Into Player Hand

### Background: Round flow reaches a dealing point

Given a game state where new cards must be dealt to the player hand
And the player hand zone is visible

### Scenario: SC-07 — New cards animate from deck source into hand positions

Given the player hand is ready to receive new cards
When the deal action resolves
Then each new card animates from a deck source origin toward the hand zone
And each card settles into its final hand slot position

### Scenario: SC-08 — Three-card deal animates simultaneously across responsive layouts

Given three cards are being dealt to the player
And the viewport is one of mobile, tablet, or desktop sizes
When the deal action resolves
Then all three cards animate simultaneously
And each card path remains visually correct for the current viewport
And cards remain interactable after the animation completes

### Scenario: SC-09 — Reduced-motion mode makes dealt cards appear instantly

Given reduced-motion preference is enabled
And three cards are being dealt to the player
When the deal action resolves
Then all dealt cards appear instantly in final hand positions
And dealing logic remains identical to normal mode

---

## Feature: Hand Selection Feedback

### Background: Card selection phase is active

Given a game is in the awaiting card play phase
And the player hand cards are visible and focusable

### Scenario: SC-10 — Hover and focus show immediate selection affordance

Given the player hovers or keyboard-focuses a hand card
When visual feedback is applied
Then the focused card appears slightly emphasized with subtle highlight
And the feedback appears quickly without delaying input

### Scenario: SC-11 — Select and deselect states remain distinct from capture effects

Given the player selects a hand card
When the selection state is active
Then the selected card shows a clear selection highlight
And deselecting the card returns it to baseline appearance
And selection highlighting is visually distinct from capture glow effects

---

## Feature: AI Opponent Animation In Single-Player

### Background: Single-player mode with AI opponent is active

Given a single-player game is in progress
And AI opponent actions are visible to the player

### Scenario: SC-12 — AI play and capture animate with same visual language as player

Given it is the AI opponent turn
When the AI performs a play and capture sequence
Then AI card placement is visually animated
And captured table cards animate with the same capture behavior used for player captures
And AI action timing aligns with the same duration envelope as player animations

### Scenario: SC-13 — Reduced-motion mode removes AI motion while preserving readability

Given reduced-motion preference is enabled
And it is the AI opponent turn
When the AI completes a play action
Then AI visual updates occur instantly without motion
And the player can still clearly understand the AI action result

---

## Feature: Escoba Special Effect

### Background: Escoba condition can be triggered

Given table cards are arranged so an Escoba is possible
And the active player can perform a valid Escoba capture

### Scenario: SC-14 — Escoba clears table with enhanced required special effect

Given the player performs an Escoba capture
When Escoba resolves
Then all table cards animate out simultaneously
And the effect is visually stronger than normal capture behavior
And a required burst or particle-style Escoba visual is shown
And the table zone is fully clear after completion

### Scenario: SC-15 — Escoba timing is faster than normal capture timing

Given the player performs an Escoba capture
When Escoba resolves
Then Escoba animation duration is within 600 to 800 milliseconds
And Escoba completes faster than standard capture animation behavior

### Scenario: SC-16 — Reduced-motion mode disables Escoba special motion

Given reduced-motion preference is enabled
And the player performs an Escoba capture
When Escoba resolves
Then the table clears instantly without special motion effects
And Escoba scoring and state outcomes remain unchanged

---

## Feature: Turn Pause Orchestration

### Background: Post-action transition is pending

Given an action animation has just completed
And the next turn phase has not started yet

### Scenario: SC-17 — Game applies required pause before advancing phase

When the transition pause is evaluated
Then the game waits for a pause within 500 to 800 milliseconds
And the next phase starts only after the pause completes

### Scenario: SC-18 — Missing animation completion signal does not deadlock turn progression

Given an action animation fails to emit a completion signal
When transition orchestration evaluates timeout or fallback handling
Then the game does not remain permanently blocked in the transition state
And progression recovers to a valid next phase behavior

### Scenario: SC-19 — Reduced-motion mode still enforces transition pause

Given reduced-motion preference is enabled
And an action has resolved with instant visual updates
When transition orchestration runs
Then the game still enforces a pause within 500 to 800 milliseconds
And the next phase starts only after pause completion

---

## Feature: Animation State Isolation And Completion Signaling

### Background: Animation state tracking is enabled

Given the game logic state and animation state are maintained separately

### Scenario: SC-20 — Animation state updates do not alter rule outcomes

Given an animation is running for a card action
When animation progress updates are emitted
Then game rule validation and scoring outcomes remain unchanged
And final game state is correct after animation completion

### Scenario: SC-21 — Animation interruption preserves game consistency

Given a card animation is in progress
When the animation is canceled or interrupted by a state change
Then the game resolves to a consistent legal state
And no duplicate, missing, or orphaned cards remain in visible zones

---

## Feature: Responsive Pathing And Fallback Behavior

### Scenario Outline: SC-22 — Arc path positions remain correct per viewport

Given the game is displayed at <viewport>
And a card movement animation is triggered
When the card travels from source zone to target zone
Then the card trajectory appears visually correct for <viewport>
And the card reaches the expected target zone location

Examples:
| viewport |
| mobile portrait |
| tablet landscape |
| desktop widescreen |

### Scenario: SC-23 — Coordinate calculation failure uses graceful fallback path

Given a card movement animation is triggered
And source or target coordinates cannot be resolved
When path generation executes
Then the system applies a fallback movement path
And the card still reaches the intended destination

---

## Feature: Non-Functional Quality Gates

### Scenario: SC-24 — Animation performance meets mobile frame-rate target

Given representative mobile devices are used for validation
When card animation sequences are executed repeatedly
Then measured frame rate remains at or above 55 frames per second
And no frame stall exceeds 100 milliseconds

### Scenario: SC-25 — Keyboard focus and navigation remain intact during animation

Given keyboard navigation is active
When card selection and play animations occur
Then focus order remains stable and predictable
And focus visibility remains clear throughout animation

### Scenario: SC-26 — Supported browsers render animation behavior consistently

Given the game is run on each supported browser family
When core card animation scenarios are executed
Then expected motion behavior is consistent across supported browsers
And fallback behavior remains usable where advanced motion is unavailable

### Scenario: SC-27 — Animation architecture remains maintainable and extensible

Given animation behavior is adjusted for future enhancement
When duration, easing, or visual style tokens are changed
Then core gameplay behavior remains unaffected
And scenario outcomes for existing card actions remain valid

---

## Rule: Scope Guardrail For Opponent Animation

### Scenario: SC-28 — Remote multiplayer opponent animation is excluded from this release scope

Given the card animation feature scope for this release
When opponent animation coverage is evaluated
Then single-player AI opponent animation is included
And remote multiplayer synchronization animation is treated as out of scope
