# User Stories: Game Engine Core

---

## US-1: Start a New Game from Lobby Configuration

**As a** player who has completed the Lobby setup,  
**I want** the game engine to initialise a full game state from my chosen configuration,  
**so that** a properly set-up match is ready to play as soon as I press Play.

### Acceptance Criteria

- [ ] When `initGame` is called with a valid `GameConfiguration`, the engine produces a `GameState` with a shuffled 40-card deck.
- [ ] The table starts with exactly 4 cards drawn from the deck.
- [ ] Each player starts with exactly 3 cards in their hand, drawn from the deck after the 4 table cards.
- [ ] All players start with empty captured piles and zero escobas.
- [ ] All players start with a match score of zero.
- [ ] The active turn is set to the first player.
- [ ] The game state is exposed as a read-only Angular Signal so that consumers immediately see the initialised state.
- [ ] Calling `initGame` a second time resets the entire match state — no remnants from a previous match persist.

---

## US-2: View the Correct Card Values

**As a** player (or developer writing game logic),  
**I want** every card to carry its correct numeric value,  
**so that** capture sums are calculated correctly according to La Escoba de 15 rules.

### Acceptance Criteria

- [ ] Cards with rank 1 through 7 carry a numeric value equal to their rank.
- [ ] Sota cards carry a numeric value of 8.
- [ ] Caballo cards carry a numeric value of 9.
- [ ] Rey cards carry a numeric value of 10.
- [ ] The total sum of all 40 card values in a complete deck equals 220 (the expected sum for a standard 40-card Spanish deck with Sota=8, Caballo=9, Rey=10).
- [ ] Each of the four suits contains exactly one card of each rank.
- [ ] A card's suit, rank, and value never change once the card is created.

---

## US-3: Play a Card and Capture Table Cards

**As a** player on my turn,  
**I want** to play a card from my hand and capture matching table cards that sum to 15 with my played card,  
**so that** those cards are added to my captured pile and removed from the table.

### Acceptance Criteria

- [ ] When the active player plays a card and specifies a capture subset, the engine validates that the played card's value plus the sum of the subset equals exactly 15.
- [ ] If the capture is valid, the played card is removed from the player's hand, the subset cards are removed from the table, and all those cards are added to the player's captured pile.
- [ ] The engine never automatically selects which table cards to capture; the player must always provide the capture subset explicitly.
- [ ] If a player plays a card without specifying any capture subset (empty subset), the card is placed on the table even if valid captures exist — the missed capture opportunity is not recoverable.
- [ ] After `playCard` is called, the turn does NOT advance immediately; the engine enters the _awaiting confirmation_ sub-state.
- [ ] All relevant Signals are updated to reflect the new state after the capture.
- [ ] If the capture subset sum plus the played card does not equal 15, the engine rejects the action, the game state is unchanged, and an informational warning is logged.
- [ ] A player cannot play a card that is not in their current hand; such an action is rejected without altering state.
- [ ] It is not the player's turn; attempting to play results in rejection without altering state.

---

## US-4: Score an Escoba by Clearing the Table

**As a** player,  
**I want** the engine to recognise when my capture clears all cards from the table,  
**so that** I am awarded an escoba point at end of round.

### Acceptance Criteria

- [ ] When a valid capture results in the table being completely empty, the engine records one escoba for the active player.
- [ ] The player's escoba count for the round is incremented by 1.
- [ ] The table is empty after the escoba capture — no cards remain.
- [ ] Multiple escobas in the same round are each recorded independently (count accumulates).
- [ ] Awarding the remaining table cards at end-of-round (FR-7.2) does NOT trigger an escoba.
- [ ] An escoba Signal update (or computed state change) is detectable by a consumer after the play.

---

## US-5: Place a Card on the Table Without Capturing

**As a** player who cannot or chooses not to capture,  
**I want** to place a card from my hand onto the table,  
**so that** the card is available for future captures by myself or other players.

### Acceptance Criteria

- [ ] When the active player calls `playCard` with an empty capture subset, the card is removed from the player's hand and added to the table.
- [ ] No cards are added to any player's captured pile.
- [ ] No escoba is recorded.
- [ ] After `playCard` is called, the turn does NOT advance immediately; the engine enters the _awaiting confirmation_ sub-state.
- [ ] A player may place a card on the table even if a valid capture exists. Once the card is placed with an empty capture subset, the play is final — the capture opportunity is lost for that turn and no retroactive correction is possible.

---

## US-6: Deal the Next Batch of Cards When All Hands Are Empty

**As a** player,  
**I want** the engine to automatically deal a new batch of cards to all players when everyone's hand is empty but the deck still has cards,  
**so that** the game continues without manual intervention.

### Acceptance Criteria

- [ ] After the last card in any player's hand is played and all hands become empty, the engine checks whether the deck has remaining cards.
- [ ] If the deck is not empty, the engine deals exactly 3 cards per player in turn order from the top of the remaining deck.
- [ ] No new table cards are added between hands.
- [ ] If the deck has fewer cards than 3 × (number of players), the remaining cards are distributed starting from the first player in turn order; some players may receive fewer than 3 cards.
- [ ] The state Signal is updated to reflect the new hands and reduced deck.
- [ ] If the deck is empty after all hands become empty, no further dealing occurs and end-of-round resolution begins.

---

## US-7: Resolve Remaining Table Cards at End of Round

**As a** player,  
**I want** the engine to award remaining table cards to the last player who captured cards,  
**so that** no cards are left unaccounted for when calculating round scores.

### Acceptance Criteria

- [ ] When the round ends (deck empty, all hands empty), all cards still on the table are added to the captured pile of the last player who successfully made a capture during the round.
- [ ] This transfer does not record an escoba for that player.
- [ ] If no player made a capture during the entire round, the remaining table cards are awarded to the last player in turn order.
- [ ] After this step, the table is empty and all 40 cards are distributed among players' captured piles.
- [ ] The `RoundResult` is computed and made available via Signal after this step.

---

## US-8: Calculate Round Scores Correctly

**As a** player,  
**I want** the engine to correctly calculate and add round scores to my match total at the end of each round,  
**so that** my progress toward winning the match is accurate.

### Acceptance Criteria

- [ ] The engine produces a `RoundResult` at round end showing each player's points per scoring category.
- [ ] Each escoba earned by a player during the round adds 1 point to their round score.
- [ ] The player with the most captured cards (strictly more than all others) receives 1 point; if that player has all 40 cards, they receive 2 points instead.
- [ ] The player with the most Oros captured (strictly more than all others) receives 1 point; if that player has all 10 Oros, they receive 2 points instead.
- [ ] The player with the most sevens captured (strictly more than all others) receives 1 point; if that player has all 4 sevens, they receive 2 points instead.
- [ ] The player who captured the 7 of Oros receives 1 additional point, independent of the Most Oros and Most Sevens categories.
- [ ] When two or more players tie on any of the most-cards, most-oros, or most-sevens categories, no one receives that category's point.
- [ ] Round points are added to each player's accumulated match score.
- [ ] A `RoundResult` Signal (or equivalent) is updated so that the UI can display a round summary.

---

## US-9: Detect and Declare a Match Winner

**As a** player,  
**I want** the engine to detect when someone has won the match,  
**so that** the game ends at the right time and the correct winner is shown.

### Acceptance Criteria

- [ ] After each round's scores are applied, the engine checks whether any player has reached 15 or more accumulated match points.
- [ ] If exactly one player has 15 or more points, that player is set as the match winner and the match-winner Signal is updated from null to that player's identity.
- [ ] If multiple players simultaneously reach or exceed 15 points, the player with the highest score is declared winner.
- [ ] If multiple players simultaneously reach 15 or more points and share the same highest score, no winner is declared and a new round begins.
- [ ] Once a winner is declared, no further rounds can be started via `startNextRound`.
- [ ] The match-winner Signal is null during an ongoing match and non-null only after a winner is determined.

---

## US-10: Start a New Round After Round Resolution

**As a** player,  
**I want** the engine to start a fresh round once I acknowledge the round summary,  
**so that** the match continues until someone wins.

### Acceptance Criteria

- [ ] `startNextRound` can only be called when the current round has ended and no match winner has been declared.
- [ ] Calling `startNextRound` creates a new shuffled deck, clears all players' hands, resets all captured piles to empty, resets all escoba counts to zero, deals 4 table cards, and deals 3 cards per player.
- [ ] The round number is incremented by 1.
- [ ] The dealer (first player in new turn order) rotates by one position from the previous round.
- [ ] Accumulated match scores are preserved and not reset.
- [ ] All relevant Signals are updated to reflect the new round state.
- [ ] If `startNextRound` is called when a match winner already exists, the call is rejected without altering state.

---

## US-11: Observe Game State Changes Reactively

**As a** developer building the game board UI,  
**I want** all relevant game state to be exposed as Angular Signals,  
**so that** my UI components can reactively update without polling or manual subscriptions.

### Acceptance Criteria

- [ ] The full `GameState` is available as a read-only Signal.
- [ ] The currently active player is available as a computed Signal derived from the game state.
- [ ] The current turn phase (_awaiting card play_ or _awaiting confirmation_) is available as a Signal.
- [ ] The current `RoundResult` (null between rounds) is available as a Signal.
- [ ] The match winner (null during ongoing match) is available as a Signal.
- [ ] Every call to `playCard`, `confirmTurn`, `initGame`, or `startNextRound` that changes state produces a new Signal value that consumers can detect.
- [ ] Consumers cannot directly mutate any Signal value; all Signals are read-only from the outside.

---

## US-12: Confirm Turn Is Complete

**As a** player who has just played a card,  
**I want** to explicitly confirm I am done with my turn before the next player can act,  
**so that** I have time to review the result of my play and there is no ambiguous hand-off between players.

### Acceptance Criteria

- [ ] After a card is played (capture or placement), the turn does not automatically advance to the next player.
- [ ] The engine enters the _awaiting confirmation_ sub-state immediately after `playCard` is called.
- [ ] The active player must call `confirmTurn` to signal that their turn is complete.
- [ ] Only after `confirmTurn` is called does the engine advance the turn to the next player and the next player's actions become available.
- [ ] If `confirmTurn` has not been called, no other player can play a card; such an action is rejected without altering state.
- [ ] Calling `confirmTurn` when the engine is NOT in the _awaiting confirmation_ sub-state is rejected without altering state.
- [ ] The engine exposes the current turn phase via a Signal so that the UI can observe when confirmation is needed.
- [ ] The specific UI control for triggering confirmation (button, gesture, etc.) is out of scope for this engine epic and is planned as a follow-up feature.
