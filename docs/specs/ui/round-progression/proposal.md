# Proposal: Round Progression and Match Over

## Summary

The game currently has no UI path for completing more than one round. Once a round ends, players see a static text indicator in the HUD but have no way to start the next round or acknowledge that the match is over. This feature adds the missing continuation workflow: an explicit "Start Next Round" button that lets players proceed when no winner yet exists, and a full-screen "Match Over" overlay that appears when a match winner is declared, offering "Return to Lobby" and "Play Again" actions.

---

## Context

### Motivation

The game engine fully implements multi-round play (FR-10.1–FR-10.3 of the game-engine core spec) and exposes all the signals and methods needed: `roundResult`, `matchWinner`, and `startNextRound()`. Without a UI that reacts to these, the game is unfinishable: after the first round ends, players are left on a board with empty hands, a single line of static text in the HUD, and no path to continue or exit.

### Current Limitation

- The `MatchContextHud` component renders round outcome and match winner as informational-only text paragraphs. No interactive controls exist.
- `GameTablePage` never calls `gameEngine.startNextRound()`.
- After a round ends, `turnPhase` resets to `awaiting-card-play`. The board appears to be in a playable state even though all hands are empty and the round has resolved. There is no visible signal to the player that they need to act to continue.
- There is no "Match Over" overlay, no "Return to Lobby" affordance, and no "Play Again" path anywhere in the game table feature.
- No Cypress end-to-end scenario covers either continuation path.

### Stakeholders

- Human players in both single-player and local multiplayer sessions.
- The future AI opponent feature, which will need to trigger `startNextRound()` as part of its agent loop after each round resolves.

### User Experience Impact

Without this feature, a match cannot progress beyond round 1. With it, the full game arc becomes playable: rounds continue until one player reaches 15 accumulated points with a clear lead, the match-over overlay then appears, and the player can return to lobby or immediately rematch with the same team.

---

## High-Level Approach

- After a round ends and no winner has been declared, a "Start Next Round" button appears in the round result area of the HUD, alongside the existing round number and top score text.
- The board (table cards, opponent zones, active hand zone) remains visible and inspectable. Since all hands are empty after a round ends, the engine's own state naturally prevents any accidental card plays; no artificial locking is needed.
- The per-player round score breakdown (points by category) is shown alongside the button so players can review results before continuing.
- Activating "Start Next Round" calls `gameEngine.startNextRound()`. The engine resets `roundResult` to null, deals fresh cards, and the board enters round N+1 in the normal play state.
- When `matchWinner` becomes non-null, a full-screen "Match Over" overlay appears over the game table, following the same layering and inert/aria-hidden pattern already used by the existing `TurnHandoffOverlay`. The overlay shows the winner's name, the final match scores for all players, and two explicit exit actions.
- "Return to Lobby" navigates to the root route. The `GameSession` configuration is preserved so the lobby form re-opens pre-filled with the last session's settings.
- "Play Again" calls `gameEngine.initGame()` directly with the current session configuration, starting a fresh round 1 match without going through the lobby. The match-over overlay dismisses and the board shows the new initial deal.
- No changes are made to `GameSession`, game engine rules, scoring logic, or the routing guard.

---

## Deliverables

- Updated `MatchContextHud` component to expose a "Start Next Round" button (visible when `roundResult` is non-null and `matchWinner` is null) and a full per-player round score breakdown panel.
- A new `MatchOverOverlay` standalone component for the match-over state, following the `TurnHandoffOverlay` structural pattern.
- Updated `GameTablePage` to wire the new button event to `startNextRound()`, to show/hide the match-over overlay based on `matchWinner`, to handle the "Play Again" reinitialisation call, and to handle the "Return to Lobby" navigation.
- New unit and integration tests covering round-result gating, next-round transitions, match-over display conditions, and Play Again reinitialisation.
- New Cypress BDD scenarios for the next-round continuation path and the match-over overlay path.

---

## Notes

- "Play Again" must bypass the existing bootstrap guard in `bootstrapEngineStateFromSession()`, which skips `initGame()` if engine state is already non-null. The implementation must call `gameEngine.initGame()` directly and unconditionally when the player activates "Play Again".
- The `TurnHandoffOverlay` component provides the closest existing reference pattern for the `MatchOverOverlay` (full-screen positioning, inert background, focus management, output-only interface).
- This feature depends exclusively on engine methods and signals that are already implemented and fully tested (T-11, SC-68 through SC-77 of the game-engine core spec).
- The round score breakdown requires `RoundResult.playerScores` data, which the engine populates completely. Player names must be resolved by cross-referencing `playerScores[].playerId` with the players array in `GameState`.
