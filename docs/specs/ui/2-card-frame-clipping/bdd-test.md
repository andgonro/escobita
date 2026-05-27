# BDD Test Scenarios: Card Frame Clipping Fix

**Source Spec:** `docs/specs/ui/2-card-frame-clipping/`
**Generated from:** proposal.md, spec.md, user-stories.md

---

## Traceability Matrix

| Scenario ID | Requirement | User Story | Category         |
| ----------- | ----------- | ---------- | ---------------- |
| SC-01       | FR-1, NFR-1 | US-1       | Happy Path       |
| SC-02       | FR-1, NFR-2 | US-1       | Happy Path       |
| SC-03       | FR-1        | US-1       | Edge Case        |
| SC-04       | TR-1        | US-1       | Happy Path       |
| SC-05       | FR-2, NFR-1 | US-2       | Happy Path       |
| SC-06       | FR-2, NFR-2 | US-2       | Happy Path       |
| SC-07       | FR-2        | US-2       | Edge Case        |
| SC-08       | TR-1        | US-2       | Happy Path       |
| SC-09       | FR-3        | US-3       | Happy Path       |
| SC-10       | FR-3        | US-3       | Happy Path       |
| SC-11       | FR-3        | US-3       | Happy Path       |
| SC-12       | FR-3        | US-3       | Edge Case        |
| SC-13       | FR-3        | US-3       | Edge Case        |
| SC-14       | FR-3        | US-3       | Alternative Path |
| SC-15       | FR-4        | US-4       | Happy Path       |
| SC-16       | FR-4        | US-4       | Edge Case        |
| SC-17       | FR-4        | US-4       | Edge Case        |
| SC-18       | FR-4, TR-3  | US-4       | Edge Case        |
| SC-19       | FR-4        | US-4       | Alternative Path |
| SC-20       | FR-5, NFR-3 | US-5       | Happy Path       |
| SC-21       | FR-5, NFR-3 | US-5       | Happy Path       |
| SC-22       | FR-5, NFR-3 | US-5       | Happy Path       |
| SC-23       | FR-5, NFR-3 | US-5       | Non-Functional   |
| SC-24       | FR-5        | US-5       | Alternative Path |
| SC-25       | FR-5        | US-5       | Edge Case        |
| SC-26       | TR-2, NFR-4 | US-6       | Happy Path       |
| SC-27       | TR-2, NFR-4 | US-6       | Happy Path       |
| SC-28       | TR-2, NFR-4 | US-6       | Edge Case        |
| SC-29       | TR-2, NFR-4 | US-6       | Edge Case        |

---

## Feature: Hand Zone Card Visibility at Rest

### Background: Game table is active with a full hand

Given a game session is in progress with the active player holding at least three hand cards
And the game is in the awaiting card play phase with no animation running

### Scenario: SC-01 — Hand cards are fully visible at rest on a mobile viewport

Given the game table is rendered on a representative mobile viewport in portrait orientation
When the active hand zone is displayed in the idle state
Then every card in the active hand zone displays its full artwork without truncation at the top edge
And every card displays its full artwork without truncation at the bottom edge
And no card decorative effect is cut off by the slot container boundary

### Scenario: SC-02 — Hand cards are fully visible at rest on a desktop viewport

Given the game table is rendered on a representative desktop viewport
When the active hand zone is displayed in the idle state
Then every card in the active hand zone displays its full artwork without truncation at the top edge
And every card displays its full artwork without truncation at the bottom edge
And no card decorative effect is cut off by the slot container boundary

### Scenario: SC-03 — Adjacent hand cards remain individually identifiable at rest

Given the active hand zone contains the maximum number of cards a player can hold
When the hand zone is displayed in the idle state
Then each card is visually distinct from its neighbours
And no card body overlaps an adjacent card in a way that obscures its identity

### Scenario: SC-04 — Card slot interactive area is unchanged after overflow is permitted

Given a card slot in the active hand zone is visible on screen
When the player taps or clicks the card slot
Then the interactive area that responds to the tap or click is the same size as before the fix
And the minimum touch target dimension is preserved

---

## Feature: Center Table Card Visibility at Rest

### Background: Game table is active with cards on the table

Given a game session is in progress with at least three cards on the center table
And the game is in the awaiting card play phase with no animation running

### Scenario: SC-05 — Table cards are fully visible at rest on a mobile viewport

Given the game table is rendered on a representative mobile viewport in portrait orientation
When the center table zone is displayed in the idle state
Then every card in the center table zone displays its full artwork without truncation at the left edge
And every card displays its full artwork without truncation at the right edge
And no card decorative effect is cut off by the slot container boundary

### Scenario: SC-06 — Table cards are fully visible at rest on a desktop viewport

Given the game table is rendered on a representative desktop viewport
When the center table zone is displayed in the idle state
Then every card in the center table zone displays its full artwork without truncation at the left edge
And every card displays its full artwork without truncation at the right edge
And no card decorative effect is cut off by the slot container boundary

### Scenario: SC-07 — Adjacent table cards remain individually identifiable at rest

Given the center table zone contains the maximum number of cards that can be displayed simultaneously
When the table zone is displayed in the idle state
Then each table card is visually distinct from its neighbours
And no card body overlaps an adjacent card in a way that obscures its identity

### Scenario: SC-08 — Table card slot interactive area is unchanged after overflow is permitted

Given a card slot in the center table zone is visible on screen
When the player taps or clicks the card slot
Then the interactive area that responds to the tap or click is the same size as before the fix
And the minimum touch target dimension is preserved

---

## Feature: Hand Zone Animation Overflow

### Background: Active gameplay turn is ready for card interactions

Given a game session is in progress with the active player holding at least one hand card
And the game table is in the awaiting card play phase

### Scenario: SC-09 — Deal animation — card is fully visible at peak upward position

Given a new round has just started and the deal animation is in progress
When the deal animation moves a hand card to its peak upward position
Then the card body is fully visible without clipping at the top edge of the slot container
And the card artwork and decorative effects are fully visible at every keyframe stage

### Scenario: SC-10 — Selection elevation — card is fully visible when shifted upward

Given the player has selected a hand card
When the card shifts upward to its elevated selection position
Then the card body is fully visible without clipping at the top edge of the slot container
And the card artwork and glow effect are fully visible in the elevated position

### Scenario: SC-11 — Play-arc animation — card is fully visible at the arc peak

Given the player has submitted a valid hand card to play
When the play-arc animation reaches its highest point
Then the card body is fully visible without clipping at any edge of the hand zone container
And the card artwork is untruncated throughout the full arc path

### Scenario: SC-12 — Escoba burst — hand card is fully visible at peak scale

Given the player has scored an escoba and the burst animation is triggered
When the escoba burst animation reaches its maximum scale on the hand card
Then the card body is fully visible without any edge being clipped
And the burst glow effect is fully visible at the peak scale

### Scenario: SC-13 — Overflowing hand card is layered above neighbours without hiding identity

Given an animation causes a hand card to overflow beyond its resting slot boundary
When the card overlaps an adjacent card during the animation
Then the animating card is rendered above its neighbours in the visual stacking order
And each adjacent card remains identifiable — its suit, rank, or artwork is not fully obscured

### Scenario: SC-14 — Reduced-motion fallback produces no clipping across all hand animations

Given reduced-motion preference is enabled in the player's operating system
When the deal animation, selection elevation, play-arc, and escoba burst transitions each occur in turn
Then each transition completes without any card edge being clipped at the container boundary
And the reduced-motion fallback behaviour is preserved for each animation type

---

## Feature: Center Table Animation Overflow

### Background: Active gameplay with table cards present

Given a game session is in progress with at least two cards on the center table
And the game is in the awaiting card play phase

### Scenario: SC-15 — Capture animation — table cards are fully visible throughout glow and fade

Given the player performs a valid capture of a table card
When the capture animation plays through its glow and fade phases
Then the captured card body is fully visible throughout the glow phase with no edge clipped
And the captured card remains fully visible through the fade phase until it disappears

### Scenario: SC-16 — Escoba burst — table cards are fully visible at peak scale

Given the player has scored an escoba and the burst animation is triggered on the table cards
When the escoba burst animation reaches maximum scale on a table card
Then the card body is fully visible without any edge being clipped
And the burst glow effect is fully visible at peak scale

### Scenario: SC-17 — Multi-card capture — all cards animate without clipping

Given the player performs a valid capture of multiple table cards simultaneously
When the simultaneous capture animation plays
Then every captured card body is fully visible without edge clipping throughout the animation
And no captured card is obscured by another captured card in a way that hides its identity

### Scenario: SC-18 — No clipping at the minimum responsive container size during capture

Given the game table is rendered at the smallest supported mobile viewport
And the center table zone is at its minimum responsive container size
When a capture animation plays on a card at the edge of the table layout
Then the card body is fully visible without edge clipping at any keyframe stage

### Scenario: SC-19 — Reduced-motion fallback produces no clipping across all table animations

Given reduced-motion preference is enabled in the player's operating system
When a capture animation and an escoba burst animation each occur on table cards
Then each transition completes without any card edge being clipped at the container boundary
And the reduced-motion fallback behaviour is preserved for each animation type

---

## Feature: Keyboard Focus Indicator Visibility

### Background: Game table is accessible via keyboard navigation

Given a game session is in progress
And the player is navigating the game table using a keyboard

### Scenario: SC-20 — Hand card focus ring is fully visible on all four sides on a mobile viewport

Given the game table is rendered on a representative mobile viewport in portrait orientation
When the player uses keyboard navigation to focus a card slot in the active hand zone
Then the focus-visible indicator is fully visible on the top side of the card slot
And the focus-visible indicator is fully visible on the bottom side of the card slot
And the focus-visible indicator is fully visible on the left side of the card slot
And the focus-visible indicator is fully visible on the right side of the card slot

### Scenario: SC-21 — Hand card focus ring is fully visible on all four sides on a desktop viewport

Given the game table is rendered on a representative desktop viewport
When the player uses keyboard navigation to focus a card slot in the active hand zone
Then the focus-visible indicator is fully visible on the top side of the card slot
And the focus-visible indicator is fully visible on the bottom side of the card slot
And the focus-visible indicator is fully visible on the left side of the card slot
And the focus-visible indicator is fully visible on the right side of the card slot

### Scenario: SC-22 — Table card focus ring is fully visible on all four sides on a desktop viewport

Given the game table is rendered on a representative desktop viewport
When the player uses keyboard navigation to focus a card slot in the center table zone
Then the focus-visible indicator is fully visible on the top side of the card slot
And the focus-visible indicator is fully visible on the bottom side of the card slot
And the focus-visible indicator is fully visible on the left side of the card slot
And the focus-visible indicator is fully visible on the right side of the card slot

### Scenario: SC-23 — Focus ring meets the established contrast requirement

Given the player uses keyboard navigation to focus a card slot in the active hand zone
When the focus-visible indicator is displayed around the card slot
Then the focus indicator colour contrast against its background meets the contrast requirement defined in the existing accessibility baseline

### Scenario: SC-24 — Keyboard navigation order through hand cards is unaffected by the fix

Given the game table is rendered with the active hand zone containing multiple cards
When the player presses the Tab key repeatedly to navigate through the hand cards
Then focus moves through each card slot in the expected sequential order
And no card slot is skipped or repeated in the navigation sequence

### Scenario: SC-25 — No residual visual artefact after focus leaves a card

Given a hand card slot currently has keyboard focus and the focus-visible indicator is shown
When the player navigates away from that card slot using the keyboard
Then the focus-visible indicator disappears from the previously focused card slot
And no ghost outline or visual remnant remains on the card slot after focus departs

---

## Feature: Adjacent Zone Non-Regression

### Background: Game table is fully rendered after the clipping fix is applied

Given the card frame clipping fix has been applied to the active hand zone and center table zone
And a game session is in progress with cards in the hand, on the table, and opponent zones visible

### Scenario: SC-26 — Opponent hand display shows no new overflow bleed or layout shift

Given the game table is rendered on a representative desktop viewport
When the active hand zone and center table zone are displayed with overflow permitted
Then the opponent hand zone shows no unintended overflow bleed from adjacent zones
And the opponent hand zone layout has not shifted compared to before the fix

### Scenario: SC-27 — Match-over overlay renders correctly with no visual change

Given a game session reaches the match-over state and the overlay is shown
When the match-over overlay is displayed over the game table
Then the overlay renders correctly with no new visual defects
And the overlay positioning and content are unchanged compared to before the fix

### Scenario: SC-28 — Other table regions show no new visual defects on mobile

Given the game table is rendered on a representative mobile viewport in portrait orientation
When the player views the full game table with the clipping fix applied
Then zones outside the active hand and center table — including the opponent zone and score area — show no new clipping, overflow bleed, or layout shift

### Scenario: SC-29 — Other table regions show no new visual defects on desktop

Given the game table is rendered on a representative desktop viewport
When the player views the full game table with the clipping fix applied
Then zones outside the active hand and center table — including the opponent zone and score area — show no new clipping, overflow bleed, or layout shift
