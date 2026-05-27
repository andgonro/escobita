# User Stories: Card Frame Clipping Fix

GitHub Issue: #2 — Frame where cards are located is cutting the cards
https://github.com/andgonro/escobita/issues/2

---

## US-1: Player Hand Cards Are Not Clipped at Rest

**Story:**
As a player, I want to see my full hand cards without any edge being cut off by the frame, so I can clearly read each card at a glance before deciding which one to play.

**Acceptance Criteria:**

- [ ] All cards in the active hand zone display their full artwork without truncation at the top or bottom edge when in the resting (idle) state
- [ ] This holds true on a representative mobile viewport (portrait orientation)
- [ ] This holds true on a representative desktop viewport
- [ ] No card in the hand overlaps or obscures an adjacent card's identity in the resting state
- [ ] The card slot boundary (interactive area) does not increase in size compared to before the fix

---

## US-2: Center Table Cards Are Not Clipped at Rest

**Story:**
As a player, I want to see all center table cards without left or right edges being cut off, so I can identify every card available for capture before choosing my play.

**Acceptance Criteria:**

- [ ] All cards in the center table zone display their full artwork without truncation at the left or right edge when in the resting (idle) state
- [ ] This holds true on a representative mobile viewport (portrait orientation)
- [ ] This holds true on a representative desktop viewport
- [ ] Adjacent table cards remain clearly separated and individually identifiable
- [ ] The card slot boundary (interactive area) does not increase in size compared to before the fix

---

## US-3: Hand Card Animations Are Fully Visible

**Story:**
As a player, I want to see hand card animations play out completely without any part of the card disappearing behind the frame, so the deal, selection, and play animations give me clear visual feedback throughout their full motion.

**Acceptance Criteria:**

- [ ] During the deal animation, the card remains fully visible at all keyframe stages including the peak upward position
- [ ] During the selection elevation, the card remains fully visible when it is shifted upward to signal selection
- [ ] During the play-arc animation, the card remains fully visible at the highest point of the arc
- [ ] During the escoba burst animation, the card remains fully visible at peak scale
- [ ] No clipping of the card body or glow effect is observed at any animation keyframe
- [ ] The animating card is visually layered above adjacent cards when it overflows, without hiding their identity
- [ ] Animations run at the same perceived smoothness as before the fix (no visible jank or frame drop)
- [ ] If prefers-reduced-motion is active, the reduced-motion fallback continues to function correctly and no clipping is introduced

---

## US-4: Center Table Card Animations Are Fully Visible

**Story:**
As a player, I want to see capture and escoba burst animations on table cards play out completely, so I get satisfying and clear confirmation when cards leave the table.

**Acceptance Criteria:**

- [ ] During a capture animation, all captured table cards remain fully visible throughout the glow and fade phases with no left, right, top, or bottom clipping
- [ ] During the escoba burst animation, table cards are fully visible at peak scale with no edge clipping
- [ ] Multiple cards captured simultaneously all animate without clipping
- [ ] No animation clipping is observed at the minimum responsive container size on mobile
- [ ] If prefers-reduced-motion is active, the reduced-motion fallback continues to function correctly

---

## US-5: Keyboard Focus Indicator Is Fully Visible on Hand Cards

**Story:**
As a keyboard user, I want to see a complete, unclipped focus ring around each hand card when I navigate with the keyboard, so I always know which card is currently focused.

**Acceptance Criteria:**

- [ ] When a hand card slot receives keyboard focus, the focus-visible indicator is fully visible on all four sides (no segment is clipped by the container edge)
- [ ] This holds true on mobile and desktop viewports
- [ ] The focus indicator meets the contrast requirement defined by the existing accessibility baseline
- [ ] Keyboard navigation order through hand cards is unaffected by the fix
- [ ] Focus behaviour is unchanged when the player navigates away from a focused card (no residual visual artefact)

---

## US-6: No Regression in Adjacent Game Table Zones

**Story:**
As a player, I want the fix to affect only the problem zones so that the rest of the game table continues to look and behave exactly as before, with no new visual defects elsewhere.

**Acceptance Criteria:**

- [ ] The opponent hand display shows no new clipping, overflow bleed, or layout shift after the fix is applied
- [ ] The match-over overlay renders correctly with no visual change compared to before the fix
- [ ] Other game table regions outside the active hand zone and center table zone show no new visual defects on mobile or desktop
- [ ] No change in game state management or turn progression behaviour is introduced
