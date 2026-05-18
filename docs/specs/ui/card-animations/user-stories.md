# User Stories: Card Animation System

---

## US-1: Player Card Play Animation

**Story:**
As a player, I want to see my selected card animate smoothly from my hand to the table or capture pile when I submit my play, so I can clearly understand which card I just played and where it went.

**Acceptance Criteria:**

- [ ] When a player submits a card play, the card animates from its position in the active hand zone with an arc path and 180° rotation
- [ ] The animation duration is 800–1200ms with ease-in-out easing
- [ ] The card lands in the center table zone if the player placed without capturing, or disappears into the captured pile if capturing
- [ ] The animation completes before the next turn phase begins (automatic 500–800ms pause inserted after animation)
- [ ] The animation plays smoothly at 60fps on mobile devices (iPhone 12, mid-range Android)
- [ ] If prefers-reduced-motion is enabled, the card instant-teleports to its final position with no animation
- [ ] The card's visual position matches its logical position in game state after animation completes
- [ ] Keyboard navigation is not interrupted by the animation (focus remains accessible)

---

## US-2: Table Card Capture Animation

**Story:**
As a player, I want to see table cards animate out with a glow effect and fade away when I capture them, so I have clear visual confirmation of what I captured.

**Acceptance Criteria:**

- [ ] When a player (or AI) captures one or more table cards, each card displays a yellow/golden glow effect
- [ ] The glow effect appears for ~300ms, then fades as the card simultaneously becomes transparent (opacity → 0) and shrinks (scale → 0.5)
- [ ] Total animation duration is 800–1200ms with ease-in-out easing
- [ ] Multiple cards captured in one action animate simultaneously (not sequentially, per feature requirement)
- [ ] The animation completes before the next turn phase begins
- [ ] Captured cards are removed from the DOM/table zone after animation completes
- [ ] If prefers-reduced-motion is enabled, cards instantly disappear (opacity 0) with no glow animation
- [ ] The visual result (empty table or partially filled table) matches the logical game state

---

## US-3: Dealer Deals New Cards Animation

**Story:**
As a player, I want to see new cards animate into my hand with a dealing motion when the dealer replenishes my hand, so I understand that I've received new cards.

**Acceptance Criteria:**

- [ ] When the game deals new cards to the player's hand (after turn submission or at round start), cards animate from a deck source position with a slide/arc path
- [ ] Cards rotate 180–360° during the flight to convey dealing action
- [ ] All dealt cards (typically 3) animate simultaneously into the hand zone
- [ ] Animation duration is 800–1200ms with ease-in-out easing
- [ ] Cards settle into their final flex layout positions in the active hand zone
- [ ] The animation completes before the player is prompted to select their next card
- [ ] If prefers-reduced-motion is enabled, cards instant-appear in the hand with no animation
- [ ] The player can immediately interact with newly dealt cards after animation completes (no artificial delay)
- [ ] On mobile viewports, card sizing and animation paths adapt to viewport dimensions

---

## US-4: Card Selection Visual Feedback

**Story:**
As a player, I want clear visual feedback when I hover over or select a card from my hand, so I know which card I'm about to play.

**Acceptance Criteria:**

- [ ] When the player hovers over or focuses a card via keyboard, the card scales up slightly (1.05×) and applies a subtle highlight/glow effect
- [ ] When the player clicks or presses Enter to select a card, the card applies a yellow glow border indicating selection
- [ ] Hovering away or pressing Escape deselects the card and returns it to normal size (120ms transition)
- [ ] The highlight is visible on all viewport sizes and does not obstruct the card image
- [ ] Selection feedback does not delay or interfere with the card selection input (instant visual response)
- [ ] Screen readers and keyboard navigation are unaffected by the highlight effect (no ARIA changes needed)
- [ ] The selection highlight is distinguishable from the capture glow effect used when cards are captured

---

## US-5: Opponent Card Placement Animation (AI Opponent)

**Story:**
As a single-player user, I want to see visual feedback when my AI opponent plays a card or receives new cards, so I can follow the dealer's actions and understand what's happening in the game.

**Acceptance Criteria:**

- [ ] When the AI opponent plays a card, a visual indicator animates showing the card leaving the opponent zone (subtle fade/scale effect, or hand count decreases with animation)
- [ ] When the AI opponent receives new cards (hand replenishment), a subtle animation indicates cards being dealt
- [ ] AI card placement animations use the same 800–1200ms duration and ease-in-out easing as player animations
- [ ] Opponent hand cards remain face-down; only placement/count changes are visible (no card images revealed)
- [ ] A brief pause (500–800ms) occurs after the AI's turn animation before the next turn phase begins
- [ ] The animation completes before the turn handoff to the next player
- [ ] If prefers-reduced-motion is enabled, opponent actions update instantly without animation
- [ ] The visual effect does not distract from the player's ability to read the current table state

---

## US-6: Escoba Special Effect (Table Clear)

**Story:**
As a player, I want a special visual effect when I achieve an Escoba (capture all table cards), so the momentous gameplay event is clearly celebrated.

**Acceptance Criteria:**

- [ ] When an Escoba occurs (player captures all remaining table cards), all table cards animate out simultaneously with enhanced visual effects
- [ ] The animation duration is faster than normal captures (600–800ms) to convey urgency/celebration
- [ ] All table cards display a brighter or color-shifted glow (golden, orange, or white) compared to normal captures
- [ ] Cards scale down more dramatically (scale 0.2) and fade faster (opacity 0) than normal captures, creating a burst/implosion effect
- [ ] Optional: A temporary shadow or bloom effect appears around the cleared table zone
- [ ] The animation is visually distinct from regular multi-card captures (players can immediately recognize Escoba)
- [ ] The table zone visually empties completely after the animation
- [ ] If prefers-reduced-motion is enabled, the table instant-clears with no special effect (but logical Escoba is still recognized)
- [ ] The Escoba effect works correctly on mobile viewports with smaller table zones

---

## US-7: Action Pause for Clarity

**Story:**
As a player, I want automatic pauses between game actions so I can observe the animation results before the game advances to the next turn, ensuring I understand what just happened.

**Acceptance Criteria:**

- [ ] After a player submits a card play, a brief pause (500–800ms) occurs before the game advances to the next turn phase
- [ ] During the pause, animations complete, results are visible, and the player cannot accidentally advance too quickly
- [ ] The pause timing accommodates the longest animation duration (800–1200ms) plus a small buffer
- [ ] In local multiplayer with handoff overlay, the pause occurs before the handoff prompt appears (player has time to observe results)
- [ ] In single-player, the pause occurs before the AI opponent's turn begins
- [ ] The pause is automatic; players cannot manually skip it (design decision for clarity)
- [ ] If prefers-reduced-motion is enabled, the pause is still applied (but animations are instant)
- [ ] Pause timing is configurable (important for testing and accessibility adjustments)
- [ ] E2E tests can disable or mock pause timing to avoid test delays

---

## US-8: Full AI Turn Animation in Single-Player

**Story:**
As a single-player player, I want to watch my AI opponent's moves animate smoothly so I can follow the dealer's play and understand the game progression without feeling like actions are happening off-screen.

**Acceptance Criteria:**

- [ ] When the AI opponent plays a card, the card play animates from the opponent zone to the table (same visual language as player card plays)
- [ ] When the AI opponent captures table cards, the cards animate out with glow and fade effects (same as player captures)
- [ ] When the AI receives new cards after its turn, a subtle animation indicates the hand replenishment
- [ ] All AI animations use the same timing (800–1200ms duration, ease-in-out easing) as player animations for visual consistency
- [ ] A brief pause (500–800ms) occurs between AI turn animations and the turn handoff to the player
- [ ] The player can observe the complete AI turn without missing actions due to instant state changes
- [ ] If prefers-reduced-motion is enabled, AI animations are instant but the game flow remains clear (no blank states)
- [ ] The AI's moves are fully visible and understandable to the player (no hidden decisions or instant state jumps)

---

## US-9: Animations Respect Prefers-Reduced-Motion

**Story:**
As a user with motion sensitivity or accessibility preferences, I want animations to respect my browser's reduced-motion setting so I can enjoy the game without experiencing discomfort.

**Acceptance Criteria:**

- [ ] When `prefers-reduced-motion: reduce` is active in the user's OS/browser settings, all card animations are disabled (duration becomes 0)
- [ ] Cards instant-appear, instant-move, or instant-disappear without any transition timing
- [ ] Game logic and state management are unaffected; only visual animation timing changes
- [ ] The game remains fully functional and playable with reduced-motion enabled
- [ ] A brief pause (500–800ms) is still applied between actions for clarity (no animation, but game advances slightly slower)
- [ ] No warning or alert is shown to the user; motion reduction is silent and automatic
- [ ] E2E tests explicitly verify behavior with `prefers-reduced-motion: reduce` enabled (using Cypress media query mocking)
- [ ] The user's accessibility preference is persistent and does not reset on page reload

---

## US-10: 60fps Performance on Mobile Devices

**Story:**
As a mobile player, I want animations to run smoothly at 60fps on my device so the game feels responsive and professional, not janky or stuttering.

**Acceptance Criteria:**

- [ ] All card animations achieve a sustained 55fps minimum on representative mobile devices (iPhone 12, mid-range Android)
- [ ] No frame drops >100ms during animation playback (measured via browser DevTools)
- [ ] Animations use GPU-accelerated properties only (`transform`, `opacity`; never layout properties like `width`, `height`, `position`)
- [ ] Multiple simultaneous animations (e.g., 3 cards dealt at once) maintain 60fps without stuttering
- [ ] Animation paths and coordinate calculations are pre-computed, not calculated during animation playback
- [ ] The game UI remains responsive to player inputs during animations (no freezing)
- [ ] On older mobile devices (>5 years old), animations are still smooth (graceful degradation, may reduce visual effects if needed)
- [ ] Performance is verified via Lighthouse performance audits and manual frame rate monitoring

---

## US-11: Animation Coordinate Calculations Adapt to Responsive Layout

**Story:**
As a user playing on different screen sizes (mobile phone, tablet, desktop), I want card animations to correctly calculate positions for arcing paths regardless of viewport size.

**Acceptance Criteria:**

- [ ] Animation source and target positions are calculated from actual DOM element bounding boxes (not hard-coded pixel values)
- [ ] When the viewport resizes or orientation changes, animation path calculations update accordingly
- [ ] Cards animate correctly from their true position in the hand zone to their true position in the table zone on any viewport
- [ ] On mobile (320px width), tablet (768px width), and desktop (1920px width), animation arcs are smooth and proportional
- [ ] Touch targets and interactive zones are not disrupted by position calculation changes
- [ ] If coordinate calculation fails for any reason, a fallback linear animation path is used (graceful degradation)
- [ ] E2E tests verify animations on multiple viewports (320px, 768px, 1920px) and orientations (portrait, landscape)

---

## US-12: Smooth Animations Do Not Break Existing Game Logic

**Story:**
As a developer, I want the animation system to be isolated from game logic so that animations can be added, modified, or disabled without affecting game state, turn sequencing, or rule validation.

**Acceptance Criteria:**

- [ ] Animation state is stored in a separate Signal (`animationState`), independent of the game engine's state signal
- [ ] Game logic advances independently of animation timing; animations are pure presentation
- [ ] Animations can be disabled globally (for testing) without changing game logic behavior
- [ ] Turn sequencing, card validation, and capture logic are unaffected by animation presence or speed
- [ ] If an animation fails to start or complete, the game state still advances correctly (no hanging turns)
- [ ] E2E tests pass with animations disabled, proving game logic is animation-independent
- [ ] Animation system can be refactored, replaced, or removed in the future without major game engine changes

---

## US-13: Animation System Supports Future Enhancements

**Story:**
As a product owner, I want the animation system to be modular and extensible so that future animation features (sounds, particles, custom easing, user speed preferences) can be added without major refactoring.

**Acceptance Criteria:**

- [ ] Animation CSS variables (`$animation-duration`, `$animation-easing`, `$glow-color`, etc.) allow easy tweaking without code changes
- [ ] Animation directives are reusable and can be applied to other UI components (buttons, overlays, etc.) in the future
- [ ] Animation completion signals can be observed and extended with additional side effects (e.g., triggering sound effects)
- [ ] Animation paths are calculated parametrically (not hard-coded), allowing new path types to be added easily
- [ ] Animation timing can be overridden per component or per action (e.g., faster animations during "fast-play" mode)
- [ ] Code comments clearly document animation logic and design decisions for future maintainers
- [ ] The animation system architecture allows adding user preferences (animation speed slider, disable specific effects) without redesign

---

## US-14: E2E Tests Validate Animation Behavior and Timing

**Story:**
As a QA engineer, I want E2E tests to verify that animations play correctly, complete at the right time, and do not interfere with game logic, so I can confidently release animation features.

**Acceptance Criteria:**

- [ ] E2E tests verify that card play animations complete within expected time range (800–1200ms)
- [ ] Tests verify that captured cards disappear after animation completes (DOM element removed)
- [ ] Tests verify that newly dealt cards appear in the hand zone after animation completes
- [ ] Tests verify that game turn advances after animations complete (pause timing is correct)
- [ ] Tests verify card positions before, during (if observable), and after animations
- [ ] Tests can run with animations disabled (for speed) and verify game logic is unchanged
- [ ] Tests verify animations on multiple viewports (mobile, tablet, desktop) and viewport changes
- [ ] Tests verify prefers-reduced-motion behavior (animations disabled, game still functional)
- [ ] Tests verify AI opponent animations in single-player mode
- [ ] Tests verify that animations do not block keyboard navigation, focus management, or screen reader functionality
- [ ] Test assertions are descriptive and maintainable, documenting expected animation behavior
