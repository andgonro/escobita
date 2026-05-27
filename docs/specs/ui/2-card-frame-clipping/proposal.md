# Title: Proposal - Card Frame Clipping Fix

GitHub Issue: #2 — Frame where cards are located is cutting the cards
https://github.com/andgonro/escobita/issues/2

---

## Summary

The containers that host player hand cards and center table cards clip their children at the frame boundary, causing visible truncation of card edges during normal play. This proposal fixes the clipping by allowing visual overflow where needed while preserving interaction boundaries and accessibility standards.

---

## Context

### Motivation

Players can see cards being cut off by the frame that wraps each card slot. For the player hand zone, cards are clipped at the top and bottom edges. For the center table zone, cards are clipped at the left and right edges. This breaks the visual integrity of the game table and creates a confusing experience, especially during animations when cards move beyond their resting position.

### Current Limitation

- The card slot containers in the hand zone and the center table zone use an overflow restriction that clips child content at the element boundary.
- Card visual components use translate and scale transforms during deal, selection, play, and capture animations. These transforms intentionally move or grow cards beyond their resting bounds to communicate game state changes. The clipping container prevents these effects from rendering fully.
- The focus-visible outline applied during keyboard navigation is rendered inside the button boundary and is therefore also partially hidden at edges.
- The problem is observable across mobile and desktop layouts, though the minimum container size makes it most prominent on smaller viewports.

### Stakeholders

- **Players (all input modes):** Most directly affected — visual truncation breaks card legibility and game feedback
- **Keyboard users:** Focus indicators that are clipped reduce navigation clarity
- **QA:** Must validate the fix across mobile and desktop viewport sizes
- **Accessibility reviewer:** Must confirm focus indicators are fully visible after change

### User Experience Impact

- Removing visible clipping restores the intended card artwork presentation at all times
- Players receive full animation feedback (deal, play, capture, selection) without content disappearing behind frame edges
- Keyboard users see complete focus indicators, improving navigability
- No change to interaction areas — touch targets and click regions remain as currently defined

---

## High-Level Approach

- Allow the card visual component and its decorations (transforms, glows, outlines) to render outside the frame boundary when required by animations or focus states
- Keep the interactive area (touch target and click boundary) at its current minimum size — visual overflow does not expand the interactive region
- Apply the overflow change selectively to the affected zones (active hand zone and center table zone) without modifying the overall game table layout
- Ensure the change does not introduce new paint or layout side effects in adjacent zones (opponent zone, match-over overlay, etc.)
- Validate at mobile and desktop breakpoints to confirm no clipping remains visible during normal play and animations

---

## Deliverables

1. **Hand zone overflow correction** — Card slot containers in the active hand zone permit visual overflow on top and bottom edges
2. **Center table zone overflow correction** — Card slot containers in the center table zone permit visual overflow on left and right edges
3. **Focus indicator visibility** — Keyboard focus outline remains fully visible around card slots without clipping
4. **QA sign-off** — Visual validation at mobile and desktop viewports confirming no card edge truncation during play and animations
5. **Accessibility sign-off** — Confirmation that focus indicators are visible and touch targets remain within minimum size standards

---

## Notes

### Edge Cases

- During the escoba burst animation, cards scale outward significantly. Overflow must be permitted broadly enough to accommodate this peak scale without re-introducing clipping.
- At the minimum responsive container size (approximately 44px), cards at the edge of the hand layout may be especially close to the frame. The solution must handle this smallest slot size without clipping.
- Animated cards that overflow visually must not overlap or obscure adjacent cards in a way that confuses card identity. Visual layering (z-index) of the overflowing card should be considered.

### Assumptions

- The fix applies only to the active hand zone and center table zone as reported in issue #2. Opponent zones and other table regions are not in scope unless they exhibit the same symptom after the fix lands.
- The current animation magnitude (deal, play, selection, escoba burst transforms) is intentional and should not be reduced as part of this fix.
- Browser support matrix remains unchanged.

### References

- Related animation specification: `docs/specs/ui/card-animations/spec.md`
- Card visual component and zone components are the primary areas of interest for implementation
