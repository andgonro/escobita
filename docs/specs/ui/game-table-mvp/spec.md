# Spec: Game Table MVP

## Overview

The Game Table MVP defines the first playable board screen for La Escoba. It establishes table layout, player card interaction, capture selection, turn progression, handoff behavior for local multiplayer, and accessibility baselines. This feature consumes the existing game-engine state and actions and does not alter game rules.

## Functional Requirements

### FR-1: Table Layout and Perspective

FR-1.1 The game table route displays a complete play surface instead of a placeholder.

FR-1.2 The active player hand is shown in the primary bottom zone of the screen.

FR-1.3 Opponent zones are arranged around the table according to player count.

FR-1.4 Table cards are shown in a central play area.

FR-1.5 The table surface uses the existing texture asset with a subtle visual overlay to preserve card readability.

### FR-2: Match Context and Information Hierarchy

FR-2.1 The active player identity is always visible.

FR-2.2 Match scores for all players are always visible.

FR-2.3 Current turn phase is always visible.

FR-2.4 Context indicators update immediately after state changes.

### FR-3: Play Interaction Flow

FR-3.1 Only the active player can initiate card-play interactions.

FR-3.2 A player selects one card from hand as the candidate play card.

FR-3.3 The selected hand card remains visually indicated until changed, canceled, or submitted.

FR-3.4 A play action requires explicit confirmation by the player.

FR-3.5 Submitting play without a selected hand card is blocked with clear feedback.

FR-3.6 After play submission, the screen enters the turn-confirmation step before advancing to the next player.

### FR-4: Capture Subset Selection and Validation

FR-4.1 The player can select one or more table cards as a capture subset.

FR-4.2 The UI provides clear validity feedback for the selected capture combination.

FR-4.3 If no table cards are selected, the action is treated as table placement.

FR-4.4 If table cards are selected and the capture is invalid, submission is blocked and feedback is shown.

FR-4.5 If the capture is valid, played and captured cards are reflected in the resulting table state.

FR-4.6 If a capture clears the table, the resulting escoba outcome is reflected in visible game state.

FR-4.7 Missed-capture behavior remains valid: if the player confirms placement with no subset selected, capture opportunity is not auto-applied.

### FR-5: Turn Completion and Local Multiplayer Handoff

FR-5.1 A dedicated turn-completion action is available after play submission.

FR-5.2 An optional pass-and-play handoff toggle is available in local multiplayer sessions.

FR-5.3 When handoff is enabled, an intermediate handoff screen appears between turns.

FR-5.4 When handoff is disabled, play advances directly to the next turn view.

FR-5.5 Handoff behavior is not forced in single-player sessions.

FR-5.6 Handoff toggle state is applied consistently for subsequent turns within the current match session.

### FR-6: Accessibility

FR-6.1 All interactive controls are reachable and operable by keyboard.

FR-6.2 Card controls expose meaningful labels and selection state for assistive technology.

FR-6.3 Validation, action outcomes, and turn changes provide screen-reader-readable announcements.

FR-6.4 Focus movement is predictable after key actions such as play submission, invalid submission, and turn completion.

### FR-7: Responsive Gameplay Surface

FR-7.1 The table is usable at mobile width starting at 320 pixels.

FR-7.2 The table uses touch-friendly target sizes for all core actions.

FR-7.3 Layout adapts for tablet and desktop without losing information clarity.

### FR-8: Engine and Session Integration

FR-8.1 The table screen initializes match display using session configuration already established in the Lobby flow.

FR-8.2 The table screen reflects game-engine signals for board, players, turn, and score context.

FR-8.3 Play submission maps to the game-engine play action.

FR-8.4 Turn completion maps to the game-engine turn-confirm action.

FR-8.5 End-of-round and winner states are shown using existing engine outcomes.

FR-8.6 The table UI does not duplicate core rule or scoring logic that already exists in the game engine.

## Technical Requirements

### TR-1: UI Architecture and Composition

TR-1.1 The feature is defined under the UI epic and remains route-based.

TR-1.2 The table screen may use internal sub-areas for hand zone, center table zone, opponent zones, and context header.

TR-1.3 The feature follows established visual conventions from the Lobby for spacing, contrast, and component rhythm.

### TR-2: Reactive State Management

TR-2.1 The table consumes game state through the existing signal-based engine contract.

TR-2.2 Temporary interaction state for selected hand and selected capture subset remains local to the table UI layer.

TR-2.3 Engine state remains the single source of truth for authoritative gameplay results.

TR-2.4 A feature-scoped interaction-state service is used for transient selection, readiness, and handoff state.

### TR-3: Asset and Surface Treatment

TR-3.1 Existing card image assets are used for card rendering.

TR-3.2 Existing table texture asset is used with a readability-preserving overlay.

TR-3.3 Surface treatment must not reduce contrast below accessibility targets.

TR-3.4 Card asset mapping is deterministic and consistent across all table zones.

### TR-4: Interaction Contracts

TR-4.1 The play submission action is gated by explicit player confirmation.

TR-4.2 Capture submission must follow valid-capture constraints before execution.

TR-4.3 Turn completion is separated from play submission to respect turn-phase behavior.

TR-4.4 Invalid actions provide user feedback without state corruption.

### TR-5: Local Multiplayer Handoff

TR-5.1 Handoff behavior is configurable with an in-session toggle.

TR-5.2 Handoff view must prevent accidental information leakage before device pass.

TR-5.3 Handoff mode change is reflected immediately for subsequent turns.

### TR-6: Accessibility and Usability

TR-6.1 Keyboard operation supports full play flow from card selection through turn completion.

TR-6.2 Screen-reader semantics identify card, role, and selected state.

TR-6.3 Error and status messaging are programmatically available to assistive technology.

## Non-Functional Requirements

### NFR-1: Performance

NFR-1.1 Core table interactions should feel immediate for normal use.

NFR-1.2 Selection and confirmation feedback should appear without perceptible lag.

### NFR-2: Accessibility

NFR-2.1 Keyboard-only play path is supported for all core table actions.

NFR-2.2 Screen-reader users can identify active controls and turn context.

NFR-2.3 Contrast and readability remain compliant over textured backgrounds.

### NFR-3: Reliability and Consistency

NFR-3.1 UI state must remain synchronized with engine state after every action.

NFR-3.2 Invalid action attempts must fail gracefully without visual desynchronization.

### NFR-4: Maintainability

NFR-4.1 Feature structure should allow future additions such as animations, advanced handoff, and richer score presentation without redesigning core interaction flow.

## Out of Scope

- Audio effects and music behavior.
- Advanced card animations and cinematic transitions.
- Drag-and-drop interaction model.
- Alternative rule variants or custom scoring rules.
- Online multiplayer and network synchronization.
- Persistence of in-progress matches across browser sessions.
- Comprehensive post-round analytics views.

## Future Considerations

- Add animation system for dealing, capturing, and turn transitions.
- Add richer opponent-state visuals for local multiplayer privacy and immersion.
- Expand handoff controls with timed reveal and player acknowledgment options.
- Add advanced accessibility helpers such as simplified spoken summaries per turn.
- Add optional visual themes while preserving contrast and readability constraints.
