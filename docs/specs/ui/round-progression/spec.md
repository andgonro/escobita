# Spec: Round Progression and Match Over

## Overview

This feature adds the UI continuation workflow that allows players to progress through multiple rounds until a match winner is declared. It introduces an explicit "Start Next Round" action for the between-round state and a "Match Over" overlay for the end-of-match state. Both states are currently unhandled in the game table screen. This feature consumes the existing game engine signals and methods and does not alter any game rules or scoring logic.

---

## Functional Requirements

### FR-1: Round-Complete State Recognition

**FR-1.1** — When `roundResult` becomes non-null, the game table must enter a visually distinct "round-complete" state, regardless of whether `matchWinner` is also non-null. This state persists until the player activates the appropriate continuation action — either "Start Next Round" (if no winner has been declared) or "View Winner" (if a winner has been declared). The round score breakdown is always shown before any match-over information is presented.

**FR-1.2** — In the round-complete state, the round number and the highest individual score earned in that round must remain visible to all players.

**FR-1.3** — In the round-complete state, the full per-player score breakdown for that round must be visible. This breakdown shows, for each player: their name, and the points they earned in each scoring category (escobas, most cards, most Oros, most sevens, Siete de Oros, and total). Player names are resolved by matching the `playerId` from each `PlayerRoundScore` entry against the players array in the current game state.

**FR-1.4** — In the round-complete state, the board zones (table cards zone, opponent zones, active hand zone) remain rendered and visually inspectable. Since all hands are empty after a round ends, the engine's own state naturally prevents card selection and play. No additional artificial disabling of zones is required.

**FR-1.5** — In the round-complete state, the standard "Submit play" and "Confirm turn" controls in the action bar are naturally inactive due to the engine being in `awaiting-card-play` phase with no hand cards present. No artificial override of these controls is required.

---

### FR-2: Start Next Round Action

**FR-2.1** — A "Start Next Round" button must be visible and reachable when the game table is in the round-complete state and `matchWinner` is null: `roundResult` is non-null and no winner has been declared.

**FR-2.2** — When both `roundResult` and `matchWinner` are non-null (the final round has just ended with a winner), a "View Winner" button must appear in place of the "Start Next Round" button. The two buttons are mutually exclusive: "Start Next Round" is shown when `matchWinner` is null; "View Winner" is shown when `matchWinner` is non-null.

**FR-2.7** — Activating the "View Winner" button transitions the game table from the round-complete state to the match-over state, causing the "Match Over" overlay to appear. The "View Winner" button must be reachable and operable by keyboard navigation and must carry a meaningful accessible label.

**FR-2.3** — When a player activates the "Start Next Round" button, `gameEngine.startNextRound()` is called. This resets `roundResult` to null at the engine level.

**FR-2.4** — After `startNextRound()` is called, the board must reflect the new round's initial deal: 4 table cards, 3 hand cards per player, round number incremented, and per-round player state reset. All elements of the previous round's score breakdown are no longer visible.

**FR-2.5** — The "Start Next Round" button must be reachable and operable by keyboard navigation.

**FR-2.6** — The "Start Next Round" button must carry a meaningful accessible label in Spanish.

---

### FR-3: Match-Over State Recognition

**FR-3.1** — The match-over UI state is entered only when the player explicitly activates the "View Winner" button from the final round-complete state (FR-2.7). The match-over overlay does not appear automatically when `matchWinner` becomes non-null; it is always preceded by the round result screen. The match winner signal can only become non-null at the end of a complete round — after all remaining table cards have been awarded, all five scoring categories have been computed, and accumulated match scores have been updated for every player. It is never set mid-round as a result of an escoba or any individual card play. A player who scores an escoba mid-round that brings their running total to 15 or more is not yet a winner; the win condition is only evaluated once the round fully ends. If one player ends with the strictly highest score, that player is the sole winner. If two or more players end the round sharing the same highest score at or above 15, all tied players are declared co-winners and the game ends — no additional round is played to break the tie.

**FR-3.2** — In the match-over state, a full-screen "Match Over" overlay must appear on top of all game table content.

**FR-3.3** — The overlay must display the winner's name prominently and clearly. If two or more players are co-winners, all winners' names must be displayed with equal prominence.

**FR-3.4** — The overlay must display the final accumulated match scores for all players (not round scores — the total points each player has earned across all rounds of the match).

**FR-3.5** — The overlay must not be dismissible by clicking outside it, pressing Escape, or any gesture other than the two explicit exit actions defined in FR-4 and FR-5.

**FR-3.6** — While the match-over overlay is active, the underlying game table content (HUD, board zones, action bar) must be made inert to pointer and keyboard input and marked with `aria-hidden`, using the same attribute pattern applied by the existing `TurnHandoffOverlay`.

---

### FR-4: Return to Lobby Action

**FR-4.1** — The match-over overlay must present a clearly labelled "Return to Lobby" action.

**FR-4.2** — When a player activates "Return to Lobby", the application navigates to the root route, rendering the Lobby screen.

**FR-4.3** — The `GameSession` configuration is not cleared on navigation to the lobby. The lobby form re-opens with the previous session's settings pre-filled, allowing the player to modify them or start a new game directly.

**FR-4.4** — The "Return to Lobby" action must be reachable and operable by keyboard navigation.

---

### FR-5: Play Again Action

**FR-5.1** — The match-over overlay must present a clearly labelled "Play Again" action.

**FR-5.2** — When a player activates "Play Again", a fresh match begins immediately with the same session configuration: same player names, same game mode, and same AI difficulty. The player does not return to the lobby.

**FR-5.3** — "Play Again" must call `gameEngine.initGame()` directly with the current session configuration. This resets all engine signals to their initial values: `state` is reinitialised with a new shuffled deck and fresh deal, `roundResult` and `matchWinner` are set to null, `turnPhase` is set to `awaiting-card-play`, round number resets to 1, and all accumulated match scores reset to 0.

**FR-5.4** — After "Play Again" is activated, the match-over overlay is dismissed and the game table presents the new round 1 board state, ready for play.

**FR-5.5** — The "Play Again" action must be reachable and operable by keyboard navigation.

---

### FR-6: Accessibility

**FR-6.1** — When the match-over overlay appears, focus must move into the overlay. Focus must not be trapped on the background content.

**FR-6.2** — The match-over overlay must have a role and accessible name so that assistive technology identifies it as a modal dialog.

**FR-6.3** — When the match-over overlay is dismissed (by either action), focus must return to a meaningful target on the resulting screen: the "Submit play" button on the game table for "Play Again", or the lobby's primary control for "Return to Lobby".

**FR-6.4** — Round completion and match winner declaration must produce announcements through the existing `A11yLiveRegion` mechanism already in use in the game table.

**FR-6.5** — All new interactive controls carry meaningful accessible labels.

---

## Technical Requirements

### TR-1: Component Boundaries

**TR-1.1** — The "Start Next Round" button and the per-player round score breakdown are introduced inside the `MatchContextHud` component, adjacent to the existing `round-outcome-indicator` element. `MatchContextHud` emits a new output event when the button is activated. `GameTablePage` handles that event and calls `gameEngine.startNextRound()`.

**TR-1.2** — The match-over overlay is implemented as a new standalone component (for example `MatchOverOverlay`). It follows the structural and accessibility patterns of the existing `TurnHandoffOverlay`: it accepts all needed data as inputs, emits discrete output events for each action, and has no direct dependencies on the game engine or router.

**TR-1.3** — `GameTablePage` is the single orchestration point for this feature. It reads `roundResult()` and `matchWinner()` from the engine via its existing computed properties, passes derived data to child components as inputs, and handles the `startNextRound` call, the `initGame` call for "Play Again", and the `Router.navigate` call for "Return to Lobby".

**TR-1.4** — `GameEngine`, `GameSession`, `partida-session.guard`, and the `GameTablePage` routing configuration are not structurally modified by this feature.

---

### TR-2: Engine Integration

**TR-2.1** — The "Start Next Round" action maps directly to `gameEngine.startNextRound()`. No intermediate state layer is required.

**TR-2.2** — The "Play Again" action calls `gameEngine.initGame(configuration)` directly, where `configuration` is the current value returned by `gameSession.configuration()`. This call must bypass the existing bootstrap guard condition in `bootstrapEngineStateFromSession()`, which skips `initGame()` when `gameEngine.state()` is already non-null. The implementation must call `initGame()` unconditionally in response to "Play Again".

**TR-2.3** — The "Return to Lobby" action uses Angular `Router.navigate(['/'])`. No engine or session state is cleared.

---

### TR-3: Overlay Display Logic

**TR-3.1** — The match-over overlay visibility is controlled by a local UI signal in `GameTablePage` (for example `showMatchOverOverlay`), not directly by the `matchWinner()` engine signal. This signal is set to true only when the player activates the "View Winner" button (FR-2.7). It is set to false when `initGame()` is called for "Play Again" or when the application navigates away. This separation ensures the overlay never appears automatically without the player first acknowledging the final round result.

**TR-3.2** — While the match-over overlay is visible, the background game table content must receive the `inert` attribute and `aria-hidden="true"` on the relevant wrapper elements, consistent with the pattern already applied by `TurnHandoffOverlay` and the existing handoff-active guard in `GameTablePage`.

**TR-3.3** — The overlay must be positioned above all game table content in the visual stacking order, using the same CSS approach as `TurnHandoffOverlay`.

---

### TR-4: Reactive State

**TR-4.1** — The visibility of the "Start Next Round" and "View Winner" buttons is derived from the existing engine signals (`roundResult`, `matchWinner`) via computed properties in `GameTablePage`. The visibility of the match-over overlay requires one additional local writable signal in `GameTablePage` (for example `showMatchOverOverlay`) that is set only in response to the "View Winner" player action, not automatically from the engine signal.

**TR-4.2** — `MatchContextHud` reflects the availability of the "Start Next Round" button through a new boolean input binding driven by a computed property in `GameTablePage`, not by reading the engine directly. This preserves the component's existing design contract (data-in, event-out).

**TR-4.3** — The per-player round score breakdown is passed to `MatchContextHud` as a structured input. `GameTablePage` is responsible for resolving player names from the engine state and combining them with the `PlayerRoundScore` entries from `roundResult`.

---

## Non-Functional Requirements

### NFR-1: Correctness

**NFR-1.1** — The "Start Next Round" button must never be visible while `matchWinner` is non-null. The "View Winner" button must never be visible while `matchWinner` is null. The two buttons are mutually exclusive and never both visible at the same time.

**NFR-1.2** — The match-over overlay must never be visible while the match winner signal is null, and must never appear without the player first having seen and acknowledged the final round result via the "View Winner" action. In the co-winner case, the overlay must correctly display all winning players.

**NFR-1.3** — "Play Again" must produce a genuinely fresh game state: round 1, all accumulated match scores at 0, new shuffled deck, and new initial deal. The engine's `initGame()` implementation guarantees this.

**NFR-1.4** — After the "Start Next Round" button is activated, `roundResult` becomes null at the engine level. The button and the score breakdown panel must no longer be visible.

---

### NFR-2: Accessibility

**NFR-2.1** — All new interactive controls satisfy the keyboard reachability requirements defined in FR-2.5, FR-4.4, and FR-5.5.

**NFR-2.2** — Live-region announcements for round completion and match winner declaration are consistent with the existing `A11yLiveRegion` mechanism and follow the same announcement patterns already used for turn changes and validation messages.

---

### NFR-3: Maintainability

**NFR-3.1** — `MatchOverOverlay` is self-contained: it receives all data as inputs and emits events as outputs. It has no direct dependencies on the game engine, session, or router, making it independently testable and reusable.

**NFR-3.2** — The score breakdown data shape passed to `MatchContextHud` is defined as a typed interface in the component, not as a raw `RoundResult` reference, so internal engine model changes do not automatically break the HUD's presentation contract.

---

## Out of Scope

- A detailed analytics view with charts or historical round-by-round statistics.
- Audio or animation feedback for round end or match end transitions.
- Automatically starting the next round without explicit player input.
- Clearing `GameSession.configuration()` on return to the lobby.
- Any change to the lobby's existing form pre-fill behavior or navigation logic.
- AI opponent behavior in response to round end or match end events.
- Online multiplayer, persistence, or session recovery scenarios.
- A confirmation dialog before "Return to Lobby" (navigating away during a match-over state is not a destructive action since the match is already concluded).

---

## Future Considerations

- A richer round summary panel (detailed per-category breakdown for all players across all previous rounds) could replace or extend the current round score breakdown area.
- A countdown timer with cancel option could replace the explicit "Start Next Round" button for single-player sessions, providing a smoother pacing experience.
- The lobby could gain a dedicated "Rematch" entry point from the match-over overlay that navigates to the lobby with the configuration highlighted and a one-click confirm option.
- The `MatchOverOverlay` could be extended to display escoba highlights or notable plays from the final round before showing the winner.
