# User Stories: Single Player Mode — AI Opponent (Laia)

---

## US-1: Start a Single Player Match

**As a** player,
**I want** to select Single Player mode in the Lobby, choose a difficulty level, and start a match against Laia,
**so that** I can play a complete game of Escoba de 15 without needing a second human player.

### Acceptance Criteria

- [ ] When the player selects "Un Jugador" in the Lobby, a difficulty dropdown (Fácil / Intermedio / Difícil) is visible and selectable.
- [ ] The player's own name field is present and required; submitting without a name shows a validation error.
- [ ] The AI opponent is identified as "Laia" in the Lobby — this name is displayed but not editable.
- [ ] Pressing "Jugar" with a valid name and a selected difficulty navigates to the game table.
- [ ] On the game table, two players are present: the human at position 1 (bottom zone) and Laia at position 2 (opponent zone).
- [ ] The selected difficulty is accessible to the game table at runtime.
- [ ] If the player navigates directly to the game route without completing Lobby setup, they are redirected to the Lobby.

---

## US-2: Laia Plays Automatically on Her Turn

**As a** player,
**I want** Laia to take her turn automatically without any action from me,
**so that** I can focus on my own strategy rather than manually advancing the AI's moves.

### Acceptance Criteria

- [ ] When the game engine designates Laia as the active player, her turn begins automatically with no human click required.
- [ ] Laia's turn triggers every time she becomes active — including after a new hand of cards is dealt mid-round.
- [ ] Laia always produces a valid play (a card from her hand; optionally paired with a capture subset summing to 15).
- [ ] The engine accepts Laia's play without error — her moves always satisfy the engine's validation rules.
- [ ] After Laia's turn completes, the engine transitions to the human's turn automatically.
- [ ] The human is never left waiting on an AI turn indefinitely — the turn always resolves within the expected animation window.

---

## US-3: Laia's Turn Is Animated Step by Step

**As a** player,
**I want** to visually follow what Laia is doing on her turn,
**so that** I can understand her play and maintain engagement with the game.

### Acceptance Criteria

- [ ] When Laia's turn begins, her hand zone enters a visually active state indicating she is about to play.
- [ ] After a brief deliberation pause, one card in Laia's hand zone is visually distinguished (highlighted or elevated).
- [ ] If Laia's play is a capture, the table cards she will capture are visually highlighted after her hand card is highlighted.
- [ ] The play resolves (cards move to capture pile or table updates) only after both the hand card and the capture subset are highlighted.
- [ ] Laia's turn confirmation is automatic — no "Confirm Turn" button press from the human is needed.
- [ ] The total animated duration of Laia's turn (from trigger to resolution) is between 1.5 and 3 seconds of visible animation.
- [ ] If Laia's play is a capture, the hand card she selected is flipped face-up during the animation so the human can see which card was played before the capture resolves.
- [ ] If Laia places a card on the table (no capture), the animation still shows the hand card being selected before placement.

---

## US-4: Human Interaction Is Blocked During Laia's Turn

**As a** player,
**I want** the game controls to be disabled while Laia is taking her turn,
**so that** I cannot accidentally submit a play out of turn.

### Acceptance Criteria

- [ ] During the entire duration of Laia's animated turn, the human's hand cards are not selectable.
- [ ] The table cards are not selectable by the human during Laia's turn.
- [ ] The "Submit Play" and "Confirm Turn" buttons are visually disabled and non-interactive during Laia's turn.
- [ ] The disabled state of all interactive elements is lifted as soon as the engine enters "awaiting-card-play" with the human as the active player.
- [ ] Attempting to interact with disabled controls during Laia's turn produces no side effects on the game state.

---

## US-5: Laia's Cards Are Always Face-Down

**As a** player,
**I want** Laia's hand cards to be shown face-down at all times,
**so that** I cannot see which cards she holds and the game is fair.

### Acceptance Criteria

- [ ] All cards in Laia's hand zone are rendered face-down (card back visible, suit and rank not revealed) throughout the entire match.
- [ ] Laia's cards remain face-down at all difficulty levels (Fácil, Intermedio, Difícil).
- [ ] During Laia's turn animation, the card she selects is visually distinguished (e.g., elevated). If the play is a capture, the card is flipped face-up during the animation; if the play is a placement, the card remains face-down.
- [ ] The face-down rendering applies after new cards are dealt to Laia's hand at the start of each sub-hand.
- [ ] The human player's own hand cards are not affected — they continue to render face-up as normal.
- [ ] Face-down rendering only applies in Single Player mode; in Multiplayer mode the existing rendering behaviour is unchanged.

---

## US-6: Fácil Mode — Laia Plays Randomly

**As a** casual player who wants a relaxed game,
**I want** Laia in Fácil mode to play without any memory or strategy,
**so that** she is easy to beat and the game is not stressful.

### Acceptance Criteria

- [ ] In Fácil mode, Laia evaluates only the current table and her current hand — she does not track any previously played cards.
- [ ] When valid captures are available, if any of them would result in an escoba, Laia always takes the escoba — she never passes up an escoba for a random play.
- [ ] When valid captures are available and none result in an escoba, Laia selects one at random (no preference for high-value cards).
- [ ] When no valid capture is available, Laia places a randomly chosen card from her hand on the table.
- [ ] Laia's choices in Fácil mode are not influenced by which cards have been captured in previous turns of the same round.
- [ ] Each turn in Fácil mode is decided independently of all prior turns in the round.

---

## US-7: Intermedio Mode — Laia Targets High-Value Cards

**As a** player who wants a moderate challenge,
**I want** Laia in Intermedio mode to prioritise capturing Oros and rank-7 cards,
**so that** she plays smarter than random but is not unbeatable.

### Acceptance Criteria

- [ ] In Intermedio mode, Laia maintains a running list of all Oros-suit cards and all rank-7 cards that have been played or captured during the current round.
- [ ] If any valid capture results in an escoba, Laia always takes that capture — it takes priority over the greedy high-value card count selection.
- [ ] When multiple capture options exist and none result in an escoba, Laia selects the capture that includes the greatest number of high-value cards (Oros cards or rank-7 cards, counted once per card).
- [ ] When two or more captures tie for the highest high-value card count, Laia selects one of the tied options at random.
- [ ] When no valid capture is available, Laia places a randomly chosen card on the table (same as Fácil).
- [ ] At the start of each new round, Laia's seen-cards memory is cleared and she begins fresh.
- [ ] Laia's memory in Intermedio mode is based only on cards that have been played face-up or captured — she does not infer or guess about cards still unseen.

---

## US-8: Difícil Mode — Laia Plays Probability-Weighted

**As a** competitive player who wants a serious challenge,
**I want** Laia in Difícil mode to make informed, probability-weighted decisions,
**so that** beating her requires genuine skill and strategy.

### Acceptance Criteria

- [ ] In Difícil mode, Laia maintains a full record of every card played or captured by either player during the current round.
- [ ] Laia uses elimination logic: the full 40-card deck minus known cards (her hand, table, all played/captured cards) yields the set of unseen cards.
- [ ] Laia does not directly access the human player's hand array — her reasoning is based solely on logical deduction from the known card history.
- [ ] For each possible play, Laia calculates an expected score contribution based on the probability distribution of unseen cards across the remaining deck and the human's inferred hand.
- [ ] If a play yields an immediate escoba, it is always preferred over other plays with an equivalent or lower expected value.
- [ ] At the start of each new round, Laia's full played-card record is cleared.
- [ ] The decision calculation completes within 100 milliseconds and does not cause visible UI lag or frame drops.

---

## US-9: AI Memory Resets Each Round

**As a** player,
**I want** Laia's memory to reset at the start of each new round,
**so that** the difficulty progression is consistent across rounds and she does not carry over stale information.

### Acceptance Criteria

- [ ] In Intermedio mode, the seen high-value cards list is empty at the first turn of every new round.
- [ ] In Difícil mode, the full played-card record is empty at the first turn of every new round.
- [ ] The reset occurs before Laia makes her first decision in the new round, not after.
- [ ] If Laia happens to take the first turn of a round (due to turn order), her decision for that first turn is made with a fresh, empty memory.
- [ ] The reset is invisible to the human player — there is no UI indication that memory was cleared.

---

## US-10: Accessibility — Laia's Actions Are Announced

**As a** player who uses a screen reader,
**I want** Laia's actions to be announced via the accessibility live region,
**so that** I can follow the game without relying on visual feedback.

### Acceptance Criteria

- [ ] When Laia places a card on the table (no capture), the live region announces a human-readable description of the action (e.g., "Laia colocó una carta en la mesa").
- [ ] When Laia makes a capture, the live region announces the capture (e.g., "Laia capturó 3 cartas de la mesa").
- [ ] When Laia scores an escoba, the live region announces it (e.g., "¡Escoba! Laia limpió la mesa").
- [ ] Announcements for Laia's actions use the same live region mechanism as announcements for human player actions.
- [ ] Announcements fire after the animation resolves and the game state has updated — not before.
- [ ] In Fácil mode, the specific card played by Laia is not announced (her hand is secret). In Intermedio and Difícil mode the same rule applies — card identity is never revealed via accessibility text until it lands on the table or in a capture pile.

---

## US-11: Match Continues Normally Through Rounds

**As a** player,
**I want** the match against Laia to progress through multiple rounds, scoring, and a final winner declaration exactly as in a multiplayer game,
**so that** Single Player mode is a complete, full-length Escoba match.

### Acceptance Criteria

- [ ] Scoring at the end of each round (most cards, most Oros, most 7s, Siete de Oros, escobas) applies equally to both the human and Laia.
- [ ] The round results overlay displays both the human's and Laia's scores for the completed round.
- [ ] The match score accumulates across rounds for both players.
- [ ] When either the human or Laia reaches or exceeds 15 accumulated points, the match-over overlay appears and declares the winner by name.
- [ ] If Laia wins the match, the overlay displays "Laia" as the winner.
- [ ] The human can start a new match from the match-over overlay, which returns them to the Lobby.
- [ ] The handoff overlay (used in Multiplayer to pass the device between players) is not shown at any point during a Single Player match.
