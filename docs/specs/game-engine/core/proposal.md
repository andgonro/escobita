# Title: Proposal — Game Engine Core

## Summary

The Game Engine Core is the foundational logic layer of "La Escoba". It defines all data models and business rules for cards, the deck, players, turns, captures, scoring, and win conditions — providing a complete, UI-independent engine that every future feature (game board UI, AI opponent, local multiplayer) will consume.

---

## Context

### Motivation

The Lobby feature is complete and produces a validated `GameConfiguration` object. However, the application has no engine to act on that configuration. There are no card models, no deck, no player entities, no turn management, and no scoring rules. Without these foundations, no playable game session can exist. The Game Engine Core establishes every rule and state structure the game depends on.

### Current Limitation

The `GameSession` service holds the `GameConfiguration` in memory, but it is only a passive data holder. There is no service or model that can interpret the configuration and start a real game. The game board placeholder component has nothing to render or interact with.

### Stakeholders

- **Players:** Need a correctly behaving game that follows the standard rules of La Escoba de 15.
- **Developers (AI epic):** Need a well-defined engine interface with a clear "play card" entry point so the AI can slot in without changes to the core rules.
- **Developers (UI epic):** Need observable game state (via Angular Signals) so the game board can reactively render the current situation without polling.
- **Developers (local multiplayer epic):** Need a turn-management model that exposes who the active player is and supports player switching.

### User Experience Impact

This feature is entirely back-end logic. Players will not see it directly, but every aspect of gameplay quality — correct captures, accurate scoring, fair win detection — depends entirely on the correctness of this engine. Bugs here propagate to every screen and every game mode.

---

## High-Level Approach

- All data models (card, deck, player, game state) are defined as TypeScript interfaces and value objects in the shared models folder, following the conventions established by the `GameConfiguration` model.
- A Spanish 40-card deck is created programmatically from the four suits (Oros, Copas, Espadas, Bastos) and the ten ranks (1 through 7, Sota, Caballo, Rey). Each card carries its suit, rank, and numeric value. Sota is worth 8, Caballo is worth 9, and Rey is worth 10.
- A deck service (or utility) is responsible for creating, shuffling, and dealing cards. Shuffling uses a Fisher-Yates randomisation approach. Dealing allocates 4 cards face-up to the table at round start and 3 cards per player per deal batch.
- A game engine service is the central orchestrator. It accepts a `GameConfiguration`, initialises the full game state (players, deck, table, scores, turn pointer), and exposes that state via Angular Signals so that consumers can react to changes.
- The engine service exposes a single primary action: playing a card. The player must always explicitly specify which table cards they wish to capture alongside the card they are playing. The engine never infers or auto-selects a capture subset. It then validates whether the play constitutes a valid capture (the played card plus the explicitly specified subset sums to exactly 15), an escoba (a valid capture that clears the entire table), or a table placement (an empty capture subset is provided). If a player provides an empty subset while a valid capture exists, the card is placed on the table and the capture opportunity is permanently lost for that turn.
- After a card is played, the turn does not automatically advance to the next player. The active player must explicitly confirm their turn is complete. This gives the player a moment to review the outcome of their play before handing off. The engine models this as a two-phase turn: _card played, awaiting confirmation_ and _turn complete_. The UI mechanism for the confirmation action is planned as a follow-up feature; the engine exposes the current turn phase via a Signal.
- At end of hand (all players' hands empty and deck non-empty), the engine automatically deals the next batch of 3 cards per player. At end of round (deck empty and all hands empty), the engine computes round scores and checks the win condition.
- Scoring at end of round awards points for: each escoba earned during the round (1 point each), most cards captured (1 point; 2 points if the player captured all 40 cards), most Oros captured (1 point; 2 points if the player captured all 10 Oros), most sevens captured (1 point; 2 points if the player captured all 4 sevens), and possession of the Siete de Oros (7 of Oros, 1 point). On any tie within a category, no one receives that point.
- Accumulated match scores are checked after each round. The first player to reach 15 or more points wins the match. If multiple players cross 15 in the same round, the player with the higher score wins; if still tied, another round is played.
- The engine is designed to be entirely framework-agnostic in its pure logic (rules, scoring, deck operations) and Angular-integrated only at the service boundary where Signals are used for state exposure.

---

## Deliverables

- **Card model:** A TypeScript interface representing a single card with suit, rank, and numeric value properties.
- **Deck factory:** A utility function that creates a full 40-card Spanish deck and a separate shuffle function.
- **Player model:** A TypeScript interface representing a player with an identifier, display name, hand (array of cards), captured cards pile, and accumulated escoba count for the current round.
- **Game state model:** A TypeScript interface representing the full in-game state: the current deck (remaining cards), the table cards, the list of players, the current turn index, the current round number, each player's accumulated match score, the identity of the last player who made a capture, and the current turn phase (card played and awaiting confirmation, or awaiting card play).
- **Round result model:** A TypeScript interface representing the outcome of a completed round, including per-player point breakdowns across all scoring categories.
- **Game engine service:** An Angular injectable service that initialises game state from a `GameConfiguration`, exposes state via read-only Angular Signals, and provides a `playCard` method for executing a player's card play and a `confirmTurn` method for the active player to signal their turn is complete and advance play to the next player.
- **Scoring engine utility:** A pure function (or set of functions) that, given a completed round state, returns a `RoundResult` with each player's points per category.
- **Win condition checker:** A pure function that, given accumulated match scores, determines whether any player has won.

---

## Notes

- The engine must never mutate state in place; each action must produce a new state snapshot so Angular change detection works correctly with Signals.
- The `playCard` action must accept both the card being played and the subset of table cards the player explicitly selects for capture. An empty subset always results in a table placement — the engine never infers a capture subset from available options. The engine validates that the provided capture subset is legal before applying it. If a legal capture existed but the player provided an empty subset, the play proceeds as a table placement with no retroactive correction.
- If a player has no legal capture available for any card in their hand, every play is a table placement. The engine does not enforce a "must capture if possible" rule. After playing a card, the active player must call `confirmTurn` to advance play; until confirmation is given, the game state is frozen and no other player can act. The specific UI affordance for this confirmation step is a follow-up feature.
- The AI opponent feature is explicitly out of scope. However, the engine's `playCard` method should be callable by any agent (human or AI), so the signature must not be coupled to UI events.
- Pass-and-play player switching is out of scope. The engine tracks turns internally, but the UI concern of hiding/showing state when passing the device is a separate feature.
- The game board UI, animations, and visual rendering are out of scope. The engine only manages state; it does not render anything.
- The existing `GameSession` service should be updated to bridge the `GameConfiguration` into the new game engine service at game start, but it should not be replaced — it remains the handoff point from the Lobby to the game.
- The Setenta scoring category (a separate bonus based on highest-value sevens across all suits) is explicitly out of scope for this release. The scoring engine must be designed so that additional categories can be added without restructuring existing categories.
