# Spec: Game Engine Core

## Overview

The Game Engine Core defines all data models and business rules required to play a complete match of La Escoba de 15. It is a purely logical layer — no UI, no rendering, no animations — that exposes game state via Angular Signals and a single action entry point (`playCard`). All subsequent features (game board UI, AI opponent, local multiplayer) depend on this layer.

---

## Functional Requirements

### FR-1: Deck & Card Representation

**FR-1.1** — The engine must model a Spanish 40-card deck. The deck consists of four suits — Oros, Copas, Espadas, and Bastos — each containing ten cards with ranks 1, 2, 3, 4, 5, 6, 7, Sota, Caballo, and Rey.

**FR-1.2** — Each card must carry its suit, its rank, and its numeric point value. Numbered cards (1 through 7) have a value equal to their rank number. Sota has a value of 8, Caballo has a value of 9, and Rey has a value of 10.

**FR-1.3** — The engine must be able to generate a complete, freshly ordered 40-card deck at any time.

**FR-1.4** — The engine must be able to shuffle a deck, producing a randomised order. The shuffle algorithm must treat every possible permutation as equally likely (Fisher-Yates or equivalent).

**FR-1.5** — A card is an immutable value. Once created, its suit, rank, and numeric value never change.

---

### FR-2: Game Initialisation

**FR-2.1** — Given a valid `GameConfiguration`, the engine must create a new game state. The game state includes: a shuffled deck, an empty table, a list of player entities (one per name in the configuration), all player scores set to zero, and the turn index set to the first player.

**FR-2.2** — On game initialisation, 4 cards are drawn from the top of the shuffled deck and placed face-up on the table as the initial table cards.

**FR-2.3** — After the initial 4 table cards are dealt, 3 cards are dealt to each player in order, drawn from the remaining deck.

**FR-2.4** — If the initial 4 table cards happen to sum to exactly 15 by themselves, or if any single table card has a value of 15 (not possible with this deck), the engine does not award an automatic escoba. Initial deal special cases do not trigger scoring.

**FR-2.5** — The game state must be exposed via read-only Angular Signals so that consumers (UI, AI agent) can react to changes without polling.

---

### FR-3: Player Entity

**FR-3.1** — Each player entity must hold: a unique identifier, the display name from the configuration, the player's current hand (cards dealt but not yet played), the player's captured cards pile (all cards won in captures during the current round), and the count of escobas made in the current round.

**FR-3.2** — A player's hand and captured pile are always specific to the current round. At the start of a new round, hands and captured piles are reset; the escoba count is also reset.

**FR-3.3** — A player's accumulated match score persists across rounds and is not reset between rounds.

---

### FR-4: Turn Management

**FR-4.1** — The engine must track which player's turn it currently is. Only the active player is allowed to play a card.

**FR-4.2** — After a player plays a card (whether it results in a capture or a table placement), the turn advances to the next player in order after confirmation.

**FR-4.3** — Turn order is circular: after the last player, it returns to the first player.

**FR-4.4** — The engine must expose the current active player identity via a Signal so that the game board UI can display the correct player's perspective.

---

### FR-5: Playing a Card

**FR-5.1** — The active player may play any card from their hand on their turn.

**FR-5.2** — When playing a card, the player must explicitly specify the subset of table cards they wish to capture. If no subset is specified (or an empty subset is provided), the play is always treated as a table placement — the engine never infers or automatically selects a capture subset on the player's behalf. This applies even if a valid capture exists on the table. A capture is valid if and only if the numeric value of the played card plus the sum of all specified table cards equals exactly 15.

**FR-5.3** — If the player specifies a valid capture subset, the engine removes the played card from the player's hand, removes all captured table cards from the table, and adds all those cards (the played card and the captured table cards) to the player's captured pile.

**FR-5.4** — If the capture results in the table being completely empty (all table cards were captured), the engine records an escoba for the active player and increments their escoba count for the round.

**FR-5.5** — If the player specifies no capture subset (or an empty subset), the engine removes the played card from the player's hand and adds it to the table. This is called a table placement.

**FR-5.6** — The engine must reject an invalid action: playing a card not in the player's hand, or specifying a capture subset whose sum (plus the played card) does not equal exactly 15, or attempting to play when it is not the player's turn. A rejected action must not alter the game state.

**FR-5.7** — The engine does not enforce a "must capture if possible" rule. A player may always choose to place a card on the table even if a valid capture exists. If a player plays a card without specifying a capture subset, and a valid capture was available, the card is placed on the table and the opportunity to capture is permanently lost for that turn — no points or captured cards are awarded retroactively.

**FR-5.8** — After a card is played (whether resulting in a capture or a table placement), the turn does not automatically advance to the next player. The engine enters a _awaiting confirmation_ sub-state for the current turn. The active player must explicitly confirm their turn is complete by calling `confirmTurn`. Only then does the engine advance the turn to the next player. Until confirmation is given, no other player may act. The UI mechanism that triggers this confirmation (e.g., a "Listo" button) is defined as a follow-up feature; the engine must nonetheless model and expose the two turn sub-states — _awaiting card play_ and _awaiting confirmation_ — via a Signal.

---

### FR-6: End of Hand — Dealing the Next Batch

**FR-6.1** — A hand ends when all players' hands are simultaneously empty.

**FR-6.2** — If the deck still contains cards when a hand ends, the engine must automatically deal 3 cards per player from the top of the remaining deck, in turn order. No new table cards are added between hands.

**FR-6.3** — If the deck has fewer than 3 × (number of players) cards remaining, the engine distributes the remaining cards as evenly as possible, giving priority to players earlier in turn order.

---

### FR-7: End of Round — Resolving Remaining Table Cards

**FR-7.1** — A round ends when the deck is exhausted and all players' hands are empty.

**FR-7.2** — When the round ends, all cards still on the table are awarded to the last player who successfully made a capture during that round.

**FR-7.3** — Awarding remaining table cards at round end does NOT count as an escoba, regardless of how many cards are on the table.

---

### FR-8: Round Scoring

**FR-8.1** — At the end of each round, the engine computes each player's points earned in that round and adds them to their accumulated match score.

**FR-8.2** — Scoring categories and point values are as follows:

- **Escobas:** Each escoba recorded for a player during the round awards 1 point. There is no tie condition for escobas; each player independently accumulates their own count.
- **Most Cards Captured:** The player who captured the most cards across the round earns 1 point. If the player captured all 40 cards, they earn 2 points instead of 1. If two or more players tie for the most cards (and no player has all 40), no one receives this point.
- **Most Oros Captured:** The player who captured the most cards of the Oros suit earns 1 point. If the player captured all 10 Oros cards, they earn 2 points instead of 1. On a tie, no one receives this point.
- **Most Sevens Captured:** The player who captured the most cards with rank 7 earns 1 point. If the player captured all 4 sevens (one per suit), they earn 2 points instead of 1. On a tie, no one receives this point.
- **Siete de Velo:** The player who captured the 7 of Oros earns 1 additional point. This is awarded independently of the Most Oros and Most Sevens categories.

**FR-8.3** — A player's round score is the sum of points earned across all applicable categories in that round. Round points are added directly to the player's accumulated match score.

**FR-8.4** — The engine must produce a detailed round result record that shows, for each player, the breakdown of points earned per category in that round.

---

### FR-9: Win Condition

**FR-9.1** — After round scores are applied, the engine checks whether any player has reached or exceeded 15 accumulated match points.

**FR-9.2** — If exactly one player has 15 or more points, that player is declared the match winner and the game ends.

**FR-9.3** — If multiple players simultaneously reach or exceed 15 points in the same round, the player with the highest accumulated score is the winner.

**FR-9.4** — If multiple players simultaneously reach or exceed 15 points and share the highest score (a perfect tie at match level), a new round is played. This continues until one player leads after a round.

**FR-9.5** — The engine must expose a Signal indicating the match winner (null if the match is ongoing) so that the UI can react to the end-of-game condition.

---

### FR-10: New Round Initialisation

**FR-10.1** — If the match is not over after a round, the engine must be able to start a new round. A new round creates a freshly shuffled deck, clears all players' hands, resets all players' captured piles to empty, resets all players' escoba counts to zero, and deals the initial 4 table cards and 3 cards per player as in FR-2.2 and FR-2.3.

**FR-10.2** — The dealer (first player in turn order) may rotate each round. The rotation order follows standard Escoba convention: the role advances by one player clockwise after each round.

**FR-10.3** — Accumulated match scores are NOT reset between rounds.

---

## Technical Requirements

### TR-1: Data Models

**TR-1.1** — All data models are defined as TypeScript interfaces located in the shared models folder (`src/app/models/`), alongside the existing `GameConfiguration` interface.

**TR-1.2** — A `Card` interface must carry at minimum: a suit field (a string union of the four suit names), a rank field (a string union of the ten rank names), and a numeric value field.

**TR-1.3** — A `Player` interface must carry: a unique string identifier, a display name string, an array of cards representing the current hand, an array of cards representing the captured pile, and a numeric escoba count for the current round.

**TR-1.4** — A `GameState` interface must carry: the remaining deck as an array of cards, the current table as an array of cards, the array of player entities, the current turn index as a number, the current round number, an accumulated match score map (keyed by player identifier), and the identifier of the last player who made a capture (nullable).

**TR-1.5** — A `RoundResult` interface must carry: the round number, and a per-player breakdown of points earned across each scoring category (escobas, most-cards, most-oros, most-sevens, siete-de-velo).

**TR-1.6** — No model may contain methods or business logic. Models are pure data shapes.

---

### TR-2: Deck Utilities

**TR-2.1** — Deck creation and shuffle functions are implemented as pure utility functions, not as Angular services. They have no side effects and take no injectable dependencies.

**TR-2.2** — The deck creation function returns a new array of 40 `Card` objects every time it is called. It is deterministic — same suits and ranks, same initial order.

**TR-2.3** — The shuffle function takes an array of cards and returns a new shuffled array without mutating the input.

**TR-2.4** — Deck utility functions are placed in a dedicated utilities folder within the core folder (`src/app/core/utils/` or similar) so they can be independently unit-tested.

---

### TR-3: Scoring Utilities

**TR-3.1** — Round scoring is implemented as a pure function (or set of functions) with no Angular dependencies. It takes a completed round state (all players' captured piles, escoba counts, and the last capturer identity) and returns a `RoundResult`.

**TR-3.2** — The scoring function must be independently unit-testable in isolation, without needing to construct a full `GameState`.

**TR-3.3** — Scoring utilities are placed alongside deck utilities in the core utilities folder.

---

### TR-4: Game Engine Service

**TR-4.1** — The game engine is implemented as a single Angular injectable service provided at the root injector level (`providedIn: 'root'`).

**TR-4.2** — The service uses Angular Signals exclusively for reactive state. RxJS observables must not be used for state management within this service.

**TR-4.3** — The service exposes the following read-only Signals to consumers:

- Current game state (the full `GameState` snapshot)
- Current active player entity
- Current turn phase (awaiting card play, or awaiting confirmation)
- Current round result (null until a round completes)
- Match winner (null until the match ends)

**TR-4.4** — The service exposes the following public methods:

- `initGame(config: GameConfiguration): void` — initialises a new match from the provided configuration.
- `playCard(card: Card, captureSubset: Card[]): void` — executes a card play for the currently active player. After this call the engine enters the _awaiting confirmation_ sub-state.
- `confirmTurn(): void` — called by the active player after reviewing their play to advance the turn to the next player.
- `startNextRound(): void` — advances to the next round after the current round result has been acknowledged.

**TR-4.5** — All state transitions inside the service must produce new object references (immutable updates). The service must never mutate an existing state object in place.

**TR-4.6** — The `playCard` method must validate the action before applying it. If the action is invalid (wrong player, card not in hand, illegal capture subset), the method must not alter any Signal and should log a descriptive warning (no exception throwing required for this release).

**TR-4.7** — The service must not contain any UI logic, DOM interaction, or routing calls. It is a pure state manager.

---

### TR-5: Integration with Existing Services

**TR-5.1** — The existing `GameSession` service retains its role as the holder of `GameConfiguration`. The game engine service reads from `GameSession` (or accepts the configuration as a direct parameter) to initialise a match.

**TR-5.2** — The `GameSession` service is not modified structurally by this feature. If passing configuration directly to `initGame` is cleaner, the `GameSession` service remains unchanged.

---

## Non-Functional Requirements

### NFR-1: Correctness

**NFR-1.1** — The game engine must implement all rules of La Escoba de 15 as specified in this document. Incorrect capture validation, incorrect scoring, or incorrect win detection constitute critical defects.

**NFR-1.2** — All pure utility functions (deck creation, shuffle, scoring) must be covered by unit tests. The game engine service's state transitions must be covered by unit tests using Vitest.

---

### NFR-2: Immutability & Predictability

**NFR-2.1** — State produced by the engine must be immutable snapshots. No consumer should be able to mutate state externally and cause side effects in the engine.

---

### NFR-3: Extensibility

**NFR-3.1** — The scoring function must be structured so that new scoring categories (e.g., Setenta) can be added by appending a new category handler without modifying existing category handlers.

**NFR-3.2** — The `playCard` entry point must not be coupled to a specific caller type. Any agent — human UI interaction, AI service, or test harness — must be able to invoke it with equal ease.

---

### NFR-4: Performance

**NFR-4.1** — All game engine operations (initialise, play card, score round) must complete synchronously and within a negligible time budget (well under 16 ms) given the small data size of a 40-card deck and at most 4 players.

---

## Out of Scope

- AI opponent decision-making logic.
- Pass-and-play player switching and device-handoff UI.
- Game board visual components, card animations, and sound effects.
- Persistence of game state across browser sessions (local storage, backend, etc.).
- Network/online multiplayer.
- The Setenta scoring category.
- Any rule variant other than the standard La Escoba de 15 rules defined in this document.

---

## Future Considerations

- The Setenta scoring category can be added by extending the round scoring utility with an additional pure function, without changing the engine service interface.
- The AI opponent feature will implement an agent that calls `playCard` with computed card and capture choices, slotting directly into the existing engine interface.
- Pass-and-play player switching will be handled in a dedicated UI feature that gates the display of state based on the active player Signal exposed by this engine.
- Persisted game state could be added by serialising and deserialising the `GameState` interface to/from local storage or a backend, without changing the engine's internal logic.
