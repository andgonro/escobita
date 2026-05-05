# Title: Proposal - Game Table MVP

## Summary

The Game Table MVP introduces the main play surface where cards are displayed, selected, and confirmed during a match. It transforms the current placeholder route into a playable table experience that aligns with existing game-engine behavior and the visual language established by the Lobby.

## Context

### Motivation

The Lobby is complete and can start a session, and the game engine already manages deck, table state, turns, captures, scoring, and win conditions. The product now needs a real game table so players can perform game actions and progress through a match.

### Current Limitation

The current game route only shows a placeholder. Players cannot view table cards, cannot play cards, and cannot interact with the turn flow.

### Stakeholders

- Players: Need a clear and playable table interface with reliable turn and capture interactions.
- Product and design: Need a coherent game screen that matches the style quality of the Lobby.
- Engineering: Need a UI contract that maps cleanly to existing game-engine signals and actions.
- Accessibility users: Need keyboard and screen-reader support from first release.

### User Experience Impact

This feature becomes the core gameplay screen. It will directly shape perceived game quality, clarity of turns, and confidence in card interactions.

## High-level approach

- Use a fixed active-player perspective with the active hand at the bottom and opponent zones around the table.
- Render table cards in a central play area with a textured surface and subtle overlay for readability.
- Keep critical match context always visible: active player indicator, match scores, and current turn phase.
- Support full capture selection in MVP, including selecting table subsets and validating capture rules before action confirmation.
- Use a two-step play interaction: select card and then confirm play intent.
- Respect game-engine turn phases by separating play confirmation from turn completion.
- Keep core rules and scoring logic engine-authoritative; the table UI consumes outcomes and does not duplicate rule computation.
- Use a feature-scoped interaction-state layer only for transient UI selections and handoff controls.
- Add an optional pass-and-play handoff toggle for local multiplayer.
- Deliver keyboard and screen-reader baseline support in MVP.

## Deliverables

- A complete game table screen specification under the UI epic.
- Functional definition for card selection, capture subset selection, play confirmation, and turn confirmation.
- Visual layout definition for 2 to 4 player matches and responsive behavior.
- Accessibility baseline requirements for keyboard and screen-reader play flows.
- User stories and acceptance criteria for happy path and edge cases.

## Notes

- Existing card assets are available and ready to be used for card rendering.
- Existing table texture asset is used with a subtle overlay to protect text and card readability.
- The game-engine contract is already available and should be consumed, not redefined.
- RED and GREEN test workflow checkpoints remain part of implementation planning to protect behavior and accessibility quality.
- Animation depth, audio, and advanced visual polish remain outside the first release scope.
- If the handoff toggle default state is disputed during implementation, product validation should prioritize local multiplayer usability testing.
