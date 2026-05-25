# BDD Test Scenarios: Laia Hand Capture Animation Bleed

**Source Spec:** docs/specs/ui/laia-hand-capture-animation-bleed/
**Generated from:** proposal.md, spec.md, user-stories.md

## Traceability Matrix

| Scenario ID | Requirement             | User Story | Category         |
| ----------- | ----------------------- | ---------- | ---------------- |
| SC-01       | FR-1.1, FR-1.2          | US-1       | Happy Path       |
| SC-02       | FR-1.2, FR-1.3          | US-1, US-3 | Happy Path       |
| SC-03       | FR-1.3                  | US-1       | Happy Path       |
| SC-04       | FR-1.4                  | US-2       | Alternative Path |
| SC-05       | FR-1.4                  | US-2       | Alternative Path |
| SC-06       | TR-1.1, TR-1.2, NFR-1.1 | US-1, US-2 | Error/Negative   |
| SC-07       | FR-1.2, TR-1.1          | US-1       | Error/Negative   |
| SC-08       | FR-1.3, NFR-1.2         | US-3       | Edge Case        |
| SC-09       | TR-1.3, NFR-1.2         | US-3       | Edge Case        |
| SC-10       | FR-1.3, TR-1.3          | US-3       | Edge Case        |
| SC-11       | NFR-1.3                 | US-4       | Non-Functional   |
| SC-12       | NFR-1.3                 | US-4       | Non-Functional   |
| SC-13       | NFR-1.4                 | US-4       | Non-Functional   |

---

## Feature: Human Capture Animation Isolation

### Background: Human turn with visible opponent hand

Given a single-player match is in progress
And the human player is on an active turn
And Laia's hand area is visible with one or more face-down cards
And at least one legal capture is available on the table

### Scenario: SC-01 — Single-card human capture does not animate Laia hand

When the human player performs a capture involving one table card
Then only cards participating in that capture show capture visual effects
And no card in Laia's hand area shows glow, flash, fade, or scale effects

### Scenario: SC-02 — Multi-card human capture does not animate Laia hand

When the human player performs a capture involving multiple table cards
Then all participating capture cards animate according to capture behavior
And all visible cards in Laia's hand area remain visually static

### Scenario: SC-03 — Escoba capture does not animate Laia hand

Given the human player has a legal Escoba capture
When the human player performs the Escoba capture
Then table-side capture visuals represent the Escoba outcome
And no card in Laia's hand area shows capture glow or flash

## Feature: Opponent Hand Animation Eligibility

### Background: Opponent animation context boundaries

Given a single-player match is in progress
And Laia's hand area is visible

### Scenario: SC-04 — Opponent hand animation appears only during explicit opponent-turn context

Given the game enters an explicit opponent-turn animation phase
When opponent-turn visual updates are presented
Then only opponent-turn eligible visuals appear in Laia's hand area
And human capture-state visuals are not applied to Laia's hand area

### Scenario: SC-05 — Ending opponent-turn phase restores static opponent hand

Given Laia's hand has temporary opponent-turn visual activity
When the explicit opponent-turn animation phase ends
Then Laia's hand area returns to a static visual state
And no residual capture-state visuals remain on Laia's hand cards

## Feature: Negative Validation for Cross-Zone Animation Bleed

### Background: Human capture with opponent hand visible

Given a single-player match is in progress
And the human player can perform a legal capture
And Laia's hand area is visible on screen

### Scenario: SC-06 — Human capture never leaks capture glow to opponent hand

When the human player performs a capture
Then capture glow is restricted to participating capture cards only
And no capture glow appears on any card in Laia's hand area

### Scenario: SC-07 — Human capture never applies non-glow capture effects to opponent hand

When the human player performs a capture
Then no card in Laia's hand area receives capture flash behavior
And no card in Laia's hand area receives capture fade behavior
And no card in Laia's hand area receives capture scale behavior

## Feature: Regression Stability Across Repeated Captures

### Background: Ongoing session with repeated capture opportunities

Given a single-player session has progressed through multiple turns
And Laia's hand area is visible
And the human player can perform captures in sequence

### Scenario: SC-08 — Consecutive captures preserve isolation every time

When the human player performs consecutive capture actions in one session
Then each capture shows visuals only on participating capture cards
And Laia's hand area remains static after every capture action

### Scenario: SC-09 — Capture after dealing new cards preserves isolation

Given a deal event has occurred and hand sizes have changed
And the human player has a legal capture after the deal
When the human player performs that capture
Then capture visuals apply only to participating cards
And Laia's hand area remains visually static

### Scenario Outline: SC-10 — Capture size variance does not alter isolation behavior

Given the human player can perform a capture involving <capture_size>
When the human player performs the capture
Then only participating capture cards show capture visuals
And Laia's hand area remains visually static

Examples:
| capture_size |
| one table card |
| two table cards |
| three or more table cards |

## Feature: Non-Functional Preservation After Isolation Fix

### Background: Accessibility and responsiveness baseline

Given a single-player match is in progress
And Laia's hand area is visible during human captures

### Scenario: SC-11 — Reduced-motion mode preserves correct isolation behavior

Given reduced-motion preference is enabled
And the human player can perform a legal capture
When the human player performs the capture
Then Laia's hand area remains visually static
And capture outcome visuals remain correctly isolated to participating cards

### Scenario: SC-12 — Keyboard and focus behavior remain unaffected during captures

Given the user is navigating with keyboard controls
And focus indicators are visible before a human capture
When the human player performs a capture
Then keyboard navigation remains available after the capture
And focus behavior remains consistent with pre-capture behavior

### Scenario: SC-13 — Capture transitions remain responsive without introduced stutter

Given normal gameplay conditions on supported viewport sizes
And the human player performs capture actions
When capture transitions are rendered
Then visual feedback remains responsive
And no noticeable stutter is introduced by animation isolation behavior
