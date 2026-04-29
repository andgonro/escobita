# Title: Proposal — Lobby Screen

## Summary

The Lobby is the landing page of "La Escoba" and the first screen every player sees when they open the application. It combines a visually engaging welcome area with a lightweight game-setup form, allowing players to configure and start a game session in under 30 seconds.

---

## Context

### Motivation

The application currently has no screens, no routes, and no visual identity. The Lobby is the natural starting point because it is the entry point for every session and forces foundational decisions — routing architecture, basic design language, player and game-configuration data models — that all subsequent features will build upon.

### Current Limitation

There is no landing page. Opening the application displays the Angular CLI default placeholder. Players have no way to configure or start a game.

### Stakeholders

- **Players (casual):** Need a welcoming, intuitive screen that gets them into the game fast.
- **Developers:** Need a reusable game-configuration data model and a route structure that future screens (game board, round summary, rules) can slot into.

### User Experience Impact

The Lobby sets the visual tone and brand identity for the entire application. Its design language — color palette, typography, card aesthetic — will inform every other screen. A well-designed Lobby also reduces friction, which is the single biggest risk for a casual game web app.

---

## High-Level Approach

- The Lobby is served at the application's root path and is the only entry point to the application.
- The screen is divided into two logical sections: a branding/hero area that introduces the game, and a setup panel where players configure the session.
- The setup panel adapts dynamically based on the selected game mode:
  - In **Single Player** mode, the panel shows one name field for the human player and a pre-filled AI opponent section with a selectable difficulty level.
  - In **Local Multiplayer** (pass-and-play) mode, the panel shows a player-count selector (2 to 4) and one name field per player, rendered dynamically as the count changes.
- Player name fields pre-fill with default values ("Jugador 1", "Jugador 2", etc.) so the form is always in a valid state on load and players are never blocked by a blank required field.
- A "Play" button is enabled as long as the form is in a valid state and triggers navigation to the game board screen (the game board screen is not in scope for this feature; the Lobby only needs to navigate to its route).
- The visual style is playful and colorful — vibrant tones, fun card-themed decorative elements, and approachable typography. No specific UI component library is used; styles are built from scratch with SCSS.
- The layout is fully responsive, providing an equally good experience on smartphones, tablets, and desktop browsers.

---

## Deliverables

- A `LobbyComponent` standalone Angular component registered at the root route.
- A game-configuration data model (a TypeScript interface or class) that captures: game mode, number of players, player names, and AI difficulty. This model is the output of the Lobby and the input to the game engine.
- A shared game-session service (or equivalent Angular Signal-based mechanism) that holds the configuration between the Lobby and the game board route.
- SCSS styles establishing the initial design tokens (color palette, typography scale, spacing variables) for the application.
- Routing configuration: the root path mapped to the Lobby, and a placeholder route for the future game board.

---

## Notes

- AI difficulty options (Easy, Medium, Hard) are defined at the UI level now even though the AI opponent feature has not been built yet. The game-configuration model must accommodate this field so the AI feature can consume it directly.
- The pass-and-play player count range (2–4) aligns with the MVP game rules defined in the project documentation.
- The default player names ("Jugador 1", "Jugador 2", etc.) are intentionally in Spanish to match the game's cultural identity.
- The Lobby does not persist any state to local storage or any backend. Configuration lives in memory for the duration of the session only.
- The Rules/Tutorial screen, audio settings, player profiles, leaderboards, and language switching are explicitly out of scope and must not be referenced or linked from the Lobby in this release.
