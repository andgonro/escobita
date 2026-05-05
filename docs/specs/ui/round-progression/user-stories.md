# User Stories: Round Progression and Match Over

---

## US-1: Continue to the Next Round

**As a** player whose round has just ended without a match winner,
**I want** to see a "Start Next Round" button alongside the round result summary,
**So that** I can review the outcome and proceed to the next round at my own pace.

### Acceptance Criteria

- [ ] After the last confirmed turn of a round, a "Start Next Round" button becomes visible in the round result area of the HUD.
- [ ] The "Start Next Round" button is visible only when `roundResult` is non-null and `matchWinner` is null.
- [ ] When `roundResult` is non-null and `matchWinner` is non-null (the final round has ended with a winner), a "View Winner" button appears in place of "Start Next Round". The two buttons are mutually exclusive.
- [ ] The per-player score breakdown for the completed round is shown alongside the button: each player's name and the points they earned in each scoring category (escobas, most cards, most Oros, most sevens, Siete de Velo, and total).
- [ ] The board zones (table cards, opponent zones, active hand zone) remain rendered and visible for inspection while the round-complete state is active.
- [ ] The action bar's "Submit play" and "Confirm turn" controls are naturally inactive (engine state prevents their use), and no artificial lock is applied.
- [ ] Activating the "Start Next Round" button calls `startNextRound()` on the game engine.
- [ ] After activation, the round score breakdown and the "Start Next Round" button disappear.
- [ ] The board immediately reflects the new round's initial deal: 4 fresh table cards, 3 hand cards per player, and the round number incremented by 1.
- [ ] The "Start Next Round" button is reachable and operable by keyboard.
- [ ] The button carries a meaningful accessible label.
- [ ] A live-region announcement is made indicating the round has been completed.

---

## US-2: Acknowledge a Match Winner

**As a** player,
**I want** to see a clear "Match Over" overlay when the match is won,
**So that** I know the game is conclusively finished and which player or players won.

### Acceptance Criteria

- [ ] When the final round ends with a winner, the round-complete state is shown first: the full per-player score breakdown for that round is visible, and a "View Winner" button appears in place of "Start Next Round".
- [ ] The match-over overlay does not appear automatically; it only appears after the player activates the "View Winner" button.
- [ ] Once the "View Winner" button is activated, a full-screen "Match Over" overlay appears on top of all game table content.
- [ ] The overlay displays the winner's name prominently. If two or more players are co-winners (tied at the same score at or above 15), all winners' names are displayed with equal prominence.
- [ ] The overlay displays the final accumulated match scores for all players.
- [ ] In the co-winner case, no additional round is played; the match ends immediately with all tied players declared as winners.
- [ ] The underlying game table content (HUD, board zones, action bar) is visually obscured and inert to pointer and keyboard interaction while the overlay is active.
- [ ] The overlay cannot be dismissed by clicking outside of it, pressing Escape, or any gesture other than the two explicit exit actions.
- [ ] The overlay has an accessible role and name so that assistive technology identifies it as a modal dialog on appearance.
- [ ] When the overlay appears, focus moves into it.
- [ ] A live-region announcement is made identifying the match winner or co-winners.
- [ ] The "Start Next Round" button is not accessible or reachable in any way while the match-over overlay is active.

---

## US-3: Return to the Lobby After a Match

**As a** player who has finished a match,
**I want** to return to the lobby from the "Match Over" overlay,
**So that** I can adjust settings and start a new game with different options.

### Acceptance Criteria

- [ ] A clearly labelled "Return to Lobby" button is visible on the "Match Over" overlay.
- [ ] Activating "Return to Lobby" navigates the application to the root route, rendering the Lobby screen.
- [ ] The `GameSession` configuration is not cleared on navigation. The lobby form re-opens pre-filled with the previous session's player names, game mode, and AI difficulty.
- [ ] The "Return to Lobby" button is reachable and operable by keyboard.
- [ ] Navigation occurs on the first activation. Rapid repeated activations do not cause multiple navigations or errors.
- [ ] After navigation, focus reaches the lobby's primary interactive control.

---

## US-4: Play Again with the Same Players

**As a** player who has finished a match,
**I want** to start a fresh match with the same players and settings directly from the "Match Over" overlay,
**So that** I can rematch immediately without re-entering the lobby.

### Acceptance Criteria

- [ ] A clearly labelled "Play Again" button is visible on the "Match Over" overlay.
- [ ] Activating "Play Again" starts a fresh match using the current session configuration: same player names, same game mode, and same AI difficulty.
- [ ] The new match starts at round 1 with all accumulated match scores at 0, a freshly shuffled deck, and a new initial deal.
- [ ] The match-over overlay dismisses immediately when "Play Again" is activated.
- [ ] The game table transitions to the new round 1 board state without navigating away from the game table route.
- [ ] The game table is fully interactive after "Play Again": the board shows the initial deal, hand cards are selectable, and the action bar behaves correctly.
- [ ] "Play Again" works correctly even when the previous game's engine state was non-null, bypassing any initialisation guard.
- [ ] The "Play Again" button is reachable and operable by keyboard.
- [ ] After the overlay dismisses, focus moves to the "Submit play" button on the game table.

---

## US-5: Inspect the Board After a Round Ends

**As a** player,
**I want** the game board to remain visible after a round ends in its final resolved state,
**So that** I can review what happened during the round before deciding to continue.

### Acceptance Criteria

- [ ] After a round ends, the table-card zone, opponent zones, and active hand zone are all still rendered.
- [ ] All player hands are empty (no cards can be selected or played), which the engine ensures naturally.
- [ ] Table cards in their final resolved state remain visible for inspection.
- [ ] The round number, top score, and full per-player score breakdown are shown alongside the "Start Next Round" button.
- [ ] No zones are hidden, collapsed, or artificially disabled during the round-complete state.
- [ ] The board remains in this state until the player activates "Start Next Round" (if no winner) or "View Winner" (if a winner has been declared).

---

## US-6: Understand the Full Round Score Breakdown

**As a** player reviewing a completed round,
**I want** to see exactly how many points each player earned and in which categories,
**So that** I understand the scoring outcome before continuing to the next round.

### Acceptance Criteria

- [ ] For each player, the round result panel shows: the player's name and their points earned in each of the five scoring categories (escobas, most cards, most Oros, most sevens, Siete de Velo).
- [ ] Each player's total round points are shown.
- [ ] If a player earned 0 in a category, that 0 is shown rather than omitting the row.
- [ ] Player names shown in the breakdown match the names configured in the session.
- [ ] The breakdown is visible to all players from the moment the round-complete state begins until the player activates either "Start Next Round" or "View Winner".
- [ ] The breakdown is not shown after either continuation action is activated.
- [ ] When `matchWinner` is non-null, the breakdown for the final round is still shown in full before the match-over overlay appears.
