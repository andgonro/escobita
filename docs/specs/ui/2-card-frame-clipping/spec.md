# Spec: Card Frame Clipping Fix

GitHub Issue: #2 — Frame where cards are located is cutting the cards
https://github.com/andgonro/escobita/issues/2

---

## Overview

This specification defines the requirements for correcting visible card clipping in the active hand zone and the center table zone of the Escobita game table. The fix must allow card visuals and their decorative effects to render beyond the frame boundary when driven by animation transforms or focus states, without affecting interaction areas, adjacent zones, or the browser support matrix.

---

## Functional Requirements

### FR-1: Hand Zone — No Top or Bottom Clipping

During all game states (idle, dealing, card selected, card play in progress, capture in progress), no part of a card in the active hand zone shall be visually cut off at the top or bottom edge of its slot container.

**Details:**

- Applies to the card body, card artwork, and any decorative visual applied to the card (glow, shadow, highlight)
- Applies at all responsive breakpoints from the minimum mobile size to the maximum desktop size
- The interactive area of each card slot remains unchanged; only the visual rendering area is extended
- When no animation is active and the card is in its resting state, the card fits within the visible game table area without overflowing into other UI regions in a disruptive way

---

### FR-2: Center Table Zone — No Left or Right Clipping

During all game states, no part of a card in the center table zone shall be visually cut off at the left or right edge of its slot container.

**Details:**

- Applies to the card body, card artwork, and any decorative visual applied to the card
- Applies at all responsive breakpoints from the minimum mobile size to the maximum desktop size
- The interactive area of each card slot remains unchanged
- When no animation is active, the card resting state fits within the visible table area without disrupting adjacent cards or table layout

---

### FR-3: Animation Overflow — Hand Zone

When deal, selection, play-arc, or escoba-burst animations move or scale hand cards beyond their resting position, the animated card shall remain fully visible throughout the animation without clipping at the container boundary.

**Details:**

- Covers upward translate during deal entry, upward translate during selection elevation, upward arc peak during play, and outward scale during escoba burst
- The card shall be fully visible at all keyframe stages, including the most extreme position in each animation
- Adjacent cards in the hand zone shall not be obscured by the overflowing card in a way that hides their identity or prevents interaction
- Layering of the active/animating card above its neighbours during overflow is acceptable

---

### FR-4: Animation Overflow — Center Table Zone

When capture or escoba-burst animations move or scale table cards beyond their resting position, the animated card shall remain fully visible throughout the animation without clipping at the container boundary.

**Details:**

- Covers lateral translate and outward scale during capture and escoba animations
- The card shall be fully visible at all keyframe stages

---

### FR-5: Keyboard Focus Indicator Fully Visible

When a card slot in the active hand zone or center table zone receives keyboard focus, the focus-visible indicator (outline or equivalent) shall be fully visible and not clipped at any edge.

**Details:**

- The focus indicator must be visually complete (no missing segment on any side) on both mobile and desktop viewports
- The indicator must meet contrast requirements consistent with the existing accessibility baseline

---

## Technical Requirements

### TR-1: Touch and Click Target Integrity

The interactive area of each card slot — the region that responds to touch and click events — must not change size or position as a result of this fix. The minimum touch target dimension must be preserved at its current value for all card slots.

---

### TR-2: No Impact to Adjacent Zones

The overflow adjustment must be scoped to card slot containers within the active hand zone and center table zone only. Opponent hand zones, the match-over overlay, and other game table regions must not exhibit any unintended layout or visual change after this fix.

---

### TR-3: Responsive Correctness

The fix must behave correctly across the full responsive range from the smallest supported mobile viewport to the largest desktop viewport. The container sizing strategy (which uses viewport-relative units with clamped min/max values) must remain in effect; only the overflow rendering behaviour is changed.

---

### TR-4: Browser Compatibility

No change to the supported browser matrix is introduced by this fix. The solution must rely on CSS behaviour that is already supported across the browsers targeted by the existing application configuration.

---

### TR-5: Animation Performance Preservation

Any change to container overflow rendering must not regress animation performance. The 60fps animation target on mobile must remain achievable. Existing paint-containment or compositing optimisations applied to card or zone components must not be invalidated by this fix.

---

## Non-Functional Requirements

### NFR-1: Visual Acceptance — Mobile

No card edge clipping shall be visible during normal play on a representative mobile viewport. Acceptance is confirmed by QA sign-off.

---

### NFR-2: Visual Acceptance — Desktop

No card edge clipping shall be visible during normal play on a representative desktop viewport. Acceptance is confirmed by QA sign-off.

---

### NFR-3: Accessibility Sign-Off

The keyboard focus indicator for card slots must be fully visible after the fix. Accessibility sign-off is required before the feature is considered complete.

---

### NFR-4: No Regression in Adjacent Areas

Zones not reported in issue #2 must exhibit no new visual defects. This includes the opponent hand display, the match-over overlay, and any other component rendered on the game table screen.

---

## Out of Scope

- Card size enlargement on desktop (covered by issue #1)
- Changes to animation timing, easing, or magnitude beyond what is required to address clipping
- Global animation redesign or introduction of new animation effects
- Changes to game rules, turn logic, or game state management
- Visual restyling of areas outside the active hand zone and center table zone
- Compliance, legal, or privacy changes (this is a UI-only fix with no data handling impact)

---

## Future Considerations

- Once card frame clipping is resolved, issue #1 (cards too small on desktop) can be addressed in isolation as a size-scaling change without risk of interaction with the overflow fix
- If opponent zones are later found to exhibit the same clipping pattern at certain animation phases, the same approach can be applied consistently
