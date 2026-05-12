# Spec: Single Player Mode — AI Opponent (Laia)

## Overview

This spec defines the behaviour, rules, and constraints for the AI opponent "Laia" in Single Player mode. It covers the three difficulty strategies (Fácil, Intermedio, Difícil), the AI turn animation and orchestration sequence, hand card visibility, interaction locking, accessibility, and the scope boundary between the AI strategy layer and the game engine.

The game engine (GameEngine service) is explicitly out of scope for modification. All AI behaviour is implemented in a separate AI strategy service and wired into the game table orchestration layer.

---

## Functional Requirements

### FR-1: AI Player Registration

**FR-1.1** — In Single Player mode, the session configuration must register two players: the human player (using the name entered in the Lobby) and the AI player with the fixed name "Laia". Both entries must be present in the players array used to initialise the game engine.

**FR-1.2** — The AI player is always assigned the second position in the players array (index 1). The human player is always at index 0.

**FR-1.3** — The AI player identity (which player index is Laia) must be derivable from the session configuration at the game table orchestration layer without hard-coding array positions in the view layer.

---

### FR-2: AI Turn Trigger

**FR-2.1** — When the active player changes and the new active player is Laia, the game table must automatically initiate Laia's turn without any human action.

**FR-2.2** — The AI turn trigger must fire each time Laia becomes the active player — including consecutive turns if the round deals new cards.

**FR-2.3** — The AI turn must not be triggered until the game engine has fully settled into the "awaiting-card-play" phase. If the engine is mid-transition (e.g., processing a round result or dealing cards), the AI turn must wait until that transition completes.

---

### FR-3: AI Decision — Fácil

**FR-3.1** — In Fácil mode, Laia makes no use of any prior play history within the round. Each decision is made solely on the current state of her hand and the current table cards.

**FR-3.2** — Laia evaluates all valid capture combinations available to her (subsets of table cards that sum to 15 together with one of her hand cards). If any of the valid captures would immediately clear the table (an escoba), Laia always selects an escoba-yielding capture. If multiple escoba-yielding captures exist, she selects one at random.

**FR-3.3** — If no escoba is available but one or more other captures exist, Laia selects one at random (uniform random distribution across all non-escoba capture options).

**FR-3.4** — If no valid capture exists, Laia selects a hand card at random (uniform random distribution) and places it on the table.

**FR-3.5** — Fácil mode retains no state between turns. There is nothing to reset at round boundaries.

---

### FR-4: AI Decision — Intermedio

**FR-4.1** — In Intermedio mode, Laia maintains a running record of all Oros-suit cards and all rank-7 cards that have been played (by either player) or captured during the current round.

**FR-4.2** — Using this record, Laia knows at all times which Oros cards and which rank-7 cards remain unaccounted for (i.e., still in the deck, in the human's hand, or in Laia's own hand).

**FR-4.3** — When evaluating possible plays, Laia scores each valid capture option by counting how many high-value cards (Oros-suit cards or rank-7 cards, with the 7 of Oros counting once, not twice) are included in the captured subset.

**FR-4.4** — Before applying the greedy high-value card count, Laia checks whether any valid capture would yield an escoba. If so, that capture is always selected regardless of its high-value card count. If multiple escoba-yielding captures exist, she selects one at random.

**FR-4.5** — If no escoba is available, Laia selects the capture option with the highest high-value card count. If multiple options tie for the highest count, she selects one of the tied options at random.

**FR-4.6** — If no valid capture exists, Laia selects a hand card at random and places it on the table (same as Fácil).

**FR-4.7** — Intermedio memory (the seen high-value cards list) resets at the start of each new round.

---

### FR-5: AI Decision — Difícil

**FR-5.1** — In Difícil mode, Laia maintains a full record of every card played or captured by either player during the current round (all suits and ranks, not just high-value ones).

**FR-5.2** — Laia does not access the human player's actual hand array directly. All reasoning about what cards the human might hold is based solely on logical elimination: the full 40-card deck minus the cards Laia can see (her own hand, the table, and all previously played/captured cards).

**FR-5.3** — For each possible play Laia could make (each hand card paired with each valid capture subset, plus each hand card placed on the table), Laia calculates an expected score contribution. This is derived by weighting each remaining scoring outcome (most Oros, most 7s, most cards, Siete de Oros, escoba) by the probability that each outcome is achievable given the inferred distribution of unseen cards.

**FR-5.4** — Laia selects the play with the highest expected score contribution. If multiple plays tie for the highest expected value, she selects one at random.

**FR-5.5** — If the calculation reveals that a certain play would immediately yield an escoba (clearing the table), that play is always preferred over plays with an equivalent or lower expected score.

**FR-5.6** — Difícil memory (the full played-cards record) resets at the start of each new round.

---

### FR-6: AI Turn Animation Sequence

**FR-6.1** — When Laia's turn begins, her hand zone must enter an "active" visual state, clearly indicating to the human that Laia is about to play.

**FR-6.2** — After a brief initial pause (to signal that Laia is deliberating), the card Laia has chosen to play must be visually highlighted or elevated in her hand zone.

**FR-6.3** — If Laia's play includes a capture, the hand card Laia selected must be flipped face-up (revealing its suit and rank) before the capture resolves, so the human can see which card was played.

**FR-6.4** — After the hand card is revealed face-up, the table cards that will be captured must be visually highlighted before the capture resolves.

**FR-6.5** — After the hand card and capture subset are highlighted, the play resolves — the engine's playCard method is called with Laia's decision.

**FR-6.6** — After the play resolves, the engine's confirmTurn method is called automatically on Laia's behalf. There is no manual confirmation step for the human to perform.

**FR-6.7** — The total duration of Laia's turn animation (from trigger to confirmTurn) must feel natural and legible to the human player — long enough to follow the action, short enough not to feel tedious. A target range is 1.5 to 3 seconds of total visible animation, not counting engine processing time.

---

### FR-7: Human Interaction Locking

**FR-7.1** — For the entire duration of Laia's turn (from the moment the AI turn trigger fires to the moment the engine advances past Laia's turn), the human player must not be able to interact with any game controls: hand card selection, table card selection, submit play button, or confirm turn button.

**FR-7.2** — The interaction lock must be visually communicated — the human's interactive areas should appear disabled or non-interactive while Laia is acting.

**FR-7.3** — The interaction lock must be lifted automatically as soon as the engine transitions to "awaiting-card-play" with the human as the active player.

---

### FR-8: AI Hand Card Visibility

**FR-8.1** — In Single Player mode, all cards in Laia's hand zone must be rendered face-down (showing the card back, not the suit and rank). This applies at all times during the match, including while Laia is selecting a card to play.

**FR-8.2** — The face-down rendering applies to all difficulty levels.

**FR-8.3** — During Laia's turn animation, the selected card is visually distinguished (e.g., elevated or highlighted). If Laia's play is a placement (no capture), the card remains face-down throughout — its identity is not revealed.

**FR-8.4** — If Laia's play is a capture, the selected hand card is flipped face-up as part of the animation (FR-6.3) so the human can see which card Laia played. The card is revealed face-up at the moment the capture animation begins and remains visible as it moves to Laia's capture pile.

---

### FR-9: Accessibility

**FR-9.1** — When Laia plays a card to the table (placement without capture), the accessibility live region must announce the action in a human-readable form (e.g., "Laia placed a card on the table").

**FR-9.2** — When Laia makes a capture, the accessibility live region must announce the card played and the cards captured (e.g., "Laia captured 3 cards from the table").

**FR-9.3** — When Laia scores an escoba, the accessibility live region must announce it (e.g., "¡Escoba! Laia cleared the table").

**FR-9.4** — These announcements must be made with the same timing and via the same mechanism used for human player action announcements.

---

### FR-10: Round Boundary Reset

**FR-10.1** — At the start of each new round, the AI strategy service must discard all accumulated memory for the previous round (seen high-value cards in Intermedio; full played-card record in Difícil).

**FR-10.2** — The reset must occur before Laia takes her first turn in the new round, not after.

---

## Technical Requirements

### TR-1: AI Strategy Service

**TR-1.1** — The AI strategy service must be a self-contained Angular service separate from the game engine. It must not modify game state directly; it only reads state and returns a decision.

**TR-1.2** — The service exposes a single decision method that accepts the current game state, the AI player's hand, and the configured difficulty level, and returns a play decision (the card to play and the optional capture subset).

**TR-1.3** — Each difficulty strategy (Fácil, Intermedio, Difícil) is implemented as a distinct, separately testable unit within the service. The service selects the appropriate strategy based on the difficulty value from GameConfiguration.

**TR-1.4** — The Intermedio and Difícil strategies maintain mutable internal state (the "memory" of played cards) within the service instance. This state is scoped to the current round and must be explicitly reset on round boundaries.

**TR-1.5** — The service must expose a reset method (or equivalent mechanism) callable by the game table orchestration layer when a new round begins.

**TR-1.6** — All randomness within the service (random card selection in Fácil and tie-breaking in Intermedio/Difícil) must use a seam that can be replaced in tests with a deterministic function, to enable reliable unit and end-to-end testing of AI decisions.

---

### TR-2: AI Turn Orchestration

**TR-2.1** — The game table orchestration layer must detect when the active player changes to the AI player using a reactive mechanism (such as an Angular effect reacting to the activePlayer signal).

**TR-2.2** — The orchestration layer must gate the AI turn trigger on the engine being in "awaiting-card-play" phase before invoking the AI strategy service.

**TR-2.3** — The animation sequence (FR-6) must be implemented using a timing mechanism that does not block the Angular change detection cycle. The engine calls (playCard, confirmTurn) must be made after the corresponding animation stages have been presented to the user.

**TR-2.4** — The "is AI turn in progress" state must be tracked separately from the engine's turn phase signal, so that interaction locking (FR-7) can remain in place across the full animation sequence even when the engine phase changes mid-animation.

---

### TR-3: AI Player Identity in Configuration

**TR-3.1** — The GameConfiguration passed to the game engine in Single Player mode must include two entries in the players-related structure: one for the human player and one for Laia. The AI player's name must be "Laia".

**TR-3.2** — The game table orchestration layer must be able to determine which player index corresponds to Laia by comparing player names or by reading a stable identifier from the session configuration, without hard-coding an array index.

---

### TR-4: Face-Down Rendering

**TR-4.1** — The face-down card rendering for Laia's hand must be driven by a flag or input at the hand zone component level. The flag must be set based on whether the current session is in Single Player mode and the hand zone belongs to the AI player.

**TR-4.2** — The existing card component must support a face-down rendering state. If it does not currently, this capability must be added to the card component without altering its default face-up behaviour for all other usages.

---

### TR-5: Difícil Probability Model

**TR-5.1** — The full deck of 40 cards (4 suits × 10 ranks) serves as the reference set. The set of "unseen" cards from Laia's perspective is defined as: full deck minus Laia's current hand, minus all table cards, minus all previously captured cards tracked in memory.

**TR-5.2** — For each possible play, the expected score contribution is computed by evaluating the probability that each of the five scoring categories (most Oros, most rank-7s, most cards, Siete de Oros, escoba) will be won, given the distribution of unseen cards across the human's hand and the remaining deck.

**TR-5.3** — The probability model must not perform exhaustive lookahead beyond the current hand and the inferred unseen card set. It does not simulate future turns. It evaluates only the immediate play in the context of likely round-end outcomes.

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1** — The AI decision calculation for all three difficulty levels must complete in under 100 milliseconds on a modern mid-range device, so as not to add perceptible latency beyond the intended animation delay.

**NFR-1.2** — The Difícil probability calculation must not cause frame drops or UI jank. If the calculation is expensive, it must be executed before the animation begins (during the initial "deliberation pause") so that results are ready before they are needed.

### NFR-2: Correctness

**NFR-2.1** — The AI strategy service must never produce an illegal play (a play that the game engine's playCard method would reject). The service must only propose captures whose sum equals exactly 15.

**NFR-2.2** — The service must always produce exactly one play decision per turn. It must never return a null or empty decision when it is Laia's turn.

### NFR-3: Testability

**NFR-3.1** — The AI strategy service must be unit-testable in isolation, with injectable dependencies for the random seam and the game state input.

**NFR-3.2** — The AI turn orchestration in the game table must be testable via the existing E2E fixture mechanism, allowing tests to control or mock AI decisions to produce deterministic game flows.

### NFR-4: Maintainability

**NFR-4.1** — Adding a fourth difficulty level in the future must require only the addition of a new strategy implementation and a new difficulty value — no changes to the orchestration layer or the game engine.

---

## Out of Scope

- Supporting more than one AI opponent in a single match (multiple Laias). Single Player mode is always exactly 1 human vs 1 AI.
- Configuring or changing the AI's name. "Laia" is fixed.
- Persisting AI memory or game state across page refreshes. All state is in-memory and lost on refresh.
- Multiplayer mode with AI fill-in (replacing a disconnected human with an AI). This is a separate feature.
- An AI tutorial, hint system, or move suggestion for the human player.
- Lookahead beyond the current hand in the Difícil strategy (no multi-turn tree search).
- Localisation of the difficulty labels from English ("Easy"/"Medium"/"Hard") to Spanish ("Fácil"/"Intermedio"/"Difícil") in the stored enum values. This is a separate clean-up task.

---

## Future Considerations

- A named personality system where each difficulty level has a distinct visual avatar or animated reaction to escobas and round results.
- An adaptive difficulty mode that adjusts Laia's strategy based on the human's recent performance.
- A hint mode where Laia can optionally "suggest" a play to the human, powered by the Intermedio or Difícil strategy.
- Supporting 3–4 player games in Single Player mode (human + 2–3 AI opponents), each potentially with individual difficulty settings.
