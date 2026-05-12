# Proposal: Single Player Mode — AI Opponent (Laia)

## Summary

Add a fully automated AI opponent named "Laia" to the existing Single Player mode, enabling a human player to compete against the game engine in a standard 2-player match of Escoba de 15 across three difficulty levels: Fácil, Intermedio, and Difícil.

## Context

### Motivation

The application already supports Single Player mode in the configuration data model and lobby UI, but the AI opponent is entirely absent from the implementation. When a player selects Single Player today, the game loads normally but Laia's turn simply waits for a human click — there is no automated play. The feature is a non-functional stub. The difficulty selector in the Lobby captures a value that is stored but never used.

### Current Limitation

The game engine treats all players identically; every card play and every turn confirmation requires explicit human interaction. There is no mechanism to detect that the active player is an AI, trigger an automated decision, or animate that decision for the watching human player.

### Stakeholders

- **Human players** seeking solo practice or casual play without requiring a second human opponent.
- **Product team** — Single Player mode is a declared core mode of the application and is currently non-functional.

### User Experience Impact

Without this feature, selecting Single Player leads to a broken experience where the human must manually control Laia's turns. With this feature the human plays a complete, natural-feeling match: Laia's turns animate step by step (card selection highlight, capture highlight, resolution), the human's interaction is blocked while Laia acts, and Laia's hand cards are always hidden — maintaining the integrity and fairness of the game. Three difficulty levels give players a progression path from casual to challenging.

## High-level Approach

- Introduce a new AI strategy service that encapsulates all difficulty-specific decision logic. Given a snapshot of the current game state and Laia's hand, the service returns the card Laia chooses to play and an optional set of table cards to capture.
- The game table orchestration layer reacts to the active player changing. When the active player is Laia, it delegates to the AI strategy service and drives Laia's turn through the existing engine API — playCard and confirmTurn — with step-by-step animation timing between each stage.
- Three difficulty strategies are defined:
  - **Fácil** — Stateless random play. No history is consulted. Laia picks a random valid capture if one exists; otherwise she places a random card on the table.
  - **Intermedio** — The service maintains a running list of all Oros and rank-7 cards seen during the current round. When multiple valid captures exist, Laia greedily selects the option that captures the most high-value cards (Oros + rank-7s) in the current play.
  - **Difícil** — The service maintains a full record of every card played by both players during the round. Using that record to infer the probability distribution of cards remaining in the deck and the human's hand, Laia selects the play with the highest expected contribution to her total score across the remainder of the round.
- Laia's hand zone renders all cards face-down in Single Player mode, regardless of difficulty.
- Human interaction (card selection, submit, confirm) is blocked for the entire duration of Laia's animated turn.
- The AI strategy service resets its internal memory state at the start of each new round, aligned with the round boundary enforced by the game engine.
- Laia's automated actions produce the same accessibility announcements as human actions so that screen reader users receive full play-by-play narration.

## Deliverables

- AI strategy service with three selectable difficulty implementations (Fácil, Intermedio, Difícil)
- AI turn orchestration integrated into the game table orchestration layer
- Face-down card rendering for Laia's hand zone in Single Player mode
- Step-by-step visual animation for Laia's card selection and capture sequence
- Accessibility announcements for Laia's actions (card played, capture made, escoba scored)
- Updated session configuration to formally register Laia as the second named player

## Notes

- The game engine must remain completely mode-agnostic. All AI logic lives outside the engine, in the orchestration and strategy layers. The engine's public API (playCard, confirmTurn) is called on Laia's behalf exactly as it is called for a human player.
- In Difícil mode, Laia infers remaining cards by elimination from the known full 40-card deck. She does not access the human player's actual hand data directly — all reasoning is based on what has been publicly played or captured.
- The aiDifficulty field in GameConfiguration and the "Oponente IA" / "Laia" section in the Lobby are already wired and do not require changes to the data model or lobby form.
- The handoff overlay is already suppressed in Single Player mode and remains suppressed with this feature.
- Difficulty labels displayed in the Lobby are currently stored in English ("Easy", "Medium", "Hard"). The displayed labels should be presented in Spanish ("Fácil", "Intermedio", "Difícil") to match the rest of the UI. Confirming whether this is an existing gap or intentional is recommended before implementation.
