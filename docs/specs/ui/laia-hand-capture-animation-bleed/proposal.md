# Title: Proposal - Laia Hand Capture Animation Bleed

## Summary

Fix a UI animation isolation defect where Laia's hand cards incorrectly glow during human capture actions. The feature ensures capture glow visuals stay limited to the human capture context while the opponent hand remains visually inert unless an explicit opponent-turn animation is active.

## Context

### Motivation

Players receive misleading visual feedback during captures because non-participating opponent hand cards animate as if they were involved in the action. This undermines clarity, trust, and perceived quality of turn outcomes.

### Current Limitation

- Human capture actions trigger a glow effect on all visible cards in Laia's hand area.
- The issue is always reproducible across capture scenarios.
- Visual feedback does not respect zone boundaries between table capture effects and opponent hand presentation.
- Existing animation suppression intent for opponent cards is not being honored in this path.

### Stakeholders

- Human players in single-player sessions who rely on clear visual state changes.
- QA and support teams who need deterministic animation behavior for regression checks.
- Design and UX stakeholders responsible for animation language consistency.
- Frontend maintainers responsible for animation state orchestration.

### User Experience Impact

- Improves action clarity by showing capture glow only where capture occurs.
- Prevents false visual cues that imply opponent participation during human turns.
- Reinforces confidence in turn sequencing and game state readability.

## High-level Approach

- Enforce animation zone isolation so opponent hand visuals are excluded from human capture animation groups.
- Restrict opponent hand animation metadata to explicit opponent-turn phases only.
- Ensure opponent hand cards remain static during all human-turn capture transitions.
- Add deterministic acceptance criteria for always-reproducible capture scenarios.
- Document regression coverage expectations for animation isolation behavior.

## Deliverables

1. Updated proposal documenting defect scope and intended behavior.
2. Formal specification with functional, technical, and non-functional requirements for zone isolation.
3. User stories with acceptance criteria covering happy path, edge cases, and regression behavior.
4. Documentation alignment under the UI epic for traceable planning and implementation handoff.

## Notes

### Edge Cases

- Captures involving one card and captures involving multiple cards must both preserve opponent hand stability.
- Escoba and non-Escoba captures must follow the same isolation rule.
- Reduced-motion behavior must not reintroduce opponent hand visual bleed.

### Assumptions

- Opponent hand cards should not display capture glow for human capture actions under any circumstance.
- Any opponent hand animation is valid only when explicitly tied to opponent-turn animation phases.
- The defect is a presentation-layer issue and does not alter game rules or scoring.

### References

- Existing UI animation specification artifacts under docs/specs/ui/card-animations.
- Existing UI game-table specification artifacts under docs/specs/ui/game-table-mvp.
