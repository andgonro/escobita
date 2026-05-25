# User Stories: Laia Hand Capture Animation Bleed

## US-1: Human Capture Does Not Animate Laia Hand

As a human player, I want Laia's hand cards to stay static when I capture cards, so that the visuals accurately reflect only the cards involved in my action.

Acceptance Criteria

- [ ] When I perform a capture, no visible card in Laia's hand area glows or flashes.
- [ ] The no-animation behavior for Laia's hand occurs on every capture attempt.
- [ ] The behavior is identical for both single-card and multi-card captures.
- [ ] The behavior remains correct for both Escoba and non-Escoba outcomes.
- [ ] Capture visuals still appear on the cards that actually participate in the capture.

## US-2: Opponent Hand Animates Only During Opponent Turn Context

As a player, I want opponent hand visuals to animate only when the opponent turn context explicitly requires it, so that animation intent is predictable and trustworthy.

Acceptance Criteria

- [ ] Human-turn capture actions never trigger capture-state visuals in Laia's hand.
- [ ] Opponent hand animation appears only when tied to explicit opponent-turn animation phases.
- [ ] Opponent-turn phase animations do not leak into human-turn capture moments.
- [ ] Ending an opponent-turn phase returns Laia's hand visuals to static state.

## US-3: Stable Behavior Across Repeated Captures

As QA, I want repeated captures in a single session to consistently preserve animation isolation, so that regressions are easy to detect and prevent.

Acceptance Criteria

- [ ] Multiple consecutive human captures do not cause any Laia hand card glow.
- [ ] The first capture and later captures behave identically.
- [ ] Changes in number of cards captured do not alter Laia hand inertness.
- [ ] The result is consistent after state transitions such as dealing new cards.

## US-4: Accessibility and Performance Are Preserved

As a player with accessibility preferences, I want the bug fix to preserve reduced-motion and responsiveness, so that correctness improvements do not introduce new UX issues.

Acceptance Criteria

- [ ] Reduced-motion behavior remains consistent with existing expectations.
- [ ] Keyboard navigation and focus behavior are unchanged by this fix.
- [ ] Capture interactions remain visually responsive after isolation logic is applied.
- [ ] No new noticeable animation stutter appears during capture transitions.
