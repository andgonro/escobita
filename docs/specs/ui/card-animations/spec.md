# Spec: Card Animation System

## Overview

This specification defines the complete card animation system for Escobita, including all visual effects triggered by card plays, captures, deals, and opponent actions. Animations are driven by a separate animation state signal and coordinated with game turn flow to provide smooth, 60fps performance across mobile and desktop devices.

---

## Functional Requirements

### FR-1: Card Play Animation (Player Plays a Card)

When a player selects a card from their hand and submits the action, the selected card shall animate from its position in the active hand zone to either the center table zone (if placing without capture) or disappear into the captured pile zone (if capturing), with a smooth arc motion and card rotation effect.

**Details:**

- Animation duration: 800–1200ms with ease-in-out easing
- Card rotates 180° on the Y-axis (flip effect) during movement
- Path: Cards follow a cubic-bezier arc from hand position to target position (not linear)
- Endpoint: Card reaches target zone and settles into layout
- Applies to: Player's own card plays in local and single-player modes

---

### FR-2: Card Capture Animation (Table Cards Disappear)

When a player or AI opponent captures one or more table cards, those cards shall animate with a glow/highlight effect and then fade out (opacity 0) and scale down simultaneously, creating a disappearance effect.

**Details:**

- Animation duration: 800–1200ms total (glow + disappear combined)
- Glow effect: Yellow/golden highlight (e.g., box-shadow or filter) appears for first 300ms, then fades
- Disappear effect: Opacity decreases to 0 and scale reduces to 0.5 simultaneously starting at 300ms
- Captured cards animate simultaneously if multiple cards are captured in one action (not sequentially)
- Applies to: All captured table cards, regardless of whether player or AI performed the capture

---

### FR-3: New Cards Deal Animation (Cards Added to Hand)

When the game engine deals new cards to the player's hand (after a turn resolves), those cards shall animate from a deck source position (top-center or off-screen) into the active hand zone with a slide/arc motion and slight rotation, settling into their layout positions.

**Details:**

- Animation duration: 800–1200ms with ease-in-out easing
- Cards animate simultaneously if dealing 3 cards at once (not sequentially, per user requirement)
- Path: Cards arc from deck origin (off-screen or top-center) to their final position in the hand zone
- Rotation: Cards rotate 180°–360° during flight to convey "dealing" action
- Endpoint: Cards settle into flex layout positions in the active hand zone
- Applies to: Player's hand replenishment after turn submission, and initial deal at round start

---

### FR-4: Card Selection Visual Feedback

When a player hovers over, focuses, or selects a card in their hand, the card shall provide immediate visual feedback through a subtle scale and highlight effect without full animation (distinction from play/deal animations).

**Details:**

- On hover/focus: Card scales up 1.05× and applies a subtle glow (not animated transition, but CSS transition with 120ms duration)
- On click-to-select: Card applies a yellow glow/border highlight
- Deselect: Removes highlight and returns to original scale (120ms transition)
- Applies to: All cards in the active hand zone during card selection phase
- Note: This is enhancement to existing selection feedback, not a new animation

---

### FR-5: Opponent Card Placement Animation

When an AI opponent plays a card (in single-player mode) or a remote opponent plays a card (in multiplayer), the card placement shall be animated to show cards being added to or removed from opponent zones.

**Details:**

- Animation duration: 800–1200ms with ease-in-out easing
- For placed cards: Card animates from opponent zone origin to opponent played-cards display area
- For card draws (hand count decreases): Visual decrease in card count with a subtle fade/scale effect
- Applies to: AI opponent plays in single-player; potential future multiplayer synchronization
- Note: Opponent hand cards remain face-down; only placement/count changes are visible

---

### FR-6: Escoba Special Effect (Table Clear)

When an Escoba occurs (player captures all cards on the table, clearing it entirely), all table cards shall animate out simultaneously with an enhanced visual effect (stronger glow, faster disappear, optional particle/burst effect).

**Details:**

- Animation duration: 600–800ms (faster than normal captures to convey the special moment)
- All table cards animate out together (no sequencing)
- Glow effect: Brighter or color-shifted (e.g., bright golden, orange, or white) compared to normal captures
- Disappear: Cards scale down and fade more dramatically (scale 0.2, opacity 0 with potential burst expansion before collapse)
- Visual emphasis: Temporary shadow/bloom effect around the cleared table zone
- Applies to: All instances where Escoba is triggered (cards cleared from table)

---

### FR-7: Action Pause for Clarity

Between major game actions (turn submission → animation → next turn start), the game shall insert brief pauses to allow animations to complete and let players observe the result.

**Details:**

- Pause duration: 500–800ms after animation completion (configurable)
- Trigger: After player submits a play, after captures resolve, before advancing turn phase
- Applies to: All turn transitions in local multiplayer, single-player with AI, and future online modes
- Player control: In modes with handoff overlay (local multiplayer), brief pause before handoff prompt appears
- Note: Pauses are automatic; players cannot skip (design decision for clarity, not UX control)

---

### FR-8: AI Turn Animation Coordination

When the AI opponent is taking its turn, all card animations (play, capture, deal) shall execute with the same visual language and timing as player actions, allowing players to follow the dealer's moves.

**Details:**

- AI plays: Card plays animate from AI zone to table/capture pile (same as player plays)
- AI captures: Table cards fade and disappear (same as player captures)
- AI receives new cards: Subtle animation when AI hand is replenished (no visual cards shown, but hand count or visual indicator updates)
- Timing: All AI animations use the same 800–1200ms duration and easing as player animations
- Applies to: Single-player AI opponent and future multiplayer opponent actions

---

## Technical Requirements

### TR-1: Animation State Signal

The animation system shall maintain a separate Angular Signal (`animationState`) that tracks which cards are currently animating, their animation type (play, capture, deal), and their progress (0–100%). This signal shall be independent of the game logic state signal.

**Details:**

- Signal updates emit at 60fps during animations (compatible with requestAnimationFrame)
- Animation state includes: `animatingCards: {cardId: string, type: 'play'|'capture'|'deal'|'selection', progress: 0-100}[]`
- State changes are observable and can be subscribed to by UI components
- Signal emission must not block game turn advancement or state mutations

---

### TR-2: CSS Keyframe Animations

Animation movements shall be implemented via CSS keyframes and transitions, not JavaScript-driven DOM mutations, to ensure GPU acceleration and 60fps performance.

**Details:**

- Keyframes defined in SCSS for reusability: `@keyframes card-play-arc`, `card-capture-fade`, `card-deal-slide`, `card-flip`, `card-glow`, `card-disappear`
- Each keyframe uses `transform: translate()`, `rotate()`, and `opacity` properties (GPU-accelerated)
- No layout-affecting properties (width, height, margin) animate within keyframes to prevent layout thrashing
- Easing: `cubic-bezier(0.25, 0.1, 0.25, 1.0)` for ease-in-out effect on card movement
- Duration: 800–1200ms (configurable via CSS custom properties or SCSS variables)

---

### TR-3: Card Animation Directives

Angular directives shall be created to apply animations to individual card components based on animation state signal emissions.

**Details:**

- Directive: `*appCardAnimation="animationType"` – applies animation class and keyframes based on type
- Directive triggers on: card model change, animation state signal update, card zone change detection
- Directive handles: applying animation classes, managing animation timings, removing animation classes on completion
- Integration: Works with existing `CardVisual` component without modifying its core rendering logic

---

### TR-4: Game Flow Pause Logic

A turn phase service or game orchestration layer shall insert configurable pauses between major turn transitions to allow animations to complete.

**Details:**

- Pause points: After turn submission confirmation, after capture result display, before next turn phase
- Pause duration: 500–800ms (calculated to allow 800–1200ms animation + small buffer)
- Implementation: Promise-based delay or observable timer that prevents turn advancement until pause completes
- Testable: Pauses shall not block E2E tests if animation timing is mocked or disabled
- Configuration: Pause duration shall be configurable (important for testing and accessibility)

---

### TR-5: Coordinate Systems for Animation Paths

Card animation paths (arc from hand to table, deck to hand, etc.) shall use coordinate calculations based on actual DOM positions of source and target zones.

**Details:**

- Source position: Calculated from active hand zone card element bounding box at animation start
- Target position: Calculated from center table zone, captured pile zone, or deck zone
- Path calculation: Cubic-bezier curve with control points positioned at 33% and 66% of horizontal distance, with vertical lift for arc effect
- Responsive: Position calculations must adapt to viewport size changes; animations recalculate on resize
- Fallback: Linear path if coordinate calculation fails (graceful degradation)

---

### TR-6: Prefers-Reduced-Motion Support

Animations shall respect the browser's `prefers-reduced-motion` media query and provide instant state changes with no animation when enabled.

**Details:**

- Detection: `@media (prefers-reduced-motion: reduce)` CSS rule disables keyframe animations
- Fallback behavior: Cards instant-teleport to final positions (no transition duration, opacity changes instant)
- No removal of animation code: Full animation system remains present; CSS media query simply disables timing
- Testing: Must be testable in E2E tests via mocking or disabling animations globally
- Note: Pause logic (FR-7) should still apply briefly for clarity, but animations are instant

---

### TR-7: Performance Optimization

Animations shall maintain 60fps frame rate on mobile (iOS Safari, Chrome Android) and desktop browsers by using GPU-accelerated properties only.

**Details:**

- Animate only: `transform` (translate, rotate, scale), `opacity`
- Never animate: `width`, `height`, `top`, `left`, `margin`, `padding`, `display`, `position` (avoid layout shifts)
- Will-change: Apply `will-change: transform, opacity` to animating cards before animation starts, remove after
- Rendering: Use `contain: strict` on animation containers to isolate repaints
- Caching: Pre-calculate animation paths during turn phase setup, not during animation execution
- Monitoring: Performance tests shall verify 60fps on Lighthouse-tested mobile devices

---

### TR-8: Animation Completion Signals

The animation system shall emit completion signals (via observable or Promise) when an animation finishes, allowing the game flow to synchronize turn advancement with animation end.

**Details:**

- Completion event: Emitted per card or per group (all cards in action)
- Used by: Turn orchestration layer to know when to advance turn phase
- Cancellation: Animations must be cancellable if game state changes before completion (edge case)
- Timing: Completion signal must fire exactly when animation ends (no manual delays needed in game logic)

---

## Non-Functional Requirements

### NFR-1: Performance – 60fps Target

All card animations shall achieve 60fps on a representative mobile device (e.g., iPhone 12, mid-range Android phone with Snapdragon 6-series processor).

**Details:**

- Measured: Frame rate monitor via browser DevTools during animation playback
- Target: Minimum 55fps sustained, no dropped frames >100ms
- Test devices: iOS Safari (12.5+), Chrome Android (latest)
- Optimization: GPU acceleration via `transform`/`opacity`, no layout shifts, caching of calculations

---

### NFR-2: Accessibility – Keyboard Navigation Unaffected

Animations shall not interfere with keyboard navigation, focus management, or screen reader announcements.

**Details:**

- Tab order: Unchanged by animation state
- Focus visibility: Focus outlines remain visible and unobstructed by animation effects
- Screen readers: No additional ARIA updates for animation state (animations are pure visual)
- Reduced motion: Instant fallback when prefers-reduced-motion is active
- Testing: E2E tests must verify keyboard navigation and screen reader compatibility

---

### NFR-3: Accessibility – Motion Preferences Respected

Users with `prefers-reduced-motion: reduce` shall experience instant animations (no motion, no timing) while the game logic remains unchanged.

**Details:**

- Detection: CSS media query `@media (prefers-reduced-motion: reduce)`
- Implementation: Animations disabled via CSS rule (duration: 0, easing removed)
- Alternative: Instant opacity/display changes if animation cannot be disabled
- Testing: E2E tests must explicitly test with and without prefers-reduced-motion

---

### NFR-4: Responsive Design Compatibility

Animations shall adapt to all viewport sizes (320px mobile to 4K desktop) without breaking layout or causing visual glitches.

**Details:**

- Coordinate calculations: Recalculate on viewport resize or orientation change
- Scaling: Animation paths scale proportionally with card sizes
- Touch safety: Animations must not interfere with touch targets or event handling
- Testing: E2E tests must verify animations on mobile, tablet, and desktop viewports

---

### NFR-5: Browser Compatibility

Animations shall work on all supported browsers: iOS Safari 12.5+, Chrome/Edge latest, Firefox latest.

**Details:**

- CSS features: `transform`, `opacity`, `keyframes`, `cubic-bezier`, `prefers-reduced-motion` are widely supported
- Fallback: Instant animations (no transform or opacity changes) if browser doesn't support CSS animations
- Testing: Cross-browser testing with BrowserStack or similar
- Vendor prefixes: Use autoprefixer in build pipeline to add `-webkit-` and `-moz-` prefixes as needed

---

### NFR-6: Maintainability

Animation code shall be modular, reusable, and well-documented for future enhancements.

**Details:**

- CSS variables: Use SCSS variables/mixins for animation durations, easing, colors (easy to adjust)
- Directives: Reusable animation directives that can be applied to other components
- Comments: Document animation paths, coordinate calculations, and timing decisions
- Testing: E2E tests documented with comments explaining animation expectations

---

### NFR-7: Consistency with Existing Design System

Animations shall align with Escobita's visual language (dark green table, card imagery, responsive scaling).

**Details:**

- Colors: Glow effects use game table colors (yellows, golds, whites)
- Shadows: Depth effects match existing card shadow styles
- Timing: Animation speed is consistent across all card actions (800–1200ms)
- Easing: Same easing function (ease-in-out) used for all movement animations for visual coherence

---

## Out of Scope

- Animations for non-card UI elements (buttons, overlays, modal dialogs) – considered separate features
- Particle effects or advanced graphics (Babylon.js, Three.js) – CSS-based animations only
- Sound effects synchronized with animations – audio is out of scope
- Undo/rewind animations – not in initial scope (future feature)
- Network synchronization timing (multiplayer latency compensation) – assumed game state sync is correct
- Animation preview mode or customization UI – animations are hard-coded, not user-configurable
- Real-time animation streaming for spectators in multiplayer – future consideration

---

## Future Considerations

- **Animation Customization:** Settings screen allowing users to adjust animation speed (fast/normal/slow) or disable animations individually
- **Particle Effects:** Escoba clear event could spawn confetti or card spray particles on special occasions
- **Sound Integration:** Whoosh sounds for card movement, chime sounds for captures, fanfare for Escoba
- **Replay/Spectator Mode:** Animated card playback allowing players to review past rounds with smooth animations
- **Advanced Easing:** Time-based easing graphs to fine-tune animation feel based on player feedback
- **Multiplayer Animation Sync:** Ensure animations stay synchronized across network latency in online multiplayer
- **Gesture Animations:** Swipe/flick gestures to trigger card plays with enhanced visual feedback
