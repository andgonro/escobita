# Spec: Lobby Screen

## Overview

The Lobby screen is the application's root landing page. It serves as the visual entry point to "La Escoba" and as the game-setup interface, allowing players to choose a game mode, configure participants, and start a session. The Lobby is the first feature built and establishes the routing architecture, design language, and game-configuration data model for the entire application.

---

## Functional Requirements

### FR-1: Screen Entry & Routing

**FR-1.1** — The Lobby screen is served at the application's root path (the default URL when the application is opened).

**FR-1.2** — The Lobby is the only screen reachable without first completing a configuration. There is no screen before the Lobby.

**FR-1.3** — Navigating to the root path always displays the Lobby. There is no redirect away from the Lobby unless the player actively initiates it by pressing the Play button.

**FR-1.4** — The application routing configuration must define a named route for the future game board screen, even if that screen does not yet exist, so the Lobby's Play button can navigate to it.

---

### FR-2: Branding & Hero Area

**FR-2.1** — The Lobby displays the application name "La Escoba" prominently as the primary visual heading.

**FR-2.2** — The hero area includes decorative visual elements that communicate the card-game nature of the application (for example, illustrated or stylized card suits, broom imagery, or similar thematic graphics).

**FR-2.3** — The hero area does not contain any interactive controls. It is purely presentational.

---

### FR-3: Game Mode Selection

**FR-3.1** — The setup panel displays a game mode selector with exactly two options: "Single Player" (versus the AI) and "Multiplayer" (local pass-and-play).

**FR-3.2** — One game mode must always be selected. The selector does not allow a de-selected / empty state.

**FR-3.3** — Single Player is the default selected mode when the Lobby first loads.

**FR-3.4** — Changing the game mode immediately updates the setup panel to show the fields relevant to the newly selected mode and hides the fields from the previously selected mode.

---

### FR-4: Single Player Mode Setup

**FR-4.1** — When Single Player mode is active, the setup panel shows exactly one editable name field for the human player.

**FR-4.2** — The human player name field pre-fills with the default value "Jugador-1".

**FR-4.3** — The setup panel shows a read-only display of the AI opponent's name. The AI name is fixed and not editable by the player.

**FR-4.4** — The setup panel shows a difficulty selector for the AI opponent with three options: Easy, Medium, and Hard.

**FR-4.5** — "Easy" is the default selected AI difficulty when Single Player mode is first activated or when the page loads.

**FR-4.6** — The number-of-players selector described in FR-5 is hidden when Single Player mode is active.

---

### FR-5: Local Multiplayer Mode Setup

**FR-5.1** — When Multiplayer mode is active, the setup panel shows a player-count selector allowing the player to choose between 2, 3, or 4 human players.

**FR-5.2** — The default selected player count is 2 when Multiplayer mode is first activated.

**FR-5.3** — The setup panel dynamically renders exactly as many name fields as the currently selected player count. Increasing the count adds a new field; decreasing the count removes the last field.

**FR-5.4** — Each player name field pre-fills with a default value following the pattern "Jugador-N", where N is the player's position number (e.g., "Jugador-1", "Jugador-2", "Jugador-3", "Jugador-4").

**FR-5.5** — When the player count is reduced, the names already entered in the remaining fields are preserved.

**FR-5.6** — The AI difficulty selector described in FR-4.4 is hidden when Multiplayer mode is active.

---

### FR-6: Player Name Validation

**FR-6.1** — Each player name field is required. The field must not be empty or contain only whitespace.

**FR-6.2** — Because default values pre-fill all fields on load and on mode change, the form is always in a valid state unless the player manually clears a field.

**FR-6.3** — If a player clears a name field and leaves it empty, the field displays a visible validation error message indicating that a name is required.

**FR-6.4** — Player names do not need to be unique for this release.

---

### FR-7: Play Button

**FR-7.1** — The setup panel contains a single "Play" / "Jugar" action button.

**FR-7.2** — The Play button is disabled when the form is in an invalid state (i.e., any required name field is empty).

**FR-7.3** — The Play button is enabled whenever all required fields are filled.

**FR-7.4** — Pressing the Play button collects the current form values into a game-configuration object and triggers navigation to the game board route.

**FR-7.5** — The game-configuration object must be made available to the game board screen before navigation completes (via a shared service or equivalent Angular mechanism).

---

### FR-8: Responsive Layout

**FR-8.1** — The Lobby layout renders correctly and is fully usable on small mobile screens (from 320 px wide), tablets, and desktop browsers.

**FR-8.2** — On small screens, the hero and setup sections stack vertically. On larger screens, a side-by-side or more expansive layout may be used.

**FR-8.3** — All tap targets (buttons, selectors, inputs) meet a minimum size that is comfortable for touch interaction.

---

## Technical Requirements

### TR-1: Routing

**TR-1.1** — The application routing configuration registers the Lobby component at the root path. No redirect from a wildcard to the Lobby is needed; the root path directly resolves to the component.

**TR-1.2** — A second named route is registered for the game board screen (the exact path to be decided when that feature is planned). The Lobby's Play button references this named route for navigation.

**TR-1.3** — The Lobby route must be lazily loadable so the architecture supports future code-splitting as the application grows.

---

### TR-2: Component Architecture

**TR-2.1** — The Lobby is implemented as a standalone Angular component using the modern standalone component pattern (no NgModules).

**TR-2.2** — Reactivity within the component must use Angular Signals exclusively. RxJS observables must not be used for local component state.

**TR-2.3** — The form must be implemented using Angular Signal Forms (the Angular v21 forms approach based on Signals), not Reactive Forms or Template-Driven Forms.

**TR-2.4** — The Lobby component may delegate sub-areas (e.g., the player-name list, the difficulty selector) to smaller child components if the template complexity warrants it, but all components must remain standalone.

---

### TR-3: Game Configuration Data Model

**TR-3.1** — A game-configuration data model is defined as a TypeScript interface or value object. It must capture at minimum: the selected game mode (single-player or multiplayer), the list of human player names, and the selected AI difficulty level.

**TR-3.2** — The AI difficulty is represented as a union of the three string literals corresponding to Easy, Medium, and Hard. The exact string values are the definitive representation used everywhere in the application.

**TR-3.3** — The game mode is represented as a union of two string literals, one for single-player and one for multiplayer.

**TR-3.4** — The data model file is placed in a location accessible to both the Lobby feature and the future game engine feature (e.g., a shared models folder).

---

### TR-4: Game Session Service

**TR-4.1** — A game-session service is created to hold the game configuration produced by the Lobby and make it available to the game board screen.

**TR-4.2** — The service stores the active configuration in an Angular Signal so that any component consuming it reacts automatically to changes.

**TR-4.3** — The service is provided at the root level so it is a singleton for the lifetime of the application session.

**TR-4.4** — The service does not persist data to local storage, cookies, or any external storage. The configuration lives in memory only for the current browser session.

---

### TR-5: Styling

**TR-5.1** — Component styles are written in SCSS and scoped to the component.

**TR-5.2** — A set of global SCSS design tokens (custom properties or SCSS variables) for the primary color palette, typography scale, and spacing scale is introduced in this feature. These tokens serve as the design foundation for all future screens.

**TR-5.3** — The visual style is playful and colorful. The color palette must include at least one vibrant primary accent color, a complementary secondary color, a neutral background color, and accessible text colors with sufficient contrast ratios.

**TR-5.4** — No external UI component library (such as Angular Material, PrimeNG, or Bootstrap) is used. All UI elements are built from scratch.

---

## Non-Functional Requirements

### NFR-1: Performance

**NFR-1.1** — The Lobby screen must reach interactive state in under 2 seconds on a typical mid-range device on a standard broadband connection.

**NFR-1.2** — The Play button interaction (form collection and navigation trigger) must respond within 100 milliseconds.

---

### NFR-2: Accessibility

**NFR-2.1** — All interactive controls (inputs, selectors, buttons) must have associated visible or programmatic labels so they are operable with a screen reader.

**NFR-2.2** — The color palette must ensure that foreground text colors meet WCAG 2.1 AA contrast ratio requirements against their backgrounds.

**NFR-2.3** — The form must be fully navigable by keyboard alone (Tab, Shift+Tab, Enter, Space, arrow keys where appropriate).

**NFR-2.4** — Validation error messages must be programmatically associated with their input field so screen readers announce them when the field loses focus.

---

### NFR-3: Usability

**NFR-3.1** — A new user must be able to start a game within 30 seconds of first opening the application, without any instructions.

**NFR-3.2** — All labels, default values, and button text are in Spanish to match the game's cultural context.

---

### NFR-4: Browser Compatibility

**NFR-4.1** — The Lobby must function correctly in the two most recent stable versions of Chrome, Firefox, Safari, and Edge.

---

## Out of Scope

- Rules or tutorial screen — a separate feature.
- Sound and music settings or any audio controls.
- Player profiles, avatars, or any form of persistent player identity.
- Game history, statistics, or leaderboard.
- Online multiplayer matchmaking.
- Language switching or internationalization.
- Animations and transitions — may be revisited in the Polish & Testing epic.
- Dark mode or theme switching.

---

## Future Considerations

- A "How to Play" button or link could be added to the Lobby once the Rules/Tutorial feature is built.
- Audio toggle settings could appear in a header or settings panel once the sound feature is built.
- The game-configuration model may need to be extended with additional fields (e.g., card-deck variant, score limit) if optional rule variants are added in a later release.
- If online multiplayer is ever added, the Lobby would be replaced or supplemented by an online matchmaking flow; the current local-session service would need to be superseded by a server-backed session model.
